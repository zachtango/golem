import './ProgressBar.css'


export default function ProgressBar({complete, total}: {
    complete: number,
    total: number
}) {

    return (
        <div
            className='progress-bar'
        >
            <div
                className='progress'
                style={{
                    width: `calc(${complete} * 100% / ${total})`
                }}
            />
        </div>
    )

}