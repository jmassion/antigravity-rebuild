import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Database, Shield, Users, Gamepad2, BookOpen, Trophy, Brain,
  Layers, Server, Lock, ArrowLeft, Sparkles, Map, Star,
  Swords, GraduationCap, Zap, Eye, GitBranch, Table2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

const tables = [
  {
    name: "profiles",
    icon: Users,
    color: "text-gold",
    desc: "Player identity — XP, level, current stage, avatar",
    columns: ["user_id", "display_name", "xp", "level", "current_stage", "avatar_url"],
    rls: "Users can only read/update their own profile. Auto-created on signup.",
  },
  {
    name: "pipeline_stages",
    icon: Map,
    color: "text-purple-light",
    desc: "The 8 worlds of the entertainment pipeline",
    columns: ["slug", "title_en/es", "description_en/es", "icon", "order_index", "is_free", "xp_reward"],
    rls: "Public read access. No user writes.",
  },
  {
    name: "lessons",
    icon: BookOpen,
    color: "text-gold-light",
    desc: "Individual learning nodes — text, quiz, roleplay, challenge",
    columns: ["slug", "stage_id", "lesson_type", "title_en/es", "content_en/es", "character_guide", "is_free", "xp_reward"],
    rls: "Free lessons are public. All lessons visible to authenticated users.",
  },
  {
    name: "quiz_questions",
    icon: Brain,
    color: "text-purple-glow",
    desc: "Multiple-choice questions attached to quiz lessons",
    columns: ["lesson_id", "question_en/es", "options_en/es", "correct_index", "explanation_en/es", "xp_reward"],
    rls: "Public read. No user writes.",
  },
  {
    name: "roleplay_scenarios",
    icon: Swords,
    color: "text-gold",
    desc: "Branching narrative scenarios with choices & outcomes",
    columns: ["lesson_id", "scenario_en/es", "role_title_en/es", "choices (JSON)", "outcome_xp"],
    rls: "Public read. No user writes.",
  },
  {
    name: "user_progress",
    icon: Star,
    color: "text-gold-light",
    desc: "Tracks which lessons each user has completed",
    columns: ["user_id", "lesson_id", "completed", "completed_at", "score"],
    rls: "Users can only view/insert/update their own records.",
  },
  {
    name: "achievements",
    icon: Trophy,
    color: "text-gold",
    desc: "Badge definitions — unlockable rewards",
    columns: ["slug", "title_en/es", "description_en/es", "icon", "condition_type", "condition_value", "xp_reward"],
    rls: "Public read. No user writes.",
  },
  {
    name: "user_achievements",
    icon: Sparkles,
    color: "text-purple-glow",
    desc: "Junction table: which user earned which badge",
    columns: ["user_id", "achievement_id", "earned_at"],
    rls: "Users can only view/insert their own achievements.",
  },
];

const features = [
  {
    icon: Gamepad2,
    title: "World Map Overworld",
    desc: "Super Mario-style stage selector. 8 interconnected worlds with animated SVG paths, starfield background, and glow effects. Locked stages appear dimmed until the player progresses.",
  },
  {
    icon: BookOpen,
    title: "Multi-Format Lessons",
    desc: "Each lesson can be text (rich content), quiz (multiple choice with XP), roleplay (branching scenarios), or challenge. The lesson viewer dynamically loads the right UI.",
  },
  {
    icon: Brain,
    title: "Interactive Quizzes",
    desc: "Questions with 4 options, instant feedback, explanations, and XP rewards. Wrong answers show the correct one with context. Progress is saved per-question.",
  },
  {
    icon: Swords,
    title: "Roleplay Scenarios",
    desc: "Step into industry roles — Director, Producer, Writer. Make branching decisions that affect outcomes and XP. Choices are stored as JSON with dynamic rendering.",
  },
  {
    icon: Zap,
    title: "XP & Leveling System",
    desc: "Every action earns XP. Level = floor(XP / 200) + 1. Profile tracks total XP, current level, and stage progression. Visual progress bars throughout the UI.",
  },
  {
    icon: Trophy,
    title: "Achievement Badges",
    desc: "8 unique badges like 'Story Master' and 'XP Hunter'. Condition-based unlocking (stage completion, XP thresholds). Displayed in the player profile grid.",
  },
  {
    icon: Eye,
    title: "Bilingual Content",
    desc: "Every piece of content has English and Spanish variants. Language switcher in the navbar propagates through the entire app via React Context.",
  },
  {
    icon: GraduationCap,
    title: "Character Guides",
    desc: "Tiger sprites (Professor, Detective, Explorer, etc.) guide players through lessons. Each lesson can assign a different character for personality.",
  },
];

const techLayers = [
  {
    label: "Frontend",
    icon: Layers,
    items: ["React 18 + TypeScript", "Vite (build)", "Tailwind CSS + shadcn/ui", "Framer Motion (animations)", "React Three Fiber (3D)", "React Router v6"],
    color: "border-gold/30",
  },
  {
    label: "State & Data",
    icon: GitBranch,
    items: ["TanStack React Query", "React Context (Auth, i18n)", "Supabase JS SDK", "Realtime subscriptions"],
    color: "border-purple-light/30",
  },
  {
    label: "Backend (Cloud)",
    icon: Server,
    items: ["PostgreSQL database", "Row-Level Security", "Auth (email/password)", "Edge Functions (Deno)", "Auto-profile trigger", "Storage buckets"],
    color: "border-gold/30",
  },
  {
    label: "Security",
    icon: Lock,
    items: ["RLS on every table", "User-scoped data access", "Service role isolation", "JWT-based sessions", "Auto token refresh"],
    color: "border-purple-light/30",
  },
];

const ArchitecturePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="relative py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button variant="outline" onClick={() => navigate("/game")} className="border-gold/30 text-gold hover:bg-gold/10">
            <Gamepad2 className="w-4 h-4 mr-2" /> Play the Game
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-16 px-6 text-center section-bg-gradient">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/20 bg-secondary/50 mb-6">
            <Database className="w-4 h-4 text-gold" />
            <span className="text-sm text-muted-foreground font-body">System Architecture</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-gradient-gold mb-4">
            How It All Works
          </h1>
          <p className="text-lg text-muted-foreground font-elegant max-w-2xl mx-auto">
            A visual guide to the database schema, game mechanics, security model, and technology stack powering this entertainment-industry LMS.
          </p>
        </motion.div>
      </section>

      {/* Main Content — Tabbed */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full max-w-xl mx-auto grid grid-cols-4 bg-secondary/60 mb-10">
            <TabsTrigger value="overview" className="font-display text-xs data-[state=active]:text-gold">Overview</TabsTrigger>
            <TabsTrigger value="database" className="font-display text-xs data-[state=active]:text-gold">Database</TabsTrigger>
            <TabsTrigger value="features" className="font-display text-xs data-[state=active]:text-gold">Features</TabsTrigger>
            <TabsTrigger value="stack" className="font-display text-xs data-[state=active]:text-gold">Tech Stack</TabsTrigger>
          </TabsList>

          {/* ── OVERVIEW TAB ── */}
          <TabsContent value="overview">
            <div className="space-y-12">
              {/* Flow diagram */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="golden-border rounded-xl p-8">
                <h2 className="text-2xl font-display text-gradient-gold mb-6 text-center">System Flow</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
                  {[
                    { icon: Users, label: "Player Signs Up", sub: "Email + password → profile auto-created" },
                    { icon: Map, label: "World Map Loads", sub: "8 stages fetched from pipeline_stages" },
                    { icon: BookOpen, label: "Enter a Stage", sub: "Lessons loaded by stage_id" },
                    { icon: Brain, label: "Complete Lessons", sub: "Quiz / roleplay / text → XP earned" },
                    { icon: Trophy, label: "Level Up & Badges", sub: "XP thresholds unlock achievements" },
                  ].map((step, i) => (
                    <motion.div key={i} variants={fadeUp} custom={i} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center border border-gold/20">
                        <step.icon className="w-6 h-6 text-gold" />
                      </div>
                      <p className="font-display text-sm text-foreground">{step.label}</p>
                      <p className="text-xs text-muted-foreground font-body">{step.sub}</p>
                      {i < 4 && <span className="hidden md:block text-gold/40 text-2xl absolute translate-x-[100%]">→</span>}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Database Tables", value: "8", icon: Table2 },
                  { label: "Pipeline Stages", value: "8", icon: Map },
                  { label: "Lesson Types", value: "4", icon: BookOpen },
                  { label: "RLS Policies", value: "12+", icon: Shield },
                ].map((stat, i) => (
                  <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                    <Card className="golden-border text-center">
                      <CardContent className="pt-6">
                        <stat.icon className="w-8 h-8 text-gold mx-auto mb-2" />
                        <p className="text-3xl font-display text-gradient-gold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* RLS explanation */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="golden-border rounded-xl p-8">
                <div className="flex items-start gap-4">
                  <Shield className="w-10 h-10 text-gold shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-display text-foreground mb-2">Row-Level Security (RLS)</h3>
                    <p className="text-muted-foreground font-body text-sm leading-relaxed">
                      Every table has RLS enabled. This means the database itself enforces who can see and modify data — not just the app code.
                      For example, <span className="text-gold">user_progress</span> rows are invisible to other users. Content tables like
                      <span className="text-gold"> pipeline_stages</span> and <span className="text-gold">achievements</span> are publicly readable
                      but nobody except admins can write to them. Profiles are viewable by all but only editable by the owner. This is defense-in-depth security.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── DATABASE TAB ── */}
          <TabsContent value="database">
            <div className="space-y-6">
              <p className="text-center text-muted-foreground font-elegant text-lg mb-8">
                8 tables powering the entire game engine. Every table has Row-Level Security.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tables.map((table, i) => (
                  <motion.div key={table.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                    <Card className="golden-border h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <table.icon className={`w-5 h-5 ${table.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-base font-display">{table.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{table.desc}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {table.columns.map((col) => (
                            <span key={col} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border font-mono">
                              {col}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-start gap-2 pt-2 border-t border-border">
                          <Lock className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                          <p className="text-[11px] text-muted-foreground">{table.rls}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Relationships visual */}
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="golden-border rounded-xl p-8 mt-8">
                <h3 className="text-xl font-display text-gradient-gold mb-6 text-center">Table Relationships</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm font-body">
                  <div className="space-y-2">
                    <p className="text-gold font-display">Content Chain</p>
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <span className="px-3 py-1 rounded bg-secondary">pipeline_stages</span>
                      <span className="text-gold/50">↓ has many</span>
                      <span className="px-3 py-1 rounded bg-secondary">lessons</span>
                      <span className="text-gold/50">↓ has many</span>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded bg-secondary text-xs">quiz_questions</span>
                        <span className="px-3 py-1 rounded bg-secondary text-xs">roleplay_scenarios</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-purple-light font-display">Player Data</p>
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <span className="px-3 py-1 rounded bg-secondary">auth.users</span>
                      <span className="text-purple-glow/50">↓ triggers</span>
                      <span className="px-3 py-1 rounded bg-secondary">profiles</span>
                      <span className="text-purple-glow/50">↓ owns</span>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded bg-secondary text-xs">user_progress</span>
                        <span className="px-3 py-1 rounded bg-secondary text-xs">user_achievements</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gold-light font-display">Reward System</p>
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <span className="px-3 py-1 rounded bg-secondary">achievements</span>
                      <span className="text-gold/50">↓ earned via</span>
                      <span className="px-3 py-1 rounded bg-secondary">user_achievements</span>
                      <span className="text-gold/50">↓ grants</span>
                      <span className="px-3 py-1 rounded bg-secondary">XP → profiles.level</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          {/* ── FEATURES TAB ── */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feat, i) => (
                <motion.div key={feat.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className="golden-border h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <feat.icon className="w-5 h-5 text-gold" />
                        </div>
                        <CardTitle className="text-base font-display">{feat.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground font-body leading-relaxed">{feat.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* ── TECH STACK TAB ── */}
          <TabsContent value="stack">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techLayers.map((layer, i) => (
                <motion.div key={layer.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                  <Card className={`golden-border h-full`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <layer.icon className="w-5 h-5 text-gold" />
                        </div>
                        <CardTitle className="text-lg font-display">{layer.label}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {layer.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold/60 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Auth flow */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="golden-border rounded-xl p-8 mt-8">
              <h3 className="text-xl font-display text-gradient-gold mb-6 text-center">Authentication Flow</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm">
                {[
                  { step: "1", label: "Sign Up", desc: "Email + password + display name" },
                  { step: "2", label: "Email Verification", desc: "Confirm link sent to inbox" },
                  { step: "3", label: "Profile Created", desc: "Trigger auto-inserts into profiles" },
                  { step: "4", label: "Game Access", desc: "JWT session → RLS enforces permissions" },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-display text-gold">
                      {s.step}
                    </div>
                    <p className="font-display text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center border-t border-border">
        <p className="text-muted-foreground text-sm font-body">
          Built with <span className="text-gold">Lovable Cloud</span> — full-stack backend, zero config.
        </p>
      </footer>
    </div>
  );
};

export default ArchitecturePage;
