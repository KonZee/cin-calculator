import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal } from "@mantine/core"
import { createShapeId, useEditor, type TLArrowShape } from "tldraw"
import { useEffect, useState } from "react"
import type { Building } from "@/building/types"
import useBuildingData from "@/building/hooks/useBuildingData"
import { v4 as uuidv4 } from "uuid"
import { arrowPositions, cardHeights, cardsGap } from "@/building/constants"

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
		const currentShape = editor.getShape(originShape.id) as BuildingShape
		const arrowId = createShapeId()
		const newShapeXPosition =
			(currentShape?.x || 0) +
			(connection === "output" ? 1 : -1) *
				((originShape?.props?.w || 0) + cardsGap)

		const height =
			cardHeights[
				Math.max(b.recipes[0].inputs.length, b.recipes[0].outputs.length) - 1
			]

		editor.createShape({
			id: newBuildingId,
			type: "building",
			x: newShapeXPosition,
			y: currentShape?.y,
			props: {
				w: 400,
				h: height,
				...b,
				build_costs: b.build_costs.map((c) => ({
					...c,
					icon_path: getProductData(c.product).icon_path,
				})),
				recipe: {
					...b.recipes[0],
					inputs: b.recipes[0].inputs.map((r) => ({
						...r,
						id: uuidv4(),
						type: getProductData(r.name).type,
						icon_path: getProductData(r.name).icon_path,
					})),
					outputs: b.recipes[0].outputs.map((r) => ({
						...r,
						id: uuidv4(),
						type: getProductData(r.name).type,
						icon_path: getProductData(r.name).icon_path,
					})),
				},
			},
		})

		// Create Arrow connection
		const createdShape = editor.getShape(newBuildingId) as BuildingShape
		const indexFrom = originShape.props.recipe[
			connection === "input" ? "inputs" : "outputs"
		].findIndex((r) => r.name === product)
		const indexTo = createdShape?.props.recipe[
			connection === "output" ? "inputs" : "outputs"
		].findIndex((r) => r.name === product)

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
				toId: originShape.id,
				type: "arrow",
				props: {
					terminal: connection === "output" ? "start" : "end",
					isExact: false,
					isPrecise: true,
					normalizedAnchor: {
						x: connection === "output" ? 1 : 0,
						y: arrowPositions[indexFrom] / currentShape.props.h,
					},
				},
			},
			{
				fromId: arrowId,
				toId: newBuildingId,
				type: "arrow",
				props: {
					terminal: connection === "output" ? "end" : "start",
					isExact: false,
					isPrecise: true,
					normalizedAnchor: {
						x: connection === "output" ? 0 : 1,
						y: arrowPositions[indexTo] / createdShape.props.h,
					},
				},
			},
		])

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
