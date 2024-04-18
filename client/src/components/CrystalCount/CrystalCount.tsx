
import YellowCrystal from '../../assets/crystals/yellowcrystal.svg?react'
import GreenCrystal from '../../assets/crystals/greencrystal.svg?react'
import BlueCrystal from '../../assets/crystals/bluecrystal.svg?react'
import PinkCrystal from '../../assets/crystals/pinkcrystal.svg?react'
import './CrystalCount.css'
import { Crystals } from '../../../../shared'


export default function CrystalCount({
    crystals,
    onCrystalClick = () => {}
} : {
    crystals: Crystals,
    onCrystalClick?: (crystal: number) => void
}) {

    return (
        <div className='crystal-count'>
            <div
                className='crystal'
                onClick={() => onCrystalClick(0)}
                style={{
                    opacity: crystals[0] > 0 ? 1 : 0.6
                }}
            >
                <YellowCrystal />
                <div className='center'>{crystals[0]}</div>
            </div>
            <div
                className='crystal'
                onClick={() => onCrystalClick(1)}
                style={{
                    opacity: crystals[1] > 0 ? 1 : 0.6
                }}
            >
                <GreenCrystal />
                <div className='center'>{crystals[1]}</div>
            </div>
            <div
                className='crystal'
                onClick={() => onCrystalClick(2)}
                style={{
                    opacity: crystals[2] > 0 ? 1 : 0.6
                }}
            >
                <BlueCrystal />
                <div className='center'>{crystals[2]}</div>
            </div>
            <div
                className='crystal'
                onClick={() => onCrystalClick(3)}
                style={{
                    opacity: crystals[3] > 0 ? 1 : 0.6
                }}
            >
                <PinkCrystal />
                <div className='center'>{crystals[3]}</div>
            </div>
        </div>
    )
}