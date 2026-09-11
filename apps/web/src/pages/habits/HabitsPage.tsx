import { Repeat2 } from 'lucide-react';

import { ModulePlaceholder } from '../../shared/components/ModulePlaceholder.tsx';

export function HabitsPage() {
    return (
        <ModulePlaceholder
            description="Your daily, weekly, and monthly habit views will help you keep the routines that matter."
            icon={Repeat2}
            title="Habits"
        />
    );
}
