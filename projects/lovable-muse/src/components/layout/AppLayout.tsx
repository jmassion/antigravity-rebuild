import { ReactNode, useState, useEffect } from 'react';
import AppSidebar from './AppSidebar';
import UploadIndicator from './UploadIndicator';
import GlobalSearch from '@/components/shared/GlobalSearch';
import ChatPanel from '@/components/chat/ChatPanel';
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setChatOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onSearchClick={() => setSearchOpen(true)} />
      <main className="ml-60 min-h-screen">
        {children}
      </main>
      <UploadIndicator />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ChatPanel open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating chat toggle */}
      {!chatOpen && (
        <Button
          onClick={() => setChatOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full shadow-lg"
          title="Pipeline AI (⌘J)"
        >
          <Bot className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}
