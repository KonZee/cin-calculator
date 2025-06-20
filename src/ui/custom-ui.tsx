import type { BuildingShape } from "@/shapes/building/buildingShape"
import { useEffect } from "react"
import { track, useEditor } from "tldraw"

const CustomUi = track(({ openNewModal }: { openNewModal: () => void }) => {
	const editor = useEditor()

	useEffect(() => {
		const handleKeyUp = (e: KeyboardEvent) => {
			switch (e.key) {
				case "Delete":
				case "Backspace": {
					editor.deleteShapes(editor.getSelectedShapeIds())
					break
				}
			}
		}

		window.addEventListener("keyup", handleKeyUp)
		return () => {
			window.removeEventListener("keyup", handleKeyUp)
		}
	})

	const checkShapes = () => {
		return !editor.getCurrentPageShapes().length
	}

	const getData = () => {
		const buildingShapes = editor
			.getCurrentPageShapes()
			.filter((s) => s.type === "building") as BuildingShape[]

		const buildings = buildingShapes.reduce(
			(acc, building) => {
				const existing = acc.find((item) => item.name === building.props.name)

				if (existing) {
					existing.quantity += 1
				} else {
					acc.push({
						name: building.props.name,
						icon_path: building.props.icon_path,
						quantity: 1,
					})
				}

				return acc
			},
			[] as Array<{ name: string; icon_path: string; quantity: number }>,
		)

		const cost = buildingShapes.reduce(
			(acc, building) => {
				for (const r of building.props.build_costs) {
					const existing = acc.find((item) => item.product === r.product)
					if (existing) {
						existing.quantity += r.quantity
					} else {
						acc.push({ ...r })
					}
				}
				return acc
			},
			[] as Array<{
				product: string
				icon_path: string
				quantity: number
			}>,
		)

		const consumption = buildingShapes
			.reduce(
				(acc, building) => {
					// Workers
					if (building.props.workers) {
						const existing = acc.find((item) => item.product === "Worker")
						if (existing) {
							existing.quantity += building.props.workers
						} else {
							acc.push({
								product: "Workers",
								icon_path: "products/Worker.png",
								quantity: building.props.workers,
							})
						}
					}
					// Electricity
					if (building.props.electricity_consumed) {
						const existing = acc.find((item) => item.product === "Electricity")
						if (existing) {
							existing.quantity += building.props.electricity_consumed
						} else {
							acc.push({
								product: "Electricity",
								icon_path: "products/Electricity.png",
								quantity: building.props.electricity_consumed,
							})
						}
					}
					// Maintenance
					if (building.props.maintenance_cost_quantity) {
						let icon_path = "products/Maintenance1.png"
						if (building.props.maintenance_cost_units === "Maintenance III") {
							icon_path = "products/Maintenance3.png"
						} else if (
							building.props.maintenance_cost_units === "Maintenance II"
						) {
							icon_path = "products/Maintenance2.png"
						}
						const existing = acc.find(
							(item) =>
								item.product ===
								(building.props.maintenance_cost_units || "Maintenance I"),
						)
						if (existing) {
							existing.quantity += building.props.maintenance_cost_quantity
						} else {
							acc.push({
								product:
									building.props.maintenance_cost_units || "Maintenance I",
								icon_path,
								quantity: building.props.maintenance_cost_quantity,
							})
						}
					}
					// Computing
					if (building.props.computing_consumed) {
						const existing = acc.find((item) => item.product === "Computing")
						if (existing) {
							existing.quantity += building.props.computing_consumed
						} else {
							acc.push({
								product: "Computing",
								icon_path: "products/Computing.png",
								quantity: building.props.computing_consumed,
							})
						}
					}
					return acc
				},
				[] as Array<{
					product: string
					icon_path: string
					quantity: number
				}>,
			)
			.map((i) => {
				if (i.product === "Electricity") {
					return {
						...i,
						quantity:
							i.quantity < 1000
								? `${i.quantity} KW`
								: `${i.quantity / 1000} MW`,
					}
				}
				return i
			})

		// Helper to sum used quantity for an output
		const getUsedQuantity = (
			output: BuildingShape["props"]["recipe"]["outputs"][number],
		) => {
			return output.connectedShapes.reduce((sum, i) => sum + i.amount, 0)
		}

		const output = buildingShapes
			.flatMap((building) =>
				building.props.recipe.outputs.map((o) => ({
					product: o.name,
					icon_path: o.icon_path,
					quantity: o.quantity,
					consumed: getUsedQuantity(o),
				})),
			)
			.reduce(
				(acc, curr) => {
					const existing = acc.find((item) => item.product === curr.product)
					if (existing) {
						existing.quantity += curr.quantity
						existing.consumed += curr.consumed
					} else {
						acc.push({ ...curr })
					}
					return acc
				},
				[] as Array<{
					product: string
					icon_path: string
					quantity: number
					consumed: number
				}>,
			)
			.map((item) => ({
				...item,
				quantity: item.quantity - item.consumed,
			}))
			.filter((item) => item.quantity > 0)

		const input = buildingShapes
			.flatMap((building) =>
				building.props.recipe.inputs.map((i) => ({
					product: i.name,
					icon_path: i.icon_path,
					quantity: i.quantity,
					consumed: getUsedQuantity(i),
				})),
			)
			.reduce(
				(acc, curr) => {
					const existing = acc.find((item) => item.product === curr.product)
					if (existing) {
						existing.quantity += curr.quantity
						existing.consumed += curr.consumed
					} else {
						acc.push({ ...curr })
					}
					return acc
				},
				[] as Array<{
					product: string
					icon_path: string
					quantity: number
					consumed: number
				}>,
			)
			.map((item) => ({
				...item,
				quantity: item.quantity - item.consumed,
			}))
			.filter((item) => item.quantity > 0)

		return { buildings, cost, consumption, output, input }
	}

	const { buildings, cost, consumption, output, input } = getData()

	return (
		<>
			{checkShapes() ? (
				<div className="absolute top-0 left-0 bottom-0 right-0 pointer-events-none flex items-center justify-center">
					<button
						type="button"
						className="pointer-events-auto hidden px-3 cursor-pointer bg-gray-200 hover:bg-gray-300 rounded-xl justify-center items-center p-3"
						onClick={openNewModal}
					>
						<span className="text-2xl">
							Let's start from selection of recipe and building
						</span>
					</button>
				</div>
			) : (
				<div className="absolute top-5 right-5 bg-white border rounded-md p-2 w-48 grid gap-2">
					<div className="grid gap-1">
						<div className="font-bold">Buildings:</div>
						{buildings.map((b) => (
							<div key={b.name} className="flex items-center gap-2">
								<img
									src={b.icon_path}
									alt={b.name}
									title={b.name}
									className="w-4 h-4 object-cover"
								/>
								<span>{b.name}</span>
								<span className="grow text-right">x {b.quantity}</span>
							</div>
						))}
					</div>
					<div className="grid gap-1">
						<div className="font-bold">Costs:</div>
						{cost.map((c) => (
							<div key={c.product} className="flex items-center gap-2">
								<img
									src={c.icon_path}
									alt={c.product}
									title={c.product}
									className="w-4 h-4 object-cover"
								/>
								<span>{c.product}</span>
								<span className="grow text-right">{c.quantity}</span>
							</div>
						))}
					</div>
					<div className="grid gap-1">
						<div className="font-bold">Consumption:</div>
						{consumption.map((c) => (
							<div key={c.product} className="flex items-center gap-2">
								<img
									src={c.icon_path}
									alt={c.product}
									title={c.product}
									className="w-4 h-4 object-cover"
								/>
								<span>{c.product}</span>
								<span className="grow text-right">{c.quantity}</span>
							</div>
						))}
					</div>
					<div className="grid gap-1">
						<div className="font-bold">Outputs:</div>
						{output.map((o) => (
							<div key={o.product} className="flex items-center gap-2">
								<img
									src={o.icon_path}
									alt={o.product}
									title={o.product}
									className="w-4 h-4 object-cover"
								/>
								<span>{o.product}</span>
								<span className="grow text-right">{o.quantity}</span>
							</div>
						))}
					</div>
					<div className="grid gap-1">
						<div className="font-bold">Inputs:</div>
						{input.map((i) => (
							<div key={i.product} className="flex items-center gap-2">
								<img
									src={i.icon_path}
									alt={i.product}
									title={i.product}
									className="w-4 h-4 object-cover"
								/>
								<span>{i.product}</span>
								<span className="grow text-right">{i.quantity}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</>
	)
})

export default CustomUi
