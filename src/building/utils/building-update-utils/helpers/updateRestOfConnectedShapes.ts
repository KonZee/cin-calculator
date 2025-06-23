import type { TLShapeId } from "tldraw"

export const updateRestOfConnectedShapes = (
	restOfConnectedShapes: {
		id: TLShapeId
		amount: number
		isPrioritized: boolean
	}[],
	targetId: TLShapeId,
	delta: number,
) => {
	return restOfConnectedShapes.map((connectedShape) =>
		connectedShape.id === targetId
			? { ...connectedShape, amount: connectedShape.amount + delta }
			: connectedShape,
	)
}
