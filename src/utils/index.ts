export const formatNumber = (num: number) => {
	return Number.isInteger(num)
		? num.toString()
		: num.toFixed(2).replace(/\.?0+$/, "")
}
