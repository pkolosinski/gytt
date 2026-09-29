import { ArrowRight, ListChecks, Repeat2 } from 'lucide-react';
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
import { useLocale } from '@/shared/i18n/useLocale.ts';

export function DashboardContent() {
    const { locale, t } = useLocale();
    const modules = [
        {
            description: t('dashboard.tasks.description'),
            href: '/tasks',
            icon: ListChecks,
            prompt: t('dashboard.tasks.prompt'),
            title: t('dashboard.tasks.title'),
        },
        {
            description: t('dashboard.habits.description'),
            href: '/habits/day',
            icon: Repeat2,
            prompt: t('dashboard.habits.prompt'),
            title: t('dashboard.habits.title'),
        },
    ];

    return (
        <main className="flex flex-1 flex-col gap-10 px-5 py-10 text-left sm:gap-14 sm:px-12 sm:py-16">
            <header className="max-w-3xl space-y-5">
                <p className="text-sm font-medium tracking-[0.12em] text-primary uppercase">
                    {t('dashboard.eyebrow')}
                </p>
                <div className="space-y-3">
                    <h1 className="m-0 font-heading text-4xl tracking-tight text-foreground sm:text-6xl">
                        {t('dashboard.heading')}
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        {t('dashboard.description')}
                    </p>
                </div>
            </header>

            <nav
                aria-label={t('dashboard.modules')}
                className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2"
            >
                {modules.map(({ description, href, icon: Icon, prompt, title }) => (
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
                            <CardTitle className="mt-4">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground">{prompt}</p>
                        </CardContent>
                        <CardFooter className="justify-between gap-4">
                            <span className="text-sm text-muted-foreground">
                                {t('dashboard.openModule', {
                                    module: title.toLocaleLowerCase(locale),
                                })}
                            </span>
                            <Button
                                nativeButton={false}
                                render={<Link to={href} />}
                                size="sm"
                                variant="outline"
                            >
                                {t('dashboard.open')}
                                <ArrowRight aria-hidden="true" data-icon="inline-end" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </nav>
        </main>
    );
}
