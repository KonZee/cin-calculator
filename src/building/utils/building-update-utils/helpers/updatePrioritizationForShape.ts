import type { Editor } from "tldraw"
import type { BuildingShape } from "@/shapes/building/buildingShape"
import { updateShapeRecipe } from "./updateShapeRecipe"

export const updatePrioritizationForShape = (
	editor: Editor,
	connectedShape: BuildingShape,
	product: string,
	shapeId: string,
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
