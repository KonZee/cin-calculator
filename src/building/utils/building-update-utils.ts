import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"

export const addConnectedShapeToOutput = (
	editor: Editor,
	buildingId: TLShapeId,
	outputIndex: number,
	connectedShapeId: TLShapeId,
	amount: number,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape({
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
									{ id: connectedShapeId, amount },
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

	editor.updateShape({
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
									{ id: connectedShapeId, amount },
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
	restOfConnectedShapes: Array<{ id: TLShapeId; amount: number }>,
	connectionType: "input" | "output", // "input" for input removal, "output" for output removal
): void => {
	if (amountToRemove <= 0) return

	let remainingAmount = amountToRemove

	for (const cs of restOfConnectedShapes) {
		const shape = editor.getShape(cs.id) as BuildingShape
		if (!shape) continue

		// Find the correct connection (input or output) for the given product
		const connections =
			connectionType === "input"
				? shape.props.recipe.outputs
				: shape.props.recipe.inputs

		const correctConnection = connections.find((conn) => conn.name === product)
		if (!correctConnection) continue

		const quantity = correctConnection.quantity
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
			const recipeUpdate =
				connectionType === "input"
					? {
							outputs: shape.props.recipe.outputs.map((output) =>
								output.name === product
									? {
											...output,
											connectedShapes: updatedConnectedShapes,
										}
									: output,
							),
						}
					: {
							inputs: shape.props.recipe.inputs.map((input) =>
								input.name === product
									? {
											...input,
											connectedShapes: updatedConnectedShapes,
										}
									: input,
							),
						}

			editor.updateShape({
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

	editor.updateShape({
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

	editor.updateShape({
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
