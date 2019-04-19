import { connect } from 'react-redux'
import { decodeWSMessage, initServer, connected, connectionError } from './Actions'
import UIManager from './UIManager'

const mapStateToProps = (state:RState) => {
    return state
};

const mapDispatchToProps = (dispatch:any) => {
    return {
        onWSMessage: (data:any) => {
            dispatch(decodeWSMessage(data))
        },
        onInitServer: (props:any) => {
            dispatch(initServer(props))
        },
        onConnected: () => {
            dispatch(connected())
        },
        onConnectionError: () => {
            dispatch(connectionError())
        }
    }
};


const UIStateContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UIManager);

export default UIStateContainer;