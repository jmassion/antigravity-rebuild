import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, MessageSquarePlus, Send, Square, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useChatStore } from '@/hooks/useChatStore';
import { useAppActions } from '@/hooks/useAppActions';
import ChatMessage from './ChatMessage';
import PromptQueue from './PromptQueue';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ChatPanel({ open, onClose }: Props) {
  const location = useLocation();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { executeToolCall } = useAppActions();

  const {
    messages, queue, isStreaming, isPaused,
    sendMessage, addToQueue, editQueued, removeQueued,
    reorderQueue, togglePause, clearQueue,
    processQueue, newConversation, stopStreaming,
  } = useChatStore();

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  // Process queue when streaming ends
  useEffect(() => {
    if (!isStreaming && queue.length > 0) {
      processQueue(location.pathname, handleToolCalls);
    }
  }, [isStreaming, queue.length]);

  const handleToolCalls = useCallback(async (calls: any[]) => {
    const results = [];
    for (const call of calls) {
      const result = await executeToolCall(call);
      results.push(result);
    }
    return results;
  }, [executeToolCall]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (isStreaming) {
      addToQueue(text);
    } else {
      sendMessage(text, location.pathname, handleToolCalls);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] z-50 bg-background border-l border-border flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-sm">Pipeline AI</h2>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={newConversation} title="New conversation">
                <MessageSquarePlus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div ref={scrollRef} className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-12">
                  <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">Pipeline AI</p>
                  <p className="text-xs mt-1">Ask me anything or tell me what to do.<br />I can navigate, create, search, and organize.</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
            </div>
          </ScrollArea>

          {/* Queue */}
          <PromptQueue queue={queue} isPaused={isPaused} onEdit={editQueued} onRemove={removeQueued} onReorder={reorderQueue} onTogglePause={togglePause} onClear={clearQueue} />

          {/* Input */}
          <div className="p-3 border-t border-border shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? 'Type to queue...' : 'Ask Pipeline AI...'}
                rows={1}
                className="flex-1 resize-none bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring min-h-[36px] max-h-[120px]"
                style={{ height: 'auto', overflow: 'auto' }}
                onInput={e => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              {isStreaming ? (
                <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={stopStreaming}>
                  <Square className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSubmit} disabled={!input.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
            {queue.length > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {queue.length} queued{isPaused ? ' · paused' : isStreaming ? '' : ' · will send next'}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
