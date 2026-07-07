import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  isStreaming?: boolean;
}

interface QueuedPrompt {
  id: string;
  text: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useChatStore() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [queue, setQueue] = useState<QueuedPrompt[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
  const abortRef = useRef<AbortController | null>(null);
  const processingQueue = useRef(false);

  // Load conversation on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('owner_id', user.id)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          toolCalls: m.tool_calls,
          toolResults: m.tool_results,
        })));
      }
    };
    load();
  }, [user, conversationId]);

  const persistMessage = useCallback(async (msg: ChatMessage) => {
    if (!user) return;
    await supabase.from('chat_messages').insert({
      owner_id: user.id,
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      tool_calls: msg.toolCalls || null,
      tool_results: msg.toolResults || null,
    });
  }, [user, conversationId]);

  const streamResponse = useCallback(async (
    allMessages: ChatMessage[],
    currentPage: string,
    onToolCalls?: (calls: any[]) => Promise<any[]>,
  ) => {
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const apiMessages = allMessages.map(m => ({ role: m.role, content: m.content }));
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages, currentPage }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: 'Stream failed' }));
        const errMsg: ChatMessage = { role: 'assistant', content: `⚠️ ${errData.error || 'Something went wrong.'}` };
        setMessages(prev => [...prev, errMsg]);
        await persistMessage(errMsg);
        setIsStreaming(false);
        return;
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let assistantSoFar = '';
      let toolCallsAccum: any[] = [];
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              assistantSoFar += delta.content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && last.isStreaming) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar, isStreaming: true }];
              });
            }
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? toolCallsAccum.length;
                if (!toolCallsAccum[idx]) {
                  toolCallsAccum[idx] = { id: tc.id || '', function: { name: '', arguments: '' } };
                }
                if (tc.id) toolCallsAccum[idx].id = tc.id;
                if (tc.function?.name) toolCallsAccum[idx].function.name += tc.function.name;
                if (tc.function?.arguments) toolCallsAccum[idx].function.arguments += tc.function.arguments;
              }
            }
            if (parsed.choices?.[0]?.finish_reason === 'tool_calls' || parsed.choices?.[0]?.finish_reason === 'stop') {
              streamDone = true;
              break;
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Finalize assistant message
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.isStreaming) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, isStreaming: false } : m);
        }
        return prev;
      });

      // Handle tool calls
      if (toolCallsAccum.length > 0 && onToolCalls) {
        const results = await onToolCalls(toolCallsAccum);
        const toolMsg: ChatMessage = {
          role: 'assistant',
          content: assistantSoFar,
          toolCalls: toolCallsAccum,
          toolResults: results,
        };
        setMessages(prev => {
          const newPrev = prev.filter(m => !(m.role === 'assistant' && m.content === assistantSoFar));
          return [...newPrev, toolMsg];
        });
        await persistMessage(toolMsg);
      } else if (assistantSoFar) {
        await persistMessage({ role: 'assistant', content: assistantSoFar });
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error('Stream error:', e);
        const errMsg: ChatMessage = { role: 'assistant', content: '⚠️ Connection error. Please try again.' };
        setMessages(prev => [...prev, errMsg]);
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [persistMessage]);

  const sendMessage = useCallback(async (
    text: string,
    currentPage: string,
    onToolCalls?: (calls: any[]) => Promise<any[]>,
  ) => {
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    await persistMessage(userMsg);

    const allMsgs = [...messages, userMsg];
    await streamResponse(allMsgs, currentPage, onToolCalls);
  }, [messages, streamResponse, persistMessage]);

  const addToQueue = useCallback((text: string) => {
    setQueue(prev => [...prev, { id: crypto.randomUUID(), text }]);
  }, []);

  const editQueued = useCallback((id: string, text: string) => {
    setQueue(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  }, []);

  const removeQueued = useCallback((id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  }, []);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const processQueue = useCallback(async (
    currentPage: string,
    onToolCalls?: (calls: any[]) => Promise<any[]>,
  ) => {
    if (processingQueue.current || isStreaming || isPaused || queue.length === 0) return;
    processingQueue.current = true;
    const next = queue[0];
    setQueue(prev => prev.slice(1));
    await sendMessage(next.text, currentPage, onToolCalls);
    processingQueue.current = false;
  }, [queue, isStreaming, isPaused, sendMessage]);

  const newConversation = useCallback(() => {
    setMessages([]);
    setQueue([]);
    setIsPaused(false);
    setConversationId(crypto.randomUUID());
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    queue,
    isStreaming,
    isPaused,
    conversationId,
    sendMessage,
    addToQueue,
    editQueued,
    removeQueued,
    reorderQueue,
    togglePause,
    clearQueue,
    processQueue,
    newConversation,
    stopStreaming,
  };
}
