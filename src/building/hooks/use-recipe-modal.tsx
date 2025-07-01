import { useState } from "react"
import { useEditor } from "tldraw"
import type { Building, Product } from "@/building/types"
import {
	searchProducts,
	searchRelatedBuildings,
	getProductData,
} from "@/building/utils/building-data-utils"

export function useRecipeModal() {
	const editor = useEditor()
	const [value, setValue] = useState<string>("")
	const [searching, setSearching] = useState<boolean>(false)
	const [products, setProducts] = useState<(Product | Building)[]>([])
	const [inputRecipes, setInputRecipes] = useState<Building[]>([])
	const [outputRecipes, setOutputRecipes] = useState<Building[]>([])

	const clearState = () => {
		setValue("")
		setProducts([])
		setSearching(false)
		setInputRecipes([])
		setOutputRecipes([])
	}

	const handleSearch = (input: string) => {
		const result = searchProducts(input)
		setValue(input)
		setProducts(result)
		setSearching(true)
		setInputRecipes([])
		setOutputRecipes([])
	}

	const handleProductSelect = (productName: string) => {
		const { buildingsWithInputRecipes, buildingsWithOutputRecipes } =
			searchRelatedBuildings(productName)

		setValue(productName)
		setInputRecipes(buildingsWithInputRecipes)
		setOutputRecipes(buildingsWithOutputRecipes)
		setSearching(false)
		setProducts([])
	}

	return {
		editor,
		value,
		searching,
		products,
		inputRecipes,
		outputRecipes,
		getProductData,
		clearState,
		handleSearch,
		handleProductSelect,
	}
}
