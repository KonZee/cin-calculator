import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"
import { calculateConnectionCapacity } from "./calculateConnectionCapacity"

export const calculateAvailableCapacity = (
	connection:
		| BuildingShape["props"]["recipe"]["inputs"][0]
		| BuildingShape["props"]["recipe"]["outputs"][0],
	numberOfBuildings: number,
	excludeShapeId: TLShapeId,
): number => {
	const totalCapacity = calculateConnectionCapacity(
		connection,
		numberOfBuildings,
	)
	const currentUsed = connection.connectedShapes.reduce(
		(
			sum: number,
			cs: { id: TLShapeId; amount: number; isPrioritized: boolean },
		) => (cs.id === excludeShapeId ? sum : sum + cs.amount),
		0,
	)
	return totalCapacity - currentUsed
}
