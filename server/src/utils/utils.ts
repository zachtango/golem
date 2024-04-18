


/**
 * Randomize array in-place using Durstenfeld shuffle algorithm
 * @returns Returns shuffled array
 */
export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array
}

/**
 * Creates a rpomise that resolves after delay ms
 * @returns Returns a promise that resolves after delay ms
 */
export function sleep(delay: number) {
    return new Promise((resolve) => setTimeout(resolve, delay))
}