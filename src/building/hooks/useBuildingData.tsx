import type { Building, Product } from "../types"
import buildings from "@/data/machines_and_buildings.json"
import products from "@/data/products.json"
import { v4 as uuidv4 } from "uuid"
import { useCallback } from "react"

export default function useBuildingData() {
	const search = useCallback((input: string): (Product | Building)[] => {
		// Add search by starting from each word
		// ex: Hydrogen fluoride must be searchable from "Hyd" and "Flu"
		const foundProducts = products.products
			.filter(
				(p) =>
					!["Computing", "Unity"].includes(p.name) &&
					p.name.toLowerCase().startsWith(input.toLowerCase()),
			)
			.slice(0, 10) satisfies Product[]

		return foundProducts
	}, [])

	const searchRelatedBuildings = useCallback((productName: string) => {
		const buildingsWithInputRecipes: Building[] = []
		const buildingsWithOutputRecipes: Building[] = []

		for (const building of buildings.machines_and_buildings) {
			const input = building.recipes.filter((r) =>
				r.inputs.some((i) => i.name === productName),
			)
			const output = building.recipes.filter((r) =>
				r.outputs.some((i) => i.name === productName),
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
	}, [])

	const getProductData = useCallback((name: string): Product => {
		return products.products.find((p) => p.name === name) as Product
	}, [])

	return {
		search,
		searchRelatedBuildings,
		getProductData,
	}
}
