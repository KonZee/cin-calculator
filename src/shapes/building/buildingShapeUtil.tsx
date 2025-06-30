import { Rectangle2d, ShapeUtil } from "tldraw"
import type { BuildingShape } from "./buildingShape"
import { BuildingView } from "./buildingView"

export class BuildingShapeUtil extends ShapeUtil<BuildingShape> {
	static override type = "building" as const

	getDefaultProps(): BuildingShape["props"] {
		return {
			w: 400,
			h: 300,
			name: "default",
			category: "default",
			previous_tier: "",
			next_tier: "",
			workers: 0,
			maintenance_cost_units: "Maintenance I",
			maintenance_cost_quantity: 0,
			electricity_consumed: 0,
			electricity_generated: 0,
			computing_consumed: 0,
			computing_generated: 0,
			product_type: "default",
			storage_capacity: 0,
			unity_cost: 0,
			research_speed: 0,
			icon_path: "default",
			number_of_buildings: 1,
			build_costs: [
				{
					product: "Construction Parts I",
					icon_path: "products/ConstructionParts1.png",
					quantity: 0,
				},
			],
			recipe: {
				id: "default",
				name: "default",
				duration: 0,
				inputs: [
					{
						id: "default",
						name: "default",
						type: "default",
						icon_path: "default",
						quantity: 0,
						connectedShapes: [],
					},
				],
				outputs: [
					{
						id: "default",
						name: "default",
						type: "default",
						icon_path: "default",
						quantity: 0,
						connectedShapes: [],
					},
				],
			},
		}
	}

	getGeometry(shape: BuildingShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: BuildingShape) {
		return <BuildingView shape={shape} />
	}

	indicator(shape: BuildingShape) {
		return <rect width={shape.props.w} height={shape.props.h} />
	}
}
