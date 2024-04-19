import Silver from '../../assets/silvertoken.svg?react'


export default function SilverToken({numTokens}: {numTokens: number}) {


    return (
        <div className="token">
            <Silver />
            <div className='center'>{numTokens}</div>
        </div>
    )
}