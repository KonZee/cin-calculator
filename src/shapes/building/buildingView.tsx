import { PlusIcon } from "@heroicons/react/24/outline"
import { v4 as uuid } from "uuid"
import type { BuildingShape } from "./buildingShape"
import { createShapeId, useEditor, type TLArrowShape } from "tldraw"

const input = [
	{
		id: uuid(),
		name: "Iron Crushed",
		file: "game/48px-IronCrushed.png",
		quantity: 24,
	},
	{
		id: uuid(),
		name: "Limestone",
		file: "game/48px-Limestone.png",
		quantity: 3,
	},
	{
		id: uuid(),
		name: "Graphite",
		file: "game/48px-Graphite.png",
		quantity: 3,
	},
]

const outputs = [
	{
		id: uuid(),
		name: "Iron Molten",
		file: "game/48px-IronMolten.png",
		quantity: 24,
	},
	{
		id: uuid(),
		name: "Slag",
		file: "game/48px-Slag.png",
		quantity: 9,
	},
	{
		id: uuid(),
		name: "Exhaust",
		file: "game/48px-Exhaust.png",
		quantity: 6,
	},
]

const gap = 100

const arrowPositions = [130, 170, 210]

export const BuildingView = ({ shape }: { shape: BuildingShape }) => {
	console.log(shape.id)

	const editor = useEditor()

	const handleInputClick = (index: number) => {
		console.log(index)
	}

	const handleOutputClick = (index: number) => {
		const newBuildingId = createShapeId()
		const arrowId = createShapeId()
		const newShapeXPosition = shape.x + shape.props.w + gap

		editor.createShape({
			id: newBuildingId,
			type: "building",
			x: newShapeXPosition,
			y: 300,
		})

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
				toId: shape.id,
				type: "arrow",
				props: {
					terminal: "start",
					isExact: false,
					isPrecise: true,
					normalizedAnchor: { x: 1, y: arrowPositions[index] / 300 },
				},
			},
			{
				fromId: arrowId,
				toId: newBuildingId,
				type: "arrow",
				props: {
					terminal: "end",
					isExact: false,
					isPrecise: true,
					normalizedAnchor: { x: 0, y: 130 / 300 },
				},
			},
		])
	}

	return (
		<>
			<div
				className="border rounded-md h-full bg-gray-500 text-white flex flex-col"
				style={{ pointerEvents: "none" }}
				onPointerDown={(e) => e.stopPropagation()}
				onTouchStart={(e) => e.stopPropagation()}
				onTouchEnd={(e) => e.stopPropagation()}
			>
				<div className="w-full p-4 flex grow-0">
					<div className="flex justify-center text-center flex-grow">
						Arc Furnace
					</div>
					{/* <TrashIcon className="w-4 h-4 cursor-pointer" /> */}
				</div>
				<div className="p-4 grow">
					<div>
						<div className="text-center mb-2">Recipes</div>
						<div className="flex justify-between">
							<div className="flex flex-col">
								<div>Inputs</div>
								{input.map((i, idx) => (
									<div
										key={i.id}
										className="flex items-center cursor-pointer hover:bg-gray-600"
										style={{ pointerEvents: "all" }}
										onClick={() => handleInputClick(idx)}
										onKeyDown={() => handleInputClick(idx)}
									>
										<PlusIcon className="w-4 h-4" />

										<img
											src={i.file}
											className="w-8 h-8 mx-1 my-1"
											alt={i.name}
										/>
										<span>{i.quantity}</span>
									</div>
								))}
							</div>
							<div className="flex flex-col items-end">
								<div>Outputs</div>
								{outputs.map((i, idx) => (
									<div
										key={i.id}
										className="flex items-center cursor-pointer hover:bg-gray-600"
										style={{ pointerEvents: "all" }}
										onClick={() => handleOutputClick(idx)}
										onKeyDown={() => handleOutputClick(idx)}
									>
										<span>{i.quantity}</span>
										<img
											src={i.file}
											className="w-8 h-8 mx-1 my-1"
											alt={i.name}
										/>
										<PlusIcon className="w-4 h-4" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="p-4 flex">
					<div className="flex mr-2">
						<div className="mr-1">
							<img
								src="game/16px-Worker.png"
								className="w-4 h-4 mr-1"
								alt="Workers"
							/>
						</div>
						<span>5</span>
					</div>
					<div className="flex mr-2 items-center">
						<img
							src="game/48px-Electricity.png"
							className="w-4 h-4 mr-1"
							alt="Electricity"
						/>
						<span>400kWt</span>
					</div>
					<div className="flex mr-2">
						<img
							src="game/48px-Maintenance_I.png"
							className="w-4 h-4 mr-1"
							alt="Maintenance"
						/>
						<span>2</span>
					</div>
					<div className="flex mr-2">
						<img
							src="game/48px-Construction_Parts_III.png"
							className="w-4 h-4 mr-1"
							alt="Construction Parts III"
						/>
						<span>160</span>
					</div>
				</div>
			</div>
		</>
	)
}
