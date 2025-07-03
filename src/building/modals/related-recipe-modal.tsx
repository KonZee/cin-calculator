import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal, Button } from "@mantine/core"
import { createShapeId, useEditor, type TLArrowShape } from "tldraw"
import { useEffect, useState } from "react"
import type { Building } from "@/building/types"
import {
	searchRelatedBuildings,
	getProductData,
} from "@/building/utils/building-data-utils"
import { arrowPositions, cardsHorizontalGap } from "@/building/constants"
import {
	addConnectedShapeToOutput,
	addConnectedShapeToInput,
	createBuildingShape,
	calculateBuildingDimensions,
	findSuitableYPosition,
} from "@/building/utils"
import { RecipeList } from "../components/recipe-list"

interface RelatedRecipesModalProps {
	opened: boolean
	onClose: () => void
	originShape?: BuildingShape
	connection?: "input" | "output"
	product?: string
}

export default function RelatedRecipeModal({
	opened,
	onClose,
	originShape,
	connection,
	product,
}: RelatedRecipesModalProps) {
	const editor = useEditor()
	const [inputRecipes, setInputRecipes] = useState<Building[]>([])
	const [outputRecipes, setOutputRecipes] = useState<Building[]>([])
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
		null,
	)
	const [existingRequestedShape, setExistingRequestedShape] =
		useState<BuildingShape | null>(null)

	useEffect(() => {
		if (opened && product) {
			const { buildingsWithInputRecipes, buildingsWithOutputRecipes } =
				searchRelatedBuildings(product)
			if (connection === "output") {
				setOutputRecipes([])
				setInputRecipes(buildingsWithInputRecipes)
			} else if (connection === "input") {
				setInputRecipes([])
				setOutputRecipes(buildingsWithOutputRecipes)
			}
		}
	}, [opened, product, connection])

	const handleBuildingClick = (b: Building) => {
		const pageBuildingShapes = editor
			.getCurrentPageShapes()
			.filter((ps) => ps.type === "building") as BuildingShape[]

		const foundShape = pageBuildingShapes.find(
			(shape) => shape.props.recipe.id === b.recipes[0].id,
		)

		if (foundShape) {
			setSelectedBuilding(b)
			setExistingRequestedShape(foundShape)
			setConfirmOpen(true)
		} else {
			onCreateConnectedBuilding(b)
		}
	}

	const handleCreateNew = () => {
		if (selectedBuilding) {
			onCreateConnectedBuilding(selectedBuilding)
			setSelectedBuilding(null)
			setConfirmOpen(false)
		}
	}

	const handleConnect = () => {
		if (
			!existingRequestedShape ||
			!selectedBuilding ||
			!originShape ||
			!connection ||
			!product
		)
			return

		// Determine supplier and consumer based on connection type
		const supplier =
			connection === "output" ? originShape : existingRequestedShape
		const consumer =
			connection === "input" ? originShape : existingRequestedShape

		// Find the correct input/output index for the product
		const indexFrom = supplier.props.recipe.outputs.findIndex(
			(r) => r.name === product,
		)
		const indexTo = consumer.props.recipe.inputs.findIndex(
			(r) => r.name === product,
		)

		createArrowConnection({ editor, supplier, consumer, indexFrom, indexTo })
		updateConnectedShapes({ editor, supplier, consumer, indexFrom, indexTo })

		setSelectedBuilding(null)
		setExistingRequestedShape(null)
		setConfirmOpen(false)
		onClose()
	}

	const handleCancel = () => {
		setSelectedBuilding(null)
		setConfirmOpen(false)
	}

	// Helper to create arrow connection between supplier and consumer
	function createArrowConnection({
		editor,
		supplier,
		consumer,
		indexFrom,
		indexTo,
	}: {
		editor: ReturnType<typeof useEditor>
		supplier: BuildingShape
		consumer: BuildingShape
		indexFrom: number
		indexTo: number
	}) {
		const arrowId = createShapeId()
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
					isExact: true,
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
					isExact: true,
					isPrecise: true,
					normalizedAnchor: {
						x: 0,
						y: arrowPositions[indexTo] / consumer.props.h,
					},
				},
			},
		])
	}

	// Helper to update connected shapes
	function updateConnectedShapes({
		editor,
		supplier,
		consumer,
		indexFrom,
		indexTo,
	}: {
		editor: ReturnType<typeof useEditor>
		supplier: BuildingShape
		consumer: BuildingShape
		indexFrom: number
		indexTo: number
	}) {
		const productToTransfer = supplier.props.recipe.outputs[indexFrom]
		const productToReceive = consumer.props.recipe.inputs[indexTo]

		const freeProductToTransfer =
			productToTransfer.quantity * supplier.props.number_of_buildings -
			productToTransfer.connectedShapes.reduce((sum, i) => sum + i.amount, 0)
		const freeProductToReceive =
			productToReceive.quantity * consumer.props.number_of_buildings -
			productToReceive.connectedShapes.reduce((sum, i) => sum + i.amount, 0)

		const toTransfer = Math.min(freeProductToTransfer, freeProductToReceive)

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
	}

	const onCreateConnectedBuilding = (b: Building) => {
		if (!originShape) return

		const newBuildingId = createShapeId()
		const newShapeXPosition =
			(originShape?.x || 0) +
			(connection === "output" ? 1 : -1) *
				((originShape?.props?.w || 0) + cardsHorizontalGap)

		const { width, height } = calculateBuildingDimensions(b)

		const suitableYPosition = findSuitableYPosition(
			editor,
			newShapeXPosition,
			originShape?.y || 0,
			width,
			height,
		)

		createBuildingShape(editor, b, {
			id: newBuildingId,
			x: newShapeXPosition,
			y: suitableYPosition,
		})

		const createdShape = editor.getShape(newBuildingId) as BuildingShape

		const supplier = connection === "output" ? originShape : createdShape
		const consumer = connection === "input" ? originShape : createdShape

		const indexFrom = supplier.props.recipe.outputs.findIndex(
			(r) => r.name === product,
		)
		const indexTo = consumer?.props.recipe.inputs.findIndex(
			(r) => r.name === product,
		)

		createArrowConnection({ editor, supplier, consumer, indexFrom, indexTo })
		updateConnectedShapes({ editor, supplier, consumer, indexFrom, indexTo })

		onClose()
	}

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title="Add Related Recipe"
			centered
			size={"920px"}
		>
			<div className="py-2 h-[75vh]">
				<RecipeList
					title="Consumption"
					recipes={inputRecipes}
					onBuildingClick={handleBuildingClick}
					getProductData={getProductData}
				/>
				<RecipeList
					title="Production"
					recipes={outputRecipes}
					onBuildingClick={handleBuildingClick}
					getProductData={getProductData}
				/>
			</div>
			{confirmOpen && (
				<Modal
					opened={confirmOpen}
					onClose={handleCancel}
					title={
						<div className="flex items-center gap-2">
							<span className="text-yellow-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Warning</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
									/>
								</svg>
							</span>
							<span className="font-semibold">
								Choose existing building or create new one:
							</span>
						</div>
					}
					centered
					radius="md"
					padding="lg"
					overlayProps={{ blur: 2 }}
				>
					<div className="mb-6 text-center bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-200">
						<div className="font-medium mb-1">
							You have an existing building with the same recipe
						</div>
						<div className="text-sm">
							Would you like to connect to it or create a new one?
						</div>
					</div>
					<div className="flex gap-4 justify-center">
						<Button
							color="blue"
							onClick={handleCreateNew}
							className="min-w-[160px]"
						>
							Create new one
						</Button>
						<Button
							color="teal"
							onClick={handleConnect}
							className="min-w-[180px]"
						>
							Connect to existing
						</Button>
					</div>
				</Modal>
			)}
		</Modal>
	)
}
