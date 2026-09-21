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

const modules = [
    {
        description: 'Plan, organize, and complete your daily work.',
        href: '/tasks',
        icon: ListChecks,
        prompt: 'Turn your plans into a clear next step.',
        title: 'Tasks',
    },
    {
        description: 'Build consistency with daily, weekly, and monthly habits.',
        href: '/habits/day',
        icon: Repeat2,
        prompt: 'Keep the routines that matter moving forward.',
        title: 'Habits',
    },
];

export function DashboardContent() {
    return (
        <main className="flex flex-1 flex-col gap-10 px-5 py-10 text-left sm:gap-14 sm:px-12 sm:py-16">
            <header className="max-w-3xl space-y-5">
                <p className="text-sm font-medium tracking-[0.12em] text-primary uppercase">
                    Get Your Things Together
                </p>
                <div className="space-y-3">
                    <h1 className="m-0 font-heading text-4xl tracking-tight text-foreground sm:text-6xl">
                        Make today count.
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        A calm place for the things you want to do and keep doing.
                    </p>
                </div>
            </header>

            <nav
                aria-label="GYTT modules"
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
                                <Badge variant="secondary">Today</Badge>
                            </div>
                            <CardTitle className="mt-4">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground">{prompt}</p>
                        </CardContent>
                        <CardFooter className="justify-between gap-4">
                            <span className="text-sm text-muted-foreground">
                                Open {title.toLowerCase()}
                            </span>
                            <Button
                                nativeButton={false}
                                render={<Link to={href} />}
                                size="sm"
                                variant="outline"
                            >
                                Open
                                <ArrowRight aria-hidden="true" data-icon="inline-end" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </nav>
        </main>
    );
}
