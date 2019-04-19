import { ReducerActions } from '../../../enum'

export const setUser = (currentUser:object) => {
    return {
        type: ReducerActions.SET_USER,
        currentUser
    }
}

export const initServer = (props:object) => {
    return {
        type: ReducerActions.INIT_SERVER,
        props
    }
}

export const connected = () => {
    return {
        type: ReducerActions.CONNECTED
    }
}

export const connectionError = () => {
    return {
        type: ReducerActions.CONNECTION_ERROR
    }
}

export const decodeWSMessage = (data:any) => {
    if (!data ) {
      return {
          type:'noop'
      }
    }
    var payload = JSON.parse(data.data);
    return {...payload}
}

