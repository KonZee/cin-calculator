import type { Editor } from "tldraw"
import type { TLShapeId } from "tldraw"
import { removeConnectedShapeFromConnection } from "./helpers/removeConnectedShapeFromConnection"

export const removeConnectedShapeFromOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	removeConnectedShapeFromConnection(
		editor,
		buildingId,
		"output",
		shapeIdToRemove,
		product,
	)
}
