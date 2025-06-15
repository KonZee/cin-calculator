import { PlusIcon } from "@heroicons/react/24/outline"
import type { BuildingShape } from "./buildingShape"
import { createShapeId, useEditor, type TLArrowShape } from "tldraw"
import buildings from "@/data/machines_and_buildings.json"
import products from "@/data/products.json"

// Some hardcode before we put selector here
const building = buildings.machines_and_buildings.find(
	(b) => b.id === "ArcFurnace",
)

const recipe = building?.recipes[1]

const gap = 100

const arrowPositions = [130, 170, 210]

export const BuildingView = ({ shape }: { shape: BuildingShape }) => {
	const editor = useEditor()

	const getProductData = (name: string | undefined) => {
		return products.products.find((p) => p.name === name)
	}

	const getFormattedElectricity = (amount: number | undefined) => {
		if (!amount) return
		if (amount < 1000) {
			return `${amount} KW`
		}
		return `${amount / 1000} MW`
	}

	const handleInputClick = (_: number) => {
		// console.log(index)
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
			<div className="p-4 border-b border-gray-600 flex justify-center items-center text-xl font-semibold select-text gap-2">
				<img
					src={building?.icon_path}
					alt={building?.name}
					className="w-8 h-8 rounded-sm object-cover"
				/>
				{building?.name}
			</div>

			{/* Recipes Section */}
			<div className="flex flex-grow p-4 gap-6 overflow-auto">
				{/* Inputs */}
				<div className="flex flex-col flex-1">
					<div className="mb-2 text-center font-medium">Inputs</div>
					<div className="flex flex-col gap-2">
						{recipe?.inputs.map((r, idx) => (
							<div
								key={r.name}
								className="flex items-center cursor-pointer rounded-md px-2 py-1 hover:bg-gray-600 transition-colors"
								style={{ pointerEvents: "all" }}
								onClick={() => handleInputClick(idx)}
								onKeyDown={() => handleInputClick(idx)}
							>
								<PlusIcon className="w-4 h-4 mr-2 flex-shrink-0" />
								<img
									src={getProductData(r.name)?.icon_path}
									alt={r.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
								<span className="ml-2">{r.quantity}</span>
							</div>
						))}
					</div>
				</div>

				{/* Outputs */}
				<div className="flex flex-col flex-1 items-end">
					<div className="mb-2 text-center font-medium w-full">Outputs</div>
					<div className="flex flex-col gap-2 w-full">
						{recipe?.outputs.map((r, idx) => (
							<div
								key={r.name}
								className="flex items-center cursor-pointer rounded-md px-2 py-1 hover:bg-gray-600 transition-colors justify-end"
								style={{ pointerEvents: "all" }}
								onClick={() => handleOutputClick(idx)}
								onKeyDown={() => handleOutputClick(idx)}
							>
								<span className="mr-2">{r.quantity}</span>
								<img
									src={getProductData(r.name)?.icon_path}
									alt={r.name}
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
					<img src="products/Worker.png" alt="Workers" className="w-4 h-4" />
					<span>{building?.workers}</span>
				</div>
				{!!building?.electricity_consumed && (
					<div className="flex items-center gap-1">
						<img
							src="products/Electricity.png"
							alt="Electricity"
							className="w-4 h-4"
						/>
						<span>
							{getFormattedElectricity(building?.electricity_consumed)}
						</span>
					</div>
				)}
				<div className="flex items-center gap-1">
					<img
						src={getProductData(building?.maintenance_cost_units)?.icon_path}
						alt="Maintenance"
						className="w-4 h-4"
					/>
					<span>{building?.maintenance_cost_quantity}</span>
				</div>
				{building?.build_costs.map((p) => (
					<div key={p.product} className="flex items-center gap-1">
						<img
							src={getProductData(p.product)?.icon_path}
							alt="Construction Parts III"
							className="w-4 h-4"
						/>
						<span>{p.quantity}</span>
					</div>
				))}
				{!!building?.computing_consumed && (
					<div className="flex items-center gap-1">
						<img
							src="products/Computing.png"
							alt="Computing"
							className="w-4 h-4"
						/>
						<span>{building?.computing_consumed}</span>
					</div>
				)}
			</div>
		</div>
	)
}
