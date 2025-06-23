export const calculateMaxAmountForBuilding = (
	availableCapacity: number,
	remainingCapacity: number,
): number => {
	return Math.min(availableCapacity, remainingCapacity)
}
