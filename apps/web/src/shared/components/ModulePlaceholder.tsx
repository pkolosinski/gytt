import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { Badge } from '@/shared/generated/shadcn/ui/badge.tsx';
import { Button } from '@/shared/generated/shadcn/ui/button.tsx';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/shared/generated/shadcn/ui/card.tsx';

interface ModulePlaceholderProps {
    description: string;
    icon: LucideIcon;
    title: string;
}

export function ModulePlaceholder({ description, icon: Icon, title }: ModulePlaceholderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <header className="space-y-5">
                    <Badge variant="outline">{t('placeholder.badge')}</Badge>
                    <div className="space-y-3">
                        <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground sm:text-6xl">
                            {title}
                        </h1>
                        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('placeholder.cardTitle')}</CardTitle>
                        <CardDescription>{t('placeholder.cardDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon aria-hidden="true" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                    {t('placeholder.ready', { module: title })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {t('placeholder.notIncluded')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button nativeButton={false} render={<Link to="/" />} variant="outline">
                            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                            {t('placeholder.backToDashboard')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
