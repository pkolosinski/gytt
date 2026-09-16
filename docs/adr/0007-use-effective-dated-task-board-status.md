# 0007 — Use effective-dated Task board status

Accepted. The dated Tasks view uses To do, In progress, and Completed columns for standard Tasks and due day-based Habit occurrences. Standard Task movement is an effective-dated domain transition rather than local UI state, supports movement in either direction, and preserves the status resolved for historical dates. Backdating an Anytime Task's completion before an existing completion requires confirmation and removes later status logs. Habit cards derive their column from occurrence progress and are not manually moved.
