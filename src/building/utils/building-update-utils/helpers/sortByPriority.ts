export const sortByPriority = <T extends { isPrioritized: boolean }>(
	items: T[],
): T[] =>
	[...items].sort((a, b) => {
		if (a.isPrioritized && !b.isPrioritized) return -1
		if (!a.isPrioritized && b.isPrioritized) return 1
		return 0
	})
