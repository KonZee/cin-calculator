import {
	DefaultToolbar,
	DefaultToolbarContent,
	type Editor,
	type TLComponents,
	Tldraw,
	type TLUiOverrides,
} from "tldraw"
import "tldraw/tldraw.css"
import "./styles/index.css"
import { BuildingShapeUtil } from "./shapes/building/buildingShapeUtil"
import { MantineProvider } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import RecipeModal from "@/components/recipe-modal"

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

	const overrides: TLUiOverrides = {
		tools(_, tools) {
			return {
				select: tools.select,
				arrow: tools.arrow,
			}
		},
	}

	const components: TLComponents = {
		ActionsMenu: undefined,
		MainMenu: undefined,
		StylePanel: undefined,
		Toolbar: (props) => {
			return (
				<DefaultToolbar {...props}>
					<button
						type="button"
						className="flex px-3 cursor-pointer hover:bg-gray-100 rounded-[11px] justify-center h-10 items-center m-1"
						onClick={open}
					>
						<span className="">Select Recipe</span>
					</button>
					<DefaultToolbarContent />
				</DefaultToolbar>
			)
		},
	}

	return (
		<MantineProvider>
			<RecipeModal opened={opened} onClose={close} />

			<div style={{ position: "fixed", inset: 0 }}>
				<Tldraw
					components={components}
					shapeUtils={CustomShapesUtils}
					overrides={overrides}
					onMount={handleMount}
				/>
			</div>
		</MantineProvider>
	)
}
