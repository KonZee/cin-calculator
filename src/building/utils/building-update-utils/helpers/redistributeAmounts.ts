import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"
import { sortByPriority } from "./sortByPriority"
import { getConnections } from "./getConnections"
import { findConnectionByName } from "./findConnectionByName"
import { findConnectedShapeById } from "./findConnectedShapeById"
import { calculateRedistributionDelta } from "./calculateRedistributionDelta"
import { updateConnectedShapeAmount } from "./updateConnectedShapeAmount"
import { updateRestOfConnectedShapes } from "./updateRestOfConnectedShapes"
import { updateShapeRecipe } from "./updateShapeRecipe"

export const redistributeAmounts = (
	editor: Editor,
	buildingId: TLShapeId,
	product: string,
	amountToRemove: number,
	restOfConnectedShapes: Array<{
		id: TLShapeId
		amount: number
		isPrioritized: boolean
	}>,
	connectionType: "input" | "output",
): void => {
	if (amountToRemove <= 0) return

	const sortedConnectedShapes = sortByPriority(restOfConnectedShapes)
	let remainingAmount = amountToRemove
	let currentRestOfConnectedShapes = restOfConnectedShapes

	for (const cs of sortedConnectedShapes) {
		const shape = editor.getShape(cs.id) as BuildingShape
		if (!shape) continue

		const { oppositeConnections } = getConnections(connectionType)
		const connections = shape.props.recipe[oppositeConnections]
		const correctConnection = findConnectionByName(connections, product)
		if (!correctConnection) continue

		const quantity =
			correctConnection.quantity * shape.props.number_of_buildings
		const currentConnectedShape = findConnectedShapeById(
			correctConnection.connectedShapes,
			buildingId,
		)

		if (currentConnectedShape && currentConnectedShape.amount < quantity) {
			const delta = calculateRedistributionDelta(
				currentConnectedShape.amount,
				quantity,
				remainingAmount,
			)

			const updatedConnectedShapes = updateConnectedShapeAmount(
				correctConnection.connectedShapes,
				buildingId,
				delta,
			)

			const updatedRestOfConnectedShapes = updateRestOfConnectedShapes(
				currentRestOfConnectedShapes,
				cs.id,
				delta,
			)

			const recipeUpdate = {
				[oppositeConnections]: connections.map((conn) =>
					conn.name === product
						? { ...conn, connectedShapes: updatedConnectedShapes }
						: conn,
				),
			}

			updateShapeRecipe(editor, cs.id, recipeUpdate)

			// Use a local variable instead of mutating the input array
			currentRestOfConnectedShapes = updatedRestOfConnectedShapes

			remainingAmount -= delta

			if (remainingAmount === 0) break
		}
	}
}
