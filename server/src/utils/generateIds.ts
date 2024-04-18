import fs from 'fs'
import { shuffleArray } from './utils'

const lower = 'abcdefghijklmnopqrstuvwxyz'
const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const digits = '0123456789'
const alphabet = lower + upper + digits

/**
 * Generates all alphabet.length^idLength ids possible
 * @returns Returns nothing
 */
function generateIds(fileName: string, idLength: number) {
    const stream = fs.createWriteStream(fileName, {flags: 'a'})
    const ids: string[] = []

    function generateId(id: string, idLength: number) {
        if (id.length === idLength) {
            ids.push(id)
            return
        }

        for (let i = 0; i < alphabet.length; i++) {
            generateId(id + alphabet[i], idLength)
        }
    }

    generateId('', idLength)
    shuffleArray(ids)

    ids.forEach(id => {
        stream.write(id + '\n')
    })
}
