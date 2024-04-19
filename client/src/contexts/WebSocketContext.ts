
import { createContext, useContext } from 'react'
import { ClientRequest, GameInfo, RoomInfo, UserInfo } from '../../../shared'

export interface WebSocketsContextType {
    status?: number,
    user?: UserInfo,
    room ?: RoomInfo,
    game?: GameInfo,
    send?: ((request: ClientRequest) => void)
}

export const WebSocketsContext = createContext<WebSocketsContextType>({})

export const useWebSocket = () => useContext(WebSocketsContext)
