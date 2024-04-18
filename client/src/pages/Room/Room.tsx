import './Room.css'
import { RiVipCrownFill } from "react-icons/ri";
import UserNameModal from '../../components/UserNameModal/UserNameModal'
import { useState } from 'react'
import { RemoveBotRequest, RoomInfo, UserId } from '../../../../shared';
import { useWebSocket } from '../../contexts/WebSocketContext';


type RoomProps = RoomInfo & {
    userId: UserId,
}

export default function Room({
    userId,
    id,
    hostId,
    users,
    bots,
    status,
    chat,
}: RoomProps) {
    const {send} = useWebSocket()
    const [showUserNameModal, setShowUserNameModal] = useState(false)

    const url = new URL(window.location.href)
    
    if (!url.searchParams.get('roomId')) {
        url.searchParams.append('roomId', id)
    }
    
    const canStartGame = users.length + bots.length > 1
    const canAddBot = users.length + bots.length < 5
    const canRemoveBot = bots.length > 0

    return (
        <div className='room-page page'>
            {showUserNameModal &&
                <UserNameModal originalUserName={users.find(user => userId === user.id)!.name} onClose={() => setShowUserNameModal(false)} />
            }
            <div className='room'>
                <div className='status'>
                    Invite your friends!
                </div>

                <div className='link'>
                    <input value={url.toString()} readOnly />
                    <button onClick={() => navigator.clipboard.writeText(url.toString())}>Copy</button>
                </div>

                {userId === hostId && (
                    <button
                        onClick={() => {
                            if (!canStartGame) {
                                alert('Need 2 - 5 players to start the game')
                                return
                            }
                            send!({type: 'StartGame'})
                        }}
                        className='start'
                    >Start Game</button>
                )}
                
                <div className='players'>
                    {users.map(user => (
                        <div 
                            key={user.id}
                            className='player'
                            onClick={() => {
                                if (userId !== user.id) {
                                    return
                                }
                                setShowUserNameModal(true)
                            }}
                        >
                            {id === hostId && <RiVipCrownFill />}
                            {user.name}{userId === user.id ? ' (You)' : ''}
                        </div>
                    ))}
                    {bots.map(bot => (
                        <div
                            key={bot.id}
                            className='player'
                        >
                            {bot.name}
                        </div>
                    ))}
                    <div className='buttons'>
                        <button
                            onClick={() => send!({type: 'AddBot'})}
                            disabled={!canAddBot}
                        >
                            Add Bot
                        </button>
                        <button
                            onClick={() => send!({type: 'RemoveBot', botId: bots[bots.length - 1].id} as RemoveBotRequest)}
                            disabled={!canRemoveBot}
                        >
                            Remove Bot
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
