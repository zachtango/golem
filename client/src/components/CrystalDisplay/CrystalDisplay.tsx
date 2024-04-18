import YellowCrystal from '../../assets/crystals/yellowcrystal.svg?react'
import GreenCrystal from '../../assets/crystals/greencrystal.svg?react'
import BlueCrystal from '../../assets/crystals/bluecrystal.svg?react'
import PinkCrystal from '../../assets/crystals/pinkcrystal.svg?react'
import './CrystalDisplay.css'
import { Crystals } from '../../../../shared'


export default function CrystalDisplay({crystals, totalCrystals} : {
    crystals: Crystals,
    totalCrystals?: number
}) {

    const crystalsLeft = totalCrystals ? [...Array(Math.max(0, totalCrystals - crystals.reduce((prev, curr) => prev + curr))).keys()].map(() => (
        <YellowCrystal style={{opacity: '40%'}} />
    )) : []

    const yellows = [...Array(crystals[0]).keys()].map(() => (
        <YellowCrystal />
    ))
    const greens = [...Array(crystals[1]).keys()].map(() => (
        <GreenCrystal />
    ))
    const blues = [...Array(crystals[2]).keys()].map(() => (
        <BlueCrystal />
    ))
    const pinks = [...Array(crystals[3]).keys()].map(() => (
        <PinkCrystal />
    ))

    return (
        <div className='crystal-display'>
            {...crystalsLeft}
            {...yellows}
            {...greens}
            {...blues}
            {...pinks}
        </div>
    )
}
