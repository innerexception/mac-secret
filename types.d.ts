declare enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN',LOSE='LOSE', SETUP='SETUP'}

interface Player {
    name:string
    id:string
    rune:string
    teamId: string
}

interface Tile {
    word: string
    teamId: string
    selected: boolean
}

interface Team {
    id: string
    color: string
    score: number
    leadPlayerId: string
    endTurnVoteIds: Array<string>
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