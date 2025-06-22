import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal } from "@mantine/core"
import {
	createShapeId,
	useEditor,
	type TLArrowShape,
	type Editor,
} from "tldraw"
import { useEffect, useState } from "react"
import type { Building } from "@/building/types"
import useBuildingData from "@/building/hooks/useBuildingData"
import {
	arrowPositions,
	cardsHorizontalGap,
	cardVerticalGap,
	cardHeights,
} from "@/building/constants"
import {
	addConnectedShapeToOutput,
	addConnectedShapeToInput,
} from "@/building/utils/building-update-utils"
import { createBuildingShape } from "@/building/utils/building-create-utils"

interface RelatedRecipesModalProps {
	opened: boolean
	onClose: () => void
	originShape?: BuildingShape
	connection?: "input" | "output"
	product?: string
}

// Helper function to check if two rectangles intersect
const doRectanglesIntersect = (
	rect1: { x: number; y: number; w: number; h: number },
	rect2: { x: number; y: number; w: number; h: number },
): boolean => {
	return !(
		rect1.x + rect1.w <= rect2.x ||
		rect2.x + rect2.w <= rect1.x ||
		rect1.y + rect1.h <= rect2.y ||
		rect2.y + rect2.h <= rect1.y
	)
}

// Helper function to calculate building dimensions based on recipe
const calculateBuildingDimensions = (building: Building) => {
	const maxConnections = Math.max(
		building.recipes[0].inputs.length,
		building.recipes[0].outputs.length,
	)

	// Use the same logic as in building-create-utils for height calculation
	const height = cardHeights[Math.max(0, maxConnections - 1)]

	return {
		width: 400, // Standard width from building-create-utils
		height,
	}
}

// Helper function to find a suitable Y position that avoids collisions
const findSuitableYPosition = (
	editor: Editor,
	targetX: number,
	targetY: number,
	shapeWidth: number,
	shapeHeight: number,
): number => {
	const existingShapes = editor
		.getCurrentPageShapes()
		.filter((shape) => shape.type === "building") as BuildingShape[]

	// Check if the target position is free
	const targetRect = {
		x: targetX,
		y: targetY,
		w: shapeWidth,
		h: shapeHeight,
	}

	const hasCollision = existingShapes.some((shape) => {
		const existingRect = {
			x: shape.x,
			y: shape.y,
			w: shape.props.w,
			h: shape.props.h,
		}
		return doRectanglesIntersect(targetRect, existingRect)
	})

	if (!hasCollision) {
		return targetY
	}

	// Find the lowest Y position of existing shapes in the same X column
	const shapesInColumn = existingShapes.filter((shape) => {
		const existingRect = {
			x: shape.x,
			y: shape.y,
			w: shape.props.w,
			h: shape.props.h,
		}
		// Check if shapes overlap horizontally
		return !(
			targetX + shapeWidth <= existingRect.x ||
			existingRect.x + existingRect.w <= targetX
		)
	})

	if (shapesInColumn.length === 0) {
		return targetY
	}

	// Find the maximum Y + height of shapes in the column
	const maxY = Math.max(
		...shapesInColumn.map((shape) => shape.y + shape.props.h),
	)

	// Return the position below the lowest shape plus gap
	return maxY + cardVerticalGap
}

export default function RelatedRecipeModal({
	opened,
	onClose,
	originShape,
	connection,
	product,
}: RelatedRecipesModalProps) {
	const editor = useEditor()
	const { searchRelatedBuildings, getProductData } = useBuildingData()
	const [inputRecipes, setInputRecipes] = useState<Building[]>([])
	const [outputRecipes, setOutputRecipes] = useState<Building[]>([])

	useEffect(() => {
		if (opened && product) {
			const { buildingsWithInputRecipes, buildingsWithOutputRecipes } =
				searchRelatedBuildings(product)
			setInputRecipes(buildingsWithInputRecipes)
			setOutputRecipes(buildingsWithOutputRecipes)
		}
	}, [opened, product, searchRelatedBuildings])

	const onCloseHandler = () => {
		setInputRecipes([])
		setOutputRecipes([])
		onClose()
	}

	const onCreateConnectedBuilding = (b: Building) => {
		if (!originShape) return

		const newBuildingId = createShapeId()
		const newShapeXPosition =
			(originShape?.x || 0) +
			(connection === "output" ? 1 : -1) *
				((originShape?.props?.w || 0) + cardsHorizontalGap)

		// Calculate dimensions based on the actual building data
		const { width, height } = calculateBuildingDimensions(b)

		// Find a suitable Y position that avoids collisions
		const suitableYPosition = findSuitableYPosition(
			editor,
			newShapeXPosition,
			originShape?.y || 0,
			width,
			height,
		)

		// Create the shape with the calculated position
		createBuildingShape(editor, b, {
			id: newBuildingId,
			x: newShapeXPosition,
			y: suitableYPosition,
		})

		const createdShape = editor.getShape(newBuildingId) as BuildingShape

		// Define supplier and consumer depends from relation
		const supplier = connection === "output" ? originShape : createdShape
		const consumer = connection === "input" ? originShape : createdShape

		// Create Arrow connection
		const arrowId = createShapeId()
		const indexFrom = supplier.props.recipe.outputs.findIndex(
			(r) => r.name === product,
		)
		const indexTo = consumer?.props.recipe.inputs.findIndex(
			(r) => r.name === product,
		)

		editor.createShape<TLArrowShape>({
			id: arrowId,
			type: "arrow",
			x: 0,
			y: 0,
			props: {},
		})

		editor.createBindings([
			{
				fromId: arrowId,
				toId: supplier.id,
				type: "arrow",
				props: {
					terminal: "start",
					isExact: false,
					isPrecise: true,
					normalizedAnchor: {
						x: 1,
						y: arrowPositions[indexFrom] / supplier.props.h,
					},
				},
			},
			{
				fromId: arrowId,
				toId: consumer.id,
				type: "arrow",
				props: {
					terminal: "end",
					isExact: false,
					isPrecise: true,
					normalizedAnchor: {
						x: 0,
						y: arrowPositions[indexTo] / consumer.props.h,
					},
				},
			},
		])

		// Store consumption data
		// Need to update later to multiple suppliers/consumers
		const productToTransfer = supplier.props.recipe.outputs[indexFrom]
		const productToReceive = consumer.props.recipe.inputs[indexTo]

		const freeProductToTransfer =
			productToTransfer.quantity * supplier.props.number_of_buildings -
			productToTransfer.connectedShapes.reduce((sum, i) => sum + i.amount, 0)
		const freeProductToReceive =
			productToReceive.quantity * consumer.props.number_of_buildings -
			productToReceive.connectedShapes.reduce((sum, i) => sum + i.amount, 0)

		const toTransfer = Math.min(freeProductToTransfer, freeProductToReceive)

		// And update shapes
		addConnectedShapeToOutput(
			editor,
			supplier.id,
			indexFrom,
			consumer.id,
			toTransfer,
		)
		addConnectedShapeToInput(
			editor,
			consumer.id,
			indexTo,
			supplier.id,
			toTransfer,
		)

		onCloseHandler()
	}

	return (
		<Modal opened={opened} onClose={onCloseHandler} centered>
			{!!inputRecipes.length && (
				<>
					<div className="text-lg font-bold">Consumption: </div>
					{inputRecipes.map((b) => (
						<div
							key={b.uuid}
							className="p-2 cursor-pointer rounded-xl hover:bg-gray-100"
							onClick={() => onCreateConnectedBuilding(b)}
							onKeyDown={() => onCreateConnectedBuilding(b)}
						>
							<div className="flex gap-2 p-2 items-center">
								<img
									src={b.icon_path}
									alt={b.name}
									title={b.name}
									className="w-8 h-8 object-cover"
								/>
								<span>:</span>
								{b.recipes[0].inputs.map((i, idx) => (
									<div key={i.name} className="flex items-center gap-2">
										<span>{!!idx && <span>+</span>}</span>
										<img
											src={getProductData(i.name)?.icon_path}
											alt={i.name}
											title={i.name}
											className="w-8 h-8 object-cover"
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
											className="w-8 h-8  object-cover"
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
					<div className="text-lg font-bold">Production: </div>
					{outputRecipes.map((b) => (
						<div
							key={b.uuid}
							className="p-2 cursor-pointer rounded-xl hover:bg-gray-100"
							onClick={() => onCreateConnectedBuilding(b)}
							onKeyDown={() => onCreateConnectedBuilding(b)}
						>
							<div className="flex gap-2 p-2 items-center">
								<img
									src={b.icon_path}
									alt={b.name}
									title={b.name}
									className="w-8 h-8 object-cover"
								/>
								<span>:</span>
								{b.recipes[0].inputs.map((i, idx) => (
									<div key={i.name} className="flex items-center gap-2">
										<span>{!!idx && <span>+</span>}</span>
										<img
											src={getProductData(i.name)?.icon_path}
											alt={i.name}
											title={i.name}
											className="w-8 h-8 object-cover"
										/>
									</div>
								))}
								<span>{"=>"}</span>
								{b.recipes[0].outputs.map((i, idx) => (
									<div key={i.name} className="flex items-center gap-2">
										<span>{!!idx && <span>+</span>}</span>
										<img
											src={getProductData(i.name)?.icon_path}
											alt={i.name}
											title={i.name}
											className="w-8 h-8 object-cover"
										/>
									</div>
								))}
							</div>
						</div>
					))}
				</>
			)}
		</Modal>
	)
}
