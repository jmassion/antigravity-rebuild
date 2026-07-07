import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ToolResult {
  toolCallId: string;
  name: string;
  result: any;
  display?: { label: string; link?: string };
}

export function useAppActions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const executeToolCall = async (toolCall: ToolCall): Promise<ToolResult> => {
    const { name, arguments: argsStr } = toolCall.function;
    let args: any;
    try {
      args = JSON.parse(argsStr);
    } catch {
      return { toolCallId: toolCall.id, name, result: { error: 'Invalid arguments' } };
    }

    switch (name) {
      case 'navigate': {
        navigate(args.path);
        toast.info(args.reason || `Navigated to ${args.path}`);
        return {
          toolCallId: toolCall.id,
          name,
          result: { success: true, path: args.path },
          display: { label: `Navigated to ${args.path}`, link: args.path },
        };
      }

      case 'create_project': {
        if (!user) return { toolCallId: toolCall.id, name, result: { error: 'Not authenticated' } };
        const { data, error } = await supabase
          .from('projects')
          .insert({
            name: args.name,
            phase: args.phase || 'start',
            description: args.description || '',
            tags: args.tags || [],
            owner_id: user.id,
          })
          .select()
          .single();
        if (error) return { toolCallId: toolCall.id, name, result: { error: error.message } };
        toast.success(`Created project: ${args.name}`);
        return {
          toolCallId: toolCall.id,
          name,
          result: { success: true, project: data },
          display: { label: `Created project: ${args.name}`, link: '/projects' },
        };
      }

      case 'create_task': {
        if (!user) return { toolCallId: toolCall.id, name, result: { error: 'Not authenticated' } };
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            title: args.title,
            priority: args.priority || 'medium',
            description: args.description || '',
            status: args.status || 'todo',
            created_by: user.id,
          })
          .select()
          .single();
        if (error) return { toolCallId: toolCall.id, name, result: { error: error.message } };
        toast.success(`Created task: ${args.title}`);
        return {
          toolCallId: toolCall.id,
          name,
          result: { success: true, task: data },
          display: { label: `Created task: ${args.title}`, link: '/tasks' },
        };
      }

      case 'create_plan': {
        if (!user) return { toolCallId: toolCall.id, name, result: { error: 'Not authenticated' } };
        const { data, error } = await supabase
          .from('plans')
          .insert({
            title: args.title,
            brief: args.brief || '',
            goals: args.goals || [],
            owner_id: user.id,
          })
          .select()
          .single();
        if (error) return { toolCallId: toolCall.id, name, result: { error: error.message } };
        toast.success(`Created plan: ${args.title}`);
        return {
          toolCallId: toolCall.id,
          name,
          result: { success: true, plan: data },
          display: { label: `Created plan: ${args.title}`, link: '/plans' },
        };
      }

      case 'search': {
        if (!user) return { toolCallId: toolCall.id, name, result: { error: 'Not authenticated' } };
        const q = `%${args.query}%`;
        const searchType = args.type || 'all';
        const results: any = {};

        if (searchType === 'all' || searchType === 'projects') {
          const { data } = await supabase.from('projects').select('id, name, phase, tags').ilike('name', q).limit(5);
          results.projects = data || [];
        }
        if (searchType === 'all' || searchType === 'tasks') {
          const { data } = await supabase.from('tasks').select('id, title, status, priority').ilike('title', q).limit(5);
          results.tasks = data || [];
        }
        if (searchType === 'all' || searchType === 'assets') {
          const { data } = await supabase.from('assets').select('id, name, file_type').ilike('name', q).limit(5);
          results.assets = data || [];
        }
        return {
          toolCallId: toolCall.id,
          name,
          result: results,
          display: { label: `Searched for "${args.query}"` },
        };
      }

      case 'list_items': {
        if (!user) return { toolCallId: toolCall.id, name, result: { error: 'Not authenticated' } };
        const limit = args.limit || 10;
        let query: any;
        switch (args.type) {
          case 'projects':
            query = supabase.from('projects').select('id, name, phase, tags, description').limit(limit);
            break;
          case 'tasks':
            query = supabase.from('tasks').select('id, title, status, priority, description').limit(limit);
            break;
          case 'assets':
            query = supabase.from('assets').select('id, name, file_type, tags').limit(limit);
            break;
          case 'plans':
            query = supabase.from('plans').select('id, title, status, brief').limit(limit);
            break;
          case 'storyboards':
            query = supabase.from('storyboards').select('id, name, description').limit(limit);
            break;
          case 'team_members':
            query = supabase.from('team_members').select('id, display_name, role, title').limit(limit);
            break;
          default:
            return { toolCallId: toolCall.id, name, result: { error: `Unknown type: ${args.type}` } };
        }
        if (args.filter) {
          for (const [key, value] of Object.entries(args.filter)) {
            query = query.eq(key, value);
          }
        }
        const { data, error } = await query;
        if (error) return { toolCallId: toolCall.id, name, result: { error: error.message } };
        return {
          toolCallId: toolCall.id,
          name,
          result: { items: data, count: data?.length || 0 },
          display: { label: `Listed ${data?.length || 0} ${args.type}` },
        };
      }

      case 'summarize_page': {
        const summaries: Record<string, string> = {
          '/projects': 'Projects page shows all your creative productions organized by phase (Start, Build, Grow). You can create, filter, and manage projects here.',
          '/tasks': 'Tasks page is your task board with kanban and list views. Create tasks, assign priorities, link to projects and assets.',
          '/storyboards': 'Storyboards page lets you create visual sequences with frames, reorder them, add notes and audio.',
          '/assets': 'Asset library for all your files — images, videos, documents. Upload, tag, version, and organize.',
          '/plans': 'Plans page for production planning — create briefs, set goals, track deliverables.',
          '/team': 'Team directory showing all team members, their roles, and project assignments.',
          '/canvas': 'Infinite canvas workspace where you can place any page as a card and arrange them spatially.',
        };
        const summary = summaries[args.page] || `Page ${args.page} is part of the Pipeline app.`;
        return {
          toolCallId: toolCall.id,
          name,
          result: { summary },
          display: { label: `Described ${args.page}` },
        };
      }

      case 'create_character': {
        if (!user) return { toolCallId: toolCall.id, name, result: { error: 'Not authenticated' } };
        const { data, error } = await supabase
          .from('characters' as any)
          .insert({
            name: args.name,
            role: args.role || '',
            description: args.description || '',
            status: args.status || 'concept',
            tags: args.tags || [],
            owner_id: user.id,
          } as any)
          .select()
          .single();
        if (error) return { toolCallId: toolCall.id, name, result: { error: error.message } };
        toast.success(`Created character: ${args.name}`);
        return {
          toolCallId: toolCall.id,
          name,
          result: { success: true, character: data },
          display: { label: `Created character: ${args.name}`, link: '/start/characters' },
        };
      }

      default:
        return { toolCallId: toolCall.id, name, result: { error: `Unknown tool: ${name}` } };
    }
  };

  return { executeToolCall };
}
