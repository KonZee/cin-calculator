import type { BuildingShape } from "@/shapes/building/buildingShape"

export const findConnectionByName = (
	connections:
		| BuildingShape["props"]["recipe"]["inputs"]
		| BuildingShape["props"]["recipe"]["outputs"],
	product: string,
) => connections.find((conn) => conn.name === product)
