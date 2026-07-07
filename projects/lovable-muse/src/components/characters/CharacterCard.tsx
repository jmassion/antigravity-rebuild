import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import type { Character } from '@/hooks/useCharacters';

const STATUS_COLORS: Record<string, string> = {
  concept: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
  approved: 'bg-green-500/10 text-green-600',
  archived: 'bg-muted text-muted-foreground/60',
};

interface CharacterCardProps {
  character: Character;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CharacterCard({ character, onSelect, onDelete }: CharacterCardProps) {
  const initials = character.name.slice(0, 2).toUpperCase();

  return (
    <Card
      className="group cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
      onClick={() => onSelect(character.id)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          {character.avatar_url ? (
            <img src={character.avatar_url} alt={character.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{character.name}</h3>
            {character.role && <p className="text-xs text-muted-foreground truncate">{character.role}</p>}
          </div>
          <Badge variant="outline" className={`text-[10px] shrink-0 ${STATUS_COLORS[character.status] || ''}`}>
            {character.status}
          </Badge>
        </div>

        {character.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{character.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {character.tags?.slice(0, 3).map(t => (
              <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
            {(character.tags?.length || 0) > 3 && (
              <Badge variant="secondary" className="text-[10px]">+{character.tags!.length - 3}</Badge>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={e => { e.stopPropagation(); onSelect(character.id); }}>
              <Eye className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); onDelete(character.id); }}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {character.project && (
          <div className="text-[10px] text-muted-foreground">📁 {character.project.name}</div>
        )}
      </CardContent>
    </Card>
  );
}
