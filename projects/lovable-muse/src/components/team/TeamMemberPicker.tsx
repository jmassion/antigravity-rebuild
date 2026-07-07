import { useState } from 'react';
import { Check, ChevronsUpDown, Bot, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PickerMember {
  id: string;
  display_name: string;
  avatar_url: string | null;
  member_type: string;
  role: string;
}

export default function TeamMemberPicker({
  value, onChange, placeholder = 'Assign...', className,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const { data: members = [] } = useQuery({
    queryKey: ['team-members-picker', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, display_name, avatar_url, member_type, role')
        .eq('is_active', true)
        .order('display_name');
      if (error) throw error;
      return data as PickerMember[];
    },
    enabled: !!user,
  });

  const selected = members.find(m => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors min-w-[140px]',
            className
          )}
        >
          {selected ? (
            <>
              <MiniAvatar member={selected} />
              <span className="truncate text-xs">{selected.display_name}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="w-3 h-3 ml-auto text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="start">
        {/* None option */}
        <button
          onClick={() => { onChange(null); setOpen(false); }}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors"
        >
          <span className="text-muted-foreground">Unassigned</span>
          {!value && <Check className="w-3 h-3 ml-auto text-primary" />}
        </button>
        {members.map(m => (
          <button
            key={m.id}
            onClick={() => { onChange(m.id); setOpen(false); }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-secondary transition-colors"
          >
            <MiniAvatar member={m} />
            <span className="truncate">{m.display_name}</span>
            <span className="text-[10px] text-muted-foreground ml-auto mr-1">
              {m.member_type === 'ai' ? '🤖' : m.member_type === 'placeholder' ? '👻' : ''}
            </span>
            {value === m.id && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
          </button>
        ))}
        {members.length === 0 && (
          <p className="text-xs text-muted-foreground px-2 py-3 text-center">No team members</p>
        )}
      </PopoverContent>
    </Popover>
  );
}

function MiniAvatar({ member }: { member: PickerMember }) {
  return (
    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 border border-border">
      {member.avatar_url ? (
        <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
      ) : member.member_type === 'ai' ? (
        <div className="w-full h-full bg-primary/10 flex items-center justify-center"><Bot className="w-3 h-3 text-primary" /></div>
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
          {member.display_name[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );
}

export { MiniAvatar, type PickerMember };
