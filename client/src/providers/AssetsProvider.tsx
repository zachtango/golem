import { useEffect, useState } from "react"
import { AssetsContext, AssetsContextType } from "../contexts/AssetsContext"


const NUM_MERCHANT_CARDS = 44
const NUM_POINT_CARDS = 35

export default function AssetsProvider({ children }: { children: React.ReactNode }) {
    const [assets, setAssets] = useState<AssetsContextType>({
        pointCards: null, 
        merchantCards: null
    })

    useEffect(() => {
        const merchantCards: Promise<{ default: React.FC<{}> }>[] = []
        const pointCards: Promise<{ default: React.FC<{}> }>[] = []

        const loadAssets = async () => {
            for (let i = 0; i < NUM_MERCHANT_CARDS; i++) {
                merchantCards.push(import(`../assets/merchant-cards/m${i}.svg?react`))
            }

            for (let i = 0; i < NUM_POINT_CARDS; i++) {
                pointCards.push(import(`../assets/point-cards/p${i}.svg?react`))
            }
            
            setAssets({
                pointCards: (await Promise.all(pointCards)).map(m => m.default({})),
                merchantCards: (await Promise.all(merchantCards)).map(m => m.default({}))
            })
        }

        loadAssets()
    }, [])

    return <AssetsContext.Provider value={assets}>{children}</AssetsContext.Provider>
}
