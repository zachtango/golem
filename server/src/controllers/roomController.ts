import { TemplatedApp, WebSocket } from "uWebSockets.js";
import { RoomService } from "../services/roomService";
import { ActionRequest, ChangeNameRequest, ChatRequest, ClientRequest, CreateRoomRequest, GameInfoResponse, JoinRoomRequest, PerSocketData, RemoveBotRequest, RoomInfoResponse, User, UserId } from '@shared/index'
import { UserService } from "../services/userService";
import { GameService } from "src/services/gameService";


export class RoomController {

    private app: TemplatedApp
    private userService: UserService
    private roomService: RoomService
    private gameService: GameService

    constructor(app: TemplatedApp, userService: UserService, roomService: RoomService, gameService: GameService) {
        this.app = app
        this.userService = userService
        this.roomService = roomService
        this.gameService = gameService
    }

    public handleWSOpen(ws: WebSocket<PerSocketData>) {
        const socketData = ws.getUserData()

        const userId = socketData.id

        try {
            const user = this.userService.getUser(userId)
            const room = this.roomService.getRoomByUser(userId)
            
            user.status = 'InRoom'
            socketData.roomId = room.id
            
            // Subscribe to room
            ws.subscribe(room.id)

            const response: RoomInfoResponse = {
                type: 'RoomInfo',
                room: {
                    id: room.id,
                    hostId: room.hostId as string,
                    users: room.userIds.map(id => this.userService.getUser(id)),
                    bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                    status: room.status,
                    chat: room.chat
                }
            }

            ws.send(JSON.stringify(response))

            // Send game to user
            if (room.status === 'InGame' && room.gameId) {
                const response: GameInfoResponse = {
                    type: 'GameInfo',
                    game: this.gameService.getGame(room.gameId)
                }
                ws.send(JSON.stringify(response))
            }
        } catch (err) {
            
        }
    }

    public handleWSMessage(ws: WebSocket<PerSocketData>, request: ClientRequest) {
        const socketData = ws.getUserData()

        const userId = socketData.id
        console.log(request)
        try {
            const user = this.userService.getUser(userId)

            switch (request.type) {
                case 'ChangeName':
                    this._handleChangeName(user)
                    break
                case 'CreateRoom':
                    this._handleCreateRoom(ws, request as CreateRoomRequest, socketData, user)
                    break
                case 'JoinRoom':
                    this._handleJoinRoom(ws, request as JoinRoomRequest, socketData, user)
                    break
                case 'StartGame':
                    this._handleStartGame(ws, socketData, user)
                    break
                case 'AddBot':
                    this._handleAddBot(socketData, user)
                    break
                case 'RemoveBot':
                    this._handleRemoveBot(request as RemoveBotRequest, socketData, user)
                    break
                case 'Action':
                    this._handleAction(ws, request as ActionRequest, socketData, user)
                    break
                case 'Chat':
                    this._handleChat(ws, request as ChatRequest, socketData, user)
                    break
            }
        } catch (err) {
            console.error(err)
        }
    }

    public handleWSClose(ws: WebSocket<PerSocketData>) {
        const socketData = ws.getUserData()

        const userId = socketData.id

        try {
            const room = this.roomService.getRoomByUser(userId)

            if (room.status === 'Waiting') {
                this.roomService.removeUser(room.id, userId)
            }

            if (room) {
                if (room.status === 'InGame' && room.gameId) {
                    const game = this.gameService.getGame(room.gameId)
                    if (game.players.every(player => player.isBot || this.userService.getUser(player.id).status === 'Offline')) {
                        this.gameService.removeGame(room.gameId)
                        this.roomService.removeRoom(room.id)
                        return
                    }
                }

                // Replace user with bot

                const response: RoomInfoResponse = {
                    type: 'RoomInfo',
                    room: {
                        id: room.id,
                        hostId: room.hostId as string,
                        users: room.userIds.map(id => this.userService.getUser(id)),
                        bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                        status: room.status,
                        chat: room.chat
                    }
                }

                // Broadcast to room that user left
                this.app.publish(room.id, JSON.stringify(response))
            }
            
        } catch (err) {
            
        }
    }

    private _handleChangeName(user: User) {
        if (user.status !== 'InRoom') {
            return
        }
        
        const room = this.roomService.getRoomByUser(user.id)

        const response: RoomInfoResponse = {
            type: 'RoomInfo',
            room: {
                id: room.id,
                hostId: room.hostId as string,
                users: room.userIds.map(id => this.userService.getUser(id)),
                bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                status: room.status,
                chat: room.chat
            }
        }

        this.app.publish(room.id, JSON.stringify(response))

    }

    private _handleCreateRoom(ws: WebSocket<PerSocketData>, request: CreateRoomRequest, socketData: PerSocketData, user: User) {
        if (user.status !== 'Online') {
            throw new Error(`Can't create room: user ${user.id} has a status of ${user.status}`)
        }

        const room = this.roomService.createRoom()

        this.roomService.addUser(room.id, user.id)

        socketData.roomId = room.id

        const response: RoomInfoResponse = {
            type: 'RoomInfo',
            room: {
                id: room.id,
                hostId: room.hostId as string,
                users: room.userIds.map(id => this.userService.getUser(id)),
                bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                status: room.status,
                chat: room.chat
            }
        }

        ws.subscribe(room.id)

        // Send room back through ws
        ws.send(JSON.stringify(response))

    }

    private _handleJoinRoom(ws: WebSocket<PerSocketData>, request: JoinRoomRequest, socketData: PerSocketData, user: User) {
        if (user.status !== 'Online') {
            throw new Error(`Can't join room: user ${user.id} has a status of ${user.status}`)
        }

        const room = this.roomService.getRoom(request.roomId)
        
        this.roomService.addUser(request.roomId, user.id)

        socketData.roomId = room.id

        const response: RoomInfoResponse = {
            type: 'RoomInfo',
            room: {
                id: room.id,
                hostId: room.hostId as string,
                users: room.userIds.map(id => this.userService.getUser(id)),
                bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                status: room.status,
                chat: room.chat
            }
        }

        ws.subscribe(room.id)

        // Broadcast changes to room
        this.app.publish(room.id, JSON.stringify(response))
    }

    private _handleStartGame(ws: WebSocket<PerSocketData>, socketData: PerSocketData, user: User) {
        if (user.status !== 'InRoom') {
            throw new Error(`Can't start game: user ${user.id} has a status of ${user.status}`)
        }

        if (!socketData.roomId) {
            throw new Error(`Can't start game: socket room id is null`)
        }

        const room = this.roomService.getRoom(socketData.roomId)

        if (room.hostId !== user.id) {
            throw new Error(`Can't start game: user ${user.id} is not host of room`)
        }

        if (room.status !== 'Waiting') {
            throw new Error(`Can't start game: room ${room.id} has a status of ${room.status}`)
        }

        const game = this.gameService.createGame(room.id, room.userIds, room.botIds)

        room.status = 'InGame'
        room.gameId = game.id

        const response: GameInfoResponse = {
            type: 'GameInfo',
            game: game
        }

        // Broadcast game to room
        this.app.publish(room.id, JSON.stringify(response))
    }

    private _handleAddBot(socketData: PerSocketData, user: User) {
        if (user.status !== 'InRoom') {
            throw new Error(`Can't handle add bot: user ${user.id} has a status of ${user.status}`)
        }

        if (!socketData.roomId) {
            throw new Error(`Can't handle add bot: socket room id is null`)
        }

        this.roomService.addBot(socketData.roomId)

        const room = this.roomService.getRoom(socketData.roomId)

        const response: RoomInfoResponse = {
            type: 'RoomInfo',
            room: {
                id: room.id,
                hostId: room.hostId as string,
                users: room.userIds.map(id => this.userService.getUser(id)),
                bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                status: room.status,
                chat: room.chat
            }
        }

        this.app.publish(room.id, JSON.stringify(response))
    }

    private _handleRemoveBot(request: RemoveBotRequest, socketData: PerSocketData, user: User) {
        if (user.status !== 'InRoom') {
            throw new Error(`Can't handle remove bot: user ${user.id} has a status of ${user.status}`)
        }

        if (!socketData.roomId) {
            throw new Error(`Can't handle remove bot: socket room id is null`)
        }

        this.roomService.removeBot(socketData.roomId, request.botId)

        const room = this.roomService.getRoom(socketData.roomId)

        const response: RoomInfoResponse = {
            type: 'RoomInfo',
            room: {
                id: room.id,
                hostId: room.hostId as string,
                users: room.userIds.map(id => this.userService.getUser(id)),
                bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                status: room.status,
                chat: room.chat
            }
        }
        
        this.app.publish(room.id, JSON.stringify(response))
    }

    private _handleAction(ws: WebSocket<PerSocketData>, request: ActionRequest, socketData: PerSocketData, user: User) {
        if (user.status !== 'InRoom') {
            throw new Error(`Can't handle action: user ${user.id} has a status of ${user.status}`)
        }

        if (!socketData.roomId) {
            throw new Error(`Can't handle action: socket room id is null`)
        }

        const room = this.roomService.getRoom(socketData.roomId)

        if (room.status !== 'InGame') {
            throw new Error(`Can't handle action: room ${room.id} has a status of ${room.status}`)
        }

        if (!room.gameId) {
            throw new Error(`Can't handle action: room ${room.id} game id is null`)
        }

        const game = this.gameService.move(room.gameId, user.id, request.action)

        const response: GameInfoResponse = {
            type: 'GameInfo',
            game: game
        }

        // Broadcast new game state
        this.app.publish(room.id, JSON.stringify(response))

        // For now, remove the game and room
        if (game.isComplete) {
            this.gameService.removeGame(game.id)
            this.roomService.removeRoom(socketData.roomId)
        }
    }

    private _handleChat(ws: WebSocket<PerSocketData>, request: ChatRequest, socketData: PerSocketData, user: User ) {
        if (user.status !== 'InRoom') {
            throw new Error(`Can't handle chat: user ${user.id} has a status of ${user.status}`)
        }

        if (!socketData.roomId) {
            throw new Error(`Can't handle chat: socket room id is null`)
        }

        const room = this.roomService.getRoom(socketData.roomId)

        room.chat.push(`${user.name}: ${request.message}`)

        const response: RoomInfoResponse = {
            type: 'RoomInfo',
            room: {
                id: room.id,
                hostId: room.hostId as string,
                users: room.userIds.map(id => this.userService.getUser(id)),
                bots: room.botIds.map((id, i) => ({id, name: `bot${i}`, status: 'InRoom'})),
                status: room.status,
                chat: room.chat
            }
        }

        this.app.publish(room.id, JSON.stringify(response))
    }

}

