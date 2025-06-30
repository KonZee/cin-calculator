import { CloseButton, Modal, TextInput } from "@mantine/core"
import { useState } from "react"
import { createShapeId, useEditor } from "tldraw"
import type { Building, Product } from "@/building/types"
import useBuildingData from "@/building/hooks/useBuildingData"
import { createBuildingShape } from "@/building/utils"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import {
	calculateBuildingDimensions,
	findSuitableYPosition,
} from "@/building/utils"

interface RecipeModalProps {
	opened: boolean
	onClose: () => void
}

export default function RecipeModal({ opened, onClose }: RecipeModalProps) {
	const editor = useEditor()
	const { search, searchRelatedBuildings, getProductData } = useBuildingData()
	const [value, setValue] = useState<string>("")
	const [searching, setSearching] = useState<boolean>(false)
	const [products, setProducts] = useState<(Product | Building)[]>([])
	const [inputRecipes, setInputRecipes] = useState<Building[]>([])
	const [outputRecipes, setOutputRecipes] = useState<Building[]>([])

	const onCloseHandler = () => {
		onClearHandler()
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

	const onClearHandler = () => {
		setValue("")
		setProducts([])
		setSearching(false)
		setInputRecipes([])
		setOutputRecipes([])
	}

	const onProductSelect = (productName: string) => {
		const { buildingsWithInputRecipes, buildingsWithOutputRecipes } =
			searchRelatedBuildings(productName)

		setValue(productName)
		setInputRecipes(buildingsWithInputRecipes)
		setOutputRecipes(buildingsWithOutputRecipes)

		// Reset products for now
		setSearching(false)
		setProducts([])
	}

	const onCreateBuilding = (b: Building) => {
		const id = createShapeId()

		// Calculate dimensions based on the actual building data
		const { width, height } = calculateBuildingDimensions(b)

		// Find a suitable position that avoids collisions
		// Start at origin
		const targetX = 0
		const targetY = 0

		// Find a suitable Y position that avoids collisions
		const suitableYPosition = findSuitableYPosition(
			editor,
			targetX,
			targetY,
			width,
			height,
		)

		// Create the shape with the calculated position
		createBuildingShape(editor, b, {
			id,
			x: targetX,
			y: suitableYPosition,
		})

		const shape = editor.getShape(id) as BuildingShape
		if (shape) {
			editor.centerOnPoint({
				x: shape.x + shape.props.w / 2,
				y: shape.y + shape.props.h / 2,
			})
		}
		onCloseHandler()
	}

	return (
		<Modal
			opened={opened}
			onClose={onCloseHandler}
			title="Add New Recipe"
			centered
			size={"920px"}
		>
			<TextInput
				value={value}
				onChange={(event) => onSearchHandler(event.currentTarget.value)}
				rightSection={
					<CloseButton
						aria-label="Clear input"
						onClick={onClearHandler}
						style={{ display: value ? undefined : "none" }}
					/>
				}
			/>

			<div className="py-2 h-[75vh]">
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
									className="w-8 h-8 object-cover"
								/>
								<span>{p.name}</span>
							</div>
						))
					: searching && <span>Nothing found...</span>}
				{!!inputRecipes.length && (
					<>
						<div className="text-lg font-bold">Consumption: </div>
						{inputRecipes.map((b) => (
							<div
								key={b.uuid}
								className="p-2 cursor-pointer rounded-xl hover:bg-gray-100"
								onClick={() => onCreateBuilding(b)}
								onKeyDown={() => onCreateBuilding(b)}
							>
								<span>{b.name}</span>
								<div className="flex items-center gap-2">
									<img
										src={b.icon_path}
										alt={b.name}
										title={b.name}
										className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
									/>
									<span>:</span>
									{b.recipes[0].inputs.map((i, idx) => (
										<div
											key={i.name}
											className="flex items-center gap-2 leading-0"
										>
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
											/>
											{" x "}
											<span className="text-sm font-bold">
												{(i.quantity * 60) / b.recipes[0].duration}
											</span>
										</div>
									))}
									<span>=</span>
									{b.recipes[0].outputs.map((i, idx) => (
										<div
											key={i.name}
											className="flex items-center gap-2 leading-0"
										>
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
											/>
											{" x "}
											<span className="text-sm font-bold">
												{(i.quantity * 60) / b.recipes[0].duration}
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</>
				)}
				{!!outputRecipes.length && (
					<>
						<div className="text-lg font-bold">Production: </div>
						{outputRecipes.map((b) => (
							<div
								key={b.uuid}
								className="p-2 cursor-pointer rounded-xl hover:bg-gray-100"
								onClick={() => onCreateBuilding(b)}
								onKeyDown={() => onCreateBuilding(b)}
							>
								<span>{b.name}</span>
								<div className="flex items-center gap-2">
									<img
										src={b.icon_path}
										alt={b.name}
										title={b.name}
										className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
									/>
									<span>:</span>
									{b.recipes[0].inputs.map((i, idx) => (
										<div
											key={i.name}
											className="flex items-center gap-2 leading-0"
										>
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
											/>
											{" x "}
											<span className="text-sm font-bold">
												{(i.quantity * 60) / b.recipes[0].duration}
											</span>
										</div>
									))}
									<span>=</span>
									{b.recipes[0].outputs.map((i, idx) => (
										<div
											key={i.name}
											className="flex items-center gap-2 leading-0"
										>
											<span>{!!idx && <span>+</span>}</span>
											<img
												src={getProductData(i.name)?.icon_path}
												alt={i.name}
												title={i.name}
												className="w-10 h-10 object-cover p-1 border border-gray-200 rounded-sm"
											/>
											{" x "}
											<span className="text-sm font-bold">
												{(i.quantity * 60) / b.recipes[0].duration}
											</span>
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
