/** Groups items by a property value, preserving item and group insertion order. */
export const groupBy = <T, K extends keyof T>(items: readonly T[], key: K): Map<T[K], T[]> =>
  items.reduce((groups, item) => {
    const groupKey = item[key];
    const group = groups.get(groupKey) ?? [];
    return groups.set(groupKey, [...group, item]);
  }, new Map<T[K], T[]>());
