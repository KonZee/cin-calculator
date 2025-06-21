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
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape({
		id: buildingId,
		type: "building",
		props: {
			recipe: {
				...building.props.recipe,
				outputs: building.props.recipe.outputs.map((output) => ({
					...output,
					connectedShapes: output.connectedShapes.filter(
						(cs) => cs.id !== shapeIdToRemove,
					),
				})),
			},
		},
	})
}

export const removeConnectedShapeFromInput = (
	editor: Editor,
	buildingId: TLShapeId,
	shapeIdToRemove: TLShapeId,
): void => {
	const building = editor.getShape(buildingId) as BuildingShape
	if (!building) return

	editor.updateShape({
		id: buildingId,
		type: "building",
		props: {
			recipe: {
				...building.props.recipe,
				inputs: building.props.recipe.inputs.map((input) => ({
					...input,
					connectedShapes: input.connectedShapes.filter(
						(cs) => cs.id !== shapeIdToRemove,
					),
				})),
			},
		},
	})
}
