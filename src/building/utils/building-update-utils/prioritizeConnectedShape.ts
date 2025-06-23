import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import { getConnections } from "./helpers/getConnections"
import { findConnectionByName } from "./helpers/findConnectionByName"
import { updatePrioritizationForShape } from "./helpers/updatePrioritizationForShape"
import { updateConnectedShapes } from "./updateConnectedShapes"

export const prioritizeConnectedShape = (
	editor: Editor,
	shape: BuildingShape,
	connection: "input" | "output",
	product: string,
): void => {
	const { directConnections, oppositeConnections } = getConnections(connection)

	const connectedShapes = findConnectionByName(
		shape.props.recipe[directConnections],
		product,
	)?.connectedShapes

	if (!connectedShapes) return

	for (const cs of connectedShapes) {
		const connectedShape = editor.getShape(cs.id) as BuildingShape
		if (!connectedShape) continue

		updatePrioritizationForShape(
			editor,
			connectedShape,
			product,
			shape.id,
			oppositeConnections,
		)

		const updatedConnectedShape = editor.getShape(
			connectedShape.id,
		) as BuildingShape
		updateConnectedShapes(
			editor,
			updatedConnectedShape,
			updatedConnectedShape.props.number_of_buildings,
		)
	}
}
