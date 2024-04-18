
export type UserId = string
export type RoomId = string
export type GameId = string
export type PointCardId = number
export type MerchantCardId = number

export interface PerSocketData {
    id: UserId,
    roomId: RoomId | null
}

export type UserStatus = 'Offline' | 'Online' | 'InRoom'

export interface User {
    id: UserId,
    name: string,
    status: UserStatus
}

export type RoomStatus = 'Waiting' | 'InGame' | 'Complete'

export interface Room {
    id: RoomId,
    hostId: UserId | null,
    userIds: UserId[],
    botIds: UserId[],
    status: RoomStatus,
    gameId: GameId | null,
    chat: string[]
}

export type CrystalType = 'Yellow' | 'Green' | 'Blue' | 'Pink'
export type Crystals = [number, number, number, number]
export type OrderedCrystals = CrystalType[]

export interface Player {
    id: UserId,
    isBot: boolean,
    name: string,
    turn: number,
    
    numCopperTokens: number,
    numSilverTokens: number

    pointCardIds: PointCardId[],
    merchantCardIds: MerchantCardId[],
    usedMerchantCardIds: MerchantCardId[],

    crystals: Crystals
}

export type ActionType = 'PlayMerchantCard' | 'PickUpMerchantCard' | 'BuyPointCard' | 'Rest' | 'RemoveCrystalOverflow'

export type PlayMerchantCardType = 'CrystalMerchantCard' | 'UpgradeMerchantCard' | 'TradeMerchantCard'

export interface CrystalMerchantCardAction {
    type: ActionType = 'PlayMerchantCard',
    playMerchantCardType: PlayMerchantCardType = 'CrystalMerchantCard',
    merchantCardId: MerchantCardId,
}

export interface UpgradeMerchantCardAction {
    type: ActionType = 'PlayMerchantCard',
    playMerchantCardType: PlayMerchantCardType = 'UpgradeMerchantCard',
    merchantCardId: MerchantCardId,
    upgrades: OrderedCrystals
}

export interface TradeMerchantCardAction {
    type: ActionType = 'PlayMerchantCard',
    playMerchantCardType: PlayMerchantCardType = 'TradeMerchantCard',
    merchantCardId: MerchantCardId,
    numTrades: number
}

export type PlayMerchantCardAction = CrystalMerchantCardAction | UpgradeMerchantCardAction | TradeMerchantCardAction

export interface PickUpMerchantCardAction {
    type: ActionType = 'PickUpMerchantCard',
    merchantCardId: MerchantCardId,
    crystalsDropped: OrderedCrystals
}

export interface BuyPointCardAction {
    type: ActionType = 'BuyPointCard',
    pointCardId: PointCardId,
}

export interface RestAction {
    type: ActionType = 'Rest'
}

export interface RemoveCrystalOverflowAction {
    type: ActionType = 'RemoveCrystalOverflow',
    toCrystals: Crystals
}

export type Action = (PlayMerchantCardAction | PickUpMerchantCardAction | BuyPointCardAction | RestAction) & {
    playerId?: UserId
}

export interface Game {
    id: GameId,
    round: number,
    turn: number,
    maxGolems: number,
    isComplete: boolean,

    numCopperTokens: number,
    numSilverTokens: number,

    activePointCardIds: PointCardId[],
    activeMerchantCardIds: MerchantCardId[],
    fieldCrystals: Crystals[],

    players: Player[]
    
    pointCardIds: PointCardId[],
    merchantCardIds: MerchantCardId[]

    actions: Action[]
}

export interface PointCard {
    id: PointCardId,
    numPoints: number,
    crystals: Crystals
}

export type MerchantCardType = 'CrystalMerchantCard' | 'UpgradeMerchantCard' | 'TradeMerchantCard'

export interface CrystalMerchantCard {
    type: MerchantCardType = 'CrystalMerchantCard',
    id: MerchantCardId,
    crystals: Crystals
}

export interface UpgradeMerchantCard {
    type: MerchantCardType = 'UpgradeMerchantCard',
    id: MerchantCardId,
    numUpgrades: number
}

export interface TradeMerchantCard {
    type: MerchantCardType = 'TradeMerchantCard',
    id: MerchantCardId,
    fromCrystals: Crystals,
    toCrystals: Crystals    
}

export type MerchantCard = CrystalMerchantCard | UpgradeMerchantCard | TradeMerchantCard

export type ClientRequestType = 'CreateRoom' | 'JoinRoom' | 'StartGame' | 'AddBot' | 'RemoveBot' | 'Action' | 'Chat' | 'ChangeName'

export interface CreateRoomRequest {
    type: ClientRequestType = 'CreateRoom'
}

export interface JoinRoomRequest {
    type: ClientRequestType = 'JoinRoom',
    roomId: RoomId
}

export interface StartGameRequest {
    type: ClientRequestType = 'StartGame',
}

export interface AddBotRequest {
    type: ClientRequestType = 'AddBot'
}

export interface RemoveBotRequest {
    type: ClientRequestType = 'RemoveBot',
    botId: UserId
}

export interface ActionRequest {
    type: ClientRequestType = 'Action',
    action: Action
}

export interface ChatRequest {
    type: ClientRequestType = 'Chat',
    message: string
}

export interface ChangeNameRequest {
    type: ClientRequestType = 'ChangeName',
    name: string
}

export type ClientRequest = CreateRoomRequest | JoinRoomRequest | StartGameRequest | AddBotRequest | RemoveBotRequest | ActionRequest | ChatRequest | ChangeNameRequest

export type ServerResponseType = 'UserInfo' | 'RoomInfo' | 'GameInfo'

export type UserInfo = User

export interface RoomInfo {
    id: RoomId,
    hostId: UserId,
    users: UserInfo[],
    bots: UserInfo[],
    status: RoomStatus,
    chat: string[]
}

export interface GameInfo {
    id: GameId,
    round: number,
    turn: number,
    maxGolems: number,
    isComplete: boolean,

    numCopperTokens: number,
    numSilverTokens: number,

    activePointCardIds: PointCardId[],
    activeMerchantCardIds: MerchantCardId[],
    fieldCrystals: Crystals[],

    players: Player[]
    
    actions: Action[]
}

export interface UserInfoResponse {
    type: ServerResponseType = 'UserInfo',
    user: UserInfo
}

export interface RoomInfoResponse {
    type: ServerResponseType = 'RoomInfo',
    room: RoomInfo
}

export interface GameInfoResponse {
    type: ServerResponseType = 'GameInfo',
    game: GameInfo
}

export type ServerResponse = UserInfoResponse | RoomInfoResponse | GameInfoResponse

// https://stackoverflow.com/questions/21762596/how-to-read-status-code-from-rejected-websocket-opening-handshake-with-javascrip

export type ServerErrorType = 'UserConnectionAlreadyExists'