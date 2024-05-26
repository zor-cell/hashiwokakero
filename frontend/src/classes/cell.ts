import Island from "./island";
import Vector2 from "./vector2";

class Cell {
    i: number;
    j: number;
    r: number;
    island: Island | null;
    pos: Vector2;

    constructor(i: number, j: number, r: number, island: Island | null) {
        this.i = i;
        this.j = j;
        this.r = r;
        this.island = island;

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
        return new Cell(cell.i, cell.j, cell.r, cell.island == null ? null : Island.deepCopy(cell.island));
    }
}

export default Cell;