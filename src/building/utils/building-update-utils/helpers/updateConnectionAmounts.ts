import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"
import { getConnections } from "./getConnections"
import { updateShapeRecipe } from "./updateShapeRecipe"

export const updateConnectionAmounts = (
	editor: Editor,
	shape: BuildingShape,
	connectionType: "input" | "output",
	newAmounts: { id: TLShapeId; amount: number }[],
	productName: string,
): void => {
	const { oppositeConnections } = getConnections(connectionType)

	for (const newAmount of newAmounts) {
		const connectedBuilding = editor.getShape(newAmount.id) as BuildingShape
		if (!connectedBuilding) continue

		const connections = connectedBuilding.props.recipe[oppositeConnections]
		const connectionIndex = connections.findIndex(
			(conn) => conn.name === productName,
		)
		if (connectionIndex === -1) continue

		const updatedConnections = connections.map((connection, idx) =>
			idx === connectionIndex
				? {
						...connection,
						connectedShapes: connection.connectedShapes.map((cs) =>
							cs.id === shape.id ? { ...cs, amount: newAmount.amount } : cs,
						),
					}
				: connection,
		)

		updateShapeRecipe(editor, newAmount.id, {
			[oppositeConnections]: updatedConnections,
		})
	}
}
