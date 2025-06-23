export const calculateRedistributionDelta = (
	currentAmount: number,
	quantity: number,
	remainingAmount: number,
): number => {
	return Math.min(quantity - currentAmount, remainingAmount)
}
