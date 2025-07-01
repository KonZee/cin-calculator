import type { BuildingShape } from "@/shapes/building/buildingShape"
import type { Editor } from "tldraw"
import { changeBuildingTier } from "./helpers/tier-utils"

export const increaseBuildingTier = ({
	editor,
	buildingShape,
}: {
	editor: Editor
	buildingShape: BuildingShape
}) => {
	changeBuildingTier({
		editor,
		buildingShape,
		tierId: buildingShape.props.next_tier,
	})
}
