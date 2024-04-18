import { User, UserId, UserStatus } from '@shared/index'
import { IDService } from './idService'
import { NameService } from './nameService'

export class UserService {
    private idService: IDService
    private nameService: NameService
    private users: Map<UserId, User>

    constructor(idService: IDService) {
        this.idService = idService
        this.nameService = new NameService()
        this.users = new Map()
    }

    public createUser(): User {
        /**
         * Creates a user
         * @returns Returns created user
         */

        const userId = this.idService.getUserId()
        const userName = this.nameService.getName()

        const user: User = {
            id: userId,
            name: userName,
            status: 'Offline'
        }

        this.users.set(userId, user)

        // console.log(`User ${userId} created`, user)

        return user
    }

    public getUser(userId: UserId): User {
        /**
         * Gets a user given a userId
         * Throws an error if user is not found
         * @returns Returns user
         */

        const user = this.users.get(userId)

        if (!user) {
            throw new Error(`User ${userId} not found`)
        }
        
        return user
    }

    public printUser(userId: UserId) {
        /**
         * Prints a user given a userId
         * @returns Returns nothing
         */
        
        console.log(`User ${userId}`, this.getUser(userId))
    }

    public printUsers() {
        /**
         * Prints all users
         * @returns Returns nothing
         */

        console.log('Print users...')
        this.users.forEach((_, userId) => {
            this.printUser(userId)
        })
    }

}