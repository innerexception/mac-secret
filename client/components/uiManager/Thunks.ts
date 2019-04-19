import { dispatch } from '../../../client/App'
import { ReducerActions, Teams } from '../../../enum'
import WS from '../../WebsocketClient'
export const server = new WS()
import { getRandomWord, shuffleArray } from '../Util'

export const onLogin = (currentUser:Player, sessionId:string) => {
    dispatch({ type: ReducerActions.SET_USER, currentUser })
    server.publishMessage({type: ReducerActions.PLAYER_AVAILABLE, currentUser, sessionId})
}

export const onMatchStart = (session:Session) => {
    let board = new Array(5).fill(null).map((row, i)=>new Array(5).fill(null).map((tile,j)=>{
        return {
            word: getRandomWord(),
            teamId: Teams[Teams.length%(i+j)].id
        }
    }))
    board = shuffleArray(board)
    const newSession = {
        ...session,
        status: MatchStatus.ACTIVE,
        board
    }
    sendSessionUpdate(newSession)
}

const onEndTurn = (session:Session) => {

    sendSessionUpdate(session)
}

export const onUpdatePlayer = (player:Player, session:Session) => {
    session.players = session.players.filter(splayer=>splayer.id!==player.id)
    session.players.push(player)
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