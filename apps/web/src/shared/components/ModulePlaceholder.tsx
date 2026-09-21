import type { LucideIcon } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
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
    return (
        <main className="flex flex-1 px-5 py-10 text-left sm:px-12 sm:py-16">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <header className="space-y-5">
                    <Badge variant="outline">Placeholder</Badge>
                    <div className="space-y-3">
                        <h1 className="m-0 font-heading text-4xl tracking-tight text-foreground sm:text-6xl">
                            {title}
                        </h1>
                        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Workspace coming next</CardTitle>
                        <CardDescription>
                            The route is connected and ready for the next implementation slice.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Icon aria-hidden="true" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                    {title} navigation is ready.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Domain behavior and saved data are not part of this placeholder.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end">
                        <Button nativeButton={false} render={<Link to="/" />} variant="outline">
                            <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                            Back to dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
