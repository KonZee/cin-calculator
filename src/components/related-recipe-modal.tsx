import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal, Button } from "@mantine/core"
import { createShapeId, useEditor, type TLArrowShape } from "tldraw"
import { useEffect, useState } from "react"
import type { Building } from "@/building/types"
import useBuildingData from "@/building/hooks/useBuildingData"
import { arrowPositions, cardsHorizontalGap } from "@/building/constants"
import {
	addConnectedShapeToOutput,
	addConnectedShapeToInput,
	createBuildingShape,
	calculateBuildingDimensions,
	findSuitableYPosition,
} from "@/building/utils"

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
	const { searchRelatedBuildings, getProductData } = useBuildingData()
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
	}, [opened, product, connection, searchRelatedBuildings])

	const onCloseHandler = () => {
		onClose()
	}

	const handleBuildingClick = (b: Building) => {
		const pageBuildingShapes = editor
			.getCurrentPageShapes()
			.filter((ps) => ps.type === "building") as BuildingShape[]

		const foundShape = pageBuildingShapes.find(
			(shape) => shape.props.recipe.name === b.recipes[0].name,
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
		if (!existingRequestedShape || !selectedBuilding) return
		// TODO: Add logic to connect to the existing shape
		setSelectedBuilding(null)
		setExistingRequestedShape(null)
		setConfirmOpen(false)
	}

	const handleCancel = () => {
		setSelectedBuilding(null)
		setConfirmOpen(false)
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
		<Modal
			opened={opened}
			onClose={onCloseHandler}
			title="Add Related Recipe"
			centered
		>
			<div className="py-2">
				{!!inputRecipes.length && (
					<>
						<div className="text-lg font-bold">Consumption: </div>
						{inputRecipes.map((b) => (
							<div
								key={b.uuid}
								className="p-2 cursor-pointer rounded-xl hover:bg-gray-100"
								onClick={() => handleBuildingClick(b)}
								onKeyDown={() => handleBuildingClick(b)}
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
								onClick={() => handleBuildingClick(b)}
								onKeyDown={() => handleBuildingClick(b)}
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
												className="w-8 h-8 object-cover"
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</>
				)}
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
