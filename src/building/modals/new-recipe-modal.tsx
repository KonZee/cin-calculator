import { CloseButton, Modal, TextInput } from "@mantine/core"
import type { Building } from "@/building/types"
import { createBuildingShape } from "@/building/utils"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import { createShapeId } from "tldraw"
import { RecipeList } from "../components/recipe-list"
import { useRecipeModal } from "../hooks/use-recipe-modal"
import {
	calculateBuildingDimensions,
	findSuitableYPosition,
} from "@/building/utils"

interface RecipeModalProps {
	opened: boolean
	onClose: () => void
}

export default function RecipeModal({ opened, onClose }: RecipeModalProps) {
	const {
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
	} = useRecipeModal()

	const onCreateBuilding = (b: Building) => {
		const id = createShapeId()
		const { width, height } = calculateBuildingDimensions(b)
		const targetX = 0
		const targetY = 0

		const suitableYPosition = findSuitableYPosition(
			editor,
			targetX,
			targetY,
			width,
			height,
		)

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
		clearState()
		onClose()
	}

	return (
		<Modal
			opened={opened}
			onClose={() => {
				clearState()
				onClose()
			}}
			title="Add New Recipe"
			centered
			size={"920px"}
		>
			<TextInput
				value={value}
				onChange={(event) => handleSearch(event.currentTarget.value)}
				placeholder="Type name of product, e.g. Crude Oil, Fuel etc."
				rightSection={
					<CloseButton
						aria-label="Clear input"
						onClick={clearState}
						style={{ display: value ? undefined : "none" }}
					/>
				}
				data-autofocus
			/>

			<div className="py-2 h-[75vh]">
				{products.length
					? products.map((p) => (
							<div
								key={p.id}
								className="flex items-center gap-2 p-2 cursor-pointer rounded-xl hover:bg-gray-100"
								onClick={() => handleProductSelect(p.name)}
								onKeyDown={() => handleProductSelect(p.name)}
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

				<RecipeList
					title="Consumption"
					recipes={inputRecipes}
					onBuildingClick={onCreateBuilding}
					getProductData={getProductData}
				/>
				<RecipeList
					title="Production"
					recipes={outputRecipes}
					onBuildingClick={onCreateBuilding}
					getProductData={getProductData}
				/>
			</div>
		</Modal>
	)
}
