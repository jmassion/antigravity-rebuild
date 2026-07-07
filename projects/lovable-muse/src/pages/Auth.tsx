import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useI18n, AVAILABLE_LOCALES } from '@/lib/i18n';

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { t, locale, setLocale } = useI18n();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = isSignUp
      ? await signUp(email, password, displayName)
      : await signIn(email, password);
    setSubmitting(false);

    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else if (isSignUp) {
      toast({ title: t('auth.checkEmail'), description: t('auth.confirmLink') });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <Film className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-wide text-foreground">PIPELINE</span>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            {isSignUp ? t('auth.createAccount') : t('auth.signIn')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                placeholder={t('auth.displayName')}
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
            )}
            <input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </form>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}
          </button>
        </div>

        {/* Language switcher */}
        <div className="flex justify-center gap-2 mt-4">
          {AVAILABLE_LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => setLocale(l.code)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                locale === l.code ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {l.flag} {l.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
