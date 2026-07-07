# 💎 Liquid Glass Design System

The signature visual language for all AntiGravity interfaces.

## Philosophy

Liquid Glass creates depth through transparency, blur, and layered surfaces. Every panel feels like it's floating in a clean, well-lit studio space.

## CSS Variables

```css
:root {
  /* Glass Surface */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-bg-hover: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.12);
  --glass-blur: 24px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);

  /* Depth Layers */
  --layer-0: rgba(10, 10, 15, 1);      /* Background */
  --layer-1: rgba(255, 255, 255, 0.04); /* Surface */
  --layer-2: rgba(255, 255, 255, 0.08); /* Card */
  --layer-3: rgba(255, 255, 255, 0.12); /* Elevated */

  /* Accent Colors */
  --accent-primary: #6C63FF;    /* Indigo */
  --accent-secondary: #00D4AA;  /* Teal */
  --accent-tertiary: #FF6B9D;   /* Rose */
  --accent-glow: rgba(108, 99, 255, 0.3);

  /* Text */
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.65);
  --text-muted: rgba(255, 255, 255, 0.4);

  /* Borders & Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 28px;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Glass Panel Pattern

```css
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  transition: all var(--transition-smooth);
}

.glass-panel:hover {
  background: var(--glass-bg-hover);
  border-color: var(--accent-primary);
  box-shadow: 0 8px 32px rgba(108, 99, 255, 0.15);
  transform: translateY(-2px);
}
```

## Scenes: White Room Studio

The default environment for content visualization:
- Pure white or very light gray background
- Soft ambient lighting with subtle shadows
- Characters and objects rendered hyperrealistically
- Workstations and props match the character's role
- Large screens showing active projects/data

---

See also: [[04-styles]], [[04-styles/color-palette]], [[04-styles/typography]]
