import { useState } from 'react'
import './Chat.css'
import { playerChat } from '../../clientMessage'


export default function Chat({chat}) {
    const [message, setMessage] = useState('')

    return (
        <div className='chat'>
            <div className='content'>
                {chat.slice().reverse().map(([type, message], i) => (
                    <div
                        key={i}
                        className={`message ${type} ${i % 2 ? 'odd' : 'even'}`}
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

                        playerChat(trimmedMessage)
                        setMessage('')
                    }
                }}
            />
        </div>
    )
}