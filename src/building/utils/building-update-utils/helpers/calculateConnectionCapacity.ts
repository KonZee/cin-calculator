import type { BuildingShape } from "@/shapes/building/buildingShape"

export const calculateConnectionCapacity = (
	connection:
		| BuildingShape["props"]["recipe"]["inputs"][0]
		| BuildingShape["props"]["recipe"]["outputs"][0],
	numberOfBuildings: number,
): number => {
	return connection.quantity * numberOfBuildings
}
