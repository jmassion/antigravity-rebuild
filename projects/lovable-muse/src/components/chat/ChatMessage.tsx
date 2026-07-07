import ReactMarkdown from 'react-markdown';
import { Bot, User, ArrowRight, Loader2 } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/hooks/useChatStore';
import { Link } from 'react-router-dom';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${isUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
        {message.isStreaming && !message.content ? (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p+p]:mt-1.5 [&>ul]:my-1 [&>ol]:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* Tool results */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolResults.map((tr: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 text-xs bg-accent/50 rounded px-2 py-1">
                <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                <span className="truncate">{tr.display?.label || tr.name}</span>
                {tr.display?.link && (
                  <Link to={tr.display.link} className="text-primary underline ml-auto shrink-0">
                    Go →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
