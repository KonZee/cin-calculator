import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"
import { getConnections } from "./getConnections"
import { sortByPriority } from "./sortByPriority"
import { findConnectionByName } from "./findConnectionByName"
import { calculateConnectionCapacity } from "./calculateConnectionCapacity"
import { calculateAvailableCapacity } from "./calculateAvailableCapacity"
import { calculateMaxAmountForBuilding } from "./calculateMaxAmountForBuilding"
import { updateConnectionAmounts } from "./updateConnectionAmounts"

export const processConnectionUpdates = (
	editor: Editor,
	shape: BuildingShape,
	connectionType: "input" | "output",
	newNumberOfBuildings: number,
) => {
	const { directConnections, oppositeConnections } =
		getConnections(connectionType)
	const connections = shape.props.recipe[directConnections]

	return connections.map((connection) => {
		const totalCapacity = calculateConnectionCapacity(
			connection,
			newNumberOfBuildings,
		)
		const sortedConnectedShapes = sortByPriority(connection.connectedShapes)
		let remainingCapacity = totalCapacity
		const newAmounts: { id: TLShapeId; amount: number }[] = []

		for (const connectedShape of sortedConnectedShapes) {
			const connectedBuilding = editor.getShape(
				connectedShape.id,
			) as BuildingShape
			if (!connectedBuilding) continue

			const oppositeConnection = findConnectionByName(
				connectedBuilding.props.recipe[oppositeConnections],
				connection.name,
			)
			if (!oppositeConnection) continue

			const availableCapacity = calculateAvailableCapacity(
				oppositeConnection,
				connectedBuilding.props.number_of_buildings,
				shape.id,
			)

			const maxAmountForThisBuilding = calculateMaxAmountForBuilding(
				availableCapacity,
				remainingCapacity,
			)

			newAmounts.push({
				id: connectedShape.id as TLShapeId,
				amount: Math.max(0, maxAmountForThisBuilding),
			})

			remainingCapacity -= maxAmountForThisBuilding
		}

		updateConnectionAmounts(
			editor,
			shape,
			connectionType,
			newAmounts,
			connection.name,
		)

		return {
			...connection,
			connectedShapes: connection.connectedShapes.map((cs) => {
				const newAmount = newAmounts.find(
					(na) => na.id === (cs.id as TLShapeId),
				)
				return newAmount ? { ...cs, amount: newAmount.amount } : cs
			}),
		}
	})
}
