-- Ensure uuid-ossp extension is enabled for gen_random_uuid() or uuid_generate_v4()
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create chat_messages table to store individual responses for each session
CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "session_id" TEXT REFERENCES "chat_sessions"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL, -- 'user' or 'assistant'
  "content" TEXT NOT NULL,
  "model_id" TEXT, -- For assistant messages
  "success" BOOLEAN DEFAULT TRUE,
  "error" TEXT,
  "response_time" REAL,
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_id" ON "chat_messages"("session_id");
CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON "chat_messages"("created_at");

-- Enable Row Level Security (RLS)
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view messages of their own sessions" 
ON "chat_messages" FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM chat_sessions 
  WHERE chat_sessions.id = chat_messages.session_id 
  AND chat_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can insert messages into their own sessions" 
ON "chat_messages" FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM chat_sessions 
  WHERE chat_sessions.id = chat_messages.session_id 
  AND chat_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can modify messages of their own sessions" 
ON "chat_messages" FOR ALL 
USING (EXISTS (
  SELECT 1 FROM chat_sessions 
  WHERE chat_sessions.id = chat_messages.session_id 
  AND chat_sessions.user_id = auth.uid()
));
