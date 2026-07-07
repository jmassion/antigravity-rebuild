// Tool name/domain → icon & metadata mapping

export interface ToolInfo {
  name: string;
  icon: string; // emoji or short identifier
  color: string; // tailwind text color class using semantic tokens
  domains: string[];
}

export const TOOLS: ToolInfo[] = [
  { name: 'Figma', icon: '🎨', color: 'text-primary', domains: ['figma.com'] },
  { name: 'Photoshop', icon: '🖌️', color: 'text-primary', domains: ['photoshop.adobe.com'] },
  { name: 'Illustrator', icon: '✏️', color: 'text-phase-start', domains: ['illustrator.adobe.com'] },
  { name: 'After Effects', icon: '🎞️', color: 'text-primary', domains: ['aftereffects.adobe.com'] },
  { name: 'Premiere', icon: '🎬', color: 'text-primary', domains: ['premiere.adobe.com'] },
  { name: 'Blender', icon: '🧊', color: 'text-phase-build', domains: ['blender.org'] },
  { name: 'Unity', icon: '🎮', color: 'text-foreground', domains: ['unity.com', 'unity3d.com'] },
  { name: 'Unreal', icon: '⚡', color: 'text-foreground', domains: ['unrealengine.com'] },
  { name: 'Google Drive', icon: '📁', color: 'text-phase-build', domains: ['drive.google.com', 'docs.google.com', 'sheets.google.com'] },
  { name: 'Dropbox', icon: '📦', color: 'text-primary', domains: ['dropbox.com'] },
  { name: 'Notion', icon: '📝', color: 'text-foreground', domains: ['notion.so', 'notion.site'] },
  { name: 'Slack', icon: '💬', color: 'text-phase-grow', domains: ['slack.com'] },
  { name: 'Discord', icon: '🎙️', color: 'text-primary', domains: ['discord.com', 'discord.gg'] },
  { name: 'GitHub', icon: '🐙', color: 'text-foreground', domains: ['github.com'] },
  { name: 'Trello', icon: '📋', color: 'text-primary', domains: ['trello.com'] },
  { name: 'Miro', icon: '🟡', color: 'text-phase-start', domains: ['miro.com'] },
  { name: 'Canva', icon: '🎯', color: 'text-primary', domains: ['canva.com'] },
  { name: 'Midjourney', icon: '🌀', color: 'text-primary', domains: ['midjourney.com'] },
  { name: 'RunwayML', icon: '🏃', color: 'text-phase-build', domains: ['runwayml.com', 'app.runwayml.com'] },
  { name: 'ChatGPT', icon: '🤖', color: 'text-phase-grow', domains: ['chat.openai.com', 'chatgpt.com'] },
  { name: 'Claude', icon: '🧠', color: 'text-phase-start', domains: ['claude.ai'] },
  { name: 'Airtable', icon: '📊', color: 'text-phase-build', domains: ['airtable.com'] },
  { name: 'Linear', icon: '📐', color: 'text-primary', domains: ['linear.app'] },
  { name: 'YouTube', icon: '▶️', color: 'text-destructive', domains: ['youtube.com', 'youtu.be'] },
  { name: 'Vimeo', icon: '🎥', color: 'text-primary', domains: ['vimeo.com'] },
];

/** Detect tool from URL domain */
export function detectToolFromUrl(url: string): ToolInfo | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    for (const tool of TOOLS) {
      if (tool.domains.some(d => hostname === d || hostname.endsWith('.' + d))) {
        return tool;
      }
    }
  } catch { /* invalid URL */ }
  return null;
}

/** Get tool info by name */
export function getToolByName(name: string): ToolInfo | null {
  return TOOLS.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
}

/** Parse tool tags like "tool:figma" and return matching ToolInfo */
export function parseToolTag(tag: string): ToolInfo | null {
  if (!tag.startsWith('tool:')) return null;
  const toolName = tag.slice(5);
  return getToolByName(toolName);
}

/** Get all tool names for autocomplete */
export function getAllToolNames(): string[] {
  return TOOLS.map(t => t.name);
}
