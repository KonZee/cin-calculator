import { useDisclosure } from "@mantine/hooks"
import React from "react"
import type { UseDisclosureReturnValue } from "@mantine/hooks"

type DisclosureState = UseDisclosureReturnValue[0]
type DisclosureActions = UseDisclosureReturnValue[1]

interface DisclosureContextValue {
	opened: DisclosureState
	actions: DisclosureActions
	searchRecipes: boolean
	setSearchRecipes: (value: boolean) => void
}

interface DisclosureProviderProps {
	children: React.ReactNode
	initialOpened?: boolean
}

// Context
const defaultDisclosureValue: DisclosureContextValue = {
	opened: false,
	actions: {
		open: () => {},
		close: () => {},
		toggle: () => {},
	},
	searchRecipes: true,
	setSearchRecipes: () => {},
}

const DisclosureContext = React.createContext<DisclosureContextValue>(
	defaultDisclosureValue,
)

// Provided
export const DisclosureProvider: React.FC<DisclosureProviderProps> = ({
	children,
	initialOpened = false,
}) => {
	const [opened, actions] = useDisclosure(initialOpened)
	const [searchRecipes, setSearchRecipes] = React.useState(true)

	return (
		<DisclosureContext.Provider
			value={{ opened, actions, searchRecipes, setSearchRecipes }}
		>
			{children}
		</DisclosureContext.Provider>
	)
}
// Hook
export const useDisclosureContext = () => React.useContext(DisclosureContext)
