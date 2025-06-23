import type { Editor } from "tldraw"
import type { TLShapeId } from "tldraw"
import { addConnectedShapeToConnection } from "./helpers/addConnectedShapeToConnection"

export const addConnectedShapeToOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	outputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	addConnectedShapeToConnection(
		editor,
		buildingId,
		"output",
		outputIndex,
		connectedShapeId,
		amount,
	)
}
