import uWS, { DEDICATED_COMPRESSOR_3KB } from 'uWebSockets.js'
import { ClientRequest, PerSocketData } from '@shared/index'
import { RoomController } from './controllers/roomController'
import { UserService } from './services/userService'
import { UserController } from './controllers/userController'
import { RoomService } from './services/roomService'
import { IDService } from './services/idService'
import { CardService } from './services/cardService'
import { GameService } from './services/gameService'

const app = uWS.App()

const idService = new IDService()
const userService = new UserService(idService)
const roomService = new RoomService(idService, userService)
const cardService = new CardService()
const gameService = new GameService(idService, userService, cardService)

const userController = new UserController(userService)
const roomController = new RoomController(app, userService, roomService, gameService)

process.on('SIGINT', () => { process.exit() })
process.on('exit', () => { idService.destruct() })

app.ws<PerSocketData>('/*', {

    /* There are many common helper features */
    idleTimeout: 32,
    maxBackpressure: 1024,
    maxPayloadLength: 512,
    compression: DEDICATED_COMPRESSOR_3KB,
    
    upgrade: (res, req, context) => {
        userController.handleWSUpgrade(res, req, context)
    },

    open: (ws) => {
        try {
            userController.handleWSOpen(ws)
            roomController.handleWSOpen(ws)
        } catch (err) {
            
        }
        
        // userService.printUsers()
        // roomService.printRooms()
    },

    message: (ws, message, isBinary) => {
        const decoder = new TextDecoder()
        let jsonMessage: ClientRequest;

        try {
            jsonMessage = JSON.parse(decoder.decode(message))
        } catch {
            console.error('Failed to parse JSON')
            return
        }
        
        userController.handleWSMessage(ws, jsonMessage)
        roomController.handleWSMessage(ws, jsonMessage)
        
        // userService.printUsers()
        // roomService.printRooms()
    },

    close: (ws, code, message) => {
        if (code === 4000) {
            return
        }
        
        userController.handleWSClose(ws)
        roomController.handleWSClose(ws)

        // userService.printUsers()
        // roomService.printRooms()
    }

})

const port = 9001
app.listen(port, (listenSocket) => {
    if (listenSocket) {
        console.log(`Listening on port ${port}`)
    }
})