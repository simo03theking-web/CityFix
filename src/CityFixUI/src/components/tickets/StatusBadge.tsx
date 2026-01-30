import { TicketStatus, STATUS_INFO } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const info = STATUS_INFO[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      variant="outline"
      className={cn(sizeClasses[size], className)}
      style={{ 
        borderColor: info.color, 
        color: info.color,
        backgroundColor: `${info.color}10`
      }}
    >
      <span 
        className="w-2 h-2 rounded-full mr-2" 
        style={{ backgroundColor: info.color }}
      />
      {info.label}
    </Badge>
  );
}
