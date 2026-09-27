import { RotateCcw } from 'lucide-react';

import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';

interface TaskBoardErrorProps {
    isRetrying: boolean;
    onRetry: () => void;
}

/** Replaces the whole board when the composite board read fails; no partial rows are shown. */
export function TaskBoardError({ isRetrying, onRetry }: TaskBoardErrorProps) {
    return (
        <StatusMessage
            action={
                <Button disabled={isRetrying} onClick={onRetry} size="sm" variant="outline">
                    <RotateCcw aria-hidden="true" data-icon="inline-start" />
                    {isRetrying ? 'Retrying…' : 'Retry'}
                </Button>
            }
            title="Tasks board unavailable"
            tone="error"
        >
            The local service could not load this date. Nothing on the board has changed.
        </StatusMessage>
    );
}
