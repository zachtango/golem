import CopperToken from '../Tokens/CopperToken'
import SilverToken from '../Tokens/SilverToken'
import CrystalCount from '../CrystalCount/CrystalCount'
import './PlayerRow.css'
import { Player } from '../../../../shared'


export default function PlayerRow({
    selected=false,
    // id,
    name,
    // turn,
    crystals,
    // merchantCardIds,
    // usedMerchantCardIds,
    pointCardIds,
    numCopperTokens,
    numSilverTokens,
    onClick
} : Player & {
    selected: boolean,
    onClick: () => void
}) {
    return (
        <div
            className={'player-row'}
            onClick={onClick}
            style={{
                backgroundColor: selected ? 'rgb(120, 120, 255, 0.5)' : ''
            }}
        >
            <div className='head'>
                <div className='name'>{name}</div>
                <div className='desc'>{pointCardIds.length} golems</div>
            </div>
            <CrystalCount crystals={crystals} />
            <div className='tokens'>
                <SilverToken numTokens={numSilverTokens} />
                <CopperToken numTokens={numCopperTokens} />
            </div>
        </div>
    )
}