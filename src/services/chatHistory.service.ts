import { ChatSession } from '@/types/chat'
import { createClient } from '@/utils/supabase/client'

type Listener = () => void

export class ChatHistoryService {
  // Add cache for chat sessions with expiration
  private chatSessionsCache: ChatSession[] | null = null
  private lastFetchTime: number | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes cache
  private isFetching = false // Prevent concurrent fetches
  private listeners: Listener[] = []

  subscribe(listener: Listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener())
  }

  async saveChatSession(session: ChatSession): Promise<boolean> {
    try {
      // Create a Supabase client that can access the current session
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { session: userSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !userSession) {
        console.error('Error saving chat session - No valid session:', sessionError?.message || 'No session found')
        return false
      }

      // Log the session data being sent
      console.log('Saving chat session:', JSON.stringify(session, null, 2))

      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', [...response.headers.entries()])

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error saving chat session - HTTP Status:', response.status)
        console.error('Error saving chat session - Response text:', errorText)
        try {
          // Only try to parse as JSON if it looks like JSON
          if (errorText.trim().startsWith('{') && errorText.trim().endsWith('}')) {
            const error = JSON.parse(errorText)
            console.error('Error saving chat session - Parsed error:', error)
          } else {
            console.error('Error saving chat session - Non-JSON response:', errorText)
          }
        } catch {
          console.error('Error saving chat session - Could not parse error as JSON:', errorText)
        }
        return false
      }

      const result = await response.json()
      console.log('Successfully saved chat session:', result)

      // Invalidate cache after successful save
      this.clearCache()
      // Notify listeners (e.g., dashboard service) that data has changed
      this.notifyListeners()

      return true
    } catch (error) {
      console.error('Error saving chat session - Network error:', error)
      return false
    }
  }

  async getChatSessions(useCache = true): Promise<ChatSession[] | null> {
    try {
      // Check if we have valid cached data
      const now = Date.now()
      if (useCache && this.chatSessionsCache && this.lastFetchTime && (now - this.lastFetchTime) < this.CACHE_DURATION) {
        console.log('Using cached chat sessions')
        return this.chatSessionsCache
      }

      // Prevent concurrent fetches
      if (this.isFetching) {
        // Wait a bit and try to get cached data
        await new Promise(resolve => setTimeout(resolve, 100))
        if (this.chatSessionsCache) {
          return this.chatSessionsCache
        }
        // If still no cache, continue with fetch
      }

      this.isFetching = true

      // Create a Supabase client that can access the current session
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { session: userSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !userSession) {
        console.error('Error fetching chat sessions - No valid session:', sessionError?.message || 'No session found')
        this.isFetching = false
        return null
      }

      console.log('Fetching chat sessions')
      const response = await fetch('/api/chat-sessions')

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error fetching chat sessions - HTTP Status:', response.status)
        console.error('Error fetching chat sessions - Response text:', errorText)
        try {
          // Only try to parse as JSON if it looks like JSON
          if (errorText.trim().startsWith('{') && errorText.trim().endsWith('}')) {
            const error = JSON.parse(errorText)
            console.error('Error fetching chat sessions - Parsed error:', error)
          } else {
            console.error('Error fetching chat sessions - Non-JSON response:', errorText)
          }
        } catch {
          console.error('Error fetching chat sessions - Could not parse error as JSON:', errorText)
        }
        this.isFetching = false
        return null
      }

      const result = await response.json()
      // Handle both old and new response formats
      const chatSessions: ChatSession[] = Array.isArray(result) ? result : result.sessions
      console.log('Successfully fetched chat sessions:', chatSessions?.length || 0)

      // Update cache
      this.chatSessionsCache = chatSessions
      this.lastFetchTime = now

      this.isFetching = false
      return chatSessions
    } catch (error) {
      console.error('Error fetching chat sessions - Network error:', error)
      this.isFetching = false
      return null
    }
  }

  // Method to clear cache
  clearCache() {
    this.chatSessionsCache = null
    this.lastFetchTime = null
    // Notify listeners to clear their caches as well
    this.notifyListeners()
  }

  // Method to get cached sessions instantly
  getCachedChatSessions(): ChatSession[] | null {
    const now = Date.now()
    if (this.chatSessionsCache && this.lastFetchTime && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.chatSessionsCache
    }
    return null
  }

  // Method to manually update cache with a new session for instant loading
  updateCacheWithNewSession(session: ChatSession) {
    if (!this.chatSessionsCache) {
      this.chatSessionsCache = [session]
    } else {
      // Avoid duplicates
      const index = this.chatSessionsCache.findIndex(s => s.id === session.id)
      if (index !== -1) {
        this.chatSessionsCache[index] = session
      } else {
        this.chatSessionsCache = [session, ...this.chatSessionsCache]
      }
    }
    this.lastFetchTime = Date.now()
    this.notifyListeners()
  }

  async deleteChatSession(sessionId: string): Promise<boolean> {
    try {
      // Create a Supabase client that can access the current session
      const supabase = createClient()

      // Check if user is authenticated
      const { data: { session: userSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !userSession) {
        console.error('Error deleting chat session - No valid session:', sessionError?.message || 'No session found')
        return false
      }

      console.log('Deleting chat session:', sessionId)
      const response = await fetch('/api/chat-sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error deleting chat session - HTTP Status:', response.status)
        console.error('Error deleting chat session - Response text:', errorText)
        try {
          // Only try to parse as JSON if it looks like JSON
          if (errorText.trim().startsWith('{') && errorText.trim().endsWith('}')) {
            const error = JSON.parse(errorText)
            console.error('Error deleting chat session - Parsed error:', error)
          } else {
            console.error('Error deleting chat session - Non-JSON response:', errorText)
          }
        } catch {
          console.error('Error deleting chat session - Could not parse error as JSON:', errorText)
        }
        return false
      }

      const result = await response.json()
      console.log('Successfully deleted chat session:', result)

      // Invalidate cache after successful delete
      this.clearCache()

      return true
    } catch (error) {
      console.error('Error deleting chat session - Network error:', error)
      return false
    }
  }
}

export const chatHistoryService = new ChatHistoryService()
