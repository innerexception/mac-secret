import { dispatch } from '../../../client/App'
import { ReducerActions, Teams, TileState, MatchStatus } from '../../../enum'
import WS from '../../WebsocketClient'
export const server = new WS()
import { getRandomWord, shuffleArray } from '../Util'
import Match from '../match/Match';

export const onLogin = (currentUser:Player, sessionId:string) => {
    dispatch({ type: ReducerActions.SET_USER, currentUser })
    server.publishMessage({type: ReducerActions.PLAYER_AVAILABLE, currentUser, sessionId, session: {teams: Teams}})
}

export const onMatchStart = (session:Session) => {
    let activeTeams = session.teams.filter(team=>session.players.filter(player=>player.teamId===team.id).length>0)
    let board = new Array(4).fill(null).map((row, i)=>new Array(5).fill(null).map((tile,j)=>{
        return {
            id: Date.now() + '' + Math.random(),
            word: getRandomWord(),
            teamId: activeTeams[(i+j)%activeTeams.length].id,
            votedIds: {},
            state: TileState.ACTIVE
        }
    }))
    board[0][0].state = TileState.ASSASSIN
    board[0][1].state = TileState.NEUTRAL
    board[0][2].state = TileState.NEUTRAL
    board[1][0].state = TileState.NEUTRAL
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
    let votedTiles = new Array<Tile>()
    let teamPlayers = session.players.filter(player=>player.teamId === session.activeTeamId)
    session.board.forEach(row=>row.forEach(tile=>{
        if(Object.keys(tile.votedIds).length === teamPlayers.length-1){
            if(tile.state === TileState.ASSASSIN){
                votedTiles.push(tile)
            }
            else if(tile.state === TileState.NEUTRAL){
                votedTiles.push(tile)
            }
            else{
                let tileTeam = session.teams.find(team=>team.id===tile.teamId)
                tileTeam.score++
                if(tile.teamId===session.activeTeamId)
                    tile.state = TileState.CORRECT
                else 
                    tile.state = TileState.WRONG
                votedTiles.push(tile)
            }
        }
        tile.votedIds = {}
    }))

    if(votedTiles.find(tile=>tile.state === TileState.ASSASSIN)){
        session.globalMessage = 'The active team picked the bomb! They lose!'
        session.status = MatchStatus.LOSE
    }
    else {
        session.globalMessage = 'The active team just put in their votes, and the results are in: \n'+
            votedTiles.map(tile=>{
                if(tile.state === TileState.NEUTRAL) return tile.word + ' was NEUTRAL (+0) '
                else return tile.word + ' was '+(tile.state === TileState.CORRECT ? ' CORRECT! (+1) ' : ' WRONG! (Other team +1) ')
            })
            .join('\n')
        let winningTeam = session.teams.find(team=>team.score >= 7)
        if(winningTeam){
            session.globalMessage += " That's a WIN!"
            session.status = MatchStatus.WIN
        }
        else {
            let activeTeamIndex=0
            session.teams.forEach((team,i)=>{
                if(team.id === session.activeTeamId) activeTeamIndex = i
            })
            session.activeTeamId = session.teams[(activeTeamIndex+1)%session.teams.length].id
        }
    }
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