export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  phase: 'start' | 'build' | 'grow';
  assetCount: number;
  memberCount: number;
  updatedAt: string;
  tags: string[];
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'model';
  thumbnail: string;
  tags: string[];
  projectIds: string[];
  versions: number;
  updatedAt: string;
  description?: string;
}

export interface StoryboardFrame {
  id: string;
  order: number;
  assetId: string;
  thumbnail: string;
  title: string;
  notes: string;
  duration: number; // seconds
  version: number;
  status: 'draft' | 'review' | 'approved';
  assignee?: string;
  tags: string[];
}

export interface Storyboard {
  id: string;
  name: string;
  projectId: string;
  frames: StoryboardFrame[];
  createdAt: string;
  updatedAt: string;
}

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Nebula Chronicles',
    description: 'Animated sci-fi series — Season 1',
    thumbnail: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=400&h=300&fit=crop',
    phase: 'build',
    assetCount: 342,
    memberCount: 8,
    updatedAt: '2 hours ago',
    tags: ['animation', 'sci-fi', 'series'],
  },
  {
    id: 'p2',
    name: 'Brand Identity System',
    description: 'Complete visual identity for TechVault',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    phase: 'start',
    assetCount: 87,
    memberCount: 3,
    updatedAt: '5 hours ago',
    tags: ['branding', 'identity', 'design'],
  },
  {
    id: 'p3',
    name: 'Product Launch Campaign',
    description: 'Multi-channel campaign for Q2 release',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    phase: 'grow',
    assetCount: 156,
    memberCount: 5,
    updatedAt: '1 day ago',
    tags: ['marketing', 'campaign', 'launch'],
  },
  {
    id: 'p4',
    name: 'Fantasy RPG World',
    description: 'World building for indie game project',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop',
    phase: 'start',
    assetCount: 213,
    memberCount: 6,
    updatedAt: '3 hours ago',
    tags: ['game', 'fantasy', 'worldbuilding'],
  },
];

export const mockAssets: Asset[] = [
  {
    id: 'a1', name: 'Hero Character — Front View', type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=300&fit=crop',
    tags: ['character', 'hero', 'turnaround'], projectIds: ['p1', 'p4'], versions: 4, updatedAt: '1h ago',
  },
  {
    id: 'a2', name: 'Cityscape Matte Painting', type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=300&fit=crop',
    tags: ['environment', 'city', 'matte'], projectIds: ['p1'], versions: 2, updatedAt: '3h ago',
  },
  {
    id: 'a3', name: 'Main Theme — Draft v3', type: 'audio',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop',
    tags: ['audio', 'soundtrack', 'theme'], projectIds: ['p1'], versions: 3, updatedAt: '1d ago',
  },
  {
    id: 'a4', name: 'Style Guide — Colors', type: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=300&fit=crop',
    tags: ['style-guide', 'colors', 'branding'], projectIds: ['p2'], versions: 1, updatedAt: '5h ago',
  },
  {
    id: 'a5', name: 'Villain Turnaround Sheet', type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=300&fit=crop',
    tags: ['character', 'villain', 'turnaround'], projectIds: ['p1', 'p4'], versions: 6, updatedAt: '30m ago',
  },
  {
    id: 'a6', name: 'Launch Ad — Instagram', type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=300&fit=crop',
    tags: ['marketing', 'social', 'ad'], projectIds: ['p3'], versions: 2, updatedAt: '2d ago',
  },
];

export const mockStoryboard: Storyboard = {
  id: 'sb1',
  name: 'Episode 1 — Opening Sequence',
  projectId: 'p1',
  createdAt: '2 weeks ago',
  updatedAt: '2 hours ago',
  frames: [
    { id: 'f1', order: 1, assetId: 'a2', thumbnail: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=300&h=200&fit=crop', title: 'Wide — City at Dawn', notes: 'Slow pan across skyline, warm golden light breaking through clouds', duration: 5, version: 3, status: 'approved', assignee: 'Alex', tags: ['establishing', 'city'] },
    { id: 'f2', order: 2, assetId: 'a1', thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=200&fit=crop', title: 'Close-up — Hero wakes', notes: 'Eyes open, camera pulls back slowly. Expression: determined.', duration: 3, version: 5, status: 'review', assignee: 'Maria', tags: ['character', 'closeup'] },
    { id: 'f3', order: 3, assetId: 'a5', thumbnail: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=300&h=200&fit=crop', title: 'Medium — Hero stands', notes: 'Full body reveal, costume detail visible. Wind in hair.', duration: 4, version: 2, status: 'draft', tags: ['character', 'reveal'] },
    { id: 'f4', order: 4, assetId: 'a2', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop', title: 'Aerial — City overview', notes: 'Drone shot sweeping over the city. Show scale.', duration: 6, version: 1, status: 'draft', assignee: 'Tom', tags: ['aerial', 'city'] },
    { id: 'f5', order: 5, assetId: 'a1', thumbnail: 'https://images.unsplash.com/photo-1534996858221-380b92700493?w=300&h=200&fit=crop', title: 'Title Card', notes: 'NEBULA CHRONICLES fades in with particle effect', duration: 4, version: 2, status: 'approved', tags: ['title', 'vfx'] },
  ],
};
