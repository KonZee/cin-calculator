export const getConnections = (connection: "input" | "output") => {
	const directConnections = connection === "input" ? "inputs" : "outputs"
	const oppositeConnections = connection === "input" ? "outputs" : "inputs"
	return { directConnections, oppositeConnections } as const
}
