import Island from "./island";

class Cell {
    i: number;
    j: number;
    island: Island | null;

    constructor(i: number, j: number, island: Island | null) {
        this.i = i;
        this.j = j;
        this.island = island;
    }
}

export default Cell;