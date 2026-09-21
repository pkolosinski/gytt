import { Link } from 'react-router';

const modules = [
    {
        description: 'Plan, organize, and complete your daily work.',
        href: '/tasks',
        title: 'Tasks',
    },
    {
        description: 'Build consistency with daily, weekly, and monthly habits.',
        href: '/habits/day',
        title: 'Habits',
    },
];

export function DashboardContent() {
    return (
        <main className="flex flex-1 flex-col justify-center gap-10 px-5 py-10 text-left sm:gap-16 sm:px-12 sm:py-16">
            <header className="max-w-[680px]">
                <p className="text-xs font-bold tracking-[0.12em] text-accent uppercase">Get Your Things Together</p>
                <h1 className="my-4">Make today count.</h1>
                <p className="max-w-[540px] text-[1.15rem]">
                    A calm place for the things you want to do and keep doing.
                </p>
            </header>

            <nav
                aria-label="GYTT modules"
                className="grid max-w-[760px] grid-cols-1 gap-4 sm:grid-cols-2"
            >
                {modules.map((module) => (
                    <Link
                        className="group relative flex min-h-[150px] flex-col gap-3 rounded-xl border border-border p-6 text-foreground no-underline transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        key={module.href}
                        to={module.href}
                    >
                        <span className="font-heading text-2xl text-foreground">{module.title}</span>
                        <span>{module.description}</span>
                        <span
                            aria-hidden="true"
                            className="absolute right-6 bottom-5 text-2xl text-accent transition-transform group-hover:translate-x-1"
                        >
                            →
                        </span>
                    </Link>
                ))}
            </nav>
        </main>
    );
}
