import type { TLShapeId } from "tldraw"

export const updateConnectedShapeAmount = (
	connectedShapes: { id: TLShapeId; amount: number; isPrioritized: boolean }[],
	targetId: TLShapeId,
	delta: number,
) => {
	return connectedShapes.map((connectedShape) =>
		connectedShape.id === targetId
			? { ...connectedShape, amount: connectedShape.amount + delta }
			: connectedShape,
	)
}
