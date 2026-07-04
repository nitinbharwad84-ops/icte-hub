'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface College {
  id: string;
  name: string;
  mode: string;
  location: string;
  courses_offered: string[];
  logo_url?: string;
}

interface CollegeCardProps {
  college: College;
  onInquire?: (collegeId: string) => void;
}

export function CollegeCard({ college, onInquire }: CollegeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isOnline = college.mode === 'Online';
  const displayCourses = expanded ? college.courses_offered : college.courses_offered.slice(0, 3);
  const hasMore = college.courses_offered.length > 3;

  const initials = college.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      <div className={cn(
        'h-1.5 w-full',
        isOnline
          ? 'bg-gradient-to-r from-cyan-400 to-cyan-600'
          : 'bg-gradient-to-r from-indigo-400 to-indigo-600'
      )} />

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-4">
          {college.logo_url ? (
            <img
              src={college.logo_url}
              alt={college.name}
              className="w-14 h-14 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-extrabold text-slate-500">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{college.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                color={isOnline ? 'cyan' : 'indigo'}
                className="rounded-full"
              >
                {college.mode}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          <span className="font-medium">{college.location}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {displayCourses.map((course) => (
            <span
              key={course}
              className="bg-slate-100 text-slate-600 rounded-lg px-2 py-1 text-[11px] font-semibold"
            >
              {course}
            </span>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {expanded ? 'Show less' : `Show more (${college.courses_offered.length - 3} more)`}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {onInquire && (
          <Button
            onClick={() => onInquire(college.id)}
            className="w-full"
          >
            Request Info
          </Button>
        )}
      </div>
    </Card>
  );
}
