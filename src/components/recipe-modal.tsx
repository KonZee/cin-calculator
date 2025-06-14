import { Modal, TextInput, Select } from "@mantine/core"
// import buildings from "@/data/machines_and_buildings.json"
import products from "@/data/products.json"
import { useState } from "react"

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
		.slice(0, 5) satisfies Product[]

	return foundProducts
}

export default function RecipeModal({
	opened,
	onClose,
}: { opened: boolean; onClose: () => void }) {
	const [value, setValue] = useState<string>("")
	const [searching, setSearching] = useState<boolean>(false)
	const [products, setData] = useState<(Product | Building)[]>([])

	const onCloseHandler = () => {
		setValue("")
		setData([])
		setSearching(false)
		onClose()
	}

	const onSearchHandler = (input: string) => {
		const result = search(input)
		setValue(input)
		setData(result)
		setSearching(true)
	}

	const onProductSelect = () => {}

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
								onClick={onProductSelect}
								onKeyDown={onProductSelect}
							>
								<img
									src={p.icon_path}
									alt={p.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
								<span>{p.name}</span>
							</div>
						))
					: searching && <span>Nothing found...</span>}
			</div>
		</Modal>
	)
}
