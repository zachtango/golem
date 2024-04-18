import names from '../config/names.json'


export class NameService {
    private names: string[]

    constructor() {
        this.names = names
    }

    /**
     * Gets random name
     * @returns Returns name
     */
    public getName(): string {
        const index = Math.floor(Math.random() * this.names.length)

        return this.names[index]
    }

}