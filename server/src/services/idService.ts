import { GameId, RoomId, UserId } from "@shared/index";
import fs from 'fs'
import cp from 'child_process'
import util from 'util'

const NUM_USER_IDS_IN_MEMORY = 100
const NUM_ROOM_IDS_IN_MEMORY = 100

const userIdFileName = 'src/config/userIds.txt'
const roomIdFileName = 'src/config/roomIds.txt'

export class IDService {
    private roomIdWriteStream: fs.WriteStream

    private userIds: UserId[]
    private roomIds: RoomId[]

    constructor() {
        this.roomIdWriteStream = fs.createWriteStream(roomIdFileName, {flags: 'a'})

        this.userIds = this._removeLastNLines(userIdFileName, 1)
        this.roomIds = this._removeLastNLines(roomIdFileName, 1)
    }

    /**
     * Gets next unique userId
     * @returns Returns unique userId
     */
    public getUserId(): UserId {
        const userId = this.userIds[this.userIds.length - 1]
        this.userIds.pop()

        this._repopulate(this.userIds, 1, NUM_USER_IDS_IN_MEMORY, userIdFileName)

        return userId
    }

    /**
     * Gets next unique roomId
     * @returns Returns unique roomId
     */
    public getRoomId(): RoomId {
        const roomId = this.roomIds[this.roomIds.length - 1]
        this.roomIds.pop()

        this._repopulate(this.roomIds, 1, NUM_ROOM_IDS_IN_MEMORY, roomIdFileName)

        return roomId
    }

    /**
     * Gets next unique gameId
     * @returns Returns unique gameId
     */
    public getGameId(): GameId {

        return 'gameId'
    }

    /**
     * Adds roomId back to unused roomIds
     * @returns Returns nothing
     */
    public addRoomId(roomId: RoomId) {

        this.roomIds.push(roomId)
    }

    /**
     * Perform cleanup
     * Add unused userIds in memory back to file
     * Add unused roomIds in memory back to file
     * Close roomId write stream
     * @returns Returns nothing
     */
    public destruct() {
        if (this.userIds.length > 0) {
            fs.appendFileSync(userIdFileName, this.userIds.join('\n') + '\n')
        }

        if (this.roomIds.length > 0) {
            fs.appendFileSync(roomIdFileName, this.roomIds.join('\n') + '\n')
        }

        this.roomIdWriteStream.close()
    }

    /**
     * Fills the array if its under minSize with maxSize - array.length lines from file fileName
     * @returns Returns nothing
     */
    private _repopulate(array: string[], minSize: number, maxSize: number, fileName: string) {
        if (array.length < minSize) {
            const lines = this._removeLastNLines(fileName, maxSize - array.length)
            lines.forEach(line => array.push(line))
        }
    }

    /**
     * Adds a user to a room given a roomId
     * @returns Returns lines removed
     */
    private _removeLastNLines(fileName: string, n: number) {
        const stdout = cp.execSync(util.format('tail -n %d %s', n, fileName))
                        .toString()

        const fileStats = fs.statSync(fileName)
        fs.truncateSync(fileName, fileStats.size - stdout.length)

        const lines = stdout.split('\n')

        if (lines[lines.length - 1].length === 0) {
            lines.pop()
        }

        return lines
    }
}

// Testing cleanup
// const idService = new IDService()

// const userId = idService.getUserId()
// const roomId = idService.getRoomId()

// idService.addRoomId(roomId)
// console.log(userId, roomId)

// function test() {
//     setInterval(() => {

//     }, 1000)
// }
// process.on('SIGINT', () => {
//     console.log('SIGINT')
//     process.exit()
// })

// process.on('exit', () => {
//     idService.destruct()
// })

// test()