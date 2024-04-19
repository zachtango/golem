import './Timer.css'


export default function Timer({userName} : {
    userName: string,
    
}) {
    // const [seconds, setSeconds] = useState(startingSeconds)

    // useEffect(() => {
    //     const end = new Date()
    //     end.setSeconds(end.getSeconds() + startingSeconds)

    //     const timer = setInterval(() => {
    //         const seconds = (Date.parse(end) - Date.parse(new Date())) / 1000
    //         if (seconds >= 0) {
    //             setSeconds(seconds)
    //         } else {
    //             clearInterval(timer)
    //         }
    //     }, 1000)

    //     return () => clearInterval(timer)
    // }, []);
    
    // const minutesLeft = Math.floor(seconds / 60)
    // const secondsLeft = seconds % 60

    return (
        <div className='timer'>
            <div className='name'>
                {userName} turn...
            </div>
            {/* <div className='time'>
                {minutesLeft}:{`${secondsLeft < 10 ? '0' : ''}${secondsLeft}`}
            </div> */}
        </div>
    )
}