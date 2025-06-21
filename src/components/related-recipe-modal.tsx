import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal } from "@mantine/core"
import { createShapeId, useEditor, type TLArrowShape } from "tldraw"
import { useEffect, useState } from "react"
import type { Building } from "@/building/types"
import useBuildingData from "@/building/hooks/useBuildingData"
import { arrowPositions, cardsGap } from "@/building/constants"
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

export default function RelatedRecipeModal({
	opened,
	onClose,
	originShape,
	connection,
	product,
}: RelatedRecipesModalProps) {
	const editor = useEditor()
	const { getProductData, searchRelatedBuildings } = useBuildingData()
	const [inputRecipes, setInputRecipes] = useState<Building[]>([])
	const [outputRecipes, setOutputRecipes] = useState<Building[]>([])

	useEffect(() => {
		if (product) {
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
	}, [product, connection, searchRelatedBuildings])

	const onCloseHandler = () => {
		onClose()
	}

	const onCreateConnectedBuilding = (b: Building) => {
		if (!originShape) return

		const newBuildingId = createShapeId()
		const newShapeXPosition =
			(originShape?.x || 0) +
			(connection === "output" ? 1 : -1) *
				((originShape?.props?.w || 0) + cardsGap)

		createBuildingShape(editor, b, {
			id: newBuildingId,
			x: newShapeXPosition,
			y: originShape?.y,
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
			productToTransfer.quantity -
			productToTransfer.connectedShapes.reduce((sum, i) => sum + i.amount, 0)
		const freeProductToReceive =
			productToReceive.quantity -
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
