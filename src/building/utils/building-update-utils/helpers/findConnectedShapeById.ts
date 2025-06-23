import type { TLShapeId } from "tldraw"

export const findConnectedShapeById = (
	connectedShapes: { id: TLShapeId; amount: number; isPrioritized: boolean }[],
	shapeId: TLShapeId,
) => connectedShapes.find((s) => s.id === shapeId)
