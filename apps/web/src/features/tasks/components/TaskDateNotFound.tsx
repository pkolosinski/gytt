import { cn } from 'cn';
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
    return (
        <main className="flex flex-1 px-5 py-10 text-left sm:px-12 sm:py-16">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
                <h1 className="m-0 font-heading text-4xl tracking-tight text-foreground">
                    Date not found
                </h1>
                <Card>
                    <CardHeader>
                        <CardTitle>This is not a calendar date</CardTitle>
                        <CardDescription className="break-words">
                            “{value}” is not a valid date in YYYY-MM-DD form.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex-wrap justify-end gap-2">
                        <Link className={cn(buttonVariants({ variant: 'outline' }))} to="/">
                            Dashboard
                        </Link>
                        <Link className={cn(buttonVariants())} to="/tasks">
                            Today’s tasks
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </main>
    );
}
