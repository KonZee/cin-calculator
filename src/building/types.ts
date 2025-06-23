// Interface for building cost per resource
export interface BuildCost {
	product: string
	quantity: number
}

// Interface for inputs and outputs inside a recipe
export interface RecipeIO {
	name: string
	quantity: number
}

// Interface for recipes inside a building
export interface Recipe {
	id: string
	name: string
	duration: number
	inputs: RecipeIO[]
	outputs: RecipeIO[]
}

// Interface for a building object
export interface Building {
	id: string
	name: string
	category: string
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
	build_costs: BuildCost[]
	recipes: Recipe[]
	uuid?: string
}

// Interface for a product object
export interface Product {
	id: string
	name: string
	icon: string
	type: string
	icon_path: string
}
