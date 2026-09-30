import { ArrowRight, ListChecks, Repeat2 } from 'lucide-react';
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

const modules = [
    { href: '/tasks', icon: ListChecks, id: 'tasks' },
    { href: '/habits/day', icon: Repeat2, id: 'habits' },
] as const;

export function DashboardContent() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1 flex-col gap-10 sm:gap-14">
            <header className="max-w-3xl space-y-5">
                <p className="text-sm font-medium tracking-[0.12em] text-primary uppercase">
                    {t('dashboard.eyebrow')}
                </p>
                <div className="space-y-3">
                    <h1 className="font-heading m-0 text-4xl tracking-tight text-foreground sm:text-6xl">
                        {t('dashboard.title')}
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        {t('dashboard.subtitle')}
                    </p>
                </div>
            </header>

            <nav
                aria-label={t('dashboard.modulesLabel')}
                className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2"
            >
                {modules.map(({ href, icon: Icon, id }) => (
                    <Card
                        className="h-full transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-lg"
                        key={href}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Icon aria-hidden="true" />
                                </div>
                                <Badge variant="secondary">{t('dashboard.today')}</Badge>
                            </div>
                            <CardTitle className="mt-4">
                                {t(`dashboard.modules.${id}.title`)}
                            </CardTitle>
                            <CardDescription>
                                {t(`dashboard.modules.${id}.description`)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                {t(`dashboard.modules.${id}.prompt`)}
                            </p>
                        </CardContent>
                        <CardFooter className="justify-between gap-4">
                            <span className="text-sm text-muted-foreground">
                                {t(`dashboard.modules.${id}.openLabel`)}
                            </span>
                            <Button
                                nativeButton={false}
                                render={<Link to={href} />}
                                size="sm"
                                variant="outline"
                            >
                                {t('common.open')}
                                <ArrowRight aria-hidden="true" data-icon="inline-end" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </nav>
        </div>
    );
}
