import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import type { TaskBoardView } from '../types/task';

import { useDateNavigation } from '../hooks/useDateNavigation';
import { getToday, isSameDate } from '../utils/date';
import { DateNavigation } from './DateNavigation';
import { TaskBoard } from './TaskBoard';

const mockTasks = [
    {
        id: '00000000-0000-0000-0000-000000000001',
        type: 'anytime' as const,
        title: 'Review project requirements',
        details: 'Go through the documentation and understand the scope',
        status: 'todo' as const,
        statusEffectiveDate: getToday(),
        startDate: getToday(),
        fixedDate: null,
        convertedHabitId: null,
        version: '1',
    },
    {
        id: '00000000-0000-0000-0000-000000000002',
        type: 'anytime' as const,
        title: 'Set up development environment',
        details: 'Install dependencies and configure the project',
        status: 'inProgress' as const,
        statusEffectiveDate: getToday(),
        startDate: getToday(),
        fixedDate: null,
        convertedHabitId: null,
        version: '1',
    },
    {
        id: '00000000-0000-0000-0000-000000000003',
        type: 'fixedDay' as const,
        title: 'Team meeting',
        details: 'Daily standup at 10:00 AM',
        status: 'completed' as const,
        statusEffectiveDate: getToday(),
        startDate: null,
        fixedDate: getToday(),
        convertedHabitId: null,
        version: '1',
    },
];

const createMockBoard = (date: string) => ({
    date,
    todo: mockTasks
        .filter((t) => t.status === 'todo')
        .map((task) => ({ type: 'task' as const, task })),
    inProgress: mockTasks
        .filter((t) => t.status === 'inProgress')
        .map((task) => ({ type: 'task' as const, task })),
    completed: mockTasks
        .filter((t) => t.status === 'completed')
        .map((task) => ({ type: 'task' as const, task })),
});

export const TasksPage = () => {
    const navigate = useNavigate();
    const params = useParams<{ date?: string }>();
    const { selectedDate, goToToday, goToPreviousDay, goToNextDay, goToDate } =
        useDateNavigation();

    useEffect(() => {
        const dateParam = params.date;
        if (dateParam && !isSameDate(dateParam, selectedDate)) {
            goToDate(dateParam);
        } else if (!dateParam && !isSameDate(getToday(), selectedDate)) {
            goToDate(getToday());
        }
    }, [params.date, selectedDate, goToDate]);

    useEffect(() => {
        const dateParam = params.date;
        if (dateParam && !isSameDate(selectedDate, dateParam) && !isSameDate(selectedDate, getToday())) {
            navigate(`/tasks/${selectedDate}`);
        } else if (!dateParam && isSameDate(selectedDate, getToday())) {
            navigate('/tasks');
        }
    }, [selectedDate, params.date, navigate]);

    const board: TaskBoardView = createMockBoard(selectedDate);

    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
                    <p className="text-sm text-muted-foreground">
                        Your daily task board
                    </p>
                </div>
                <DateNavigation
                    selectedDate={selectedDate}
                    onPrevious={goToPreviousDay}
                    onNext={goToNextDay}
                    onToday={goToToday}
                />
            </header>
            <TaskBoard board={board} onOpenTask={() => {}} />
        </main>
    );
};
