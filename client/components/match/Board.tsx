import * as React from 'react'
import { onVoteTile, onUpdatePlayer, onEndTurn, onUpdateClueText } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { Button } from '../Shared'
import { TileState, MatchStatus } from '../../../enum'

interface Props {
    activeSession: Session
    me: Player
    players: Array<Player>
    board: Array<Array<Tile>>
}

interface State {
    highlightTiles: Array<Array<boolean>>
    showMessage: string
}

export default class Board extends React.Component<Props, State> {

    state = {
        highlightTiles: [[false]],
        showMessage: ''
    }

    voteEndTurn = () => {
        let teamPlayers = this.props.activeSession.players.filter(player=>player.teamId === this.props.me.teamId)
        let readyTeamPlayers = teamPlayers.filter(player=>player.voteEndTurn)
        
        if(readyTeamPlayers.length >= teamPlayers.length-2)
            onEndTurn(this.props.activeSession)
        else
            onUpdatePlayer({...this.props.me, voteEndTurn: !this.props.me.voteEndTurn}, this.props.activeSession)
    }

    getNotification = () => {
        let activeName = this.props.activeSession.players[0] && this.props.activeSession.players[0].name
        if(this.props.activeSession.status === MatchStatus.WIN)
            return <div style={{...styles.disabled, display: 'flex'}}>
                        <div style={AppStyles.notification}>
                            {activeName} is Victorious
                        </div>
                    </div>
        else if(this.state.showMessage)
            return (
                <div style={{...styles.disabled, display: 'flex'}}>
                    <div style={AppStyles.notification}>
                        <div style={{marginBottom:'0.5em'}}>
                            {this.state.showMessage}
                        </div>
                        {Button(true, ()=>this.setState({showMessage:''}), 'Done')}
                    </div>
                </div>
            )
    }

    getTileClickHandler = (tile:Tile) => {
        if(this.props.activeSession.activeTeamId === this.props.me.teamId)
            return ()=>onVoteTile(tile, this.props.me.id, this.props.activeSession)
    }

    getTileBackground = (tile:Tile) => {
        let team = this.props.activeSession.teams.find(team=>team.id === tile.teamId)
        let teamPlayers = this.props.activeSession.players.filter(player=>player.teamId === this.props.me.teamId)
        if(tile.state !== TileState.ACTIVE){
            return team.color
        }
        if(team.leadPlayerId === this.props.me.id){
            return team.color
        }
        return Object.keys(tile.votedIds).length === teamPlayers.length ? AppStyles.colors.grey1 : 'transparent'
    }

    render(){
        let activeTeam = this.props.activeSession.teams.find(team=>team.id === this.props.activeSession.activeTeamId)
        let codeMaker = activeTeam.leadPlayerId === this.props.me.id
        let myTeam = this.props.activeSession.teams.find(team=>team.id === this.props.me.teamId)
        return (
            <div>
                <div style={{position:'relative'}}>
                    <div style={styles.mapFrame}>
                        <div style={{display:'flex'}}>
                            {this.props.board.map((row, x) => 
                                <div>
                                    {row.map((tile:Tile, y) => {
                                        const votes = Object.keys(tile.votedIds).length
                                        return <div style={{
                                                ...styles.tile, 
                                                background: this.getTileBackground(tile),
                                                borderStyle: tile.votedIds[this.props.me.id] ? 'solid' : 'dotted',
                                                cursor: codeMaker ? 'none' : 'pointer'
                                            }} 
                                            onClick={!codeMaker && this.getTileClickHandler(tile)}>
                                            <div>{votes > 0 ? tile.word + ' - '+ votes : tile.word}</div>
                                        </div>
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {this.getNotification()}
                </div>
                {activeTeam.id === this.props.me.teamId ? 
                    <div style={{marginTop:'0.5em'}}>
                        <div>
                            <input  type='text' 
                                    disabled={!codeMaker} 
                                    value={this.props.activeSession.clueText} 
                                    onChange={(e)=>onUpdateClueText(e.currentTarget.value, this.props.activeSession)}/>
                        </div>
                        {codeMaker ? null : Button(!this.props.me.voteEndTurn, this.voteEndTurn, 'Confirm Secrets')}
                    </div> : 
                    <div style={{background:activeTeam.color}}>It's Another Team's Turn</div>
                }
                <div>Score: {myTeam.score}</div>
            </div>
        )
    }
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
        width: '6em',
        height:'2em',
        border: '1px',
        position:'relative' as 'relative',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
    }
}