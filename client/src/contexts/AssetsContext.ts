
import { createContext, useContext } from 'react'

export interface AssetsContextType {
    pointCards: React.ReactNode[] | null,
    merchantCards: React.ReactNode[] | null
}

export const AssetsContext = createContext<AssetsContextType>({ pointCards: null, merchantCards: null })

export const useAssets = () => useContext(AssetsContext)
