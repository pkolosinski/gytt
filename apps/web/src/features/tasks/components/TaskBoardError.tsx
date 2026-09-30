import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StatusMessage } from '@/shared/components/StatusMessage.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';

interface TaskBoardErrorProps {
    isRetrying: boolean;
    onRetry: () => void;
}

/** Replaces the whole board when the composite board read fails; no partial rows are shown. */
export function TaskBoardError({ isRetrying, onRetry }: TaskBoardErrorProps) {
    const { t } = useTranslation();

    return (
        <StatusMessage
            action={
                <Button disabled={isRetrying} onClick={onRetry} size="sm" variant="outline">
                    <RotateCcw aria-hidden="true" data-icon="inline-start" />
                    {isRetrying ? t('common.retrying') : t('common.retry')}
                </Button>
            }
            title={t('tasks.boardError.title')}
            tone="error"
        >
            {t('tasks.boardError.description')}
        </StatusMessage>
    );
}
