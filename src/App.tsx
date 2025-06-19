import {
	DefaultToolbar,
	DefaultToolbarContent,
	type TLComponents,
	Tldraw,
	type TLUiOverrides,
} from "tldraw"
import "tldraw/tldraw.css"
import "./styles/index.css"
import { BuildingShapeUtil } from "./shapes/building/buildingShapeUtil"
import { MantineProvider } from "@mantine/core"
import { ModalProvider, useModalContext } from "./context/modal-context"
import NewRecipeModal from "@/components/new-recipe-modal"
import { useDisclosure } from "@mantine/hooks"
import RelatedRecipeModal from "./components/related-recipe-modal"

const CustomShapesUtils = [BuildingShapeUtil]

function TldrawApp() {
	const [newModalOpened, { open: openNewModal, close: closeNewModal }] =
		useDisclosure()
	const {
		opened: relatedRecipesModalOpened,
		actions: { close: closeRelatedRecipesModal },
		originShape,
		connection,
		product,
	} = useModalContext()

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
						onClick={openNewModal}
					>
						<span className="">Select Recipe</span>
					</button>
					<DefaultToolbarContent />
				</DefaultToolbar>
			)
		},
	}

	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<Tldraw
				components={components}
				shapeUtils={CustomShapesUtils}
				overrides={overrides}
			>
				<NewRecipeModal opened={newModalOpened} onClose={closeNewModal} />
				<RelatedRecipeModal
					opened={relatedRecipesModalOpened}
					onClose={closeRelatedRecipesModal}
					originShape={originShape}
					connection={connection}
					product={product}
				/>
			</Tldraw>
		</div>
	)
}

export default function App() {
	return (
		<MantineProvider>
			<ModalProvider>
				<TldrawApp />
			</ModalProvider>
		</MantineProvider>
	)
}
