import { RotateCcw } from 'lucide-react';

import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import { useLocale } from '@/shared/i18n/useLocale.ts';

interface TaskBoardErrorProps {
    isRetrying: boolean;
    onRetry: () => void;
}

/** Replaces the whole board when the composite board read fails; no partial rows are shown. */
export function TaskBoardError({ isRetrying, onRetry }: TaskBoardErrorProps) {
    const { t } = useLocale();

    return (
        <StatusMessage
            action={
                <Button disabled={isRetrying} onClick={onRetry} size="sm" variant="outline">
                    <RotateCcw aria-hidden="true" data-icon="inline-start" />
                    {isRetrying ? t('tasks.retrying') : t('tasks.retry')}
                </Button>
            }
            title={t('tasks.errorTitle')}
            tone="error"
        >
            {t('tasks.errorDescription')}
        </StatusMessage>
    );
}
