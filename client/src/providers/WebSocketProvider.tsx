import { useEffect, useRef, useState } from "react"
import { WebSocketsContext } from "../contexts/WebSocketContext"
import { ClientRequest, GameInfo, GameInfoResponse, JoinRoomRequest, RoomInfo, RoomInfoResponse, ServerResponse, UserInfo, UserInfoResponse } from "../../../shared"


export default function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<number | undefined>()
    const [user, setUser] = useState<UserInfo | undefined>()
    const [room, setRoom] = useState<RoomInfo | undefined>()
    const [game, setGame] = useState<GameInfo | undefined>()

    const ws = useRef<WebSocket | null>(null)

    function handleServerResponse(response: ServerResponse) {
        switch (response.type) {
          case 'UserInfo':
            const user = (response as UserInfoResponse).user
            localStorage.setItem('userId', user.id)
            setUser(user)
            break
          case 'RoomInfo':
            const room = (response as RoomInfoResponse).room
            setRoom(room)
            break
          case 'GameInfo':
            const game = (response as GameInfoResponse).game
            setGame(game)
            break
        }
      }

    useEffect(() => {
        const userId = localStorage.getItem('userId')
        const url = userId ? `wss://golem.lol/socket/?userId=${userId}` : `wss://golem.lol/socket/`

        const socket = new WebSocket(url)

        socket.onopen = () => {
            const url = new URL(window.location.href)
            const roomId = url.searchParams.get('roomId')

            if (roomId) {
                const request: JoinRoomRequest = {
                    type: 'JoinRoom',
                    roomId: roomId
                }
                socket.send(JSON.stringify(request))
            }
            setStatus(socket.readyState)
        }

        socket.onclose = (e) => {
            if (e.reason) {
                alert(e.reason)
            } else {
                alert('Server connection closed, please refresh')
            }
            setStatus(socket.readyState)
        }

        socket.onmessage = (e) => {
            handleServerResponse(JSON.parse(e.data))
            setStatus(socket.readyState)
        }

        ws.current = socket

        return () => {
            socket.close()
        }

    }, [])

    function send(request: ClientRequest) {
        if (!ws.current || status !== WebSocket.OPEN) {
            alert('Could not connect to server, please refresh')
        } else {
            ws.current!.send(JSON.stringify(request))
        }
    }

    return (
        <WebSocketsContext.Provider value={{
            status,
            user,
            room,
            game,
            send
        }}>
            {children}
        </WebSocketsContext.Provider>
    )
}
