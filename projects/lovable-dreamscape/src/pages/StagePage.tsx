import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowLeft, BookOpen, HelpCircle, Gamepad2, Zap, Lock, CheckCircle, Play } from "lucide-react";

interface Lesson {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  lesson_type: string;
  order_index: number;
  xp_reward: number;
  is_free: boolean;
  character_guide: string;
}

const typeIcons: Record<string, any> = {
  text: BookOpen,
  quiz: HelpCircle,
  roleplay: Gamepad2,
  challenge: Zap,
};

const typeColors: Record<string, string> = {
  text: "text-primary",
  quiz: "text-purple-glow",
  roleplay: "text-gold-light",
  challenge: "text-destructive",
};

export default function StagePage() {
  const { slug } = useParams<{ slug: string }>();
  const [stage, setStage] = useState<any>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: stageData } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("slug", slug)
        .single();
      if (stageData) setStage(stageData);

      if (stageData) {
        const { data: lessonsData } = await supabase
          .from("lessons")
          .select("*")
          .eq("stage_id", stageData.id)
          .order("order_index");
        if (lessonsData) setLessons(lessonsData);
      }

      if (user) {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("lesson_id")
          .eq("user_id", user.id)
          .eq("completed", true);
        if (progress) setCompleted(new Set(progress.map((p) => p.lesson_id)));
      }
    };
    fetchData();
  }, [slug, user]);

  if (!stage) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary animate-pulse font-display text-2xl">Loading...</div></div>;

  const title = language === "es" ? stage.title_es : stage.title_en;
  const desc = language === "es" ? stage.description_es : stage.description_en;
  const completedCount = lessons.filter((l) => completed.has(l.id)).length;
  const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_50%_12%)_0%,_hsl(270_35%_6%)_70%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 glass border-b border-primary/10">
          <button onClick={() => navigate("/game")} className="text-foreground/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-gradient-gold">{title}</h1>
            <p className="font-body text-xs text-foreground/40">{desc}</p>
          </div>
          <div className="text-right">
            <span className="font-display text-sm text-primary">{completedCount}/{lessons.length}</span>
            <div className="w-24 h-1.5 rounded-full bg-secondary mt-1">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-purple-glow"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
          {/* Progress line */}
          <div className="relative pl-8">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />

            {lessons.map((lesson, i) => {
              const Icon = typeIcons[lesson.lesson_type] || BookOpen;
              const color = typeColors[lesson.lesson_type] || "text-primary";
              const isCompleted = completed.has(lesson.id);
              const canAccess = lesson.is_free || !!user;

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative mb-6"
                >
                  {/* Timeline dot */}
                  <div className={`absolute -left-5 top-4 w-4 h-4 rounded-full border-2 ${
                    isCompleted
                      ? "bg-primary border-primary shadow-[0_0_10px_hsl(42_78%_55%/0.5)]"
                      : "bg-card border-primary/30"
                  }`} />

                  <button
                    onClick={() => canAccess && navigate(`/game/stage/${slug}/lesson/${lesson.slug}`)}
                    disabled={!canAccess}
                    className={`w-full text-left p-5 rounded-2xl golden-border backdrop-blur-sm transition-all duration-300 group ${
                      canAccess ? "hover:shadow-[0_0_30px_hsl(42_78%_55%/0.15)] cursor-pointer" : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-purple/10 flex items-center justify-center shrink-0 border border-primary/10 ${
                        isCompleted ? "glow-gold" : ""
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        ) : canAccess ? (
                          <Icon className={`w-6 h-6 ${color}`} />
                        ) : (
                          <Lock className="w-5 h-5 text-foreground/30" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-body text-[10px] uppercase tracking-wider text-foreground/40">
                            {lesson.lesson_type}
                          </span>
                          <span className="font-body text-[10px] text-primary/50">+{lesson.xp_reward} XP</span>
                        </div>
                        <h3 className="font-display text-base font-semibold text-foreground truncate">
                          {language === "es" ? lesson.title_es : lesson.title_en}
                        </h3>
                      </div>

                      {canAccess && !isCompleted && (
                        <Play className="w-5 h-5 text-primary/50 group-hover:text-primary transition-colors shrink-0" />
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
