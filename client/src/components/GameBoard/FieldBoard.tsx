import CopperToken from '../Tokens/CopperToken'
import CrystalDisplay from '../CrystalDisplay/CrystalDisplay'
import SilverToken from '../Tokens/SilverToken'
import Card from '../Card/Card'
import PointCardCover from '../../assets/point-cards/point-card-cover.svg?react'
import MerchantCardCover from '../../assets/merchant-cards/merchant-card-cover.svg?react'
import './FieldBoard.css'
import { Crystals, MerchantCardId, PointCardId } from '../../../../shared'


interface FieldBoardProps {
    activePointCardIds: PointCardId[],
    activeMerchantCardIds: MerchantCardId[],
    numCopperTokens: number,
    numSilverTokens: number,
    fieldCrystals: Crystals[],
    onActiveMerchantCardClick: (id: MerchantCardId) => void,
    onActivePointCardClick: (id: PointCardId) => void
}


export default function FieldBoard({
    activePointCardIds,
    activeMerchantCardIds,
    numSilverTokens,
    numCopperTokens,
    fieldCrystals,
    onActiveMerchantCardClick,
    onActivePointCardClick
} : FieldBoardProps) {

    return (
        <div className='field-board'>
            <div className='point-cards'>
                <div className='tokens'>
                    <SilverToken numTokens={numSilverTokens} />
                    {numCopperTokens > 0 && <CopperToken numTokens={numCopperTokens} />}
                </div>
                <div className='cards'>
                    <div className='card'>
                        <PointCardCover />
                    </div>
                    {activePointCardIds.map((id) => (
                        <Card
                            key={id}
                            type='PointCard'
                            id={id}
                            onClick={() => onActivePointCardClick(id)}
                        />
                    ))}
                </div>
            </div>
            <div className='merchant-cards'>
                <div className='cards'>
                    <div className='card'>
                        <MerchantCardCover />
                    </div>
                    {activeMerchantCardIds.map((id) => (
                        <Card
                            key={id}
                            type='MerchantCard'
                            id={id}
                            onClick={() => onActiveMerchantCardClick(id)}
                        />
                    ))}
                </div>
                <div className='crystals'>
                    {fieldCrystals.map((crystals, i) => (
                        <CrystalDisplay
                            key={i}
                            crystals={crystals}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}