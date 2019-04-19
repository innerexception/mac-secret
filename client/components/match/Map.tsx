import * as React from 'react'
import { onMovePlayer, onAttackTile, onUpdatePlayer } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { FourCoordinatesArray, EightCoordinatesArray, TileType, MatchStatus, Directions } from '../../../enum'
import { Button, LightButton } from '../Shared'

interface Props {
    activeSession: Session
    me: Player
    players: Array<Player>
    map: Array<Array<Tile>>
    isHost: boolean
}

interface State {
    selectedTile: Tile | null
    movingPlayer: Player | null
    attackingPlayer: Player | null
    showDescription: Player | null
    highlightTiles: Array<Array<boolean>>
    visibleTiles: Array<Array<boolean>>
}

export default class Map extends React.Component<Props, State> {

    state = {
        selectedTile: null as null,
        movingPlayer: null as null,
        attackingPlayer: null as null,
        showDescription: null as null,
        highlightTiles: [[false]],
        visibleTiles: getVisibleTilesOfPlayer(this.props.me, this.props.map),
        startX: -1,
        startY: -1
    }

    getNotification = () => {
        let activeName = this.props.activeSession.players[0] && this.props.activeSession.players[0].name
        if(this.props.activeSession.status === MatchStatus.WIN)
            return <div style={{...styles.disabled, display: 'flex'}}>
                        <div style={AppStyles.notification}>
                            {activeName} is Victorious
                        </div>
                    </div>
        else if(this.state.showDescription)
            return (
                <div style={{...styles.disabled, display: 'flex'}}>
                    <div style={AppStyles.notification}>
                        <div style={{marginBottom:'0.5em'}}>
                            <span style={{fontFamily:'Rune', marginRight:'1em'}}>{(this.state.showDescription as Player).rune}</span>
                            {(this.state.showDescription as Player).name}
                        </div>
                        {Button(true, ()=>this.setState({showDescription:null}), 'Done')}
                    </div>
                </div>
            )
    }

    getUnitInfoOfTile = () => {
        let tile = this.state.selectedTile
        if(tile){
            let player = (tile as any).player as Player
            if(player){
                let isOwner = player.id === this.props.me.id
                return <div style={styles.tileInfo}>
                            <div>
                                <h4>{player.name}</h4>
                                <h4>{(tile as any).type}</h4>
                                {LightButton(true, ()=>this.setState({showDescription: player}), 'Info')}
                            </div>
                            <div>
                                {isOwner && <h4>M: {player.move} / {player.maxMove}</h4>}
                                {isOwner && player.weapon.name !== 'Fist' && <h4>A: {player.weapon.ammo} / {player.weapon.maxAmmo}</h4>}
                                {this.getUnitActionButtons(this.props.me, player)}
                            </div>
                        </div>
            }
            else
                return <div style={styles.tileInfo}>
                            <h4>{(tile as any).type}</h4>
                        </div>
        }
        return <div style={styles.tileInfo}>No selection...</div>
    }
    

    moveUnit = (player:Player, direction:Directions) => {
        let candidateTile = {...this.state.selectedTile as Tile}
        if(player.move > 0){
            switch(direction){
                case Directions.DOWN: candidateTile.y++
                     break
                case Directions.UP: candidateTile.y--
                     break
                case Directions.LEFT: candidateTile.x--
                     break
                case Directions.RIGHT: candidateTile.x++
                     break
            }
            if(!this.getObstruction(candidateTile.x, candidateTile.y, player)){
                player.x = candidateTile.x
                player.y = candidateTile.y
                player.move--
                candidateTile.player = player
                this.setState({selectedTile: candidateTile, visibleTiles: getVisibleTilesOfPlayer(player, this.props.map)}, 
                    ()=>onMovePlayer(player, this.props.activeSession))
            }
        }
    }

    getObstruction = (x:number, y:number, player:Player) => {
        let tile = this.props.map[x][y]
        if(tile){
            if(tile.player) return true
            if(tile.type === TileType.MOUNTAIN || tile.type===TileType.RIVER){
                return true 
            } 
            return false
        }
        return true
    }

    performSpecial = (player:Player) => {
        switch(player.item){
            case Item.SMAL_HEALTH:
                player.hp+=1
            case Item.LARGE_HEALTH:
                player.hp+=3
        }
        onUpdatePlayer(player, this.props.activeSession)
    }

    showAttackTiles = (player:Player) => {
        let highlightTiles = getTilesInRange(player, this.props.map)
        this.setState({attackingPlayer: player, highlightTiles})
    }

    hideAttackTiles = () => {
        this.setState({attackingPlayer: null, highlightTiles:[[false]]})
    }

    performAttackOnTile = (tile:Tile) => {
        if(tile.player){
            //TODO flash/shake tile's unit here
            onAttackTile(this.state.attackingPlayer, tile, this.props.activeSession)
        }
        this.hideAttackTiles()
    }

    getUnitActionButtons = (me:Player, player?:Player) => {
        if(player){
            let isOwner = player.id === me.id
            if(isOwner){
                let buttons = []
                if(this.state.attackingPlayer){
                    buttons.push(LightButton(true, this.hideAttackTiles, 'Cancel'))
                }
                if(!this.state.attackingPlayer){
                    if(this.state.selectedTile && (this.state.selectedTile as any).player && (this.state.selectedTile as any).player.weapon.attacks > 0)
                        if(!this.state.movingPlayer) 
                            buttons.push(LightButton(true, ()=>this.showAttackTiles(player), 'Attack'))
                }
                if(this.state.movingPlayer){
                    if(player.move<player.maxMove){
                        buttons.push(LightButton(true, ()=>this.setState({movingPlayer:null}), 'Done'))
                    }
                }
                if(!this.state.movingPlayer && !this.state.attackingPlayer){
                    if(player.move>0) buttons.push(LightButton(true, ()=>this.setState({movingPlayer: player, attackingPlayer:null, highlightTiles:[[false]]}), 'Move'))
                }
                if(player.item) buttons.push(LightButton(player.itemCooldown === 0, ()=>this.performSpecial(player), player.item))

                return <div>
                            {buttons}
                       </div>
            }
        }
        return <span/>
    }

    getMoveArrowsOfTile = (tile:Tile, movingPlayer?:Player) => {
        let tileUnit = tile.player
        if(tileUnit && movingPlayer && tileUnit.id === movingPlayer.id)
            return [
                    <div style={styles.leftArrow} onClick={()=>this.moveUnit(tileUnit, Directions.LEFT)}>{'<'}</div>,
                    <div style={styles.rightArrow} onClick={()=>this.moveUnit(tileUnit, Directions.RIGHT)}>></div>,
                    <div style={styles.upArrow} onClick={()=>this.moveUnit(tileUnit, Directions.UP)}>^</div>,
                    <div style={styles.downArrow} onClick={()=>this.moveUnit(tileUnit, Directions.DOWN)}>v</div>
                ]
        return <span/>
    }

    getTileClickHandler = (tile:Tile) => {
        if(this.state.movingPlayer) return null
        if(this.state.attackingPlayer) return ()=>this.performAttackOnTile(tile)
        return ()=>this.setState({selectedTile: tile, attackingPlayer:null, highlightTiles:[[false]]})
    }

    render(){
        return (
            <div>
                {this.getUnitInfoOfTile()}
                <div style={{position:'relative'}}>
                    <div style={styles.mapFrame}>
                        <div style={{display:'flex'}}>
                            {this.props.map.map((row, x) => 
                                <div>
                                    {row.map((tile:Tile, y) => 
                                        <div style={{
                                                ...styles.tile, 
                                                opacity: getTileOpacity(tile, this.props.me, this.state.visibleTiles),
                                                background: this.state.highlightTiles[x] && this.state.highlightTiles[x][y]===true ? AppStyles.colors.grey2 : 'transparent',
                                                borderStyle: isSelectedTile(tile, this.state.selectedTile) ? 'dashed' : 'dotted'
                                            }} 
                                            onClick={this.getTileClickHandler(tile)}>
                                            <div style={{fontFamily:'Terrain', color: AppStyles.colors.grey3, fontSize:'2em'}}>{tile.subType}</div>
                                            {tile.item && <div style={{fontFamily:'Item', color: AppStyles.colors.grey2, fontSize:'0.6em', textAlign:'left'}}>{tile.item}</div>}
                                            {this.state.movingPlayer && this.getMoveArrowsOfTile(tile, this.state.movingPlayer)}
                                            {getUnitPortraitOfTile(tile)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {this.getNotification()}
                </div>
                <div style={{marginTop:'0.5em'}}>
                    Next turn in {this.props.activeSession.turnTickLimit - this.props.activeSession.ticks} sec
                </div>
            </div>
            
        )
    }
}

const getUnitPortraitOfTile = (tile:Tile) => {
    let tileUnit = tile.player
    if(tileUnit){
        return <div style={{textAlign:'right', position:'absolute', top:0, right:0}}>
                    <span style={{fontFamily:'Gun', fontSize:'0.6em'}}>{tileUnit.weapon.rune}</span>
                    <span style={{fontFamily:'Rune', fontSize:'0.7em'}}>{tileUnit.rune}</span>
                    <div>{new Array(tileUnit.hp).fill(null).map((hp) =>  <span>*</span>)}</div>
               </div>
    }
    return <span/>
}

const getTileOpacity = (tile:Tile, me:Player, visibleTiles: Array<Array<boolean>>) => {
    if(tile.player){
        let isOwner = tile.player.id === me.id
        if(isOwner) return 1
        else {
            return visibleTiles[tile.player.x][tile.player.y] ? 0.5 : 0
        }
    }
    return visibleTiles[tile.x][tile.y] ? 1 : 0.5
}

const getTilesInRange = (player:Player, map:Array<Array<Tile>>) => {
    let tiles = new Array(map.length).fill(null).map((item) => 
                    new Array(map[0].length).fill(false))
    FourCoordinatesArray.forEach((direction) => {
        let candidateX = player.x
        let candidateY = player.y
        for(var i=player.weapon.range; i>0; i--){
            candidateX += direction.x
            candidateY += direction.y
            if(candidateY >= 0 && candidateX >= 0 
                && candidateX < map.length 
                && candidateY < map[0].length)
                tiles[candidateX][candidateY] = true
        }
    })
    return tiles
}

const isSelectedTile = (tile:Tile, selectedTile?:Tile) => {
    if(selectedTile){
        return tile.x === selectedTile.x && tile.y === selectedTile.y
    }
    return false
}

const getVisibleTilesOfPlayer = (player:Player, map:Array<Array<Tile>>) => {
    let tiles = new Array(map.length).fill(null).map((item) => 
                    new Array(map[0].length).fill(false))
    EightCoordinatesArray.forEach((direction) => {
        let candidateX = player.x
        let candidateY = player.y
        for(var i=Math.max(player.weapon.range, 3); i>0; i--){
            candidateX += direction.x
            candidateY += direction.y
            if(candidateY >= 0 && candidateX >= 0 
                && candidateX < map.length 
                && candidateY < map[0].length)
                tiles[candidateX][candidateY] = true
                console.log('visible tile at '+candidateX + ','+candidateY)
        }
    })
    return tiles
}

const styles = {
    disabled: {
        pointerEvents: 'none' as 'none',
        alignItems:'center', justifyContent:'center', 
        position:'absolute' as 'absolute', top:0, left:0, width:'100%', height:'100%'
    },
    mapFrame: {
        position:'relative' as 'relative',
        backgroundImage: 'url('+require('../../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        overflow:'auto',
        maxHeight:'60vh',
        maxWidth:'100%'
    },
    tileInfo: {
        height: '5em',
        backgroundImage: 'url('+require('../../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        marginBottom: '0.5em',
        padding: '0.5em',
        border: '1px dotted',
        display:'flex',
        justifyContent:'space-between'
    },
    tile: {
        width: '2em',
        height:'2em',
        border: '1px',
        position:'relative' as 'relative'
    },
    levelBarOuter: {
        height:'0.25em',
        background: AppStyles.colors.white
    },
    leftArrow: {
        position:'absolute' as 'absolute',
        left:'-1em',
        top:0,
        bottom:0,
        width:'1em',
        height:'1em',
        cursor:'pointer',
        zIndex:2
    },
    rightArrow: {
        position:'absolute' as 'absolute',
        right:'-2em',
        top:0,
        bottom:0,
        width:'1em',
        height:'1em',
        cursor:'pointer',
        zIndex:2
    },
    upArrow: {
        position:'absolute' as 'absolute',
        right:0,
        top:'-1em',
        left:'1em',
        width:'1em',
        height:'1em',
        cursor:'pointer',
        zIndex:2
    },
    downArrow: {
        position:'absolute' as 'absolute',
        right:0,
        bottom:'-1em',
        left:'1em',
        width:'1em',
        height:'1em',
        cursor:'pointer',
        zIndex:2
    }
}