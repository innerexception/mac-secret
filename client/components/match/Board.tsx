import * as React from 'react'
import { onVoteTile, onUpdatePlayer, onEndTurn, onUpdateClueText } from '../uiManager/Thunks'
import AppStyles from '../../AppStyles';
import { Button, LightButton } from '../Shared'
import { TileState, MatchStatus } from '../../../enum'
import App from '../../App';

interface Props {
    activeSession: Session
    me: Player
    players: Array<Player>
    board: Array<Array<Tile>>
}

interface State {
    showMessage: string
    globalMessage: string
}

export default class Board extends React.Component<Props, State> {

    state = {
        globalMessage: this.props.activeSession.globalMessage,
        showMessage: ''
    }

    componentWillReceiveProps = (props:Props) => {
        if(this.state.globalMessage !== props.activeSession.globalMessage)
            this.setState({globalMessage: props.activeSession.globalMessage, showMessage: props.activeSession.globalMessage})
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
        let activeTeam = this.props.activeSession.teams.find(team=>team.id===this.props.activeSession.activeTeamId)
        let activeName = this.props.activeSession.players.find(player=>player.id === activeTeam.leadPlayerId)
        if(this.props.activeSession.status === MatchStatus.WIN)
            return <div style={{...styles.disabled, display: 'flex'}}>
                        <div style={AppStyles.notification}>
                            {activeName.name}'s team wins!
                        </div>
                    </div>
        else if(this.props.activeSession.status === MatchStatus.LOSE)
            return <div style={{...styles.disabled, display: 'flex'}}>
                        <div style={AppStyles.notification}>
                            {activeName.name}'s team loses!
                        </div>
                    </div>
        else if(this.state.showMessage)
            return (
                <div style={{...styles.disabled, display: 'flex'}}>
                    <div style={AppStyles.notification}>
                        <div style={{marginBottom:'0.5em', whiteSpace:'pre-wrap'}}>
                            {this.state.showMessage}
                        </div>
                        {Button(true, ()=>this.setState({showMessage:''}), 'Done')}
                    </div>
                </div>
            )
    }

    getTileClickHandler = (tile:Tile) => {
        if(this.props.activeSession.activeTeamId === this.props.me.teamId && tile.state === TileState.ACTIVE || tile.state === TileState.ASSASSIN || tile.state === TileState.NEUTRAL)
            return ()=>onVoteTile(tile, this.props.me.id, this.props.activeSession)
    }

    getTileBackground = (tile:Tile, isTeamLead: boolean) => {
        let tileTeam = this.props.activeSession.teams.find(team=>team.id === tile.teamId)
        if(tile.state === TileState.CORRECT || tile.state === TileState.WRONG){
            return tileTeam.color
        }
        if(isTeamLead){
            if(tile.state===TileState.ASSASSIN){
                return AppStyles.colors.black
            }
            if(tile.state===TileState.NEUTRAL){
                return AppStyles.colors.white
            }
            return tileTeam.color
        }
    }

    render(){
        let activeTeam = this.props.activeSession.teams.find(team=>team.id === this.props.activeSession.activeTeamId)
        let codeMaker = activeTeam.leadPlayerId === this.props.me.id
        let myTeam = this.props.activeSession.teams.find(team=>team.id === this.props.me.teamId)
        return (
            <div>
                <div style={{...styles.tileInfo, background:myTeam.color}}>
                    <div style={styles.infoInner}>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
                            <div>{this.props.me.name}</div>
                            <div style={{fontFamily:'Rune'}}>{this.props.me.rune}</div>
                            <div>Score: {myTeam.score}</div>
                        </div>
                        {activeTeam.id === this.props.me.teamId ? 
                            <div style={{padding:'0.5em', display:'flex', alignItems:'center', width:'100%', justifyContent:codeMaker ? 'center':'space-between'}}>
                                <div style={{display:'flex', alignItems:'center'}}>
                                    <div style={{marginRight:'5px'}}>Clue:</div>
                                    <input  type='text' 
                                            style={{marginRight:'5px'}}
                                            disabled={!codeMaker} 
                                            placeholder="Noun - 3"
                                            value={this.props.activeSession.clueText} 
                                            onChange={(e)=>onUpdateClueText(e.currentTarget.value, this.props.activeSession)}/>
                                    {LightButton(true, ()=>this.setState({showMessage: codeMaker ? 'Enter a word and a number to try to tell your team to pick the correct words. The number is the amount of words they should pick, and the correct words have your team color. The black tile is the bomb.':'Your leader is trying to get you to pick the correct words using this clue. The number is the amount of words you should pick.'}), '?')}
                                </div>
                                {codeMaker ? null : Button(!this.props.me.voteEndTurn, this.voteEndTurn, 'Confirm Secrets')}
                            </div> : 
                            <div style={styles.otherTeamTurn}>It's Another Team's Turn</div>
                        }
                    </div>
                </div>
                <div style={{position:'relative'}}>
                    <div style={styles.mapFrame}>
                        <div style={{display:'flex'}}>
                            {this.props.board.map((row) => 
                                <div>
                                    {row.map((tile:Tile) => {
                                        const votes = Object.keys(tile.votedIds).length
                                        return <div style={{
                                                ...styles.tile, 
                                                background: this.getTileBackground(tile, codeMaker),
                                                borderStyle: tile.votedIds[this.props.me.id] ? 'solid' : 'dotted',
                                                cursor: codeMaker ? 'none' : 'pointer',
                                                opacity: tile.state === TileState.CORRECT || tile.state === TileState.WRONG ? 0.5 : 1
                                            }} 
                                            onClick={!codeMaker && this.getTileClickHandler(tile)}>
                                            <div style={styles.tileInner}>{votes > 0 ? tile.word + ' - '+ votes : tile.word}</div>
                                        </div>
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    {this.getNotification()}
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
        marginBottom: '0.5em',
        padding: '0.5em',
        border: '1px solid'
    },
    infoInner: {
        padding:'0.5em',
        background:'white',
        borderRadius:'5px'
    },
    tile: {
        width: '6em',
        height:'2em',
        border: '1px',
        position:'relative' as 'relative',
        display:'flex',
        alignItems:'center',
        justifyContent:'center'
    },
    tileInner: {
        background: 'white',
        width: '100%',
        textAlign: 'center' as 'center',
        borderRadius: '5px',
        border: '1px solid',
        margin: '5px'
    },
    otherTeamTurn: {
        background: 'white',
        padding: '2px',
        borderRadius: '5px',
        textAlign: 'center' as 'center',
        margin: '5px'
    }
}