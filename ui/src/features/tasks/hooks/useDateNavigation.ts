import { useState } from 'react';

import { getToday, addDays } from '../utils/date';

export const useDateNavigation = () => {
    const [selectedDate, setSelectedDate] = useState<string>(getToday());

    const goToToday = () => {
        setSelectedDate(getToday());
    };

    const goToPreviousDay = () => {
        setSelectedDate((prev) => addDays(prev, -1));
    };

    const goToNextDay = () => {
        setSelectedDate((prev) => addDays(prev, 1));
    };

    const goToDate = (date: string) => {
        setSelectedDate(date);
    };

    return {
        selectedDate,
        goToToday,
        goToPreviousDay,
        goToNextDay,
        goToDate,
    };
};
