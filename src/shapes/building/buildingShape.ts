import type { TLBaseShape, TLShapeId } from "tldraw"

export type BuildingShape = TLBaseShape<
	"building",
	{
		w: number
		h: number
		name: string
		category: string // Define a list
		previous_tier: string
		next_tier: string
		workers: number
		maintenance_cost_units: string
		maintenance_cost_quantity: number
		electricity_consumed: number
		electricity_generated: number
		computing_consumed: number
		computing_generated: number
		product_type: string
		storage_capacity: number
		unity_cost: number
		research_speed: number
		icon_path: string
		number_of_buildings: number
		build_costs: {
			product: string
			icon_path: string
			quantity: number
		}[]
		recipe: {
			id: string
			name: string
			duration: number
			inputs: {
				id: string
				name: string
				type: string
				icon_path: string
				quantity: number
				connectedShapes: {
					id: TLShapeId
					amount: number
					isPrioritized: boolean
				}[]
			}[]
			outputs: {
				id: string
				name: string
				type: string
				icon_path: string
				quantity: number
				connectedShapes: {
					id: TLShapeId
					amount: number
					isPrioritized: boolean
				}[]
			}[]
		}
	}
>
