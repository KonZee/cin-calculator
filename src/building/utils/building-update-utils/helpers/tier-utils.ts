import type { BuildingShape } from "@/shapes/building/buildingShape"
import {
	getArrowBindings,
	type Editor,
	type TLArrowShape,
	type TLShapeId,
} from "tldraw"
import products from "@/data/products.json"
import buildings from "@/data/machines_and_buildings.json"
import { cardHeights } from "@/building/constants"
import type { BuildCost, Building, Product, RecipeIO } from "@/building/types"
import { v4 as uuidv4 } from "uuid"
import { removeConnectedShapeFromOutput } from "../removeConnectedShapeFromOutput"
import { removeConnectedShapeFromInput } from "../removeConnectedShapeFromInput"
import { updateConnectedShapes } from "../updateConnectedShapes"

const getProductData = (name: string): Product => {
	return products.products.find((p) => p.name === name) as Product
}

function findMostSimilarRecipeIndex(
	currentRecipe: BuildingShape["props"]["recipe"],
	newBuilding: Building,
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

const getConnectedShapes = (
	currentRecipe: BuildingShape["props"]["recipe"],
	name: string,
	dir: "inputs" | "outputs",
): BuildingShape["props"]["recipe"][typeof dir][number]["connectedShapes"] => {
	const match = currentRecipe[dir].find((item) => item.name === name)
	return match ? match.connectedShapes : []
}

const getCancelledConnectedShapes = (
	currentRecipe: BuildingShape["props"]["recipe"],
	selectedNames: Set<string>,
	dir: "inputs" | "outputs",
) => {
	return currentRecipe[dir]
		.filter((item) => !selectedNames.has(item.name))
		.flatMap((item) => item.connectedShapes)
}

function handleCancelledConnections({
	editor,
	buildingShape,
	currentRecipe,
	selectedRecipe,
}: {
	editor: Editor
	buildingShape: BuildingShape
	currentRecipe: BuildingShape["props"]["recipe"]
	selectedRecipe: Building["recipes"][number]
}) {
	const newInputNames = new Set(selectedRecipe.inputs.map((i) => i.name))
	const newOutputNames = new Set(selectedRecipe.outputs.map((o) => o.name))

	const cancelledInputs = getCancelledConnectedShapes(
		currentRecipe,
		newInputNames,
		"inputs",
	)
	const cancelledOutputs = getCancelledConnectedShapes(
		currentRecipe,
		newOutputNames,
		"outputs",
	)

	for (const input of cancelledInputs) {
		removeConnectedShapeFromOutput(
			editor,
			input.id as TLShapeId,
			buildingShape.id,
			currentRecipe.inputs.find((i) =>
				i.connectedShapes.some((cs) => cs.id === input.id),
			)?.name || "",
		)
	}
	for (const output of cancelledOutputs) {
		removeConnectedShapeFromInput(
			editor,
			output.id as TLShapeId,
			buildingShape.id,
			currentRecipe.outputs.find((o) =>
				o.connectedShapes.some((cs) => cs.id === output.id),
			)?.name || "",
		)
	}

	const cancelledArrows = editor
		.getCurrentPageShapes()
		.filter((arrow): arrow is TLArrowShape => arrow.type === "arrow")
		.filter((arrow) => {
			const binding = getArrowBindings(editor, arrow)
			return (
				(cancelledInputs.some((i) => i.id === binding.start?.toId) &&
					buildingShape.id === binding.end?.toId) ||
				(cancelledOutputs.some((i) => i.id === binding.end?.toId) &&
					buildingShape.id === binding.start?.toId)
			)
		})

	editor.deleteShapes(cancelledArrows)
}

export function changeBuildingTier({
	editor,
	buildingShape,
	tierId,
}: {
	editor: Editor
	buildingShape: BuildingShape
	tierId: string
}) {
	const newBuilding = buildings.machines_and_buildings.find(
		(p) => p.id === tierId,
	)

	if (!newBuilding) return

	const currentRecipe = buildingShape.props.recipe
	const bestRecipeIndex = findMostSimilarRecipeIndex(currentRecipe, newBuilding)
	const selectedRecipe = newBuilding.recipes[bestRecipeIndex]

	handleCancelledConnections({
		editor,
		buildingShape,
		currentRecipe,
		selectedRecipe,
	})

	const height =
		cardHeights[
			Math.max(selectedRecipe.inputs.length, selectedRecipe.outputs.length) - 1
		]

	editor.updateShape<BuildingShape>({
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
					connectedShapes: getConnectedShapes(currentRecipe, r.name, "inputs"),
				})),
				outputs: selectedRecipe.outputs.map((r: RecipeIO) => ({
					name: r.name,
					quantity: (r.quantity * 60) / selectedRecipe.duration,
					id: uuidv4(),
					type: getProductData(r.name).type,
					icon_path: getProductData(r.name).icon_path,
					connectedShapes: getConnectedShapes(currentRecipe, r.name, "outputs"),
				})),
			},
		},
	})

	// Update connected shapes info
	const connectedInputIds = selectedRecipe.inputs.flatMap((r) =>
		getConnectedShapes(currentRecipe, r.name, "inputs").map((cs) => cs.id),
	)
	const connectedOutputIds = selectedRecipe.outputs.flatMap((r) =>
		getConnectedShapes(currentRecipe, r.name, "outputs").map((cs) => cs.id),
	)
	for (const id of [...connectedInputIds, ...connectedOutputIds]) {
		const shape = editor.getShape(id) as BuildingShape
		if (shape) {
			updateConnectedShapes(editor, shape, shape.props.number_of_buildings)
		}
	}
}
