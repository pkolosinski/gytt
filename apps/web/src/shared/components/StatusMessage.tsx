import type { ReactNode } from 'react';

import { cn } from 'cn';
import { CircleAlert, Info } from 'lucide-react';

interface StatusMessageProps {
    action?: ReactNode;
    children: ReactNode;
    title: string;
    tone: 'error' | 'info';
}

/** An inline callout for errors and state changes that need the user's attention. */
export function StatusMessage({ action, children, title, tone }: StatusMessageProps) {
    const Icon = tone === 'error' ? CircleAlert : Info;
    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-lg border px-3 py-2.5 text-left text-sm sm:flex-row sm:items-start',
                tone === 'error'
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-border bg-muted/50 text-foreground',
            )}
            role={tone === 'error' ? 'alert' : 'status'}
        >
            <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div className="flex flex-1 flex-col gap-1">
                <p className="font-medium">{title}</p>
                <div className={cn(tone === 'info' && 'text-muted-foreground')}>{children}</div>
            </div>
            {action}
        </div>
    );
}
