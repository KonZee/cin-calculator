import type { Editor, TLShapeId } from "tldraw"
import { v4 as uuidv4 } from "uuid"
import type { Building, Product, BuildCost, RecipeIO } from "../../types"
import { cardHeights } from "../../constants"
import products from "@/data/products.json"

const getProductData = (name: string): Product => {
	return products.products.find((p) => p.name === name) as Product
}

export const createBuildingShape = (
	editor: Editor,
	building: Building,
	options?: {
		id?: TLShapeId
		x?: number
		y?: number
	},
): void => {
	const height =
		cardHeights[
			Math.max(
				building.recipes[0].inputs.length,
				building.recipes[0].outputs.length,
			) - 1
		]

	const shapeData = {
		...(options?.id && { id: options.id }),
		type: "building" as const,
		...(options?.x !== undefined && { x: options.x }),
		...(options?.y !== undefined && { y: options.y }),
		props: {
			w: 400,
			h: height,
			name: building.name,
			category: building.category,
			previous_tier: building.previous_tier,
			next_tier: building.next_tier,
			workers: building.workers,
			maintenance_cost_units: building.maintenance_cost_units,
			maintenance_cost_quantity: building.maintenance_cost_quantity,
			electricity_consumed: building.electricity_consumed,
			electricity_generated: building.electricity_generated,
			computing_consumed: building.computing_consumed,
			computing_generated: building.computing_generated,
			product_type: building.product_type,
			storage_capacity: building.storage_capacity,
			unity_cost: building.unity_cost,
			research_speed: building.research_speed,
			icon_path: building.icon_path,
			build_costs: building.build_costs.map((c: BuildCost) => ({
				...c,
				icon_path: getProductData(c.product).icon_path,
			})),
			recipe: {
				...building.recipes[0],
				inputs: building.recipes[0].inputs.map((r: RecipeIO) => ({
					name: r.name,
					quantity: (r.quantity * 60) / building.recipes[0].duration,
					id: uuidv4(),
					type: getProductData(r.name).type,
					icon_path: getProductData(r.name).icon_path,
					connectedShapes: [],
				})),
				outputs: building.recipes[0].outputs.map((r: RecipeIO) => ({
					name: r.name,
					quantity: (r.quantity * 60) / building.recipes[0].duration,
					id: uuidv4(),
					type: getProductData(r.name).type,
					icon_path: getProductData(r.name).icon_path,
					connectedShapes: [],
				})),
			},
		},
	}

	editor.createShape(shapeData)
}
