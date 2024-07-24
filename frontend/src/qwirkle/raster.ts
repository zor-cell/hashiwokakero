import {Tile} from "./tile";
import {Position} from "./position";
import {Shape} from "./shape";
import {Color} from "./color";

export class Raster {
    private grid: Map<Position, Tile>;

    constructor() {
        this.grid = new Map<Position, Tile>();

        let pos = {i: 0, j: 0};
        let redCircle = new Tile(pos, Color.RED, Shape.CIRCLE);

        pos = {i: 0, j: 1};
        let purpleCircle = new Tile(pos, Color.PURPLE, Shape.CIRCLE);

        this.add(redCircle);
        this.add(purpleCircle);
    }

    add(tile: Tile) {
        this.grid.set(tile.position, tile);
    }


    getPartitions(tiles: Tile[]): Set<Tile>[] {
        let partitions: Set<Tile>[] = [];

        for(let i = 0;i < tiles.length;i++) {
            let cur = tiles[i];
            let color = cur.color;
            let shape = cur.shape;

            //find all partitions with matching colors and all partitions with matching shape in different iterations
            for(let t = 0;t < 2;t++) {
                for (let j = 0; j < tiles.length && j != i; j++) {
                    let other = tiles[j];

                    if(t === 0) {
                        let sameColorMissingShape = color === other.color && (shape & other.shape) === 0;
                        if(sameColorMissingShape) {
                            color |= other.color;
                        }
                    } else {
                        let sameShapeMissingColor = shape === other.shape && (color & other.color) === 0;
                    }
                }
            }
        }

        return partitions;
    }

    getLegalPositions(tile: Tile): Set<Position> {
        let legal = new Set<Position>();

        let free = this.getFreePositions();
        for(let pos of Array.from(free.keys())) {
            if(this.isLegalPosition(pos, tile)) {
                legal.add(pos);
            }
        }

        return legal;
    }

    //retrieves all open raster spots, ie all neighbor tile fields that are not occupied
    getFreePositions(): Set<Position> {
        let free = new Set<Position>();

        let di = [-1, 1, 0, 0];
        let dj = [0, 0, -1, 1];
        for(let tile of Array.from(this.grid.values())) {
            for(let d = 0;d < 4;d++) {
                let pos: Position = {i: tile.position.i + di[d], j: tile.position.j + dj[d]};

                if(!this.grid.has(pos)) {
                    free.add(pos);
                }
            }
        }

        return free;
    }

    //indicates whether the tile placement would be valid
    isLegalPosition(position: Position, tile: Tile): boolean {
        //cannot be placed if position is already occupied
        if(this.grid.has(position)) return false;

        //go through all 4 directions from the tile
        let di = [-1, 1, 0, 0];
        let dj = [0, 0, -1, 1];
        for(let d = 0;d < 4;d++) {
            let pos: Position = {i: position.i + di[d], j: position.j + dj[d]};
            let color = Color.NONE;
            let shape = Shape.NONE;

            //accumulate neighbors colors and shapes in current direction
            while(this.grid.has(pos)) {
                let neighbor = this.grid.get(pos)!;

                color |= neighbor.color;
                shape |= neighbor.shape;

                pos = {i: pos.i + di[d], j: pos.j + dj[d]};
            }

            //the neighbors in the current direction have: the same color as the tile, do not contain the shape of the tile
            let sameColorMissingShape = color === tile.color && (shape & tile.shape) === 0;
            //the neighbors in the current direction have: the same shape as the tile, do not contain the color of the tile
            let sameShapeMissingColor = shape === tile.shape && (color & tile.color) === 0;

            //if the tile does not match color or shape, it cannot be placed
            if(!sameColorMissingShape && !sameShapeMissingColor) return false;
        }

        return true;
    }
}