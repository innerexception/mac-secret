declare enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN',LOSE='LOSE', SETUP='SETUP'}

interface Player {
    name:string
    id:string
    rune:string
    teamId: string
}

interface Tile {
    x: number
    y: number
    word: string
    teamId: string
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
}

interface RState {
    isConnected: boolean
    currentUser: Player
    activeSession: Session
}