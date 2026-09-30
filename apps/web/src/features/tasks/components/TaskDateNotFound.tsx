import { cn } from 'cn';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { buttonVariants } from '@/shared/generated/shadcn/ui/button.tsx';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/shared/generated/shadcn/ui/card.tsx';

interface TaskDateNotFoundProps {
    value: string;
}

export function TaskDateNotFound({ value }: TaskDateNotFoundProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground">
                    {t('tasks.dateNotFound.heading')}
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('tasks.dateNotFound.title')}</CardTitle>
                        <CardDescription className="break-words">
                            {t('tasks.dateNotFound.description', { value })}
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-wrap justify-end gap-2">
                        <Link className={cn(buttonVariants({ variant: 'outline' }))} to="/">
                            {t('tasks.dateNotFound.dashboard')}
                        </Link>
                        <Link className={cn(buttonVariants())} to="/tasks">
                            {t('tasks.dateNotFound.todaysTasks')}
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
