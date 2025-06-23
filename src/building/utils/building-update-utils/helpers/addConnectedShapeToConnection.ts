import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"
import { getConnections } from "./getConnections"
import { updateShapeRecipe } from "./updateShapeRecipe"
import { createConnectedShape } from "./createConnectedShape"

export const addConnectedShapeToConnection = (
	editor: Editor,
	buildingId: TLShapeId,
	connectionType: "input" | "output",
	index: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	const { directConnections } = getConnections(connectionType)
	const connections = building.props.recipe[directConnections]

	const updatedConnections = connections.map((connection, idx) =>
		idx === index
			? {
					...connection,
					connectedShapes: [
						...connection.connectedShapes,
						createConnectedShape(connectedShapeId, amount),
					],
				}
			: connection,
	)

	updateShapeRecipe(editor, buildingId, {
		[directConnections]: updatedConnections,
	})
}
