import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal } from "@mantine/core"
import { createShapeId, useEditor } from "tldraw"
import { useEffect, useState } from "react"
import type { Building } from "@/building/types"
import useBuildingData from "@/building/hooks/useBuildingData"
import { v4 as uuidv4 } from "uuid"

interface RelatedRecipesModalProps {
	opened: boolean
	onClose: () => void
	fromShape?: BuildingShape
	connection?: "input" | "output"
	product?: string
}

const gap = 100

// const arrowPositions = [130, 170, 210]

export default function RelatedRecipeModal({
	opened,
	onClose,
	fromShape,
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
		const newBuildingId = createShapeId()
		// const arrowId = createShapeId()
		const newShapeXPosition =
			(fromShape?.x || 0) +
			(connection === "output" ? 1 : -1) * ((fromShape?.props?.w || 0) + gap)

		editor.createShape({
			id: newBuildingId,
			type: "building",
			x: newShapeXPosition,
			y: 300,
			props: {
				w: 400,
				h: 300,
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

		// editor.createShape<TLArrowShape>({
		// 	id: arrowId,
		// 	type: "arrow",
		// 	x: 0,
		// 	y: 0,
		// 	props: {},
		// })

		// editor.createBindings([
		// 	{
		// 		fromId: arrowId,
		// 		toId: shape.id,
		// 		type: "arrow",
		// 		props: {
		// 			terminal: "start",
		// 			isExact: false,
		// 			isPrecise: true,
		// 			normalizedAnchor: { x: 1, y: arrowPositions[index] / 300 },
		// 		},
		// 	},
		// 	{
		// 		fromId: arrowId,
		// 		toId: newBuildingId,
		// 		type: "arrow",
		// 		props: {
		// 			terminal: "end",
		// 			isExact: false,
		// 			isPrecise: true,
		// 			normalizedAnchor: { x: 0, y: 130 / 300 },
		// 		},
		// 	},
		// ])

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
