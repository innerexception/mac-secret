import { dispatch } from '../../../client/App'
import { ReducerActions, Teams, TileState, MatchStatus } from '../../../enum'
import WS from '../../WebsocketClient'
export const server = new WS()
import { getRandomWord, shuffleArray } from '../Util'

export const onLogin = (currentUser:Player, sessionId:string) => {
    dispatch({ type: ReducerActions.SET_USER, currentUser })
    server.publishMessage({type: ReducerActions.PLAYER_AVAILABLE, currentUser, sessionId, session: {teams: Teams}})
}

export const onMatchStart = (session:Session) => {
    let activeTeams = session.teams.filter(team=>session.players.filter(player=>player.teamId===team.id).length>0)
    let board = new Array(5).fill(null).map((row, i)=>new Array(5).fill(null).map((tile,j)=>{
        return {
            id: Date.now() + '' + Math.random(),
            word: getRandomWord(),
            teamId: activeTeams[(i+j)%activeTeams.length].id,
            votedIds: {},
            state: TileState.ACTIVE
        }
    }))
    board = shuffleArray(board)
    const newSession = {
        ...session,
        teams: activeTeams,
        activeTeamId: activeTeams[0].id,
        status: MatchStatus.ACTIVE,
        board
    }
    sendSessionUpdate(newSession)
}

export const onEndTurn = (session:Session) => {
    let teamPlayers = session.players.filter(player=>player.teamId === session.activeTeamId)
    session.board.forEach(row=>row.forEach(tile=>{
        if(Object.keys(tile.votedIds).length === teamPlayers.length-1){
            let tileTeam = session.teams.find(team=>team.id===tile.teamId)
            tileTeam.score++
            if(tile.teamId===session.activeTeamId)
                tile.state = TileState.CORRECT
            else 
                tile.state = TileState.WRONG
        }
        tile.votedIds = {}
    }))

    let activeTeamIndex=0
    session.teams.forEach((team,i)=>{
        if(team.id === session.activeTeamId) activeTeamIndex = i
    })
    session.activeTeamId = session.teams[(activeTeamIndex+1)%session.teams.length].id
    session.clueText = ''

    sendSessionUpdate(session)
}

export const onVoteTile = (tile:Tile, playerId:string, session:Session) => {
    session.board.forEach(row=>row.forEach(stile=>{
        if(stile.id === tile.id) {
            if(tile.votedIds[playerId])
                delete tile.votedIds[playerId]
            else 
                tile.votedIds[playerId] = true
        }
    }))
    sendSessionUpdate(session)
}

export const onUpdatePlayer = (player:Player, session:Session) => {
    session.players = session.players.map(splayer => {
        if(splayer.id === player.id) return {...splayer, ...player}
        return splayer
    })
    sendSessionUpdate(session)
}

export const onTeamUpdate = (team:Team, session:Session) => {
    session.teams = session.teams.filter(steam=>steam.id!==team.id)
    session.teams.push(team)
    sendSessionUpdate(session)
}

export const onUpdateClueText = (text:string, session:Session) => {
    session.clueText = text
    sendSessionUpdate(session)
}

export const onMatchWon = (session:Session) => {
    session.status = MatchStatus.WIN
    sendSessionUpdate(session)
}

export const onCleanSession = () => {
    dispatch({
        type: ReducerActions.MATCH_CLEANUP
    })
}

const sendSessionUpdate = (session:Session) => {
    server.publishMessage({
        type: ReducerActions.MATCH_UPDATE,
        sessionId: session.sessionId,
        session: {
            ...session
        }
    })
}