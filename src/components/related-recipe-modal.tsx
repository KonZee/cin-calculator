import type { BuildingShape } from "@/shapes/building/buildingShape"
import { Modal } from "@mantine/core"

interface RelatedRecipesModalProps {
	opened: boolean
	onClose: () => void
	fromShape?: BuildingShape
	connection?: "input" | "output"
	product?: string
}

export default function RelatedRecipeModal({
	opened,
	onClose,
}: RelatedRecipesModalProps) {
	const onCloseHandler = () => {
		onClose()
	}

	return (
		<Modal opened={opened} onClose={onCloseHandler} centered>
			Something
		</Modal>
	)
}
