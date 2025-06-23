import type { Editor } from "tldraw"
import type { TLShapeId } from "tldraw"
import { addConnectedShapeToConnection } from "./helpers/addConnectedShapeToConnection"

export const addConnectedShapeToInput = (
	editor: Editor,
	buildingId: TLShapeId,
	inputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	addConnectedShapeToConnection(
		editor,
		buildingId,
		"input",
		inputIndex,
		connectedShapeId,
		amount,
	)
}
