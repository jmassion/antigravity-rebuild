import { motion } from "framer-motion";

const USERS = [
  { name: "Aria", color: "hsl(var(--presence-1))", x: 62, y: 38, active: true },
  { name: "Kai", color: "hsl(var(--presence-2))", x: 78, y: 52, active: true },
  { name: "Zoe", color: "hsl(var(--presence-3))", x: 45, y: 65, active: false },
  { name: "Rex", color: "hsl(var(--presence-4))", x: 85, y: 30, active: true },
];

export function PresenceBar() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {USERS.map((user, i) => (
          <motion.div
            key={user.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold"
            style={{ background: user.color + "33", borderColor: user.color + "60", color: user.color }}
            title={user.name}
          >
            {user.name[0]}
            {user.active && (
              <span
                className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background"
                style={{ background: user.color }}
              />
            )}
          </motion.div>
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        <span className="text-foreground font-medium">4</span> collaborating
      </span>
    </div>
  );
}

export function PresenceCursors() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {USERS.filter((u) => u.active).map((user, i) => (
        <motion.div
          key={user.name}
          className="absolute"
          animate={{
            x: [`${user.x}%`, `${user.x + 3}%`, `${user.x - 2}%`, `${user.x}%`],
            y: [`${user.y}%`, `${user.y - 2}%`, `${user.y + 4}%`, `${user.y}%`],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Cursor */}
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M0 0L0 14L4 10L7 18L9 17L6 9L11 9L0 0Z" fill={user.color} />
          </svg>
          {/* Name tag */}
          <div
            className="absolute top-5 left-2 text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap font-medium"
            style={{ background: user.color + "33", color: user.color, border: `1px solid ${user.color}50` }}
          >
            {user.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
