import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { Editor } from "tldraw"
import { changeBuildingTier } from "./helpers/tier-utils"

export const decreaseBuildingTier = ({
	editor,
	buildingShape,
}: {
	editor: Editor
	buildingShape: BuildingShape
}) => {
	changeBuildingTier({
		editor,
		buildingShape,
		tierId: buildingShape.props.previous_tier,
	})
}
