declare enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN',LOSE='LOSE', SETUP='SETUP'}
declare enum TileState {ACTIVE='ACTIVE', CORRECT='CORRECT', WRONG='WRONG'}
declare module "*.json" {
    const words: Array<string>
    export default words
}
interface Player {
    name:string
    id:string
    rune:string
    teamId: string
    voteEndTurn: boolean
}

interface Tile {
    id: string
    word: string
    teamId: string
    votedIds: any
    state: TileState
}

interface Team {
    id: string
    color: string
    score: number
    leadPlayerId: string
}

interface Session {
    players: Array<Player>
    board: Array<Array<Tile>>
    words: Array<string>
    teams: Array<Team>
    sessionId: string
    status: MatchStatus
    activeTeamId: string
}

interface RState {
    isConnected: boolean
    currentUser: Player
    activeSession: Session
}