import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowLeft, Zap, Star, Trophy, LogOut, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [lessonsCompleted, setLessonsCompleted] = useState(0);
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }

    const fetchData = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (p) setProfile(p);

      const { data: allAchievements } = await supabase.from("achievements").select("*");
      if (allAchievements) setAchievements(allAchievements);

      const { data: earned } = await supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id);
      if (earned) setEarnedIds(new Set(earned.map((e) => e.achievement_id)));

      const { data: progress } = await supabase.from("user_progress").select("id").eq("user_id", user.id).eq("completed", true);
      if (progress) setLessonsCompleted(progress.length);
    };
    fetchData();
  }, [user]);

  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display text-xl">Loading...</div></div>;

  const xpForNext = (profile.level) * 200;
  const xpProgress = (profile.xp % 200) / 200 * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_50%_12%)_0%,_hsl(270_35%_6%)_70%)]" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 px-6 py-4 glass border-b border-primary/10">
          <button onClick={() => navigate("/game")} className="text-foreground/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold text-gradient-gold flex-1">Player Profile</h1>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="text-foreground/40 hover:text-destructive">
            <LogOut className="w-4 h-4 mr-1" /> Sign Out
          </Button>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-10">
          {/* Player card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-3xl golden-border backdrop-blur-sm text-center mb-10"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-purple/20 border-2 border-primary/40 flex items-center justify-center mx-auto mb-4">
              <span className="font-display text-3xl">🐯</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{profile.display_name}</h2>
            <p className="font-body text-sm text-foreground/40 mb-6">
              {language === "es" ? "Estudiante de Tiger Studios" : "Tiger Studios Student"}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-display text-xl font-bold text-primary">{profile.xp}</p>
                <p className="font-body text-[10px] text-foreground/40">Total XP</p>
              </div>
              <div className="p-3 rounded-xl bg-purple/10 border border-purple-glow/10">
                <Star className="w-5 h-5 text-purple-glow mx-auto mb-1" />
                <p className="font-display text-xl font-bold text-purple-glow">{profile.level}</p>
                <p className="font-body text-[10px] text-foreground/40">Level</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="font-display text-xl font-bold text-primary">{lessonsCompleted}</p>
                <p className="font-body text-[10px] text-foreground/40">Lessons</p>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="text-left">
              <div className="flex justify-between mb-1">
                <span className="font-body text-xs text-foreground/40">Level {profile.level}</span>
                <span className="font-body text-xs text-foreground/40">Level {profile.level + 1}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-purple-glow to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="font-body text-[10px] text-foreground/30 mt-1">{profile.xp % 200} / 200 XP to next level</p>
            </div>
          </motion.div>

          {/* Achievements */}
          <h3 className="font-display text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            {language === "es" ? "Logros" : "Achievements"}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {achievements.map((a, i) => {
              const isEarned = earnedIds.has(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-4 rounded-xl border transition-all ${
                    isEarned
                      ? "golden-border backdrop-blur-sm"
                      : "border-border/15 bg-card/20 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{a.icon}</span>
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground truncate">
                        {language === "es" ? a.title_es : a.title_en}
                      </p>
                      <p className="font-body text-[10px] text-foreground/40 truncate">
                        {language === "es" ? a.description_es : a.description_en}
                      </p>
                    </div>
                    {isEarned && <CheckCircle className="w-4 h-4 text-primary shrink-0 ml-auto" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
