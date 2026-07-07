import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { BookOpen, Clapperboard, Film, Scissors, Megaphone, Globe, DollarSign, Crown, Lock, Star, Zap, User } from "lucide-react";
import tigerDirector from "@/assets/tiger-director-3d.png";

const stageIcons: Record<string, any> = {
  BookOpen, Clapperboard, Film, Scissors, Megaphone, Globe, DollarSign, Crown,
};

interface Stage {
  id: number;
  slug: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  icon: string;
  order_index: number;
  xp_reward: number;
  is_free: boolean;
}

interface Profile {
  xp: number;
  level: number;
  display_name: string;
  current_stage: number;
}

// World map node positions (Mario-style path)
const nodePositions = [
  { x: 15, y: 75 },
  { x: 30, y: 55 },
  { x: 50, y: 65 },
  { x: 65, y: 40 },
  { x: 80, y: 55 },
  { x: 70, y: 25 },
  { x: 45, y: 20 },
  { x: 25, y: 15 },
];

export default function WorldMapPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: stagesData } = await supabase
        .from("pipeline_stages")
        .select("*")
        .order("order_index");
      if (stagesData) setStages(stagesData);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("xp, level, display_name, current_stage")
          .eq("user_id", user.id)
          .single();
        if (profileData) setProfile(profileData);

        const { data: progress } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true);
        if (progress) setCompletedLessons(new Set(progress.map((p) => p.lesson_id)));
      }
    };
    fetchData();
  }, [user]);

  const isStageUnlocked = (stage: Stage) => {
    if (stage.is_free) return true;
    if (!user) return false;
    return profile ? stage.order_index <= profile.current_stage : false;
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Deep space background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_50%_12%)_0%,_hsl(270_35%_6%)_50%,_hsl(270_35%_4%)_100%)]" />

      {/* Starfield effect */}
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      {/* Header bar */}
      <div className="relative z-20 flex items-center justify-between px-6 py-4 glass border-b border-primary/10">
        <Link to="/" className="font-display text-xl font-bold text-gradient-gold tracking-wider">
          WTS
        </Link>

        <div className="flex items-center gap-4">
          {profile && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-display text-sm font-bold text-primary">{profile.xp} XP</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple/20 border border-purple-glow/20">
                <Star className="w-4 h-4 text-purple-glow" />
                <span className="font-display text-sm font-bold text-purple-glow">Lv.{profile.level}</span>
              </div>
            </div>
          )}

          {user ? (
            <Link
              to="/game/profile"
              className="w-9 h-9 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center hover:bg-primary/25 transition-colors"
            >
              <User className="w-4 h-4 text-primary" />
            </Link>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-lg font-display text-xs tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Log In
            </Link>
          )}
        </div>
      </div>

      {/* World Map Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center pt-8 pb-4"
      >
        <h1 className="font-display text-3xl md:text-5xl font-bold text-gradient-gold mb-2">
          {language === "es" ? "Mapa del Pipeline" : "Pipeline World Map"}
        </h1>
        <p className="font-elegant text-lg text-foreground/40 italic">
          {language === "es" ? "Tu viaje por la industria del entretenimiento" : "Your journey through the entertainment industry"}
        </p>
      </motion.div>

      {/* World map area */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>
        {/* Connecting paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(42 78% 55%)" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(275 60% 50%)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(42 78% 55%)" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          {nodePositions.slice(0, -1).map((pos, i) => {
            const next = nodePositions[i + 1];
            const midX = (pos.x + next.x) / 2;
            const midY = (pos.y + next.y) / 2 - 5;
            return (
              <path
                key={i}
                d={`M ${pos.x} ${pos.y} Q ${midX} ${midY} ${next.x} ${next.y}`}
                fill="none"
                stroke="url(#pathGrad)"
                strokeWidth="0.5"
                strokeDasharray="2 1.5"
              />
            );
          })}
        </svg>

        {/* Stage nodes */}
        {stages.map((stage, i) => {
          const pos = nodePositions[i] || { x: 50, y: 50 };
          const IconComp = stageIcons[stage.icon] || BookOpen;
          const unlocked = isStageUnlocked(stage);

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12, type: "spring", stiffness: 120 }}
              className="absolute z-10"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <motion.button
                onClick={() => unlocked && navigate(`/game/stage/${stage.slug}`)}
                whileHover={unlocked ? { scale: 1.12 } : {}}
                whileTap={unlocked ? { scale: 0.95 } : {}}
                className={`relative group flex flex-col items-center ${!unlocked ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Glow ring */}
                {unlocked && (
                  <motion.div
                    className="absolute inset-0 -m-3 rounded-full"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ background: "radial-gradient(circle, hsl(42 78% 55% / 0.2) 0%, transparent 70%)" }}
                  />
                )}

                {/* Node circle */}
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                    unlocked
                      ? "border-primary bg-gradient-to-br from-primary/25 to-card shadow-[0_0_30px_hsl(42_78%_55%/0.3)] group-hover:shadow-[0_0_50px_hsl(42_78%_55%/0.5)]"
                      : "border-border/30 bg-card/40 opacity-50"
                  }`}
                >
                  {unlocked ? (
                    <IconComp className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-foreground/30" />
                  )}
                </div>

                {/* Stage number */}
                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-bold ${
                  unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {stage.order_index}
                </div>

                {/* Label */}
                <span className={`mt-2 font-display text-[10px] md:text-xs text-center max-w-[80px] md:max-w-[100px] leading-tight ${
                  unlocked ? "text-foreground/80" : "text-foreground/30"
                }`}>
                  {language === "es" ? stage.title_es : stage.title_en}
                </span>

                {/* XP badge */}
                {unlocked && (
                  <span className="mt-1 font-body text-[9px] text-primary/60">
                    +{stage.xp_reward} XP
                  </span>
                )}
              </motion.button>
            </motion.div>
          );
        })}

        {/* Tiger mascot floating near center */}
        <motion.div
          className="absolute z-5 hidden lg:block"
          style={{ left: "48%", top: "45%", transform: "translate(-50%, -50%)" }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src={tigerDirector}
            alt="Tiger Guide"
            className="w-24 h-24 object-contain opacity-30"
            style={{ filter: "drop-shadow(0 0 20px hsl(42 78% 55% / 0.3))" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
