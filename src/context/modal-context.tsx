import { useDisclosure } from "@mantine/hooks"
import React, { useState } from "react"
import type { UseDisclosureReturnValue } from "@mantine/hooks"
import type { BuildingShape } from "@/shapes/building/buildingShape"

type DisclosureState = UseDisclosureReturnValue[0]
type DisclosureActions = UseDisclosureReturnValue[1]

interface ModalContextValue {
	opened: DisclosureState
	actions: DisclosureActions
	fromShape?: BuildingShape
	setFromShape?: (shape: BuildingShape) => void
	connection?: "input" | "output"
	setConnection?: (connection: "input" | "output") => void
	product?: string
	setProduct?: (product: string) => void
}

interface ModalProviderProps {
	children: React.ReactNode
	initialOpened?: boolean
}

// Context
const defaultModalValue: ModalContextValue = {
	opened: false,
	actions: {
		open: () => {},
		close: () => {},
		toggle: () => {},
	},
}

const ModalContext = React.createContext<ModalContextValue>(defaultModalValue)

// Provided
export const ModalProvider: React.FC<ModalProviderProps> = ({
	children,
	initialOpened = false,
}) => {
	const [opened, actions] = useDisclosure(initialOpened)
	// const [searchRecipes, setSearchRecipes] = React.useState(true)
	const [fromShape, setFromShape] = useState<BuildingShape | undefined>(
		undefined,
	)
	const [connection, setConnection] = useState<"input" | "output" | undefined>(
		undefined,
	)
	const [product, setProduct] = useState("")

	return (
		<ModalContext.Provider
			value={{
				opened,
				actions,
				fromShape,
				setFromShape,
				connection,
				setConnection,
				product,
				setProduct,
			}}
		>
			{children}
		</ModalContext.Provider>
	)
}
// Hook
export const useModalContext = () => React.useContext(ModalContext)
