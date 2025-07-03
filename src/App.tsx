import {
	type Editor,
	type TLComponents,
	Tldraw,
	type TLUiOverrides,
} from "tldraw"
import "tldraw/tldraw.css"
import "./styles/index.css"
import { BuildingShapeUtil } from "./shapes/building/buildingShapeUtil"
import { MantineProvider } from "@mantine/core"
import { ModalProvider, useModalContext } from "./context/modal-context"
import NewRecipeModal from "@/building/modals/new-recipe-modal"
import { useDisclosure } from "@mantine/hooks"
import RelatedRecipeModal from "./building/modals/related-recipe-modal"
import CustomUi from "./ui/custom-ui"
import type { BuildingShape } from "./shapes/building/buildingShape"
import {
	removeConnectedShapeFromOutput,
	removeConnectedShapeFromInput,
} from "./building/utils"
import { deleteConnectedArrows } from "./building/utils/building-update-utils/helpers/arrow-utils"

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

	const onMount = (editor: Editor) => {
		editor.sideEffects.registerBeforeDeleteHandler("shape", (shape) => {
			if (shape.type === "building") {
				for (const input of (shape as BuildingShape).props.recipe.inputs) {
					for (const connected of input.connectedShapes) {
						const connectedShape = editor.getShape(
							connected.id,
						) as BuildingShape
						if (connectedShape) {
							removeConnectedShapeFromOutput(
								editor,
								connectedShape.id,
								(shape as BuildingShape).id,
								input.name,
							)
						}
					}
				}

				for (const output of (shape as BuildingShape).props.recipe.outputs) {
					for (const connected of output.connectedShapes) {
						const connectedShape = editor.getShape(
							connected.id,
						) as BuildingShape
						if (connectedShape) {
							removeConnectedShapeFromInput(
								editor,
								connectedShape.id,
								(shape as BuildingShape).id,
								output.name,
							)
						}
					}
				}
			}

			return
		})
	}

	const overrides: TLUiOverrides = {
		tools(_, tools) {
			return {
				select: tools.select,
			}
		},
		actions(editor, actions) {
			const deleteOnSelect = actions.delete.onSelect
			actions.delete = {
				...actions.delete,
				onSelect: (source) => {
					for (const shape of editor.getSelectedShapes()) {
						deleteConnectedArrows({ editor, shape })
					}
					return deleteOnSelect(source)
				},
			}

			return actions
		},
	}

	const components: TLComponents = {
		ActionsMenu: undefined,
		MainMenu: undefined,
		StylePanel: undefined,
		Toolbar: undefined,
	}

	return (
		<div style={{ position: "fixed", inset: 0 }}>
			<Tldraw
				persistenceKey="captain-of-industry"
				onMount={onMount}
				components={components}
				shapeUtils={CustomShapesUtils}
				overrides={overrides}
				// hideUi={true}
			>
				<CustomUi openNewModal={openNewModal} />
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
