import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Progress } from '../ui/progress';

interface DeadlineTrackerProps {
  inProgressAt: string;
  estimatedHours: number;
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({ inProgressAt, estimatedHours }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const startMs = new Date(inProgressAt).getTime();
  const totalMs = estimatedHours * 3600000;
  const deadlineMs = startMs + totalMs;
  const elapsedMs = now - startMs;
  const remainingMs = deadlineMs - now;
  const isOverdue = remainingMs < 0;
  const progressPercent = Math.min(100, Math.round((elapsedMs / totalMs) * 100));

  const isNearDeadline = !isOverdue && remainingMs < totalMs * 0.2;

  const statusColor = isOverdue
    ? 'text-red-600 dark:text-red-400'
    : isNearDeadline
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-green-600 dark:text-green-400';

  const progressColor = isOverdue
    ? 'bg-red-500'
    : isNearDeadline
    ? 'bg-amber-500'
    : 'bg-green-500';

  const Icon = isOverdue ? AlertCircle : isNearDeadline ? Clock : CheckCircle2;

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${statusColor}`} />
          <span className="text-sm font-medium">
            {isOverdue
              ? `Overdue by ${formatDuration(Math.abs(remainingMs))}`
              : `${formatDuration(remainingMs)} remaining`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{progressPercent}%</span>
      </div>

      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${progressColor}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Started {formatDuration(elapsedMs)} ago</span>
        <span>Estimate: {estimatedHours}h total</span>
      </div>
    </div>
  );
};

export default DeadlineTracker;
