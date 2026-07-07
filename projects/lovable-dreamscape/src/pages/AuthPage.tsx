import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await signUp(email, password, displayName || "Tiger Student");
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "🐯 Welcome!", description: "Check your email to verify your account." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        navigate("/game");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(280_50%_15%)_0%,_hsl(270_35%_8%)_70%)]" />
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-purple-glow/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="p-8 rounded-3xl golden-border backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-3"
            >
              <Gamepad2 className="w-12 h-12 text-primary mx-auto" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-gradient-gold mb-2">
              White Tiger Studios
            </h1>
            <p className="font-elegant text-lg text-foreground/50 italic">
              {mode === "login" ? "Continue your adventure" : "Begin your journey"}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl bg-secondary/50 p-1 mb-8">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg font-display text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-foreground/50 hover:text-foreground/70"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                    <Input
                      placeholder="Display Name (your tiger name)"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-secondary/30 border-border/30 focus:border-primary/50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-secondary/30 border-border/30 focus:border-primary/50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="pl-10 bg-secondary/30 border-border/30 focus:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 py-6 glow-gold"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  {mode === "login" ? "Enter the Game" : "Create Character"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Guest mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/game")}
              className="font-body text-sm text-foreground/40 hover:text-primary transition-colors"
            >
              Explore as guest →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
