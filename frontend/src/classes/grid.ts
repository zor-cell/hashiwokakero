import Island from "./island";
import Direction from "./direction";
import Cell from "./cell";

class Grid {
    rows: number;
    cols: number;
    grid!: (Island | null)[][];
    ctx: CanvasRenderingContext2D;

    constructor(rows: number, cols: number, ctx: CanvasRenderingContext2D) {
        this.rows = rows;
        this.cols = cols;
        this.ctx = ctx;

        this.initGrid();
    }

    private initGrid(): void {
        this.grid = new Array<Island[]>(this.rows);
        for(let i = 0;i < this.rows;i++) {
            this.grid[i] = new Array<Island>(this.cols);
            for(let j = 0;j < this.cols;j++) {
                this.grid[i][j] = null;
            }
        }

        /*for(let c = 1;c <= 10;c++) {
            let i = Math.floor(Math.random() * this.rows);
            let j = Math.floor(Math.random() * this.cols);

            this.grid[i][j] = new Island(c % 10);
        }*/
    }

    private drawHexagon(i: number, j: number, x: number, y: number, r = 10, angle = 2 * Math.PI / 6) {
        //render hexagon
        this.ctx.beginPath();
        for(let i = 0;i < 6;i++) {
            this.ctx.lineTo(x + r * Math.cos(angle * i), y + r * Math.sin(angle * i));
        }
        this.ctx.closePath();
        this.ctx.stroke();

        if(this.grid[i][j]?.bridgeCnt) this.ctx.fillStyle = "#ffffff";
        else {
            if(i % 2 == 0) this.ctx.fillStyle = "#dddddd";
            else this.ctx.fillStyle = "#bbbbbb";
        }
        this.ctx.fill();

        //render text
        if(this.grid[i][j] != null) {
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = "#000000";
            this.ctx.fillText(this.grid[i][j]!.bridgeCnt.toString(), x, y);
        }
    }

    /**
     * Retrieves the directly adjacent neighbor of a position in a given direction.
     * @param i the row of the position
     * @param j the column of the position
     * @param d the direction to look in
     */
    private getAdjacentNeighbor(i : number, j: number, d: Direction): Cell {
        let cell = new Cell(-1, -1, null);

        //up and down are the same for each position
        if (d == Direction.D2 && i > 0) {
            cell.i = i - 1;
            cell.j = j;
            cell.island = this.grid[cell.i][cell.j];
            return cell;
        } else if (d == Direction.D5 && i < this.rows - 1) {
            cell.i = i + 1;
            cell.j = j;
            cell.island = this.grid[cell.i][cell.j];
            return cell;
        }

        if(j % 2 == 1) {
            if (d == Direction.D1 && j > 0) {
                cell.i = i;
                cell.j = j - 1;
            } else if (d == Direction.D3 && j < this.cols - 1) {
                cell.i = i;
                cell.j = j + 1;
            } else if (d == Direction.D4 && i < this.rows - 1 && j < this.cols - 1) {
                cell.i = i + 1;
                cell.j = j + 1
            } else if (d == Direction.D6 && i < this.rows - 1 && j > 0) {
                cell.i = i + 1;
                cell.j = j - 1;
            } else {
                return cell;
            }
        } else {
            if (d == Direction.D1 && i > 0 && j > 0) {
                cell.i = i - 1;
                cell.j = j - 1;
            } else if (d == Direction.D3 && i > 0 && j < this.cols - 1) {
                cell.i = i - 1;
                cell.j = j + 1;
            } else if (d == Direction.D4 && j < this.cols - 1) {
                cell.i = i;
                cell.j = j + 1
            } else if (d == Direction.D6 && j > 0) {
                cell.i = i;
                cell.j = j - 1;
            } else {
                return cell;
            }
        }

        cell.island = this.grid[cell.i][cell.j];
        return cell;
    }

    /**
     * Retrieves the first neighbor of a position in a given direction
     * @param i the row of the position
     * @param j the column of the position
     * @param d the direction to look in
     */
    private getFirstNeighbor(i: number, j: number, d: Direction) : Island | null {
        let cur = this.getAdjacentNeighbor(i, j, d);
        if(cur.i == -1 && cur.j == -1) return null;

        while(cur.island === null) {
            cur = this.getAdjacentNeighbor(cur.i, cur.j, d);
            if(cur.i == -1 && cur.j == -1) return null;
        }

        return cur.island;
    }

    /**
     * Renders the hexagonal grid.
     */
    draw(): void {
        this.ctx.clearRect(0, 0, 400, 400);

        const r: number = 20;
        const angle: number = 2 * Math.PI / 6;

        let sx = r;
        let sy = r;
        for(let i = 0;i < this.rows;i++) {
            let y = sy + i * (2 * r * Math.sin(angle));
            for (let j = 0; j < this.cols; j++) {
                let x = sx + j * (r + r * Math.cos(angle));
                if(j > 0) y = y + Math.pow(-1, j + 1) * (r * Math.sin(angle));

                this.drawHexagon(i, j, x, y, r, angle);
            }
        }
    }

    /**
     * Retrieves all neighbors of a given position.
     * @param i the row of the position
     * @param j the column of the position
     */
    getFirstNeighbors(i: number, j: number): Island[] {
        let directions = [Direction.D1, Direction.D2, Direction.D3, Direction.D4, Direction.D5, Direction.D6];
        let neighbors: Island[] = [];

        for(let dir of directions) {
            let neighbor = this.getFirstNeighbor(i, j, dir);
            if(neighbor != null) neighbors.push(neighbor);
        }

        return neighbors;
    }
}

export default Grid;