import { ListChecks } from 'lucide-react';

import { ModulePlaceholder } from '../../shared/components/ModulePlaceholder.tsx';

export function TasksPage() {
    return (
        <ModulePlaceholder
            description="Your daily task board will give you a focused place to plan and complete work."
            icon={ListChecks}
            title="Tasks"
        />
    );
}
