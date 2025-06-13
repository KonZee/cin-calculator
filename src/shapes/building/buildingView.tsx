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
		<div
			className="bg-gradient-to-b from-gray-700 to-gray-800 text-white rounded-lg shadow-lg flex flex-col select-none"
			style={{ pointerEvents: "none" }}
			onPointerDown={(e) => e.stopPropagation()}
			onTouchStart={(e) => e.stopPropagation()}
			onTouchEnd={(e) => e.stopPropagation()}
		>
			{/* Header */}
			<div className="p-4 border-b border-gray-600 flex justify-center items-center text-xl font-semibold select-text">
				Arc Furnace
			</div>

			{/* Recipes Section */}
			<div className="flex flex-grow p-4 gap-6 overflow-auto">
				{/* Inputs */}
				<div className="flex flex-col flex-1">
					<div className="mb-2 text-center font-medium">Inputs</div>
					<div className="flex flex-col gap-2">
						{input.map((i, idx) => (
							<div
								key={i.id}
								className="flex items-center cursor-pointer rounded-md px-2 py-1 hover:bg-gray-600 transition-colors"
								style={{ pointerEvents: "all" }}
								onClick={() => handleInputClick(idx)}
								onKeyDown={() => handleInputClick(idx)}
							>
								<PlusIcon className="w-4 h-4 mr-2 flex-shrink-0" />
								<img
									src={i.file}
									alt={i.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
								<span className="ml-2">{i.quantity}</span>
							</div>
						))}
					</div>
				</div>

				{/* Outputs */}
				<div className="flex flex-col flex-1 items-end">
					<div className="mb-2 text-center font-medium w-full">Outputs</div>
					<div className="flex flex-col gap-2 w-full">
						{outputs.map((i, idx) => (
							<div
								key={i.id}
								className="flex items-center cursor-pointer rounded-md px-2 py-1 hover:bg-gray-600 transition-colors justify-end"
								style={{ pointerEvents: "all" }}
								onClick={() => handleOutputClick(idx)}
								onKeyDown={() => handleOutputClick(idx)}
							>
								<span className="mr-2">{i.quantity}</span>
								<img
									src={i.file}
									alt={i.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
								<PlusIcon className="w-4 h-4 ml-2 flex-shrink-0" />
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer Stats */}
			<div className="flex p-4 border-t border-gray-600 gap-6 text-sm items-center select-text">
				<div className="flex items-center gap-1">
					<img src="game/16px-Worker.png" alt="Workers" className="w-4 h-4" />
					<span>5</span>
				</div>
				<div className="flex items-center gap-1">
					<img
						src="game/48px-Electricity.png"
						alt="Electricity"
						className="w-4 h-4"
					/>
					<span>400kWt</span>
				</div>
				<div className="flex items-center gap-1">
					<img
						src="game/48px-Maintenance_I.png"
						alt="Maintenance"
						className="w-4 h-4"
					/>
					<span>2</span>
				</div>
				<div className="flex items-center gap-1">
					<img
						src="game/48px-Construction_Parts_III.png"
						alt="Construction Parts III"
						className="w-4 h-4"
					/>
					<span>160</span>
				</div>
			</div>
		</div>
	)
}
