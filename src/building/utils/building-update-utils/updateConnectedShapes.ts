import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import { processConnectionUpdates } from "./helpers/processConnectionUpdates"

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
