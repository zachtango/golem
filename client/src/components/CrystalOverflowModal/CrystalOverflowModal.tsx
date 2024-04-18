import { FaArrowDown } from 'react-icons/fa'
import './CrystalOverflowModal.css'
import CrystalCount from '../CrystalCount/CrystalCount'
import { useState } from 'react'
import { ActionRequest, Crystals, RemoveCrystalOverflowAction } from '../../../../shared'
import { useWebSocket } from '../../contexts/WebSocketContext'


export default function CrystalOverflowModal({
    crystals
}: {
    crystals: Crystals
}) {
    const {
        send
    } = useWebSocket()
    const [toCrystals, setToCrystals] = useState<Crystals>(crystals)

    function onFromCrystalsClick(crystal: number) {
        if (toCrystals[crystal] === 0) {
            return
        }
        const newToCrystals = toCrystals.slice() as Crystals
        newToCrystals[crystal] -= 1

        setToCrystals(newToCrystals)
    }

    function onToCrystalClick(crystal: number) {
        if (toCrystals[crystal] >= crystals[crystal]) {
            return
        }
        const newToCrystals = toCrystals.slice() as Crystals
        newToCrystals[crystal] += 1

        setToCrystals(newToCrystals)
    }

    const canDrop = toCrystals.reduce((sum, crystals) => (sum + crystals), 0) === 10

    function onOkay() {
        if (!canDrop) {
            return
        }

        const request: ActionRequest = {
            type: 'Action',
            action: {
                type: 'RemoveCrystalOverflow',
                toCrystals: toCrystals
            } as RemoveCrystalOverflowAction
        }

        send!(request)
    }

    return (
        <div className="crystal-overflow-modal modal center">
            <h1>You have over 10 crystals</h1>
            <div className='crystals-container'>
                <CrystalCount
                    crystals={crystals}
                    onCrystalClick={onFromCrystalsClick}    
                />
                <FaArrowDown />
                {toCrystals && (
                    <CrystalCount
                        crystals={toCrystals}
                        onCrystalClick={onToCrystalClick}
                    />
                )}
            </div>
            <div className='buttons'>
                <button
                    disabled={!canDrop}    
                    onClick={onOkay}
                >Okay</button>
                <button
                    disabled={crystals.every((c, i) => c === toCrystals[i])}
                    onClick={() => setToCrystals(crystals)}
                >Reset</button>
            </div>
        </div>
    )
}