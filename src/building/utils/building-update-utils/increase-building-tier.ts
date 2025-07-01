import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { Editor } from "tldraw"
import products from "@/data/products.json"
import buildings from "@/data/machines_and_buildings.json"
import { cardHeights } from "@/building/constants"
import type { BuildCost, Product, RecipeIO } from "@/building/types"
import { v4 as uuidv4 } from "uuid"

const getProductData = (name: string): Product => {
	return products.products.find((p) => p.name === name) as Product
}

function findMostSimilarRecipeIndex(
	currentRecipe: { inputs: { name: string }[]; outputs: { name: string }[] },
	newBuilding: {
		recipes: { inputs: { name: string }[]; outputs: { name: string }[] }[]
	},
) {
	let maxMatches = -1
	let bestIndex = 0
	const currentInputNames = new Set(currentRecipe.inputs.map((i) => i.name))
	const currentOutputNames = new Set(currentRecipe.outputs.map((o) => o.name))

	newBuilding.recipes.forEach((recipe, idx) => {
		const inputMatches = recipe.inputs.filter((i) =>
			currentInputNames.has(i.name),
		).length
		const outputMatches = recipe.outputs.filter((o) =>
			currentOutputNames.has(o.name),
		).length
		const matches = inputMatches + outputMatches
		if (matches > maxMatches) {
			maxMatches = matches
			bestIndex = idx
		}
	})
	return bestIndex
}

export const increaseBuildingTier = ({
	editor,
	buildingShape,
}: {
	editor: Editor
	buildingShape: BuildingShape
}) => {
	const newBuilding = buildings.machines_and_buildings.find(
		(p) => p.id === buildingShape.props.next_tier,
	)

	if (!newBuilding) return

	const currentRecipe = buildingShape.props.recipe
	const bestRecipeIndex = findMostSimilarRecipeIndex(currentRecipe, newBuilding)
	const selectedRecipe = newBuilding.recipes[bestRecipeIndex]

	const height =
		cardHeights[
			Math.max(selectedRecipe.inputs.length, selectedRecipe.outputs.length) - 1
		]

	editor.updateShape({
		id: buildingShape.id,
		type: buildingShape.type,
		props: {
			h: height,
			name: newBuilding.name,
			category: newBuilding.category,
			previous_tier: newBuilding.previous_tier,
			next_tier: newBuilding.next_tier,
			workers: newBuilding.workers,
			maintenance_cost_units: newBuilding.maintenance_cost_units,
			maintenance_cost_quantity: newBuilding.maintenance_cost_quantity,
			electricity_consumed: newBuilding.electricity_consumed,
			electricity_generated: newBuilding.electricity_generated,
			computing_consumed: newBuilding.computing_consumed,
			computing_generated: newBuilding.computing_generated,
			product_type: newBuilding.product_type,
			storage_capacity: newBuilding.storage_capacity,
			unity_cost: newBuilding.unity_cost,
			research_speed: newBuilding.research_speed,
			icon_path: newBuilding.icon_path,
			build_costs: newBuilding.build_costs.map((c: BuildCost) => ({
				...c,
				icon_path: getProductData(c.product).icon_path,
			})),
			recipe: {
				...selectedRecipe,
				inputs: selectedRecipe.inputs.map((r: RecipeIO) => ({
					name: r.name,
					quantity: (r.quantity * 60) / selectedRecipe.duration,
					id: uuidv4(),
					type: getProductData(r.name).type,
					icon_path: getProductData(r.name).icon_path,
					connectedShapes: [],
				})),
				outputs: selectedRecipe.outputs.map((r: RecipeIO) => ({
					name: r.name,
					quantity: (r.quantity * 60) / selectedRecipe.duration,
					id: uuidv4(),
					type: getProductData(r.name).type,
					icon_path: getProductData(r.name).icon_path,
					connectedShapes: [],
				})),
			},
		},
	})
}
