import Vector2 from "./vector2";

class Cell {
    i: number;
    j: number;
    r: number;
    empty: boolean;
    bridgeCnt: number;
    pos: Vector2;


    constructor(i: number, j: number, r: number, bridgeCnt: number = 0, empty: boolean = false) {
        this.i = i;
        this.j = j;
        this.r = r;
        this.bridgeCnt = bridgeCnt;
        this.empty = empty;

        this.pos = this.computeCanvasPosition();
    }

    computeCanvasPosition(): Vector2 {
        this.pos = Vector2.gridToCanvasPosition(this.i, this.j);
        return this.pos;
    }

    equals(other: any): boolean {
        if(!(other instanceof Cell)) return false;

        return this.i == other.i && this.j == other.j;
    }

    static deepCopy(cell: Cell) {
        return new Cell(cell.i, cell.j, cell.r, cell.bridgeCnt, cell.empty);
    }
}

export default Cell;