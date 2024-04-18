import { Room, RoomId, UserId, UserStatus } from '@shared/index'
import { UserService } from "./userService";
import { IDService } from './idService';


export class RoomService {
    private idService: IDService
    private userService: UserService
    private rooms: Map<RoomId, Room>

    constructor(idService: IDService, userService: UserService) {
        this.idService = idService
        this.userService = userService
        this.rooms = new Map()
    }

    /**
     * Creates a room if doesn't exist
     * @returns Returns created room, otherwise nothing
    */
    public createRoom(): Room {
        const roomId = this.idService.getRoomId()

        if (this.rooms.has(roomId)) {
            throw new Error(`Room ${roomId} already exists`)
        }
        
        const room: Room = {
            id: roomId,
            hostId: null,
            userIds: [],
            botIds: [],
            status: 'Waiting',
            gameId: null,
            chat: []
        }

        this.rooms.set(roomId, room)

        // console.log(`Room ${roomId} created`, room)

        return room
    }

    /**
     * Removes a room given a roomId
     * @returns Returns true if room was removed
     */
    public removeRoom(roomId: RoomId): boolean {
        return this.rooms.delete(roomId)
    }

    /**
     * Gets a room given a roomId
     * @returns Returns room if found, otherwise nothing
     */
    public getRoom(roomId: RoomId): Room {
        const room = this.rooms.get(roomId)

        if (!room) {
            throw new Error(`Can't get room: room ${roomId} doesn't exist`)
        }

        return room
    }

    /**
     * Gets a room that user is in
     * @returns Returns room if found, otherwise nothing
     */
    public getRoomByUser(userId: UserId): Room {

        // FIXME: this is very inefficient, not scalable

        for (const [_, room] of this.rooms) {
            if (room.userIds.includes(userId)) {
                return room
            }
        }

        throw new Error(`Can't get room: no room has user ${userId}`)
    }

    /**
     * Adds a user to a room given a roomId
     * @returns Returns nothing
     */
    public addUser(roomId: RoomId, userId: UserId) {
        const user = this.userService.getUser(userId)
        const room = this.getRoom(roomId)

        if (room.status !== 'Waiting') {
            throw new Error(`Can't add user ${userId}: room ${roomId} has a status of ${room.status}`)
        }

        if (room.userIds.length + room.botIds.length >= 5) {
            throw new Error(`Can't add user ${userId}: room ${roomId} is full`)
        }
    
        if (room.userIds.length === 0) {
            room.hostId = userId
        }
        
        room.userIds.push(user.id)

        user.status = 'InRoom'

        // console.log(`User ${userId} added to room ${roomId}`)
    }

    /**
     * Removes a user from a room given a roomId
     * @returns Returns nothing
     */
    public removeUser(roomId: RoomId, userId: UserId) {
        const user = this.userService.getUser(userId)
        const room = this.getRoom(roomId)

        const index = room.userIds.indexOf(room.userIds.find(id => id === userId) || '')
        
        if (index === -1) {
            throw new Error(`Can't remove user: room ${roomId} does not have user ${userId}`)
        }
        
        room.userIds.splice(index, 1)

        // console.log(`User ${userId} removed from room ${roomId}`, room)

        // For now, remove the room if the room becomes empty; however, we will want to change this later
        if (room.userIds.length === 0) {
            this.rooms.delete(room.id)
            this.idService.addRoomId(room.id)
        }

        if (room.hostId === userId) {
            room.hostId = room.userIds[0]
        }

        if (user.status === 'InRoom') {
            user.status = 'Online'
        }
    }

    /**
     * Adds a bot to a room given a roomId
     * @returns Returns nothing
     */
    public addBot(roomId: RoomId) {
        const room = this.getRoom(roomId)

        if (room.status !== 'Waiting') {
            throw new Error(`Can't add bot: room ${roomId} has a status of ${room.status}`)
        }

        if (room.userIds.length + room.botIds.length >= 5) {
            throw new Error(`Can't add bot: room ${roomId} is full`)
        }

        room.botIds.push(this.idService.getUserId())
    }

    /**
     * Removes a bot from a room given a roomId
     * @returns Returns nothing
     */
    public removeBot(roomId: RoomId, botId: UserId) {
        const room = this.getRoom(roomId)

        const index = room.botIds.indexOf(room.botIds.find(id => id === botId) || '')
        
        if (index === -1) {
            throw new Error(`Can't remove bot: room ${roomId} does not have bot ${botId}`)
        }
        
        room.botIds.splice(index, 1)
    }

    /**
     * Prints a room given a roomId
     * @returns Returns nothing
     */
    public printRoom(roomId: RoomId) {
        console.log(`Room ${roomId}`, this.getRoom(roomId))
    }

    /**
     * Prints all rooms
     * @returns Returns nothing
     */
    public printRooms() {
        console.log('Print rooms...')
        this.rooms.forEach((_, roomId) => {
            this.printRoom(roomId)
        })
    }

}