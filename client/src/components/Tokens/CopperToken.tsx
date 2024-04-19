import Copper from '../../assets/coppertoken.svg?react'


export default function CopperToken({numTokens}: {numTokens: number}) {

    return (
        <div className='token'>
            <Copper />
            <div className='center'>{numTokens}</div>
        </div>
    )
}