import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { TLShapeId } from "tldraw"

export const updateShapeRecipe = (
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
