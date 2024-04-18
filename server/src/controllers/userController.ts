import { HttpRequest, HttpResponse, WebSocket, us_socket_context_t } from "uWebSockets.js"
import { RoomService } from "../services/roomService"
import { ChangeNameRequest, ClientRequest, PerSocketData, RoomInfoResponse, User, UserInfoResponse } from '@shared/index'
import { UserService } from "../services/userService"


export class UserController {

    private userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }

    public handleWSUpgrade(res: HttpResponse, req: HttpRequest, context: us_socket_context_t) {
        const userId = req.getQuery('userId')
        
        let user

        try {
            user = userId ? this.userService.getUser(userId) : this.userService.createUser()
        } catch (err) {
            user = this.userService.createUser()
        }

        res.upgrade<PerSocketData>(
            {
                id: user.id,
                roomId: null
            },
            req.getHeader("sec-websocket-key"),
            req.getHeader("sec-websocket-protocol"),
            req.getHeader("sec-websocket-extensions"),
            context
        )
    }

    public handleWSMessage(ws: WebSocket<PerSocketData>, request: ClientRequest) {
        const socketData = ws.getUserData()

        const userId = socketData.id
        const user = this.userService.getUser(userId)
        
        switch (request.type) {
            case 'ChangeName':
                this._handleChangeName(ws, request as ChangeNameRequest, user)
                break
        }

    }

    public handleWSOpen(ws: WebSocket<PerSocketData>) {
        const socketData = ws.getUserData()
        
        const userId = socketData.id

        const user = this.userService.getUser(userId)

        // Only 1 websocket connection allowed per user
        if (user.status !== 'Offline') {
            ws.end(4000, 'UserConnectionAlreadyExists')
            throw new Error('UserConnectionAlreadyExists')
        }

        const response: UserInfoResponse = {
            type: 'UserInfo',
            user: user
        }

        user.status = 'Online'

        // Send user data through websocket
        ws.send(JSON.stringify(response))

    }

    public handleWSClose(ws: WebSocket<PerSocketData>) {
        const socketData = ws.getUserData()

        const userId = socketData.id

        try {
            const user = this.userService.getUser(userId)
            user.status = 'Offline'
        } catch (err) {
            console.error(err)
        }

    }

    private _handleChangeName(ws: WebSocket<PerSocketData>, request: ChangeNameRequest, user: User) {
        if (user.status === 'Offline') {
            throw new Error(`Can't change name: user ${user.id} has a status of ${user.status}`)
        }
        
        user.name = request.name

        const response: UserInfoResponse = {
            type: 'UserInfo',
            user: user
        }

        ws.send(JSON.stringify(response))
    }

}

