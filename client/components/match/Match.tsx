import * as React from 'react'
import AppStyles from '../../AppStyles';
import Board from './Board'
import { TopBar, Button } from '../Shared'

interface Props {
    currentUser: Player
    activeSession: Session
}

export default class Match extends React.Component<Props> {
    render(){
        return (
            <div style={AppStyles.window}>
                {TopBar('MacSecret')}
                <div style={{padding:'0.5em', maxWidth:'25em'}}>
                    <Board 
                        board={this.props.activeSession.board} 
                        me={this.props.currentUser}
                        activeSession={this.props.activeSession}
                        players={this.props.activeSession.players}/>
                </div>
         </div>
        )
    }
}

const styles = {
    
}