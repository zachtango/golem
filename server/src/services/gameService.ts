import { Action, BuyPointCardAction, CrystalMerchantCard, CrystalMerchantCardAction, CrystalType, Crystals, Game, GameId, MerchantCardId, PickUpMerchantCardAction, PlayMerchantCardAction, Player, PointCard, PointCardId, RemoveCrystalOverflowAction, RestAction, RoomId, TradeMerchantCard, TradeMerchantCardAction, UpgradeMerchantCard, UpgradeMerchantCardAction, User, UserId, UserStatus } from '@shared/index'
import { IDService } from './idService'
import { shuffleArray } from '../utils/utils'
import { UserService } from './userService'
import { CardService } from './cardService'

const POINT_CARD_IDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34]
const MERCHANT_CARD_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43]

const NUM_ACTIVE_POINT_CARDS = 5
const NUM_ACTIVE_MERCHANT_CARDS = 6
const MAX_NUM_CRYSTALS = 10

export class GameService {
    private games: Map<GameId, Game>
    
    private idService: IDService
    private userService: UserService
    private cardService: CardService

    constructor(idService: IDService, userService: UserService, cardService: CardService) {
        this.games = new Map()

        this.idService = idService
        this.userService = userService
        this.cardService = cardService
    }

    // FIXME: eventually generate own game ids from id service
    public createGame(roomId: RoomId, userIds: UserId[], botIds: UserId[]): Game {
        const gameId = roomId

        if (this.games.has(gameId)) {
            throw new Error(`Can't create game: game ${gameId} already exists`)
        }
        
        const numPlayers = userIds.length + botIds.length

        if (numPlayers < 2 || numPlayers > 5) {
            throw new Error(`Can't create game: number of players ${numPlayers} not in 2 - 5`)
        }

        const pointCardIds: number[] = shuffleArray([...POINT_CARD_IDS])
        const merchantCardIds: number[] = shuffleArray([...MERCHANT_CARD_IDS])

        const activePointCardIds = pointCardIds.splice(pointCardIds.length - NUM_ACTIVE_POINT_CARDS)
        const activeMerchantCardIds = merchantCardIds.splice(merchantCardIds.length - NUM_ACTIVE_MERCHANT_CARDS)

        const players: Player[] = []

        // FIXME: randomize turns
        userIds.forEach((id, i) => {
            const user = this.userService.getUser(id)

            players.push({
                id: user.id,
                isBot: false,
                name: user.name,
                turn: i,
                numCopperTokens: 0,
                numSilverTokens: 0,
                pointCardIds: [],
                merchantCardIds: [0, 1],
                usedMerchantCardIds: [],
                crystals: i === 0 ? [3, 0, 0, 0] : i < 3 ? [4, 0, 0, 0] : [3, 1, 0, 0]
            })
        })

        botIds.forEach((id, i) => {
            const turn = userIds.length + i
            players.push({
                id: id,
                isBot: true,
                name: `bot${i}`,
                turn: turn,
                numCopperTokens: 0,
                numSilverTokens: 0,
                pointCardIds: [],
                merchantCardIds: [0, 1],
                usedMerchantCardIds: [],
                crystals: turn === 0 ? [3, 0, 0, 0] : turn < 3 ? [4, 0, 0, 0] : [3, 1, 0, 0]
            })
        })

        const game: Game = {
            id: gameId,
            round: 0,
            turn: 0,
            maxGolems: numPlayers > 3 ? 5 : 6,
            isComplete: false,

            numCopperTokens: 2 * numPlayers,
            numSilverTokens: 2 * numPlayers,

            activePointCardIds: activePointCardIds,
            activeMerchantCardIds: activeMerchantCardIds,
            fieldCrystals: [],

            players: players,

            pointCardIds: pointCardIds,
            merchantCardIds: merchantCardIds,

            actions: []
        }

        this.games.set(gameId, game)

        while (this._botMove(game));

        return game
    }

    public getGame(gameId: GameId) {
        const game = this.games.get(gameId)

        if (!game) {
            throw new Error(`Can't get game: game ${gameId} does not exist`)
        }

        return game
    }

    public removeGame(gameId: GameId) {
        if (!this.games.has(gameId)) {
            throw new Error(`Can't remove game: game ${gameId} does not exist`)
        }

        this.games.delete(gameId)
    }

    public move(gameId: GameId, playerId: UserId, action: Action): Game {
        const game = this.games.get(gameId)

        if (!game) {
            throw new Error(`Can't action: game ${gameId} does not exist`)
        }

        // Player move
        this._action(game, playerId, action)

        // Bot move
        while (this._botMove(game));

        return game
    }

    private _getBotAction(game: Game, bot: Player): Action {
        if (bot.crystals.reduce((prev, curr) => prev + curr) > MAX_NUM_CRYSTALS) {
            const toCrystals = bot.crystals.slice()
            let numCrystals = toCrystals.reduce((prev, curr) => prev + curr)
            let crystalIndex = 0
            while (numCrystals > MAX_NUM_CRYSTALS) {
                if (toCrystals[crystalIndex] > 0) {
                    toCrystals[crystalIndex] -= 1
                    numCrystals -= 1
                } else {
                    crystalIndex += 1
                }
            }

            return {
                type: 'RemoveCrystalOverflow',
                toCrystals: toCrystals
            } as RemoveCrystalOverflowAction
        }

        // If can buy point card, buy point card
        let pointCardToBuy: PointCard | null = null
        for (const pointCardId of game.activePointCardIds) {
            const pointCard = this.cardService.getPointCard(pointCardId)
            if (bot.crystals.every((numCrystals, i) => numCrystals >= pointCard.crystals[i])) {
                pointCardToBuy = pointCardToBuy && pointCardToBuy.numPoints > pointCard.numPoints ? pointCardToBuy : pointCard
            }
        }

        if (pointCardToBuy) {
            return {
                type: 'BuyPointCard',
                pointCardId: pointCardToBuy.id
            } as BuyPointCardAction
        }

        const randomNumber = Math.random() * 100

        // 20% to pick up a merchant card
        if (randomNumber < 20 && game.activeMerchantCardIds.length > 0) {
            return {
                type: 'PickUpMerchantCard',
                merchantCardId: game.activeMerchantCardIds[0],
                crystalsDropped: []
            } as PickUpMerchantCardAction
        }

        // 80% to play a merchant card
        const actions: Action[] = []
        for (const merchantCardId of bot.merchantCardIds) {
            if (bot.usedMerchantCardIds.includes(merchantCardId)) {
                continue
            }
            const merchantCard = this.cardService.getMerchantCard(merchantCardId)

            switch (merchantCard.type) {
                case 'CrystalMerchantCard':
                    actions.push({
                        type: 'PlayMerchantCard',
                        playMerchantCardType: 'CrystalMerchantCard',
                        merchantCardId: merchantCard.id
                    } as CrystalMerchantCardAction)
                    break
                case 'TradeMerchantCard':
                    const fromCrystals = (merchantCard as TradeMerchantCard).fromCrystals
                    const maxNumTrades = Math.min(...bot.crystals.map((numCrystals, i) => {
                        if (fromCrystals[i] === 0) {
                            return Infinity
                        }
                        return Math.floor(numCrystals / fromCrystals[i])
                    }))

                    if (maxNumTrades > 0) {
                        actions.push({
                            type: 'PlayMerchantCard',
                            playMerchantCardType: 'TradeMerchantCard',
                            merchantCardId: merchantCardId,
                            numTrades: Math.max(1, Math.floor(Math.random() * maxNumTrades))
                        } as TradeMerchantCardAction)
                    }
                    break
                case 'UpgradeMerchantCard':
                    // FIXME: Learn how to upgrade smartly
                    break
            }
        }

        if (actions.length === 0) {
            return {
                type: 'Rest'
            } as RestAction
        }

        return actions[Math.floor(Math.random() * actions.length)]
    }
    
    /**
     * If it's a bot's turn, bot moves
     * @returns Returns true if a bot moves otherwise false
     */
    private _botMove(game: Game): boolean {
        const player = game.players.find(p => p.turn === game.turn) as Player

        if (!player.isBot) {
            return false
        }

        const action = this._getBotAction(game, player)
        this._action(game, player.id, action)

        return true
    }

    private _action(game: Game, playerId: UserId, action: Action) {
        const player = this._findPlayer(game, playerId)
        
        if (game.turn !== player.turn) {
            throw new Error(`Can't action: game turn ${game.turn} not player turn ${player.turn}`)
        }

        let numCrystals = player.crystals.reduce((prev, curr) => prev + curr)
        if (numCrystals > MAX_NUM_CRYSTALS &&
            action.type !== 'RemoveCrystalOverflow') {
            throw new Error(`Can't action: player ${player.id} must remove crystal overflow`)
        }

        switch (action.type) {
            case 'BuyPointCard':
                this._buyPointCardAction(game, player, action as BuyPointCardAction)
                break
            case 'PickUpMerchantCard':
                this._pickUpMerchantCardAction(game, player, action as PickUpMerchantCardAction)
                break
            case 'PlayMerchantCard':
                this._playMerchantCardAction(player, action as PlayMerchantCardAction)
                break
            case 'Rest':
                this._restAction(player)
                break
            case 'RemoveCrystalOverflow':
                this._removeCrystalOverflow(player, action as RemoveCrystalOverflowAction)
                break
        }

        numCrystals = player.crystals.reduce((prev, curr) => prev + curr)
        
        if (numCrystals <= MAX_NUM_CRYSTALS) {
            game.turn += 1
            
            if (game.turn === game.players.length) {
                game.round += 1
                game.turn = 0
            }

            if (game.turn === 0 &&
                game.maxGolems === Math.max(...game.players.map(p => p.pointCardIds.length))
            ) {
                game.isComplete = true
            }
        }

        game.actions.push({
            ...action,
            playerId: playerId
        })
    }

    private _buyPointCardAction(game: Game, player: Player, action: BuyPointCardAction) {
        const card = this.cardService.getPointCard(action.pointCardId)

        const pointCardIndex = game.activePointCardIds.indexOf(card.id)

        if (pointCardIndex < 0) {
            throw new Error(`Point card ${card.id} does not exist on board`)
        }

        if (!player.crystals.every((numCrystals, i) => numCrystals >= card.crystals[i])) {
            throw new Error(`Player ${player.id} does not have enough crystals ${player.crystals} to buy ${card.crystals}`)
        }
        
        if (pointCardIndex === 0) {
            if (game.numCopperTokens > 0) {
                player.numCopperTokens += 1
                game.numCopperTokens -= 1
            } else if (game.numSilverTokens > 0) {
                player.numSilverTokens += 1
                game.numSilverTokens -= 1
            }
        }

        game.activePointCardIds.splice(pointCardIndex, 1)
        if (game.pointCardIds.length > 0) {
            game.activePointCardIds.push(game.pointCardIds.pop() as PointCardId)
        }

        player.pointCardIds.push(action.pointCardId)
        
        for (let i = 0; i < 4; i++) {
            player.crystals[i] -= card.crystals[i]
        }

    }

    private _pickUpMerchantCardAction(game: Game, player: Player, action: PickUpMerchantCardAction) {

        const merchantCardIndex = game.activeMerchantCardIds.indexOf(action.merchantCardId)
        const fieldCrystalIndex = merchantCardIndex

        if (merchantCardIndex < 0) {
            throw new Error(`Merchant card ${action.merchantCardId} does not exist on board`)
        }

        const numCrystalsDropped = action.crystalsDropped.length
        const numCrystalsToDrop = merchantCardIndex

        if (numCrystalsDropped !== numCrystalsToDrop) {
            throw new Error(`Number of crystals to drop ${numCrystalsToDrop} does not equal number of crystals dropped ${numCrystalsDropped}`)
        }

        action.crystalsDropped.forEach((crystalType, i) => {
            if (i == game.fieldCrystals.length) {
                game.fieldCrystals.push([0, 0, 0, 0])
            }
            const crystalIndex = this._getCrystalIndex(crystalType)
            game.fieldCrystals[i][crystalIndex] += 1
            player.crystals[crystalIndex] -= 1
        })

        if (fieldCrystalIndex < game.fieldCrystals.length) {
            const crystalsPickedUp = game.fieldCrystals.splice(fieldCrystalIndex, 1)[0]
            for (let i = 0; i < 4; i++) {
                player.crystals[i] += crystalsPickedUp[i]
            }
        }

        game.activeMerchantCardIds.splice(merchantCardIndex, 1)
        if (game.merchantCardIds.length > 0) {
            game.activeMerchantCardIds.push(game.merchantCardIds.pop() as MerchantCardId)
        }

        player.merchantCardIds.push(action.merchantCardId)
        
    }

    private _crystalMerchantCardAction(player: Player, card: CrystalMerchantCard) {
        for (let i = 0; i < 4; i++) {
            player.crystals[i] += card.crystals[i]
        }
    }

    private _tradeMerchantCardAction(player: Player, action: TradeMerchantCardAction, card: TradeMerchantCard) {
        if (!player.crystals.every((numCrystals, i) => numCrystals >= action.numTrades * card.fromCrystals[i])) {
            throw new Error(`Player ${player.id} does not have enough crystals ${player.crystals} to trade ${action.numTrades} ${card.fromCrystals}`)
        }

        for (let i = 0; i < 4; i++) {
            player.crystals[i] -= action.numTrades * card.fromCrystals[i]
            player.crystals[i] += action.numTrades * card.toCrystals[i]
        }
    }

    private _upgradeMerchantCardAction(player: Player, action: UpgradeMerchantCardAction, card: UpgradeMerchantCard) {
        if (action.upgrades.length > card.numUpgrades) {
            throw new Error(`Too many upgrades ${action.upgrades} to play merchant card ${card.id}`)
        }

        const newCrystals = [...player.crystals] as Crystals
        
        action.upgrades.forEach(crystalType => {
            if (crystalType === 'Pink') {
                throw new Error(`Can't upgrade ${crystalType} crystal`)
            }

            const crystalIndex = this._getCrystalIndex(crystalType)
            if (newCrystals[crystalIndex] < 0) {
                throw new Error(`Player ${player.id} does not have ${crystalType} crystal to upgrade in upgrades ${action.upgrades}`)
            }
            newCrystals[crystalIndex] -= 1
            newCrystals[crystalIndex + 1] += 1
        })

        player.crystals = newCrystals
    }

    private _playMerchantCardAction(player: Player, action: PlayMerchantCardAction) {
        if (!player.merchantCardIds.includes(action.merchantCardId)) {
            throw new Error(`Player ${player.id} does not have merchant card ${action.merchantCardId}`)
        }

        if (player.usedMerchantCardIds.includes(action.merchantCardId)) {
            throw new Error(`Player ${player.id} already used merchant card ${action.merchantCardId}`)
        }
        
        const card = this.cardService.getMerchantCard(action.merchantCardId)

        switch (action.playMerchantCardType) {
            case 'CrystalMerchantCard':
                this._crystalMerchantCardAction(player, card as CrystalMerchantCard)
                break
            case 'TradeMerchantCard':
                this._tradeMerchantCardAction(player, action as TradeMerchantCardAction, card as TradeMerchantCard)
                break
            case 'UpgradeMerchantCard':
                this._upgradeMerchantCardAction(player, action as UpgradeMerchantCardAction, card as UpgradeMerchantCard)
                break
        }

        player.usedMerchantCardIds.push(action.merchantCardId)
    }

    private _restAction(player: Player) {
        if (player.usedMerchantCardIds.length === 0) {
            throw new Error(`Can't rest: player ${player.id} has no used merchant cards`)
        }
        player.usedMerchantCardIds.length = 0
    }

    private _removeCrystalOverflow(player: Player, action: RemoveCrystalOverflowAction) {
        if (player.crystals.reduce((prev, curr) => prev + curr) <= MAX_NUM_CRYSTALS) {
            throw new Error(`Can't remove crystals: player ${player.id} ${player.crystals} not over ${MAX_NUM_CRYSTALS}`)
        }

        if (action.toCrystals.reduce((prev, curr) => prev + curr) !== MAX_NUM_CRYSTALS) {
            throw new Error(`Can't remove crystals: player ${player.id} ${action.toCrystals} not equal ${MAX_NUM_CRYSTALS}`)
        }

        if (!player.crystals.every((numCrystals, i) => numCrystals >= action.toCrystals[i])) {
            throw new Error(`Can't remove crystals: player ${player.id} ${player.crystals} to ${action.toCrystals}`)
        }

        player.crystals = [...action.toCrystals]
        
    }

    private _findPlayer(game: Game, userId: UserId): Player {
        const player = game.players.find(p => p.id === userId)

        if (!player) {
            throw new Error(`Player ${userId} does not exist`)
        }
        
        return player
    }

    private _getCrystalIndex(crystalType: CrystalType): 0 | 1 | 2 | 3 {
        switch (crystalType) {
            case 'Yellow':
                return 0
            case 'Green':
                return 1
            case 'Blue':
                return 2
            case 'Pink':
                return 3
        }
    }

}