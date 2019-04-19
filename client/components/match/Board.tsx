import * as React from 'react'
import { onVoteTile, onUpdatePlayer, onEndTurn } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { Button, LightButton } from '../Shared'
import App from '../../App';

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
        
        if(readyTeamPlayers.length >= teamPlayers.length-1)
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
        if(tile.state === TileState.CORRECT){
            return AppStyles.colors.white
        }
        if(tile.state === TileState.WRONG){
            return AppStyles.colors.black
        }
        if(team.leadPlayerId === this.props.me.id){
            return team.color
        }
        return Object.keys(tile.votedIds).length === teamPlayers.length ? AppStyles.colors.grey1 : 'transparent'
    }

    render(){
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
                                                borderStyle: tile.votedIds[this.props.me.id] ? 'solid' : 'dotted'
                                            }} 
                                            onClick={this.getTileClickHandler(tile)}>
                                            <div>{votes > 0 ? tile.word + ' - '+ votes : tile.word}</div>
                                        </div>
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {this.getNotification()}
                </div>
                <div style={{marginTop:'0.5em'}}>
                    {Button(this.props.me.teamId===this.props.activeSession.activeTeamId, this.voteEndTurn, 'Check Secrets')}
                </div>
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
        width: '2em',
        height:'2em',
        border: '1px',
        position:'relative' as 'relative'
    }
}