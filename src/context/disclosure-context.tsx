import { useDisclosure } from "@mantine/hooks"
import React from "react"
import type { UseDisclosureReturnValue } from "@mantine/hooks"

interface DisclosureContextValue extends UseDisclosureReturnValue {}

interface DisclosureProviderProps {
	children: React.ReactNode
	initialOpened?: boolean
}

// Context
const defaultDisclosureValue: DisclosureContextValue = [
	false,
	{
		open: () => {},
		close: () => {},
		toggle: () => {},
	},
]

const DisclosureContext = React.createContext<DisclosureContextValue>(
	defaultDisclosureValue,
)

// Provided
export const DisclosureProvider: React.FC<DisclosureProviderProps> = ({
	children,
	initialOpened = false,
}) => {
	const disclosure = useDisclosure(initialOpened)

	return (
		<DisclosureContext.Provider value={disclosure}>
			{children}
		</DisclosureContext.Provider>
	)
}
// Hook
export const useDisclosureContext = () => React.useContext(DisclosureContext)
