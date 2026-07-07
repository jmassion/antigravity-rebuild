import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, Sparkles, Gamepad2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Character guide images map
const characterImages: Record<string, string> = {};
try {
  const modules = import.meta.glob("@/assets/sprites/*.png", { eager: true }) as Record<string, { default: string }>;
  for (const [path, mod] of Object.entries(modules)) {
    const name = path.split("/").pop()?.replace(".png", "") || "";
    characterImages[name] = mod.default;
  }
} catch {}

export default function LessonPage() {
  const { slug, lessonSlug } = useParams<{ slug: string; lessonSlug: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [roleplayScenarios, setRoleplayScenarios] = useState<any[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [roleplayChoice, setRoleplayChoice] = useState<number | null>(null);
  const [earnedXP, setEarnedXP] = useState(0);
  const [completed, setCompleted] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: stageData } = await supabase
        .from("pipeline_stages")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!stageData) return;

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("stage_id", stageData.id)
        .eq("slug", lessonSlug)
        .single();
      if (lessonData) {
        setLesson(lessonData);

        if (lessonData.lesson_type === "quiz") {
          const { data: questions } = await supabase
            .from("quiz_questions")
            .select("*")
            .eq("lesson_id", lessonData.id)
            .order("order_index");
          if (questions) setQuizQuestions(questions);
        }

        if (lessonData.lesson_type === "roleplay") {
          const { data: scenarios } = await supabase
            .from("roleplay_scenarios")
            .select("*")
            .eq("lesson_id", lessonData.id)
            .order("order_index");
          if (scenarios) setRoleplayScenarios(scenarios);
        }
      }
    };
    fetchData();
  }, [slug, lessonSlug]);

  const completeLesson = async (xp: number) => {
    if (!user || !lesson || completed) return;
    setCompleted(true);
    setEarnedXP(xp);

    await supabase.from("user_progress").upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      completed: true,
      score: quizScore,
      completed_at: new Date().toISOString(),
    }, { onConflict: "user_id,lesson_id" });

    // Update XP
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("user_id", user.id)
      .single();
    if (profile) {
      const newXp = profile.xp + xp;
      const newLevel = Math.floor(newXp / 200) + 1;
      await supabase.from("profiles").update({ xp: newXp, level: newLevel }).eq("user_id", user.id);
    }

    toast({ title: `🎉 +${xp} XP!`, description: "Lesson completed!" });
  };

  const handleQuizAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const q = quizQuestions[currentQuiz];
    if (index === q.correct_index) {
      setQuizScore((s) => s + q.xp_reward);
    }
  };

  const nextQuestion = () => {
    if (currentQuiz < quizQuestions.length - 1) {
      setCurrentQuiz((c) => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeLesson(lesson.xp_reward + quizScore);
    }
  };

  if (!lesson) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}>
        <Sparkles className="w-8 h-8 text-primary" />
      </motion.div>
    </div>
  );

  const title = language === "es" ? lesson.title_es : lesson.title_en;
  const content = language === "es" ? lesson.content_es : lesson.content_en;
  const guideImg = characterImages[lesson.character_guide] || "";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(280_50%_12%)_0%,_hsl(270_35%_6%)_70%)]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 glass border-b border-primary/10">
          <button onClick={() => navigate(`/game/stage/${slug}`)} className="text-foreground/50 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <span className="font-body text-[10px] uppercase tracking-wider text-foreground/40">{lesson.lesson_type}</span>
            <h1 className="font-display text-lg font-bold text-foreground">{title}</h1>
          </div>
          <div className="font-display text-sm text-primary">+{lesson.xp_reward} XP</div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Character guide */}
          {guideImg && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-card/50 border border-primary/10"
            >
              <img src={guideImg} alt="" className="w-12 h-12 object-contain rounded-lg" />
              <p className="font-elegant text-sm text-foreground/50 italic">
                {language === "es" ? "Tu guía para esta lección" : "Your guide for this lesson"}
              </p>
            </motion.div>
          )}

          {/* TEXT LESSON */}
          {lesson.lesson_type === "text" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose-custom"
            >
              <div
                className="font-body text-foreground/75 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(/^# (.+)$/gm, '<h1 class="font-display text-3xl font-bold text-gradient-gold mb-4">$1</h1>')
                    .replace(/^## (.+)$/gm, '<h2 class="font-display text-xl font-semibold text-foreground mt-8 mb-3">$1</h2>')
                    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-primary/40 pl-4 italic text-foreground/50 my-6">$1</blockquote>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/^- (.+)$/gm, '<li class="flex items-start gap-2 ml-4"><span class="text-primary mt-1">▸</span><span>$1</span></li>')
                    .replace(/^\d+\. \*\*(.+?)\*\* — (.+)$/gm, '<div class="flex items-start gap-3 my-3"><span class="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 font-display text-xs text-primary font-bold"></span><div><strong class="text-foreground">$1</strong><span class="text-foreground/60"> — $2</span></div></div>')
                    .replace(/\n\n/g, '<br/><br/>')
                }}
              />

              {!completed && user && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-12 text-center">
                  <Button
                    onClick={() => completeLesson(lesson.xp_reward)}
                    className="font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 glow-gold"
                  >
                    Complete Lesson <CheckCircle className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {completed && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-12 text-center p-8 rounded-2xl golden-border">
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="font-display text-2xl font-bold text-gradient-gold mb-1">+{earnedXP} XP</p>
                  <p className="font-body text-sm text-foreground/50">Lesson completed!</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* QUIZ */}
          {lesson.lesson_type === "quiz" && quizQuestions.length > 0 && !completed && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-body text-sm text-foreground/40">
                  Question {currentQuiz + 1} of {quizQuestions.length}
                </span>
                <div className="w-32 h-1.5 rounded-full bg-secondary">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-purple-glow"
                    animate={{ width: `${((currentQuiz + 1) / quizQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={currentQuiz} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                  {(() => {
                    const q = quizQuestions[currentQuiz];
                    const question = language === "es" ? q.question_es : q.question_en;
                    const options = (language === "es" ? q.options_es : q.options_en) as string[];
                    const explanation = language === "es" ? q.explanation_es : q.explanation_en;

                    return (
                      <div>
                        <h2 className="font-display text-xl font-semibold text-foreground mb-6">{question}</h2>
                        <div className="space-y-3">
                          {options.map((opt: string, idx: number) => {
                            const isCorrect = idx === q.correct_index;
                            const isSelected = selectedAnswer === idx;
                            return (
                              <motion.button
                                key={idx}
                                whileHover={!showResult ? { scale: 1.02 } : {}}
                                onClick={() => handleQuizAnswer(idx)}
                                className={`w-full text-left p-4 rounded-xl border transition-all font-body text-sm ${
                                  showResult
                                    ? isCorrect
                                      ? "border-primary bg-primary/10 text-foreground"
                                      : isSelected
                                        ? "border-destructive bg-destructive/10 text-foreground/70"
                                        : "border-border/20 bg-card/30 text-foreground/50"
                                    : "border-border/30 bg-card/40 hover:border-primary/40 text-foreground/70"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    showResult && isCorrect ? "border-primary bg-primary" : showResult && isSelected ? "border-destructive bg-destructive" : "border-foreground/20"
                                  }`}>
                                    {showResult && isCorrect && <CheckCircle className="w-4 h-4 text-primary-foreground" />}
                                    {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive-foreground" />}
                                  </div>
                                  {opt}
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>

                        {showResult && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                            <div className="p-4 rounded-xl bg-card/50 border border-primary/15 mb-4">
                              <p className="font-body text-sm text-foreground/60">{explanation}</p>
                            </div>
                            <Button onClick={nextQuestion} className="font-display text-xs tracking-wider uppercase bg-primary text-primary-foreground">
                              {currentQuiz < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Quiz completed */}
          {lesson.lesson_type === "quiz" && completed && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-10 rounded-2xl golden-border">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="font-display text-3xl font-bold text-gradient-gold mb-2">+{earnedXP} XP</p>
              <p className="font-body text-foreground/50">Quiz completed! Score: {quizScore}</p>
            </motion.div>
          )}

          {/* ROLEPLAY */}
          {lesson.lesson_type === "roleplay" && roleplayScenarios.length > 0 && !completed && (
            <div>
              {roleplayScenarios.map((scenario) => {
                const scenarioText = language === "es" ? scenario.scenario_es : scenario.scenario_en;
                const roleTitle = language === "es" ? scenario.role_title_es : scenario.role_title_en;
                const choices = scenario.choices as any[];

                return (
                  <motion.div key={scenario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                      <span className="font-display text-sm text-primary">{roleTitle}</span>
                    </div>
                    <p className="font-body text-foreground/70 leading-relaxed mb-8">{scenarioText}</p>

                    <div className="space-y-3">
                      {choices.map((choice: any, idx: number) => {
                        const choiceText = language === "es" ? choice.es : choice.en;
                        const outcomeText = language === "es" ? choice.outcome_es : choice.outcome_en;
                        const isChosen = roleplayChoice === idx;

                        return (
                          <div key={idx}>
                            <motion.button
                              whileHover={roleplayChoice === null ? { scale: 1.02 } : {}}
                              onClick={() => {
                                if (roleplayChoice !== null) return;
                                setRoleplayChoice(idx);
                              }}
                              className={`w-full text-left p-4 rounded-xl border transition-all font-body text-sm ${
                                isChosen
                                  ? "border-primary bg-primary/10"
                                  : roleplayChoice !== null
                                    ? "border-border/15 bg-card/20 opacity-50"
                                    : "border-border/30 bg-card/40 hover:border-primary/40"
                              } text-foreground/70`}
                            >
                              {choiceText}
                              {isChosen && <span className="ml-2 text-primary text-xs">+{choice.xp} XP</span>}
                            </motion.button>

                            {isChosen && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 ml-4 p-3 rounded-lg bg-card/30 border border-primary/10">
                                <p className="font-body text-xs text-foreground/55">{outcomeText}</p>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {roleplayChoice !== null && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
                        <Button
                          onClick={() => completeLesson(lesson.xp_reward + (choices[roleplayChoice]?.xp || 0))}
                          className="font-display text-xs tracking-wider uppercase bg-primary text-primary-foreground glow-gold"
                        >
                          Continue Adventure <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {lesson.lesson_type === "roleplay" && completed && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-10 rounded-2xl golden-border">
              <Gamepad2 className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="font-display text-3xl font-bold text-gradient-gold mb-2">+{earnedXP} XP</p>
              <p className="font-body text-foreground/50">Role-play scenario completed!</p>
            </motion.div>
          )}

          {/* CHALLENGE placeholder */}
          {lesson.lesson_type === "challenge" && (
            <div className="text-center py-16">
              <Zap className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="font-display text-xl text-foreground/40">Challenge coming soon...</p>
              <p className="font-body text-sm text-foreground/25 mt-2">This feature is being built</p>
            </div>
          )}

          {/* No login notice */}
          {!user && lesson.lesson_type !== "text" && (
            <div className="text-center py-12">
              <p className="font-body text-foreground/40 mb-4">Sign in to track your progress and earn XP</p>
              <Button onClick={() => navigate("/auth")} variant="outline" className="border-primary/30 text-primary">
                Sign In to Play
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
