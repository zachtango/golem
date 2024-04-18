import { useState } from 'react'
import './ChatLog.css'
import { useWebSocket } from '../../contexts/WebSocketContext'
import { ChatRequest } from '../../../../shared'


export default function ChatLog({
    chat
} : {
    chat: string[]
}) {
    const {send} = useWebSocket()
    const [message, setMessage] = useState('')

    return (
        <div className='chat-log'>
            <div className='content'>
                {chat.slice().reverse().map((message, i) => (
                    <div
                        key={i}
                        className={`${i % 2 ? 'odd' : 'even'}`}
                    >
                        {message}
                    </div>
                ))}
            </div>
            <input
                placeholder='Type your message...'
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter') {
                        const trimmedMessage = message.trim()

                        if (trimmedMessage.length === 0) {
                            return
                        }
                        const request: ChatRequest = {
                            type: 'Chat',
                            message: message
                        }
                        send!(request)
                        setMessage('')
                    }
                }}
            />
        </div>
    )
}