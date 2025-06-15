import { Modal, TextInput } from "@mantine/core"
import buildings from "@/data/machines_and_buildings.json"
import products from "@/data/products.json"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

interface BuildCost {
	product: string
	quantity: number
}

// Interface for inputs and outputs inside a recipe
interface RecipeIO {
	name: string
	quantity: number
}

// Interface for recipes inside a building
interface Recipe {
	id: string
	name: string
	duration: number
	inputs: RecipeIO[]
	outputs: RecipeIO[]
}

// Interface for a building object
interface Building {
	id: string
	name: string
	category: string
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
	build_costs: BuildCost[]
	recipes: Recipe[]
	uuid?: string
}

// Interface for a product object
interface Product {
	id: string
	name: string
	icon: string
	type: string
	icon_path: string
}

function search(input: string): (Product | Building)[] {
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
}

function searchRelatedBuildings(productName: string) {
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
}

const getProductData = (name: string | undefined) => {
	return products.products.find((p) => p.name === name)
}

export default function RecipeModal({
	opened,
	onClose,
}: { opened: boolean; onClose: () => void }) {
	const [value, setValue] = useState<string>("")
	const [searching, setSearching] = useState<boolean>(false)
	const [products, setProducts] = useState<(Product | Building)[]>([])
	const [inputRecipes, setInputRecipes] = useState<Building[]>([])
	const [outputRecipes, setOutputRecipes] = useState<Building[]>([])

	const onCloseHandler = () => {
		setValue("")
		setProducts([])
		setSearching(false)
		setInputRecipes([])
		setOutputRecipes([])
		onClose()
	}

	const onSearchHandler = (input: string) => {
		const result = search(input)
		setValue(input)
		setProducts(result)
		setSearching(true)
		setInputRecipes([])
		setOutputRecipes([])
	}

	const onProductSelect = (productName: string) => {
		const { buildingsWithInputRecipes, buildingsWithOutputRecipes } =
			searchRelatedBuildings(productName)

		setInputRecipes(buildingsWithInputRecipes)
		setOutputRecipes(buildingsWithOutputRecipes)

		// Reset products for now
		setSearching(false)
		setProducts([])
	}

	return (
		<Modal
			opened={opened}
			onClose={onCloseHandler}
			title="Add New Recipe"
			centered
		>
			<TextInput
				value={value}
				onChange={(event) => onSearchHandler(event.currentTarget.value)}
			/>

			<div className="py-2">
				{products.length
					? products.map((p) => (
							<div
								key={p.id}
								className="flex items-center gap-2 p-2 cursor-pointer rounded-xl hover:bg-gray-100"
								onClick={() => onProductSelect(p.name)}
								onKeyDown={() => onProductSelect(p.name)}
							>
								<img
									src={p.icon_path}
									alt={p.name}
									title={p.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
								<span>{p.name}</span>
							</div>
						))
					: searching && <span>Nothing found...</span>}
				{!!inputRecipes.length && (
					<>
						<div className="text-lg font-bold">Production: </div>
						{inputRecipes.map((b) => (
							<div key={b.uuid}>
								<div className="flex gap-2 p-2 items-center">
									<img
										src={b.icon_path}
										alt={b.name}
										title={b.name}
										className="w-8 h-8 rounded-sm object-cover"
									/>
									<span>:</span>
									{b.recipes[0].inputs.map((i, idx) => (
										<div key={i.name} className="flex items-center gap-2">
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-8 h-8 rounded-sm object-cover"
											/>
										</div>
									))}
									<span>=</span>
									{b.recipes[0].outputs.map((i, idx) => (
										<div key={i.name} className="flex items-center gap-2">
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-8 h-8 rounded-sm object-cover"
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</>
				)}
				{!!outputRecipes.length && (
					<>
						<div className="text-lg font-bold">Consumption: </div>
						{outputRecipes.map((b) => (
							<div key={b.uuid}>
								<div className="flex gap-2 p-2 items-center">
									<img
										src={b.icon_path}
										alt={b.name}
										title={b.name}
										className="w-8 h-8 rounded-sm object-cover"
									/>
									<span>:</span>
									{b.recipes[0].inputs.map((i, idx) => (
										<div key={i.name} className="flex items-center gap-2">
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-8 h-8 rounded-sm object-cover"
											/>
										</div>
									))}
									<span>=</span>
									{b.recipes[0].outputs.map((i, idx) => (
										<div key={i.name} className="flex items-center gap-2">
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-8 h-8 rounded-sm object-cover"
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</>
				)}
			</div>
		</Modal>
	)
}
