import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"
import { getConnections } from "./getConnections"
import { findConnectedShapeById } from "./findConnectedShapeById"
import { updateShapeRecipe } from "./updateShapeRecipe"
import { redistributeAmounts } from "./redistributeAmounts"
import { updateConnectedShapes } from "../updateConnectedShapes"

export const removeConnectedShapeFromConnection = (
	editor: Editor,
	buildingId: TLShapeId,
	connectionType: "input" | "output",
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	const { directConnections } = getConnections(connectionType)
	const connections = building.props.recipe[directConnections]
	const connectionIndex = connections.findIndex((c) => c.name === product)

	if (connectionIndex === -1) return

	const connection = connections[connectionIndex]
	const shapeToRemove = findConnectedShapeById(
		connection.connectedShapes,
		shapeIdToRemove,
	)

	if (!shapeToRemove) return

	const amountToRemove = shapeToRemove.amount
	const restOfConnectedShapes = connection.connectedShapes.filter(
		(cs) => cs.id !== shapeIdToRemove,
	)

	// Update the building's connections
	const newConnections = [...connections]
	newConnections[connectionIndex] = {
		...connection,
		connectedShapes: restOfConnectedShapes,
	}
	updateShapeRecipe(editor, buildingId, {
		[directConnections]: newConnections,
	})

	redistributeAmounts(
		editor,
		buildingId,
		product,
		amountToRemove,
		restOfConnectedShapes,
		connectionType,
	)

	// After redistribution, update all affected shapes to propagate changes
	const shapesToUpdate = new Set(restOfConnectedShapes.map((cs) => cs.id))
	shapesToUpdate.add(buildingId)

	for (const id of shapesToUpdate) {
		const shape = editor.getShape(id) as BuildingShape
		if (shape) {
			updateConnectedShapes(editor, shape, shape.props.number_of_buildings)
		}
	}
}
