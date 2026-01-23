import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ChatSession } from "@/types/chat";

interface DatabaseChatSession {
  id: string;
  message: string;
  timestamp: string;
  selected_models: string[];
  responses: unknown[];
  best_response?: string;
  response_time?: number;
}

export async function GET(req: NextRequest) {
  console.log('GET /api/chat-sessions called');
  const supabase = await createClient();

  try {
    // Get user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('GET - Authentication error:', authError.message);
      return new Response(JSON.stringify({ error: "Unauthorized", authError: authError.message }), { status: 401 });
    }

    if (!user) {
      console.error('GET - No user found in session');
      return new Response(JSON.stringify({ error: "Unauthorized", authError: "No user session found" }), { status: 401 });
    }

    console.log('GET - User authenticated:', user.id);

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10); // Default to 50, max 100
    const clampedLimit = Math.min(limit, 100);
    const offset = (page - 1) * clampedLimit;

    // First get count of total sessions
    const { count, error: countError } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error('GET - Database count error:', countError);
      return new Response(JSON.stringify({ error: countError.message }), { status: 500 });
    }

    // Then get the sessions with pagination
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('id, message, timestamp, selected_models, responses, best_response, response_time')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(offset, offset + clampedLimit - 1);

    if (error) {
      console.error('GET - Database query error:', error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log('GET - Successfully fetched sessions:', data?.length || 0);

    // Convert database format to ChatSession format
    const chatSessions: ChatSession[] = (data as DatabaseChatSession[]).map(session => ({
      id: session.id,
      message: session.message,
      responses: session.responses as ChatSession['responses'],
      timestamp: new Date(session.timestamp),
      selectedModels: session.selected_models,
      bestResponse: session.best_response,
      responseTime: session.response_time
    }));

    return new Response(JSON.stringify({
      sessions: chatSessions,
      pagination: {
        page,
        limit: clampedLimit,
        total: count,
        hasMore: offset + clampedLimit < (count || 0)
      }
    }), { status: 200 });
  } catch (error: unknown) {
    console.error('GET - Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  console.log('POST /api/chat-sessions called');
  const supabase = await createClient();

  try {
    // Get user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('POST - Authentication error:', authError.message);
      return new Response(JSON.stringify({ error: "Unauthorized", authError: authError.message }), { status: 401 });
    }

    if (!user) {
      console.error('POST - No user found in session');
      return new Response(JSON.stringify({ error: "Unauthorized", authError: "No user session found" }), { status: 401 });
    }

    let session: ChatSession;
    try {
      session = await req.json() as ChatSession;
      console.log('POST - Received session data:', JSON.stringify(session, null, 2));
    } catch (parseError) {
      console.error('POST - Invalid JSON in request body:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body", details: errorMessage }), { status: 400 });
    }

    // Validate required fields
    if (!session.id) {
      console.error('POST - Missing required field: id');
      return new Response(JSON.stringify({ error: "Missing required field: id" }), { status: 400 });
    }

    if (!session.message) {
      console.error('POST - Missing required field: message');
      return new Response(JSON.stringify({ error: "Missing required field: message" }), { status: 400 });
    }

    if (!session.timestamp) {
      console.error('POST - Missing required field: timestamp');
      return new Response(JSON.stringify({ error: "Missing required field: timestamp" }), { status: 400 });
    }

    // Ensure timestamp is a Date object
    let timestamp: Date;
    if (typeof session.timestamp === 'string') {
      timestamp = new Date(session.timestamp);
    } else if (session.timestamp instanceof Date) {
      timestamp = session.timestamp;
    } else {
      console.error('POST - Invalid timestamp format');
      return new Response(JSON.stringify({ error: "Invalid timestamp format" }), { status: 400 });
    }

    // Ensure responses is an array
    const responses = Array.isArray(session.responses) ? session.responses : [];

    // Ensure selectedModels is an array
    const selectedModels = Array.isArray(session.selectedModels) ? session.selectedModels : [];

    console.log('POST - Attempting to insert or update session:', {
      id: session.id,
      user_id: user.id,
      message: session.message,
      responses_count: responses.length,
      timestamp: timestamp.toISOString(),
      selected_models_count: selectedModels.length,
    });

    // Optimized strategy: Try to INSERT first. If it fails with unique constraint (23505), then UPDATE.
    // This avoids race conditions (Insert handles concurrency via DB constraint) AND avoids RLS issues with upsert (Update only touches mutable fields).

    // 1. Try Insert
    const { error: insertError } = await supabase.from('chat_sessions').insert({
      id: session.id,
      user_id: user.id,
      message: session.message,
      responses: responses,
      timestamp: timestamp.toISOString(),
      selected_models: selectedModels,
      best_response: session.bestResponse,
      response_time: session.responseTime,
      created_at: new Date().toISOString()
    });

    if (insertError) {
      // 2. Catch Unique Violation (Duplicate Key) -> Update
      if (insertError.code === '23505') {
        // Update ONLY mutable fields. Do NOT update user_id or created_at to avoid RLS triggers.
        const { error: updateError } = await supabase
          .from('chat_sessions')
          .update({
            message: session.message,
            responses: responses,
            timestamp: timestamp.toISOString(),
            selected_models: selectedModels,
            best_response: session.bestResponse,
            response_time: session.responseTime
            // Exclude user_id and created_at
          })
          .eq('id', session.id)
          .eq('user_id', user.id); // Ensure we own it

        if (updateError) {
          console.error('POST - Database update error (after duplicate key):', {
            message: updateError.message,
            code: updateError.code,
            details: updateError.details
          });
          return new Response(JSON.stringify({
            error: "Database operation failed",
            details: updateError.message,
            code: updateError.code
          }), { status: 500 });
        }
      } else {
        // Real Insert Error
        console.error('POST - Database insert error:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details
        });
        return new Response(JSON.stringify({
          error: "Database operation failed",
          details: insertError.message,
          code: insertError.code
        }), { status: 500 });
      }
    }

    console.log('POST - Successfully saved session:', session.id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    console.error('POST - Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  console.log('DELETE /api/chat-sessions called');
  const supabase = await createClient();

  try {
    // Get user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('DELETE - Authentication error:', authError.message);
      return new Response(JSON.stringify({ error: "Unauthorized", authError: authError.message }), { status: 401 });
    }

    if (!user) {
      console.error('DELETE - No user found in session');
      return new Response(JSON.stringify({ error: "Unauthorized", authError: "No user session found" }), { status: 401 });
    }

    try {
      let sessionId: string;
      try {
        const body = await req.json() as { sessionId: string };
        sessionId = body.sessionId;
      } catch (parseError) {
        console.error('DELETE - Invalid JSON in request body:', parseError);
        const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
        return new Response(JSON.stringify({ error: "Invalid JSON in request body", details: errorMessage }), { status: 400 });
      }

      if (!sessionId) {
        console.error('DELETE - Missing sessionId');
        return new Response(JSON.stringify({ error: "Missing sessionId" }), { status: 400 });
      }

      console.log('DELETE - Attempting to delete session:', { sessionId, user_id: user.id });

      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('DELETE - Database delete error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
      }

      console.log('DELETE - Successfully deleted session:', sessionId);
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: unknown) {
      console.error('DELETE - Unexpected error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
  } catch (error: unknown) {
    console.error('DELETE - Authentication error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: "Authentication failed", details: errorMessage }), { status: 401 });
  }
}