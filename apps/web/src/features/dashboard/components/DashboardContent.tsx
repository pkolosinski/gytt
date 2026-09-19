import { Link } from 'react-router';

import './DashboardContent.css';

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
        <main className="dashboard">
            <header className="dashboard__header">
                <p className="dashboard__eyebrow">Get Your Things Together</p>
                <h1>Make today count.</h1>
                <p className="dashboard__intro">A calm place for the things you want to do and keep doing.</p>
            </header>

            <nav aria-label="GYTT modules" className="dashboard__modules">
                {modules.map((module) => (
                    <Link className="dashboard__module" key={module.href} to={module.href}>
                        <span className="dashboard__module-title">{module.title}</span>
                        <span>{module.description}</span>
                        <span aria-hidden="true" className="dashboard__module-arrow">
                            →
                        </span>
                    </Link>
                ))}
            </nav>
        </main>
    );
}
