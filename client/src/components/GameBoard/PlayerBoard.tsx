import CopperToken from '../Tokens/CopperToken'
import CrystalCount from '../CrystalCount/CrystalCount'
import Card from '../Card/Card'
import SilverToken from '../Tokens/SilverToken'
import PickupCard from '../../assets/pickupcard.svg?react'
import PointCardCover from '../../assets/point-cards/point-card-cover.svg?react'
import MerchantCardCover from '../../assets/merchant-cards/merchant-card-cover.svg?react'
import './PlayerBoard.css'
import { ActionRequest, Crystals, MerchantCardId, PointCardId, RestAction } from '../../../../shared'
import { useWebSocket } from '../../contexts/WebSocketContext'
// import { restMove } from '../../utils/clientMessage'


type PlayerBoardProps = {
    isOwnPlayer: boolean,
    crystals: Crystals,
    numCopperTokens: number,
    numSilverTokens: number,
    pointCardIds: PointCardId[],
    merchantCardIds: MerchantCardId[],
    usedMerchantCardIds: MerchantCardId[],
    onPlayerMerchantCardClick: (id: MerchantCardId) => void
}


export default function PlayerBoard({
    isOwnPlayer,
    crystals,
    numSilverTokens,
    numCopperTokens,
    pointCardIds,
    merchantCardIds,
    usedMerchantCardIds,
    onPlayerMerchantCardClick
} : PlayerBoardProps) {
    const {send} = useWebSocket()

    function onRest() {
        if (!isOwnPlayer || usedMerchantCardIds.length === 0) {
            return
        }
        const request: ActionRequest = {
            type: 'Action',
            action: {
                type: 'Rest'
            } as RestAction
        }
        send!(request)
    }

    return (
        <div className='player-board'>
            <div className='head'>
                <div className='sub-head'>
                    <CrystalCount crystals={crystals} />
                    <div className='tokens'>
                        <SilverToken
                            numTokens={numSilverTokens}
                        />
                        <CopperToken
                            numTokens={numCopperTokens}
                        />
                    </div>
                    <div className='point-cards'>
                        {pointCardIds.map((id) => (
                            isOwnPlayer ? (
                                <Card
                                    key={id}
                                    type='PointCard'
                                    id={id}
                                />
                            ) : (
                                <div
                                    className='card'
                                    key={id}
                                >
                                    <PointCardCover />
                                </div>
                            )
                        ))}
                    </div>
                </div>
                <div
                    className='rest-button'
                    style={{
                        opacity: isOwnPlayer && usedMerchantCardIds.length !== 0 ? 1 : 0.5
                    }}
                    onClick={onRest}
                >
                    <PickupCard />
                </div>
            </div>
            <div className='merchant-cards'>
                {merchantCardIds.map((id) => {
                    const used = usedMerchantCardIds.includes(id)

                    const card = isOwnPlayer || used ? (
                        <Card
                            key={id}
                            type='MerchantCard'
                            id={id}
                            used={used}
                            onClick={isOwnPlayer && !used ? (() => onPlayerMerchantCardClick(id)) : undefined}
                        />
                    ) : (
                        <div className='card' key={id}>
                            <MerchantCardCover />
                        </div>
                    )

                    return card
                })}
            </div>
        </div>
    )
}