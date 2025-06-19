import { PlusIcon } from "@heroicons/react/24/outline"
import type { BuildingShape } from "./buildingShape"
import { useModalContext } from "@/context/modal-context"

export const BuildingView = ({ shape }: { shape: BuildingShape }) => {
	const {
		actions: { open },
		setOriginShape,
		setConnection,
		setProduct,
	} = useModalContext()

	const getFormattedElectricity = (amount: number | undefined) => {
		if (!amount) return
		if (amount < 1000) {
			return `${amount} KW`
		}
		return `${amount / 1000} MW`
	}

	const getMaintenanceIcon = () => {
		switch (shape.props.maintenance_cost_units) {
			case "Maintenance III":
				return "products/Maintenance3.png"
			case "Maintenance II":
				return "products/Maintenance2.png"
			default:
				return "products/Maintenance1.png"
		}
	}

	const handleInputClick = (index: number) => {
		setOriginShape(shape)
		setConnection("input")
		setProduct(shape.props.recipe.inputs[index].name)
		open()
	}

	const handleOutputClick = (index: number) => {
		setOriginShape(shape)
		setConnection("output")
		setProduct(shape.props.recipe.outputs[index].name)
		open()
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
					src={shape.props.icon_path}
					alt={shape.props.name}
					className="w-8 h-8 rounded-sm object-cover"
				/>
				{shape.props.name}
			</div>

			{/* Recipes Section */}
			<div className="flex flex-grow p-2 gap-6 overflow-auto">
				{/* Inputs */}
				<div className="flex flex-col flex-1">
					<div className="mb-2 text-center font-medium">Inputs</div>
					<div className="flex flex-col gap-2">
						{shape.props.recipe.inputs.map((r, idx) => (
							<div
								key={r.name}
								className="flex items-center cursor-pointer rounded-md py-1 justify-start gap-2"
							>
								<div
									className="cursor-pointer rounded-md p-2 hover:bg-gray-600 transition-colors"
									style={{ pointerEvents: "all" }}
									onClick={() => handleInputClick(idx)}
									onKeyDown={() => handleInputClick(idx)}
								>
									<PlusIcon className="w-4 h-4 flex-shrink-0" />
								</div>
								<div className="flex flex-col leading-none items-center">
									<span>0</span>
									<span>—</span>
									<span>{r.quantity}</span>
								</div>
								<img
									src={r.icon_path}
									alt={r.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
							</div>

							// <div
							// 	key={r.name}
							// 	className="flex items-center cursor-pointer rounded-md px-2 py-1 hover:bg-gray-600 transition-colors"
							// 	style={{ pointerEvents: "all" }}
							// 	onClick={() => handleInputClick(idx)}
							// 	onKeyDown={() => handleInputClick(idx)}
							// >
							// 	<PlusIcon className="w-4 h-4 mr-2 flex-shrink-0" />
							// 	<img
							// 		src={r.icon_path}
							// 		alt={r.name}
							// 		className="w-8 h-8 rounded-sm object-cover"
							// 	/>
							// 	<span className="ml-2">{r.quantity}</span>
							// </div>
						))}
					</div>
				</div>

				{/* Outputs */}
				<div className="flex flex-col flex-1 items-end">
					<div className="mb-2 text-center font-medium w-full">Outputs</div>
					<div className="flex flex-col gap-2 w-full">
						{shape.props.recipe.outputs.map((r, idx) => (
							<div
								key={r.name}
								className="flex items-center cursor-pointer rounded-md py-1 justify-end gap-2"
							>
								<img
									src={r.icon_path}
									alt={r.name}
									className="w-8 h-8 rounded-sm object-cover"
								/>
								<div className="flex flex-col leading-none items-center">
									<span>0</span>
									<span>—</span>
									<span>{r.quantity}</span>
								</div>
								<div
									className="cursor-pointer rounded-md p-2 hover:bg-gray-600 transition-colors"
									style={{ pointerEvents: "all" }}
									onClick={() => handleOutputClick(idx)}
									onKeyDown={() => handleOutputClick(idx)}
								>
									<PlusIcon className="w-4 h-4 flex-shrink-0" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer Stats */}
			<div className="flex p-4 border-t border-gray-600 gap-6 text-sm items-center select-text">
				{!!shape.props.workers && (
					<div className="flex items-center gap-1">
						<img src="products/Worker.png" alt="Workers" className="w-4 h-4" />
						<span>{shape.props.workers}</span>
					</div>
				)}
				{!!shape.props.electricity_consumed && (
					<div className="flex items-center gap-1">
						<img
							src="products/Electricity.png"
							alt="Electricity"
							className="w-4 h-4"
						/>
						<span>
							{getFormattedElectricity(shape.props.electricity_consumed)}
						</span>
					</div>
				)}
				{!!shape.props.maintenance_cost_quantity && (
					<div className="flex items-center gap-1">
						<img
							src={getMaintenanceIcon()}
							alt="Maintenance"
							className="w-4 h-4"
						/>
						<span>{shape.props.maintenance_cost_quantity}</span>
					</div>
				)}
				{shape.props.build_costs.map((p) => (
					<div key={p.product} className="flex items-center gap-1">
						<img src={p.icon_path} alt={p.product} className="w-4 h-4" />
						<span>{p.quantity}</span>
					</div>
				))}
				{!!shape.props.computing_consumed && (
					<div className="flex items-center gap-1">
						<img
							src="products/Computing.png"
							alt="Computing"
							className="w-4 h-4"
						/>
						<span>{shape.props.computing_consumed}</span>
					</div>
				)}
			</div>
		</div>
	)
}
