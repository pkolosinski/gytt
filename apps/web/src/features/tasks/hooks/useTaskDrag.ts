import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  MouseSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';

import { TASK_STATUSES, type TaskListItem, type TaskStatus } from '../models/task.ts';

interface UseTaskDragOptions {
  findTask: (id: string | null) => TaskListItem | null;
  onMove: (task: TaskListItem, status: TaskStatus) => void;
}

/** Mouse drag and drop of Task cards onto status columns, with localized announcements. */
export const useTaskDrag = ({ findTask, onMove }: UseTaskDragOptions) => {
  const { t } = useTranslation('tasks');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }));

  const titleOf = (id: UniqueIdentifier) => findTask(String(id))?.title ?? t('board.fallbackTitle');
  const columnOf = (id: UniqueIdentifier | undefined) => {
    const status = TASK_STATUSES.find((candidate) => candidate === id);
    return status === undefined ? t('board.noColumn') : t(`status.${status}`);
  };

  const announcements: Announcements = {
    onDragCancel: ({ active }) => t('board.dragCancel', { title: titleOf(active.id) }),
    onDragEnd: ({ active, over }) =>
      over
        ? t('board.dragEnd', { column: columnOf(over.id), title: titleOf(active.id) })
        : t('board.dropOutside', { title: titleOf(active.id) }),
    onDragOver: ({ active, over }) =>
      t('board.dragOver', { column: columnOf(over?.id), title: titleOf(active.id) }),
    onDragStart: ({ active }) => t('board.dragStart', { title: titleOf(active.id) }),
  };

  const handleDragStart = ({ active }: DragStartEvent) => setDraggedTaskId(String(active.id));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDraggedTaskId(null);
    const task = findTask(String(active.id));
    const status = TASK_STATUSES.find((candidate) => candidate === over?.id);
    if (task !== null && status !== undefined) {
      onMove(task, status);
    }
  };

  return {
    draggedTask: findTask(draggedTaskId),
    dndContextProps: {
      accessibility: {
        announcements,
        screenReaderInstructions: { draggable: t('board.instructions') },
      },
      collisionDetection: pointerWithin,
      onDragCancel: () => setDraggedTaskId(null),
      onDragEnd: handleDragEnd,
      onDragStart: handleDragStart,
      sensors,
    },
  };
};
