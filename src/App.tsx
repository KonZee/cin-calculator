import { DefaultToolbar, type Editor, type TLComponents, Tldraw } from "tldraw"
import "tldraw/tldraw.css"
import "./styles/index.css"
import { BuildingShapeUtil } from "./shapes/building/buildingShapeUtil"
import { MantineProvider } from "@mantine/core"
import { Button } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Modal } from "@mantine/core"

const CustomShapesUtils = [BuildingShapeUtil]

export default function App() {
	const [opened, { open, close }] = useDisclosure(false)

	const handleMount = (editor: Editor) => {
		editor.createShape({
			type: "building",
			x: 300,
			y: 300,
		})
	}

	const components: TLComponents = {
		Toolbar: (props) => {
			return (
				<DefaultToolbar {...props}>
					<Button
						className="h-12 cursor-pointer hover:bg-gray-200 rounded-[11px]"
						onClick={open}
					>
						Select Recipe
					</Button>
				</DefaultToolbar>
			)
		},
	}

	return (
		<MantineProvider>
			<Modal opened={opened} onClose={close} title="Add New Recipe" centered>
				Modal content
			</Modal>

			<div style={{ position: "fixed", inset: 0 }}>
				<Tldraw
					components={components}
					shapeUtils={CustomShapesUtils}
					onMount={handleMount}
				/>
			</div>
		</MantineProvider>
	)
}
