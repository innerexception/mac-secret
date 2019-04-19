import { dispatch } from '../../../client/App'
import { ReducerActions, MatchStatus, Weapon, TileType, TileSubType } from '../../../enum'
import WS from '../../WebsocketClient'
export const server = new WS()
import Thunderdome from '../../assets/Thunderdome'
import { toast } from './toast';
import { getRandomInt, getRandomItem, getRandomWeapon } from '../Util';

export const onLogin = (currentUser:LocalUser, sessionId:string) => {
    dispatch({ type: ReducerActions.SET_USER, currentUser })
    server.publishMessage({type: ReducerActions.PLAYER_AVAILABLE, currentUser, sessionId})
}

export const onMatchStart = (currentUser:LocalUser, session:Session) => {
    const players = session.players.map((player:Player, i) => {
        return {
            ...player,
            x: Math.max(1, getRandomInt(Thunderdome.length-1)),
            y: Math.max(1,getRandomInt(Thunderdome[0].length-1)),
            weapon: Weapon.FIST,
            hp: 5,
            maxHp: 5,
            move: 4,
            maxMove: 4,
            armor: 0
        }
    })
    const newSession = {
        ...session,
        status: MatchStatus.ACTIVE,
        hostPlayerId: currentUser.id,
        players,
        map: Thunderdome.map((row, i) => 
                row.map((tile:Tile, j) => {
                    let player = players.find(player=>player.x===i && player.y === j)
                    return {
                        ...tile,
                        x:i,
                        y:j,
                        playerId: player ? player.id : null,
                        item: tile.itemSpawn ? getRandomItem() : null,
                        weapon: tile.weaponSpawn ? getRandomWeapon() : null
                    }
                })
            ),
        ticks: 0,
        turnTickLimit: 15
    }
    sendSessionUpdate(newSession)
}

export const onMovePlayer = (player:Player, session:Session) => {
    sendReplaceMapPlayer(session, player)
}

export const onAttackTile = (attacker:Player, tile:Tile, session:Session) => {
    if(attacker.weapon.ammo <= 0 || attacker.weapon.attacks <= 0) return 
    const target = session.players.find(player=>player.id === tile.playerId)
    if(target){
        //TODO add weapon accuracy? 
        target.hp -= attacker.weapon.atk - target.armor
        sendReplaceMapPlayer(session, target)
    } 

    attacker.move = 0
    attacker.weapon.attacks--   
    attacker.weapon.ammo--  
    sendReplaceMapPlayer(session, attacker)

    if(session.players.filter(player=>player.hp>0).length === 1){
        session.status = MatchStatus.WIN
        sendSessionUpdate(session)
    }
}

export const onMatchTick = (session:Session) => {
    session.ticks++
    if(session.ticks >= session.turnTickLimit){
        onEndTurn(session)
        return
    }
    sendSessionTick(session)
}

const onEndTurn = (session:Session) => {
    session.ticks = 0
    session.turn++
    session.players.forEach(player=>{
        player.move = player.maxMove
        player.weapon.attacks = player.weapon.maxAttacks
        if(player.weapon.reloadCooldown > 0){
            player.weapon.reloadCooldown--
            if(player.weapon.reloadCooldown === 0)
                player.weapon.ammo = player.weapon.maxAmmo
        }
    })
    if(session.turn%2===0){
        session.map = session.map.map((row, x)=>{
            return row.map((tile, y)=>{
                if(y === session.turn/2 || y=== session.map[x].length-(session.turn/2) 
                    || x===0 || x===session.map.length-(session.turn/2))
                    return {...tile, type:TileType.MOUNTAIN, subType: TileSubType.MOUNTAIN[0]}
                else return tile
            })
        })
        session.players = session.players.map(player=>{
            if(session.map[player.x][player.y].type === TileType.MOUNTAIN){
                return {...player, hp:0}
            }
            return player
        })
    }
    sendSessionUpdate(session)
}

export const onUpdatePlayer = (player:Player, session:Session) => {
    sendReplacePlayer(session, player)
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

const sendSessionTick = (session:Session) => {
    server.publishMessage({
        type: ReducerActions.MATCH_TICK,
        sessionId: session.sessionId
    })
}

const sendReplacePlayer = (session:Session, player:Player) => {
    server.publishMessage({
        type: ReducerActions.PLAYER_REPLACE,
        sessionId: session.sessionId,
        player
    })
}

const sendReplaceMapPlayer = (session:Session, player:Player) => {
    server.publishMessage({
        type: ReducerActions.PLAYER_MAP_REPLACE,
        sessionId: session.sessionId,
        player
    })
}