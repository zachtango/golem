import { IoMdClose } from "react-icons/io";
import './PickMerchantCardModal.css'
import MerchantCard from "../Card/Card";
import CrystalDisplay from "../CrystalDisplay/CrystalDisplay";
import { ActionRequest, Crystals, MerchantCardId, OrderedCrystals, PickUpMerchantCardAction } from "../../../../shared";
import { useWebSocket } from "../../contexts/WebSocketContext";


export default function PickMerchantCardModal({
    id,
    position,
    crystals,
    onClose
} : {
    id: MerchantCardId,
    position: number,
    crystals: Crystals,
    onClose: () => void
}) {
    const {send} = useWebSocket()
    const canPick = position <= crystals.reduce((prev, curr) => prev + curr, 0)
    const yellows = Math.min(position, crystals[0])
    const greens = Math.min(Math.max(position - crystals[0], 0), crystals[1])
    const blues =  Math.min(Math.max(position - crystals[0] - crystals[1], 0), crystals[2])
    const pinks = Math.min(Math.max(position - crystals[0] - crystals[1] - crystals[2], 0), crystals[3])
    const crystalsDropped: OrderedCrystals = [
        ...Array(yellows).fill('Yellow'),
        ...Array(greens).fill('Green'),
        ...Array(blues).fill('Blue'),
        ...Array(pinks).fill('Pink')
    ]
    console.log(position)
    return (
        <div className="pick-merchant-card-modal modal center">
            <div className="exit" onClick={onClose}>
                <IoMdClose />
            </div>
            <MerchantCard
                type='MerchantCard'
                id={id}
            />
            <div className="controls">
                <CrystalDisplay
                    crystals={[yellows, greens, blues, pinks]}
                    totalCrystals={position}
                />
                <button
                    onClick={() => {
                        const request: ActionRequest = {
                            type: 'Action',
                            action: {
                                type: 'PickUpMerchantCard',
                                merchantCardId: id,
                                crystalsDropped: crystalsDropped
                            } as PickUpMerchantCardAction
                        }
                        send!(request)
                        onClose()
                    }}
                    disabled={!canPick}
                >Acquire</button>
            </div>
        </div>
    )
}
