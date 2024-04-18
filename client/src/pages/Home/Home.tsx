
import Logo from '../../assets/logo.svg?react'
import { FaDiscord } from "react-icons/fa";
import { useState } from 'react';
import UserNameModal from '../../components/UserNameModal/UserNameModal'
import './Home.css'
import { useWebSocket } from '../../contexts/WebSocketContext';


export default function Home({userName}: {userName: string}) {
    const {send} = useWebSocket()
    const [showUserNameModal, setShowUserNameModal] = useState(false)

    return (
        <div className='home-page page'>
            {showUserNameModal &&
                <UserNameModal originalUserName={userName} onClose={() => setShowUserNameModal(false)} />
            }
            <div className='logo'>
                <Logo />
            </div>
            <div className='play'>
                <div
                    className='user-name'
                    onClick={() => setShowUserNameModal(true)}
                >
                    Welcome {userName}!
                </div>
                <button onClick={() => send!({ type: 'CreateRoom' })}>Create lobby</button>
            </div>
            <div className="footer">
                <div>
                    v3
                </div>
                <a href='https://discord.gg/6zVgtFy2ZW'>
                    <FaDiscord />
                </a>
            </div>
        </div>
    )
}
