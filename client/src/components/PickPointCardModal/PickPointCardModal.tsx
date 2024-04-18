import { IoMdClose } from "react-icons/io";
import Card from "../Card/Card";
import pointCards from '../../../../shared/PointCards.json'
import { ActionRequest, BuyPointCardAction, Crystals, PointCardId } from "../../../../shared";
import { useWebSocket } from "../../contexts/WebSocketContext";


export default function PickPointCardModal({
    id,
    crystals,
    onClose
} : {
    id: PointCardId,
    crystals: Crystals,
    onClose: () => void
}) {
    const {send} = useWebSocket()
    const pointCard = pointCards[id]
    const canClaim = crystals.every((crystal, i) => crystal >= pointCard.crystals[i])

    function onClaim() {
        const request: ActionRequest = {
            type: 'Action',
            action: {
                type: 'BuyPointCard',
                pointCardId: id
            } as BuyPointCardAction
        }
        send!(request)
        onClose()
    }

    return (
        <div className="pick-merchant-card-modal modal center">
            <div className="exit" onClick={onClose}>
                <IoMdClose />
            </div>
            <Card
                type='PointCard'
                id={id}
            />
            <div className="controls">
                <button
                    disabled={!canClaim}
                    onClick={onClaim}
                >Buy</button>
            </div>
        </div>
    )
}
