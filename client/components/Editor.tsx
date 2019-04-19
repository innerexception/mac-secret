import * as React from 'react';
import AppStyles from '../AppStyles';
import { TopBar } from './Shared';
import { EmptyTile, TileSubType, TileType } from '../../enum'
import { LightButton, Button } from './Shared'
import { getRandomInt } from './Util'

export default class Editor extends React.Component {

    state = { 
        map: [[EmptyTile]],
        selectedTile: EmptyTile,
        tileBrush: TileType.GRASS
    }

    exportMapJson = () => {
        console.log(JSON.stringify(this.state.map))
    }

    setTileType = (tile:Tile, type:TileType) => {
        let newTile = {
            ...tile,
            player: null as null,
            item: null as null,
            weapon: null as null,
            type,
            subType: (TileSubType as any)[type][getRandomInt((TileSubType as any)[type].length)]
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile, tileBrush: type})
    }

    setTileItemSpawn = () => {
        let newTile = {
            ...this.state.selectedTile,
            itemSpawn: true
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    setTileWeaponSpawn = () => {
        let newTile = {
            ...this.state.selectedTile,
            weaponSpawn: true
        }
        this.state.map[this.state.selectedTile.x][this.state.selectedTile.y] = newTile
        this.setState({map: this.state.map, selectedTile:newTile})
    }

    setMapWidth = (w:number) => {
        let map = new Array(w).fill([])
        this.setState({map})
    }

    setMapHeight = (h: number) => {
        let map = this.state.map.map((row, x) => new Array(h).fill({...EmptyTile, x}))
        map = map.map((row, x) => row.map((tile, y) => {return {...tile, y}}))
        this.setState({map})
    }

    render(){
        return (
            <div style={{...AppStyles.window, padding:'0.5em', maxWidth:'25em'}}>
                {TopBar('Editor')}
                <div>
                    W: <input type='number' value={this.state.map.length} onChange={(e)=>this.setMapWidth(+e.currentTarget.value)}/>
                    H: <input type='number' value={this.state.map[0].length} onChange={(e)=>this.setMapHeight(+e.currentTarget.value)}/>
                </div>
                <div style={styles.tileInfo}>
                    <h4 style={{margin:0}}>{this.state.selectedTile.type} {this.state.selectedTile.x}, {this.state.selectedTile.y}</h4>
                    <div style={{display:'flex'}}>
                        {Object.keys(TileType).map((key:TileType) => LightButton(true, ()=>this.setState({tileBrush: key}), key))}
                    </div>
                    {LightButton(true, this.setTileItemSpawn, 'Item Spawn')}
                    {LightButton(true, this.setTileWeaponSpawn, 'Weapon Spawn')}
                </div>
                <div style={styles.mapFrame}>
                    <div style={{display:'flex'}}>
                        {this.state.map.map((row) => 
                            <div>
                                {row.map((tile:Tile) => 
                                    <div style={{
                                            ...styles.tile, 
                                            background: 'transparent',
                                            borderStyle: isSelectedTile(tile, this.state.selectedTile) ? 'dashed' : 'dotted'
                                        }} 
                                        onClick={()=>this.setTileType(tile, this.state.tileBrush)}> 
                                        <div style={{fontFamily:'Terrain', color: AppStyles.colors.grey3, fontSize:'2em'}}>{tile.subType}</div>
                                        {tile.itemSpawn && <div style={{fontFamily:'Item', color: AppStyles.colors.grey3, fontSize:'0.5em', textAlign:'left'}}>a</div>}
                                        {tile.weaponSpawn && <div style={{fontFamily:'Gun', color: AppStyles.colors.grey3, fontSize:'0.5em', textAlign: 'right'}}>a</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {Button(true, this.exportMapJson, 'Export')}
            </div>
        )
    }
}

const isSelectedTile = (tile:Tile, selectedTile?:Tile) => {
    if(selectedTile){
        return tile.x === selectedTile.x && tile.y === selectedTile.y
    }
    return false
}

const styles = {
    mapFrame: {
        position:'relative' as 'relative',
        backgroundImage: 'url('+require('../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        overflow:'auto',
        maxHeight:'60vh',
        maxWidth:'100%'
    },
    tileInfo: {
        height: '5em',
        backgroundImage: 'url('+require('../assets/whiteTile.png')+')',
        backgroundRepeat: 'repeat',
        marginBottom: '0.5em',
        padding: '0.5em',
        border: '1px dotted',
        display:'flex',
        justifyContent:'space-between',
        flexWrap:'wrap' as 'wrap'
    },
    tile: {
        width: '2em',
        height:'2em',
        border: '1px',
        position:'relative' as 'relative'
    },
}