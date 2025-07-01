import type { Building, Product, Recipe, RecipeIO } from "../types"
import products from "@/data/products.json"
import buildings from "@/data/machines_and_buildings.json"
import { v4 as uuidv4 } from "uuid"

export const searchProducts = (input: string): Product[] => {
	return products.products
		.filter(
			(p) =>
				!["Computing", "Unity"].includes(p.name) &&
				p.name.toLowerCase().startsWith(input.toLowerCase()),
		)
		.slice(0, 10) as Product[]
}

export const searchRelatedBuildings = (productName: string) => {
	const buildingsWithInputRecipes: Building[] = []
	const buildingsWithOutputRecipes: Building[] = []

	for (const building of buildings.machines_and_buildings as Building[]) {
		const input = building.recipes.filter((r: Recipe) =>
			r.inputs.some((i: RecipeIO) => i.name === productName),
		)
		const output = building.recipes.filter((r: Recipe) =>
			r.outputs.some((i: RecipeIO) => i.name === productName),
		)

		if (!input.length && !output.length) continue

		if (input.length) {
			for (const i of input) {
				buildingsWithInputRecipes.push({
					...building,
					recipes: [i],
					uuid: uuidv4(),
				})
			}
		}

		if (output.length) {
			for (const i of output) {
				buildingsWithOutputRecipes.push({
					...building,
					recipes: [i],
					uuid: uuidv4(),
				})
			}
		}
	}

	return {
		buildingsWithInputRecipes,
		buildingsWithOutputRecipes,
	}
}

export const getProductData = (name: string): Product => {
	return products.products.find((p) => p.name === name) as Product
}
