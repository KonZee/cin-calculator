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
					// Find the amount from the shape being removed
					const shapeToRemove = output.connectedShapes.find(
						(cs) => cs.id === shapeIdToRemove,
					)
					let amountToRemove = shapeToRemove?.amount || 0

					const restOfConnectedShapes = output.connectedShapes.filter(
						(cs) => cs.id !== shapeIdToRemove,
					)

					if (amountToRemove > 0) {
						for (const cs of restOfConnectedShapes) {
							const shape = editor.getShape(cs.id) as BuildingShape
							if (!shape) continue

							// Find the correct input for the given product
							const correctInput = shape.props.recipe.inputs.find(
								(input) => input.name === product,
							)
							if (!correctInput) continue

							const quantity = correctInput.quantity
							const currentConnectedShape = correctInput.connectedShapes.find(
								(s) => s.id === buildingId,
							)

							if (
								currentConnectedShape &&
								currentConnectedShape.amount < quantity
							) {
								const delta = Math.min(
									quantity - currentConnectedShape.amount,
									amountToRemove,
								)

								// Update the connected shape amount
								const updatedConnectedShapes = correctInput.connectedShapes.map(
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

								// Update the shape with the new input amounts
								editor.updateShape({
									id: cs.id,
									type: "building",
									props: {
										recipe: {
											...shape.props.recipe,
											inputs: shape.props.recipe.inputs.map((input) =>
												input.name === product
													? {
															...input,
															connectedShapes: updatedConnectedShapes,
														}
													: input,
											),
										},
									},
								})

								// Update the restOfConnectedShapes reference
								restOfConnectedShapes.length = 0
								restOfConnectedShapes.push(...updatedRestOfConnectedShapes)

								amountToRemove -= delta

								if (amountToRemove === 0) {
									break
								}
							}
						}
					}

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
					// Find the amount from the shape being removed
					const shapeToRemove = input.connectedShapes.find(
						(cs) => cs.id === shapeIdToRemove,
					)
					let amountToRemove = shapeToRemove?.amount || 0

					const restOfConnectedShapes = input.connectedShapes.filter(
						(cs) => cs.id !== shapeIdToRemove,
					)

					if (amountToRemove > 0) {
						for (const cs of restOfConnectedShapes) {
							const shape = editor.getShape(cs.id) as BuildingShape
							if (!shape) continue

							// Find the correct output for the given product
							const correctOutput = shape.props.recipe.outputs.find(
								(output) => output.name === product,
							)
							if (!correctOutput) continue

							const quantity = correctOutput.quantity
							const currentConnectedShape = correctOutput.connectedShapes.find(
								(s) => s.id === buildingId,
							)

							if (
								currentConnectedShape &&
								currentConnectedShape.amount < quantity
							) {
								const delta = Math.min(
									quantity - currentConnectedShape.amount,
									amountToRemove,
								)

								// Update the connected shape amount
								const updatedConnectedShapes =
									correctOutput.connectedShapes.map((connectedShape) =>
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

								// Update the shape with the new output amounts
								editor.updateShape({
									id: cs.id,
									type: "building",
									props: {
										recipe: {
											...shape.props.recipe,
											outputs: shape.props.recipe.outputs.map((output) =>
												output.name === product
													? {
															...output,
															connectedShapes: updatedConnectedShapes,
														}
													: output,
											),
										},
									},
								})

								// Update the restOfConnectedShapes reference
								restOfConnectedShapes.length = 0
								restOfConnectedShapes.push(...updatedRestOfConnectedShapes)

								amountToRemove -= delta

								if (amountToRemove === 0) {
									break
								}
							}
						}
					}

					return {
						...input,
						connectedShapes: restOfConnectedShapes,
					}
				}),
			},
		},
	})
}
