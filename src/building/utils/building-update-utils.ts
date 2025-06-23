import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"

// Helper function to get direct and opposite connections
const getConnections = (connection: "input" | "output") => {
	const directConnections = connection === "input" ? "inputs" : "outputs"
	const oppositeConnections = connection === "input" ? "outputs" : "inputs"
	return { directConnections, oppositeConnections } as const
}

export const addConnectedShapeToOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	outputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape<BuildingShape>({
		id: buildingId,
		type: "building",
		props: {
			recipe: {
				...building.props.recipe,
				outputs: building.props.recipe.outputs.map((output, index) =>
					index === outputIndex
						? {
								...output,
								connectedShapes: [
									...output.connectedShapes,
									{ id: connectedShapeId, amount, isPrioritized: false },
								],
							}
						: output,
				),
			},
		},
	})
}

export const addConnectedShapeToInput = (
	editor: Editor,
	buildingId: TLShapeId,
	inputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape<BuildingShape>({
		id: buildingId,
		type: "building",
		props: {
			recipe: {
				...building.props.recipe,
				inputs: building.props.recipe.inputs.map((input, index) =>
					index === inputIndex
						? {
								...input,
								connectedShapes: [
									...input.connectedShapes,
									{ id: connectedShapeId, amount, isPrioritized: false },
								],
							}
						: input,
				),
			},
		},
	})
}

// Generic function to handle redistribution when removing connected shapes
const redistributeAmounts = (
	editor: Editor,
	buildingId: TLShapeId,
	product: string,
	amountToRemove: number,
	restOfConnectedShapes: Array<{
		id: TLShapeId
		amount: number
		isPrioritized: boolean
	}>,
	connectionType: "input" | "output", // "input" for input removal, "output" for output removal
): void => {
	if (amountToRemove <= 0) return

	// Sort connected shapes by priority (prioritized first, then by original order)
	const sortedConnectedShapes = [...restOfConnectedShapes].sort((a, b) => {
		if (a.isPrioritized && !b.isPrioritized) return -1
		if (!a.isPrioritized && b.isPrioritized) return 1
		return 0
	})

	let remainingAmount = amountToRemove

	for (const cs of sortedConnectedShapes) {
		const shape = editor.getShape(cs.id) as BuildingShape
		if (!shape) continue

		// Find the correct connection (input or output) for the given product
		const { oppositeConnections } = getConnections(connectionType)
		const connections = shape.props.recipe[oppositeConnections]

		const correctConnection = connections.find((conn) => conn.name === product)
		if (!correctConnection) continue

		const quantity =
			correctConnection.quantity * shape.props.number_of_buildings
		const currentConnectedShape = correctConnection.connectedShapes.find(
			(s) => s.id === buildingId,
		)

		if (currentConnectedShape && currentConnectedShape.amount < quantity) {
			const delta = Math.min(
				quantity - currentConnectedShape.amount,
				remainingAmount,
			)

			// Update the connected shape amount
			const updatedConnectedShapes = correctConnection.connectedShapes.map(
				(connectedShape) =>
					connectedShape.id === buildingId
						? {
								...connectedShape,
								amount: connectedShape.amount + delta,
							}
						: connectedShape,
			)

			// Store updated values to update current shape connection later
			const updatedRestOfConnectedShapes = restOfConnectedShapes.map(
				(connectedShape) =>
					connectedShape.id === cs.id
						? {
								...connectedShape,
								amount: connectedShape.amount + delta,
							}
						: connectedShape,
			)

			// Update the shape with the new connection amounts
			const recipeUpdate = {
				[oppositeConnections]: shape.props.recipe[oppositeConnections].map(
					(conn) =>
						conn.name === product
							? {
									...conn,
									connectedShapes: updatedConnectedShapes,
								}
							: conn,
				),
			}

			editor.updateShape<BuildingShape>({
				id: cs.id,
				type: "building",
				props: {
					recipe: {
						...shape.props.recipe,
						...recipeUpdate,
					},
				},
			})

			// Update the restOfConnectedShapes reference
			restOfConnectedShapes.length = 0
			restOfConnectedShapes.push(...updatedRestOfConnectedShapes)

			remainingAmount -= delta

			if (remainingAmount === 0) {
				break
			}
		}
	}
}

export const removeConnectedShapeFromOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape<BuildingShape>({
		id: buildingId,
		type: "building",
		props: {
			recipe: {
				...building.props.recipe,
				outputs: building.props.recipe.outputs.map((output) => {
					const shapeToRemove = output.connectedShapes.find(
						(cs) => cs.id === shapeIdToRemove,
					)
					const amountToRemove = shapeToRemove?.amount || 0

					const restOfConnectedShapes = output.connectedShapes.filter(
						(cs) => cs.id !== shapeIdToRemove,
					)

					redistributeAmounts(
						editor,
						buildingId,
						product,
						amountToRemove,
						restOfConnectedShapes,
						"output",
					)

					return {
						...output,
						connectedShapes: restOfConnectedShapes,
					}
				}),
			},
		},
	})
}

export const removeConnectedShapeFromInput = (
	editor: Editor,
	buildingId: TLShapeId,
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape<BuildingShape>({
		id: buildingId,
		type: "building",
		props: {
			recipe: {
				...building.props.recipe,
				inputs: building.props.recipe.inputs.map((input) => {
					const shapeToRemove = input.connectedShapes.find(
						(cs) => cs.id === shapeIdToRemove,
					)
					const amountToRemove = shapeToRemove?.amount || 0

					const restOfConnectedShapes = input.connectedShapes.filter(
						(cs) => cs.id !== shapeIdToRemove,
					)

					redistributeAmounts(
						editor,
						buildingId,
						product,
						amountToRemove,
						restOfConnectedShapes,
						"input",
					)

					return {
						...input,
						connectedShapes: restOfConnectedShapes,
					}
				}),
			},
		},
	})
}

export const updateConnectedShapes = (
	editor: Editor,
	shape: BuildingShape,
	newNumberOfBuildings: number,
): void => {
	// Collect all updates for the original shape
	const updatedOutputs = shape.props.recipe.outputs.map((output) => {
		const totalOutputCapacity = output.quantity * newNumberOfBuildings

		// Sort connected shapes by priority (prioritized first, then by original order)
		const sortedConnectedShapes = [...output.connectedShapes].sort((a, b) => {
			if (a.isPrioritized && !b.isPrioritized) return -1
			if (!a.isPrioritized && b.isPrioritized) return 1
			return 0
		})

		// Distribute total capacity to connected shapes in priority order
		let remainingCapacity = totalOutputCapacity
		const newAmounts: { id: TLShapeId; amount: number }[] = []

		for (const connectedShape of sortedConnectedShapes) {
			const connectedBuilding = editor.getShape(
				connectedShape.id,
			) as BuildingShape
			if (!connectedBuilding) continue

			const inputIndex = connectedBuilding.props.recipe.inputs.findIndex(
				(input) => input.name === output.name,
			)
			if (inputIndex === -1) continue

			const input = connectedBuilding.props.recipe.inputs[inputIndex]
			const inputCapacity =
				input.quantity * connectedBuilding.props.number_of_buildings
			const currentInputUsed = input.connectedShapes.reduce(
				(sum, cs) => (cs.id === shape.id ? sum : sum + cs.amount),
				0,
			)
			const inputAvailable = inputCapacity - currentInputUsed

			// Calculate how much this connected building can receive
			const maxAmountForThisBuilding = Math.min(
				inputAvailable,
				remainingCapacity,
			)

			newAmounts.push({
				id: connectedShape.id,
				amount: Math.max(0, maxAmountForThisBuilding),
			})

			remainingCapacity -= maxAmountForThisBuilding
		}

		// Update connected buildings' input connections
		for (const newAmount of newAmounts) {
			const connectedBuilding = editor.getShape(newAmount.id) as BuildingShape
			if (!connectedBuilding) continue

			const inputIndex = connectedBuilding.props.recipe.inputs.findIndex(
				(input) => input.name === output.name,
			)
			if (inputIndex === -1) continue

			editor.updateShape<BuildingShape>({
				id: newAmount.id,
				type: "building",
				props: {
					recipe: {
						...connectedBuilding.props.recipe,
						inputs: connectedBuilding.props.recipe.inputs.map((input, idx) =>
							idx === inputIndex
								? {
										...input,
										connectedShapes: input.connectedShapes.map((cs) =>
											cs.id === shape.id
												? { ...cs, amount: newAmount.amount }
												: cs,
										),
									}
								: input,
						),
					},
				},
			})
		}

		// Return updated output with new amounts
		return {
			...output,
			connectedShapes: output.connectedShapes.map((cs) => {
				const newAmount = newAmounts.find((na) => na.id === cs.id)
				return newAmount ? { ...cs, amount: newAmount.amount } : cs
			}),
		}
	})

	const updatedInputs = shape.props.recipe.inputs.map((input) => {
		const totalInputCapacity = input.quantity * newNumberOfBuildings

		// Sort connected shapes by priority (prioritized first, then by original order)
		const sortedConnectedShapes = [...input.connectedShapes].sort((a, b) => {
			if (a.isPrioritized && !b.isPrioritized) return -1
			if (!a.isPrioritized && b.isPrioritized) return 1
			return 0
		})

		// Distribute total capacity to connected shapes in priority order
		let remainingCapacity = totalInputCapacity
		const newAmounts: { id: TLShapeId; amount: number }[] = []

		for (const connectedShape of sortedConnectedShapes) {
			const connectedBuilding = editor.getShape(
				connectedShape.id,
			) as BuildingShape
			if (!connectedBuilding) continue

			const outputIndex = connectedBuilding.props.recipe.outputs.findIndex(
				(output) => output.name === input.name,
			)
			if (outputIndex === -1) continue

			const output = connectedBuilding.props.recipe.outputs[outputIndex]
			const outputCapacity =
				output.quantity * connectedBuilding.props.number_of_buildings
			const currentOutputUsed = output.connectedShapes.reduce(
				(sum, cs) => (cs.id === shape.id ? sum : sum + cs.amount),
				0,
			)
			const outputAvailable = outputCapacity - currentOutputUsed

			// Calculate how much this connected building can provide
			const maxAmountForThisBuilding = Math.min(
				outputAvailable,
				remainingCapacity,
			)

			newAmounts.push({
				id: connectedShape.id,
				amount: Math.max(0, maxAmountForThisBuilding),
			})

			remainingCapacity -= maxAmountForThisBuilding
		}

		// Update connected buildings' output connections
		for (const newAmount of newAmounts) {
			const connectedBuilding = editor.getShape(newAmount.id) as BuildingShape
			if (!connectedBuilding) continue

			const outputIndex = connectedBuilding.props.recipe.outputs.findIndex(
				(output) => output.name === input.name,
			)
			if (outputIndex === -1) continue

			editor.updateShape<BuildingShape>({
				id: newAmount.id,
				type: "building",
				props: {
					recipe: {
						...connectedBuilding.props.recipe,
						outputs: connectedBuilding.props.recipe.outputs.map(
							(output, idx) =>
								idx === outputIndex
									? {
											...output,
											connectedShapes: output.connectedShapes.map((cs) =>
												cs.id === shape.id
													? { ...cs, amount: newAmount.amount }
													: cs,
											),
										}
									: output,
						),
					},
				},
			})
		}

		// Return updated input with new amounts
		return {
			...input,
			connectedShapes: input.connectedShapes.map((cs) => {
				const newAmount = newAmounts.find((na) => na.id === cs.id)
				return newAmount ? { ...cs, amount: newAmount.amount } : cs
			}),
		}
	})

	// Update the original shape with all changes at once
	editor.updateShape<BuildingShape>({
		id: shape.id,
		type: shape.type,
		props: {
			number_of_buildings: newNumberOfBuildings,
			recipe: {
				...shape.props.recipe,
				outputs: updatedOutputs,
				inputs: updatedInputs,
			},
		},
	})
}

export const prioritizeConnectedShape = (
	editor: Editor,
	shape: BuildingShape,
	connection: "input" | "output",
	product: string,
) => {
	const { directConnections, oppositeConnections } = getConnections(connection)

	const connectedShapes = shape.props.recipe[directConnections].find(
		(s) => s.name === product,
	)?.connectedShapes

	if (!connectedShapes) return

	for (const cs of connectedShapes) {
		const connectedShape = editor.getShape(cs.id) as BuildingShape

		editor.updateShape<BuildingShape>({
			id: connectedShape.id,
			type: connectedShape.type,
			props: {
				recipe: {
					...connectedShape.props.recipe,
					[oppositeConnections]: connectedShape.props.recipe[
						oppositeConnections
					].map((s) =>
						s.name === product
							? {
									...s,
									connectedShapes: s.connectedShapes.map((c) => ({
										...c,
										isPrioritized: c.id === shape.id,
									})),
								}
							: s,
					),
				},
			},
		})

		const updatedConnectedShape = editor.getShape(
			connectedShape.id,
		) as BuildingShape

		// Run prioritization again for each connected shape
		updateConnectedShapes(
			editor,
			updatedConnectedShape,
			updatedConnectedShape.props.number_of_buildings,
		)
	}
}
