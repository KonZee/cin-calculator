import type { TLShapeId } from "tldraw"

export const createConnectedShape = (id: TLShapeId, amount: number) => ({
	id,
	amount,
	isPrioritized: false,
})
