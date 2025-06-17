import { useDisclosure } from "@mantine/hooks"
import React from "react"
import type { UseDisclosureReturnValue } from "@mantine/hooks"

type DisclosureState = UseDisclosureReturnValue[0]
type DisclosureActions = UseDisclosureReturnValue[1]

interface ModalContextValue {
	opened: DisclosureState
	actions: DisclosureActions
	searchRecipes: boolean
	setSearchRecipes: (value: boolean) => void
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
	searchRecipes: true,
	setSearchRecipes: () => {},
}

const ModalContext = React.createContext<ModalContextValue>(defaultModalValue)

// Provided
export const ModalProvider: React.FC<ModalProviderProps> = ({
	children,
	initialOpened = false,
}) => {
	const [opened, actions] = useDisclosure(initialOpened)
	const [searchRecipes, setSearchRecipes] = React.useState(true)

	return (
		<ModalContext.Provider
			value={{ opened, actions, searchRecipes, setSearchRecipes }}
		>
			{children}
		</ModalContext.Provider>
	)
}
// Hook
export const useModalContext = () => React.useContext(ModalContext)
