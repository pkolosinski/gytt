import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

import { Button } from '@/shared/components/shadcn/ui/button';

import { formatDate } from '../utils/date';

interface DateNavigationProps {
    selectedDate: string;
    onPrevious: () => void;
    onNext: () => void;
    onToday: () => void;
}

export const DateNavigation = ({
    selectedDate,
    onPrevious,
    onNext,
    onToday,
}: DateNavigationProps) => {
    return (
        <nav
            className="flex items-center gap-2"
            aria-label="Date navigation"
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                aria-label="Previous day"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={onToday}
                aria-label="Today"
            >
                <Calendar className="mr-1 h-4 w-4" />
                <span>{formatDate(selectedDate)}</span>
            </Button>
            <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                aria-label="Next day"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
};
