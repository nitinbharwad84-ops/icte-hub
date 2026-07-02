'use client';
import { Badge } from '@/components/ui/Badge';
import { STATUS_LABELS } from '@/lib/utils/constants';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<string, 'blue' | 'indigo' | 'purple' | 'slate' | 'emerald' | 'teal'> = {
    'new': 'blue',
    'contacted': 'indigo',
    'interested': 'purple',
    'not-interested': 'slate',
    'enrolled-college': 'emerald',
    'enrolled-institute': 'teal',
  };

  return (
    <Badge color={colorMap[status] || 'slate'}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
