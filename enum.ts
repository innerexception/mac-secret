import AppStyles from "./client/AppStyles";
export enum MatchStatus {ACTIVE='ACTIVE',WIN='WIN',LOSE='LOSE', SETUP='SETUP'}
export enum TileState {ACTIVE='ACTIVE', CORRECT='CORRECT', WRONG='WRONG'}
export const ApiUrl= 'ws://localhost:1337'
export const ReducerActions= {
    PLAYER_AVAILABLE: 'ma',
    MATCH_UPDATE: 'mu',
    MATCH_TICK: 'mt',
    PLAYER_READY: 'pr',
    PLAYER_ENTERED: 'pe',
    PLAYER_JOIN: 'pj',
    PLAYER_LEFT: 'pl',
    NEW_PHRASE: 'np',
    MATCH_START: 'ms',
    MATCH_WIN: 'mw',
    MATCH_LOST: 'ml',
    MATCH_CLEANUP: 'mc',
    PHRASE_CORRECT: 'pc',
    INIT_SERVER: 'is',
    CONNECTION_ERROR: 'ce',
    CONNECTED: 'c',
    SET_USER: 'su'
}

export const Teams = [
    {
        id: 'team1',
        color: 'url('+require('./client/assets/grayTile.png')+')',
        score: 0,
        leadPlayerId: ''
    },
    {
        id: 'team2',
        color: 'url('+require('./client/assets/whiteTile3.png')+')',
        score: 0,
        leadPlayerId: ''
    },
    {
        id: 'team3',
        color: AppStyles.colors.grey3,
        score: 0,
        leadPlayerId: ''
    },
    {
        id: 'team4',
        color: AppStyles.colors.white,
        score: 0,
        leadPlayerId: ''
    },
]

export const PlayerRune = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K']
