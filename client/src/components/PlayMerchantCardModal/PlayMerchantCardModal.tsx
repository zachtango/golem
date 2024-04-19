import { useState } from "react";
import Card from "../Card/Card";
import { IoMdClose } from "react-icons/io";
import { FaMinus, FaPlus, FaArrowDown } from "react-icons/fa";
import CrystalCount from "../CrystalCount/CrystalCount";
import merchantCards from '../../../../shared/MerchantCards.json'
import './PlayMerchantCardModal.css'
import { ActionRequest, CrystalMerchantCardAction, CrystalType, Crystals, MerchantCard, MerchantCardId, OrderedCrystals, TradeMerchantCard, TradeMerchantCardAction, UpgradeMerchantCard, UpgradeMerchantCardAction } from "../../../../shared";
import { useWebSocket } from "../../contexts/WebSocketContext";


const crystalTypes: CrystalType[] = ['Yellow', 'Green', 'Blue', 'Pink']


function CrystalControls({
    id,
    onClose
} : {
    id: MerchantCardId,
    onClose: () => void
}) {
    const {send} = useWebSocket()
    function onPlay() {
        const request: ActionRequest = {
            type: 'Action',
            action: {
                type: 'PlayMerchantCard',
                playMerchantCardType: 'CrystalMerchantCard',
                merchantCardId: id
            } as CrystalMerchantCardAction
        }
        send!(request)
        onClose()
    }

    return (
        <div className="controls">
            <button onClick={onPlay}>Play</button>
        </div>
    )
}

function UpgradeControls({
    id,
    numUpgrades,
    crystals,
    onClose
} : {
    id: MerchantCardId,
    numUpgrades: number,
    crystals: Crystals,
    onClose: () => void
}) {
    const {send} = useWebSocket()
    const [crystalsStack, setCrystalsStack] = useState<Crystals[]>([crystals])
    const [upgrades, setUpgrades] = useState<OrderedCrystals>([])

    function onCrystalClick(crystal: number) {
        const newCrystals = [...crystalsStack[crystalsStack.length - 1]]

        if (crystalTypes[crystal] === 'Pink' || newCrystals[crystal] == 0 || crystalsStack.length > numUpgrades) {
            return;
        }
        
        newCrystals[crystal] -= 1;
        newCrystals[crystal + 1] += 1;

        setCrystalsStack([...crystalsStack, newCrystals] as Crystals[])
        setUpgrades([...upgrades, crystalTypes[crystal]])
    }

    function onPlay() {
        if (upgrades.length === 0) {
            return
        }
        const request: ActionRequest = {
            type: 'Action',
            action: {
                type: 'PlayMerchantCard',
                playMerchantCardType: 'UpgradeMerchantCard',
                merchantCardId: id,
                upgrades: upgrades
            } as UpgradeMerchantCardAction
        }
        send!(request)
        onClose()
    }

    return (
        <div className="upgrade-controls controls">
            <div className="upgrades">
                {crystalsStack.slice(0, crystalsStack.length - 1).map((crystals) => (
                    <>
                        <CrystalCount
                            crystals={crystals}
                        />
                        <FaArrowDown className="arrow-down"/>
                    </>
                ))}
                <CrystalCount
                    crystals={crystalsStack[crystalsStack.length - 1]}
                    onCrystalClick={onCrystalClick}
                />
            </div>
            <div className="buttons">
                <button
                    disabled={upgrades.length === 0}
                    onClick={onPlay}
                >Play</button>
                <button
                    disabled={upgrades.length === 0}
                    onClick={() => {
                        setCrystalsStack([crystals])
                        setUpgrades([])
                    }}>Reset</button>
            </div>
        </div>
    )
}

function TradeControls({
    id,
    fromCrystals,
    ownCrystals,
    onClose
} : {
    id: MerchantCardId,
    fromCrystals: Crystals,
    ownCrystals: Crystals,
    onClose: () => void
}) {
    const {send} = useWebSocket()
    const [numTrades, setNumTrades] = useState(0)
    
    const canPlus = fromCrystals.every((crystal, i) => ownCrystals[i] >= crystal * (numTrades + 1))

    function onPlus() {
        if (!canPlus) {
            return
        }
        setNumTrades(numTrades + 1)
    }

    function onMinus() {
        if (numTrades > 0) {
            setNumTrades(numTrades - 1)
        }
    }

    function onPlay() {
        const request: ActionRequest = {
            type: 'Action',
            action: {
                type: 'PlayMerchantCard',
                playMerchantCardType: 'TradeMerchantCard',
                merchantCardId: id,
                numTrades: numTrades
            } as TradeMerchantCardAction
        }
        send!(request)
        onClose()
    }

    return (
        <div className="trade-controls controls">
            <div className="trades">
                <FaPlus onClick={onPlus} />
                <div>
                    {numTrades}
                </div>
                <FaMinus onClick={onMinus} />
            </div>
            <button
                disabled={numTrades === 0}
                className="button"
                onClick={onPlay}
            >Play</button>
        </div>
    )
}

export default function PlayMerchantCardModal({
    id,
    crystals,
    onClose
} : {
    id: MerchantCardId,
    crystals: Crystals,
    onClose: () => void
}) {
    const merchantCard = merchantCards[id] as MerchantCard

    let controls;

    switch(merchantCard.type) {
        case 'CrystalMerchantCard':
            controls = (
                <CrystalControls
                    id={id}
                    onClose={onClose}
                />
            )
            break;
        case 'UpgradeMerchantCard':
            controls = (
                <UpgradeControls
                    id={id}
                    numUpgrades={(merchantCard as UpgradeMerchantCard).numUpgrades}
                    crystals={crystals}
                    onClose={onClose}
                />
            )
            break;
        case 'TradeMerchantCard':
            controls = (
                <TradeControls
                    id={id}
                    fromCrystals={(merchantCard as TradeMerchantCard).fromCrystals}
                    ownCrystals={crystals}
                    onClose={onClose}
                />
            )
    }
    console.log(controls)
    return (
        <div className="play-merchant-card-modal modal center">
            <div className="exit" onClick={onClose}>
                <IoMdClose />
            </div>
            <Card
                type='MerchantCard'
                id={id}
            />
            {controls}
        </div>
    )
}
