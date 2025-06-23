import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"

// Helper function to get direct and opposite connections
const getConnections = (connection: "input" | "output") => {
	const directConnections = connection === "input" ? "inputs" : "outputs"
	const oppositeConnections = connection === "input" ? "outputs" : "inputs"
	return { directConnections, oppositeConnections } as const
}

// Utility functions for common operations
const updateShapeRecipe = (
	editor: Editor,
	shapeId: TLShapeId,
	recipeUpdate: Partial<BuildingShape["props"]["recipe"]>,
): void => {
	const shape = editor.getShape(shapeId) as BuildingShape
	if (!shape) return

	editor.updateShape<BuildingShape>({
		id: shapeId,
		type: "building",
		props: {
			recipe: { ...shape.props.recipe, ...recipeUpdate },
		},
	})
}

const sortByPriority = <T extends { isPrioritized: boolean }>(
	items: T[],
): T[] =>
	[...items].sort((a, b) => {
		if (a.isPrioritized && !b.isPrioritized) return -1
		if (!a.isPrioritized && b.isPrioritized) return 1
		return 0
	})

const createConnectedShape = (id: TLShapeId, amount: number) => ({
	id,
	amount,
	isPrioritized: false,
})

const findConnectionByName = (
	connections:
		| BuildingShape["props"]["recipe"]["inputs"]
		| BuildingShape["props"]["recipe"]["outputs"],
	product: string,
) => connections.find((conn) => conn.name === product)

const findConnectedShapeById = (
	connectedShapes: { id: TLShapeId; amount: number; isPrioritized: boolean }[],
	shapeId: TLShapeId,
) => connectedShapes.find((s) => s.id === shapeId)

// Helper for adding connected shapes
const addConnectedShapeToConnection = (
	editor: Editor,
	buildingId: TLShapeId,
	connectionType: "input" | "output",
	index: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	const { directConnections } = getConnections(connectionType)
	const connections = building.props.recipe[directConnections]

	const updatedConnections = connections.map((connection, idx) =>
		idx === index
			? {
					...connection,
					connectedShapes: [
						...connection.connectedShapes,
						createConnectedShape(connectedShapeId, amount),
					],
				}
			: connection,
	)

	updateShapeRecipe(editor, buildingId, {
		[directConnections]: updatedConnections,
	})
}

export const addConnectedShapeToOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	outputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	addConnectedShapeToConnection(
		editor,
		buildingId,
		"output",
		outputIndex,
		connectedShapeId,
		amount,
	)
}

export const addConnectedShapeToInput = (
	editor: Editor,
	buildingId: TLShapeId,
	inputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	addConnectedShapeToConnection(
		editor,
		buildingId,
		"input",
		inputIndex,
		connectedShapeId,
		amount,
	)
}

// Helper functions for redistribution logic
const calculateRedistributionDelta = (
	currentAmount: number,
	quantity: number,
	remainingAmount: number,
): number => {
	return Math.min(quantity - currentAmount, remainingAmount)
}

const updateConnectedShapeAmount = (
	connectedShapes: { id: TLShapeId; amount: number; isPrioritized: boolean }[],
	targetId: TLShapeId,
	delta: number,
) => {
	return connectedShapes.map((connectedShape) =>
		connectedShape.id === targetId
			? { ...connectedShape, amount: connectedShape.amount + delta }
			: connectedShape,
	)
}

const updateRestOfConnectedShapes = (
	restOfConnectedShapes: {
		id: TLShapeId
		amount: number
		isPrioritized: boolean
	}[],
	targetId: TLShapeId,
	delta: number,
) => {
	return restOfConnectedShapes.map((connectedShape) =>
		connectedShape.id === targetId
			? { ...connectedShape, amount: connectedShape.amount + delta }
			: connectedShape,
	)
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
	connectionType: "input" | "output",
): void => {
	if (amountToRemove <= 0) return

	const sortedConnectedShapes = sortByPriority(restOfConnectedShapes)
	let remainingAmount = amountToRemove

	for (const cs of sortedConnectedShapes) {
		const shape = editor.getShape(cs.id) as BuildingShape
		if (!shape) continue

		const { oppositeConnections } = getConnections(connectionType)
		const connections = shape.props.recipe[oppositeConnections]
		const correctConnection = findConnectionByName(connections, product)
		if (!correctConnection) continue

		const quantity =
			correctConnection.quantity * shape.props.number_of_buildings
		const currentConnectedShape = findConnectedShapeById(
			correctConnection.connectedShapes,
			buildingId,
		)

		if (currentConnectedShape && currentConnectedShape.amount < quantity) {
			const delta = calculateRedistributionDelta(
				currentConnectedShape.amount,
				quantity,
				remainingAmount,
			)

			const updatedConnectedShapes = updateConnectedShapeAmount(
				correctConnection.connectedShapes,
				buildingId,
				delta,
			)

			const updatedRestOfConnectedShapes = updateRestOfConnectedShapes(
				restOfConnectedShapes,
				cs.id,
				delta,
			)

			const recipeUpdate = {
				[oppositeConnections]: connections.map((conn) =>
					conn.name === product
						? { ...conn, connectedShapes: updatedConnectedShapes }
						: conn,
				),
			}

			updateShapeRecipe(editor, cs.id, recipeUpdate)

			// Update the restOfConnectedShapes reference
			restOfConnectedShapes.length = 0
			restOfConnectedShapes.push(...updatedRestOfConnectedShapes)

			remainingAmount -= delta

			if (remainingAmount === 0) break
		}
	}
}

// Helper for removing connected shapes
const removeConnectedShapeFromConnection = (
	editor: Editor,
	buildingId: TLShapeId,
	connectionType: "input" | "output",
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	const { directConnections } = getConnections(connectionType)
	const connections = building.props.recipe[directConnections]
	const connectionIndex = connections.findIndex((c) => c.name === product)

	if (connectionIndex === -1) return

	const connection = connections[connectionIndex]
	const shapeToRemove = findConnectedShapeById(
		connection.connectedShapes,
		shapeIdToRemove,
	)

	if (!shapeToRemove) return

	const amountToRemove = shapeToRemove.amount
	const restOfConnectedShapes = connection.connectedShapes.filter(
		(cs) => cs.id !== shapeIdToRemove,
	)

	// Update the building's connections
	const newConnections = [...connections]
	newConnections[connectionIndex] = {
		...connection,
		connectedShapes: restOfConnectedShapes,
	}
	updateShapeRecipe(editor, buildingId, {
		[directConnections]: newConnections,
	})

	redistributeAmounts(
		editor,
		buildingId,
		product,
		amountToRemove,
		restOfConnectedShapes,
		connectionType,
	)

	// After redistribution, update all affected shapes to propagate changes
	const shapesToUpdate = new Set(restOfConnectedShapes.map((cs) => cs.id))
	shapesToUpdate.add(buildingId)

	for (const id of shapesToUpdate) {
		const shape = editor.getShape(id) as BuildingShape
		if (shape) {
			updateConnectedShapes(editor, shape, shape.props.number_of_buildings)
		}
	}
}

export const removeConnectedShapeFromOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	removeConnectedShapeFromConnection(
		editor,
		buildingId,
		"output",
		shapeIdToRemove,
		product,
	)
}

export const removeConnectedShapeFromInput = (
	editor: Editor,
	buildingId: TLShapeId,
	shapeIdToRemove: TLShapeId,
	product: string,
): void => {
	removeConnectedShapeFromConnection(
		editor,
		buildingId,
		"input",
		shapeIdToRemove,
		product,
	)
}

// Helper functions for updateConnectedShapes
const calculateConnectionCapacity = (
	connection:
		| BuildingShape["props"]["recipe"]["inputs"][0]
		| BuildingShape["props"]["recipe"]["outputs"][0],
	numberOfBuildings: number,
): number => {
	return connection.quantity * numberOfBuildings
}

const calculateAvailableCapacity = (
	connection:
		| BuildingShape["props"]["recipe"]["inputs"][0]
		| BuildingShape["props"]["recipe"]["outputs"][0],
	numberOfBuildings: number,
	excludeShapeId: TLShapeId,
): number => {
	const totalCapacity = calculateConnectionCapacity(
		connection,
		numberOfBuildings,
	)
	const currentUsed = connection.connectedShapes.reduce(
		(
			sum: number,
			cs: { id: TLShapeId; amount: number; isPrioritized: boolean },
		) => (cs.id === excludeShapeId ? sum : sum + cs.amount),
		0,
	)
	return totalCapacity - currentUsed
}

const calculateMaxAmountForBuilding = (
	availableCapacity: number,
	remainingCapacity: number,
): number => {
	return Math.min(availableCapacity, remainingCapacity)
}

const updateConnectionAmounts = (
	editor: Editor,
	shape: BuildingShape,
	connectionType: "input" | "output",
	newAmounts: { id: TLShapeId; amount: number }[],
	productName: string,
): void => {
	const { oppositeConnections } = getConnections(connectionType)

	for (const newAmount of newAmounts) {
		const connectedBuilding = editor.getShape(newAmount.id) as BuildingShape
		if (!connectedBuilding) continue

		const connections = connectedBuilding.props.recipe[oppositeConnections]
		const connectionIndex = connections.findIndex(
			(conn) => conn.name === productName,
		)
		if (connectionIndex === -1) continue

		const updatedConnections = connections.map((connection, idx) =>
			idx === connectionIndex
				? {
						...connection,
						connectedShapes: connection.connectedShapes.map((cs) =>
							cs.id === shape.id ? { ...cs, amount: newAmount.amount } : cs,
						),
					}
				: connection,
		)

		updateShapeRecipe(editor, newAmount.id, {
			[oppositeConnections]: updatedConnections,
		})
	}
}

const processConnectionUpdates = (
	editor: Editor,
	shape: BuildingShape,
	connectionType: "input" | "output",
	newNumberOfBuildings: number,
) => {
	const { directConnections, oppositeConnections } =
		getConnections(connectionType)
	const connections = shape.props.recipe[directConnections]

	return connections.map((connection) => {
		const totalCapacity = calculateConnectionCapacity(
			connection,
			newNumberOfBuildings,
		)
		const sortedConnectedShapes = sortByPriority(connection.connectedShapes)
		let remainingCapacity = totalCapacity
		const newAmounts: { id: TLShapeId; amount: number }[] = []

		for (const connectedShape of sortedConnectedShapes) {
			const connectedBuilding = editor.getShape(
				connectedShape.id,
			) as BuildingShape
			if (!connectedBuilding) continue

			const oppositeConnection = findConnectionByName(
				connectedBuilding.props.recipe[oppositeConnections],
				connection.name,
			)
			if (!oppositeConnection) continue

			const availableCapacity = calculateAvailableCapacity(
				oppositeConnection,
				connectedBuilding.props.number_of_buildings,
				shape.id,
			)

			const maxAmountForThisBuilding = calculateMaxAmountForBuilding(
				availableCapacity,
				remainingCapacity,
			)

			newAmounts.push({
				id: connectedShape.id,
				amount: Math.max(0, maxAmountForThisBuilding),
			})

			remainingCapacity -= maxAmountForThisBuilding
		}

		updateConnectionAmounts(
			editor,
			shape,
			connectionType,
			newAmounts,
			connection.name,
		)

		return {
			...connection,
			connectedShapes: connection.connectedShapes.map((cs) => {
				const newAmount = newAmounts.find((na) => na.id === cs.id)
				return newAmount ? { ...cs, amount: newAmount.amount } : cs
			}),
		}
	})
}

export const updateConnectedShapes = (
	editor: Editor,
	shape: BuildingShape,
	newNumberOfBuildings: number,
): void => {
	// Recalculate outputs
	const updatedOutputs = processConnectionUpdates(
		editor,
		shape,
		"output",
		newNumberOfBuildings,
	)
	// Recalculate inputs
	const updatedInputs = processConnectionUpdates(
		editor,
		shape,
		"input",
		newNumberOfBuildings,
	)

	// Update the current shape's recipe with recalculated connections
	editor.updateShape<BuildingShape>({
		id: shape.id,
		type: shape.type,
		props: {
			...shape.props,
			number_of_buildings: newNumberOfBuildings,
			recipe: {
				...shape.props.recipe,
				outputs: updatedOutputs,
				inputs: updatedInputs,
			},
		},
	})
}

const updatePrioritizationForShape = (
	editor: Editor,
	connectedShape: BuildingShape,
	product: string,
	shapeId: TLShapeId,
	oppositeConnections: "inputs" | "outputs",
): void => {
	const recipeUpdate = {
		[oppositeConnections]: connectedShape.props.recipe[oppositeConnections].map(
			(s) =>
				s.name === product
					? {
							...s,
							connectedShapes: s.connectedShapes.map((c) => ({
								...c,
								isPrioritized: c.id === shapeId,
							})),
						}
					: s,
		),
	}

	updateShapeRecipe(editor, connectedShape.id, recipeUpdate)
}

export const prioritizeConnectedShape = (
	editor: Editor,
	shape: BuildingShape,
	connection: "input" | "output",
	product: string,
): void => {
	const { directConnections, oppositeConnections } = getConnections(connection)

	const connectedShapes = findConnectionByName(
		shape.props.recipe[directConnections],
		product,
	)?.connectedShapes

	if (!connectedShapes) return

	for (const cs of connectedShapes) {
		const connectedShape = editor.getShape(cs.id) as BuildingShape
		if (!connectedShape) continue

		updatePrioritizationForShape(
			editor,
			connectedShape,
			product,
			shape.id,
			oppositeConnections,
		)

		const updatedConnectedShape = editor.getShape(
			connectedShape.id,
		) as BuildingShape
		updateConnectedShapes(
			editor,
			updatedConnectedShape,
			updatedConnectedShape.props.number_of_buildings,
		)
	}
}
