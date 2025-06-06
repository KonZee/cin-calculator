import { createShapeId, type Editor, type TLArrowShape, Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import "./styles/index.css"
import { BuildingShapeUtil } from "./shapes/building/buildingShapeUtil"

const CustomShapesUtils = [BuildingShapeUtil]

export default function App() {
	const handleMount = (editor: Editor) => {
		editor.createShape({
			type: "building",
			x: 300,
			y: 300,
		})
	}

	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<Tldraw shapeUtils={CustomShapesUtils} onMount={handleMount} />
		</div>
	)
}
