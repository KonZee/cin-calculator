import { getArrowBindings } from "tldraw"
import type { Editor, TLArrowShape } from "tldraw"

export function deleteConnectedArrows({
	editor,
	shape,
}: { editor: Editor; shape: { id: string } }) {
	const connectedArrows = editor
		.getCurrentPageShapes()
		.filter((arrow): arrow is TLArrowShape => arrow.type === "arrow")
		.filter((arrow) => {
			const binding = getArrowBindings(editor, arrow)
			return binding.start?.toId === shape.id || binding.end?.toId === shape.id
		})

	for (const arrow of connectedArrows) {
		editor.deleteShape(arrow.id)
	}
}
