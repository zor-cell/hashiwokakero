import Bridge from "./bridge";
import Cell from "./cell";
import Direction from "./direction";
import Vector2 from "./vector2";
import Colors from "./colors";
import GridOptions from "./grid-options";

type OptionalCell = Cell | null;

class Grid {
    private readonly options: GridOptions;
    static readonly CELL_RADIUS = 30;
    static readonly ANGLE = 2 * Math.PI / 6;

    private readonly rows: number;
    private readonly cols: number;
    private readonly width: number;
    private readonly height: number;
    private readonly ctx: CanvasRenderingContext2D;

    private readonly grid: Cell[][];
    private readonly cells: Cell[];
    private readonly bridges: Bridge[];
    private allBridges: Bridge[];

    constructor(canvas: HTMLCanvasElement, options: GridOptions) {
        this.options = options;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ctx.scale(this.options.scale, this.options.scale);

        this.rows = Math.floor(this.height / (Grid.CELL_RADIUS * 2)) + 2;
        this.cols = Math.floor(this.width / (Grid.CELL_RADIUS * 2)) + 6;

        this.cells = [];
        this.bridges = [];

        //init empty grid
        this.grid = new Array<Cell[]>(this.rows);
        for(let i = 0;i < this.rows;i++) {
            this.grid[i] = new Array<Cell>(this.cols);
            for(let j = 0;j < this.cols;j++) {
                this.grid[i][j] = new Cell(i, j, Grid.CELL_RADIUS / 2, 0,true);
            }
        }

        this.createValidGrid();

        //this.bridges = [];
        this.allBridges = this.getAllBridges();

        //add some random bridges
        let notUsed = [];
        for(let bridge of this.allBridges) {
            let i = this.indexOfArray(bridge, this.bridges);
            if(i === -1) notUsed.push(new Bridge(bridge.start, bridge.end, Math.random() < 0.5 ? 1 : 2));
        }

        //console.log(notUsed);

        for(let i = 0;i < Math.floor(notUsed.length / 3);i++) {
            if(this.intersectsAny(notUsed[i])) this.addBridge(notUsed[i]);
        }

        this.computeBridgeCnt();
        //console.log(this.bridges);
        this.bridges = [];
    }

    private createValidGrid() {
        let directions = [Direction.D1, Direction.D2, Direction.D3, Direction.D4, Direction.D5, Direction.D6];

        let i = Math.floor(this.rows / 2);
        let j = Math.floor(this.cols / 2);

        let cell = new Cell(i, j, Grid.CELL_RADIUS / 2);
        this.addCell(Cell.deepCopy(cell));

        for(let c = 1;c <= this.options.islandCnt;c++) {
            let dirIndex = Math.floor(Math.random() * directions.length);
            let dir = directions[dirIndex];

            let n = this.getAdjacentNeighbor(cell.i, cell.j, dir);
            if(n == null) continue;

            this.addBridge(new Bridge(cell, n, Math.random() < 0.5 ? 1 : 2));

            cell = n;
            this.addCell(Cell.deepCopy(cell));
        }
    }

    private intersectsAny(bridge: Bridge) {
        for(let other of this.bridges) {
            //discard bridges starting or ending in the same node
            if(other.equals(bridge) || bridge.start.equals(other.start) || bridge.end.equals(other.end) || bridge.start.equals(other.end) || bridge.end.equals(other.start)) continue;

            //check intersection with bridge
            if (Vector2.intersects(bridge.start.pos, bridge.end.pos, other.start.pos, other.end.pos)) {
                return false;
            }
        }
        return true;
    }

    addCell(cell: Cell) {
        cell.empty = false;
        this.grid[cell.i][cell.j] = cell;

        let index = this.indexOfArray(cell, this.cells);
        if(index === -1) this.cells.push(cell);
        else this.cells[index] = cell;
    }

    removeCell(cell: Cell) {
        let index = this.indexOfArray(cell, this.cells);
        if(index !== -1) {
            this.grid[cell.i][cell.j].empty = true;
            this.cells.splice(index, 1);
        }
    }

    addBridge(bridge: Bridge) {
        let index = this.indexOfArray(bridge, this.bridges);
        if(index === -1) this.bridges.push(bridge);
        else this.bridges[index] = bridge;
    }

    removeBridge(bridge: Bridge) {
        let index = this.indexOfArray(bridge, this.bridges);
        if(index !== -1) {
            this.bridges.splice(index, 1);
        }
    }

    /**
     * Renders the hexagonal grid.
     */
    draw(): void {
        this.ctx.clearRect(0, 0, this.width, this.height);

        //draw line grid
        for(let i = 0;i < this.rows;i++) {
            for (let j = 0; j < this.cols; j++) {
                this.drawLines(i, j);
            }
        }

        //draw current bridges
        for(let bridge of this.bridges) {
            this.drawBridge(bridge);
        }

        //draw cells
        for(let cell of this.cells) {
            this.drawCell(cell);
        }
    }

    mouseClick(mousePos: Vector2): void {
        this.draw();

        //draw hover bridges to neighbors
        for(let cell of this.cells) {
            if(mousePos.isInRangeOfPoint(cell.pos, cell.r)) {
                let neighbors = this.getFirstNeighbors(cell);
                for(let neighbor of neighbors) {
                    this.drawBridge(new Bridge(cell, neighbor, 1), true);
                }
                return;
            }
        }

        //add new bridge
        for(let bridge of this.allBridges) {
            let onLine = mousePos.isOnLine(bridge.start.pos, bridge.end.pos, 8);
            if(onLine) {
                //check bridge intersection
                let valid = true;
                for(let other of this.bridges) {
                    //discard bridges starting or ending in the same node
                    if(other.equals(bridge) || bridge.start.equals(other.start) || bridge.end.equals(other.end) || bridge.start.equals(other.end) || bridge.end.equals(other.start)) continue;

                    //check intersection with bridge
                    if (Vector2.intersects(bridge.start.pos, bridge.end.pos, other.start.pos, other.end.pos)) {
                        valid = false;
                        break;
                    }
                }

                if(valid) {
                    bridge.incrementWeight();
                    this.drawBridge(bridge);
                    break;
                }
            }
        }

        this.draw();
    }

    private drawLines(i: number, j: number) {
        const r = Grid.CELL_RADIUS;

        let pos = Vector2.gridToCanvasPosition(i, j);
        let x = pos.x;
        let y = pos.y;

        this.ctx.beginPath();

        //left
        if(i < this.rows - 1 && j > 0) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - r - r * Math.cos(Grid.ANGLE), y + r * Math.sin(Grid.ANGLE));
        }

        //right
        if(i < this.rows - 1 && j < this.cols - 1) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + r + r * Math.cos(Grid.ANGLE), y + r * Math.sin(Grid.ANGLE));
        }

        //last row left and right
        if(i == this.rows - 1 && j % 2 == 0) {
            //left
            if(j > 0) {
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - r - r * Math.cos(Grid.ANGLE), y + r * Math.sin(Grid.ANGLE));
            }

            //right
            if(j < this.cols - 1) {
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + r + r * Math.cos(Grid.ANGLE), y + r * Math.sin(Grid.ANGLE));
            }
        }

        //down
        if(i < this.rows - 1) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + 2 * r * Math.sin(Grid.ANGLE));
        }

        this.ctx.closePath();

        this.ctx.lineWidth = Colors.BACKGROUND_LINE_WIDTH;
        this.ctx.strokeStyle = Colors.BACKGROUND_COLOR;
        this.ctx.stroke();
    }

    private drawBridge(bridge: Bridge, showHover: boolean = false) {
        let startPos = bridge.start.pos;
        let endPos = bridge.end.pos;

        this.ctx.beginPath();
        if(showHover) {
            this.ctx.moveTo(startPos.x, startPos.y);
            this.ctx.lineTo(endPos.x, endPos.y);

            this.ctx.lineWidth = Colors.HOVER_LINE_WIDTH;
            this.ctx.strokeStyle = Colors.HOVER_COLOR;
        } else {
            if(bridge.weight > 0) this.addBridge(bridge);

            if (bridge.weight == 1) {
                this.ctx.moveTo(startPos.x, startPos.y);
                this.ctx.lineTo(endPos.x, endPos.y);

                this.ctx.lineWidth = Colors.BRIDGE_LINE_WIDTH;
                this.ctx.strokeStyle = Colors.BRIDGE_COLOR;
            } else if (bridge.weight == 2) {
                let offset = endPos.minus(startPos).normalVector().unitVector().multiplyScalar(3);
                let leftStartPos = startPos.plus(offset);
                let leftEndPos = endPos.plus(offset);
                this.ctx.moveTo(leftStartPos.x, leftStartPos.y);
                this.ctx.lineTo(leftEndPos.x, leftEndPos.y);

                let rightStartPos = startPos.minus(offset);
                let rightEndPos = endPos.minus(offset);
                this.ctx.moveTo(rightStartPos.x, rightStartPos.y);
                this.ctx.lineTo(rightEndPos.x, rightEndPos.y);

                this.ctx.lineWidth = Colors.BRIDGE_LINE_WIDTH;
                this.ctx.strokeStyle = Colors.BRIDGE_COLOR;
            } else {
                this.removeBridge(bridge);
            }
        }


        this.ctx.closePath();
        this.ctx.stroke();

        this.drawCell(bridge.start);
        this.drawCell(bridge.end);
    }

    private drawCell(cell: Cell) {
        let pos = cell.pos;
        let x = pos.x;
        let y = pos.y;

        let cnt = 0;
        for(let bridge of this.bridges) {
            if(cell.equals(bridge.start) || cell.equals(bridge.end)) {
                cnt += bridge.weight;
            }
        }
        if(cnt === cell.bridgeCnt) {
            this.ctx.fillStyle = Colors.CELL_FULL_COLOR;
        } else if(cnt > 0) {
            this.ctx.fillStyle = Colors.CELL_ACTIVE_COLOR;
        } else {
            this.ctx.fillStyle = Colors.CELL_EMPTY_COLOR;
        }

        //render hexagon
        this.ctx.beginPath();
        for(let i = 0;i < 6;i++) {
            this.ctx.lineTo(x + cell.r * Math.cos(Grid.ANGLE * i), y + cell.r * Math.sin(Grid.ANGLE * i));
        }
        this.ctx.closePath();

        this.ctx.fill();
        this.ctx.lineWidth = Colors.CELL_BORDER_LINE_WIDTH;
        this.ctx.strokeStyle = Colors.CELL_BORDER_COLOR;
        this.ctx.stroke();

        //render text
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = Colors.CELL_TEXT_COLOR;
        this.ctx.fillText(cell.bridgeCnt.toString(), x, y);
    }

    private indexOfArray(element: any, array: any[]) {
        for(let i = 0;i < array.length;i++) {
            if(element.equals(array[i])) {
                return i;
            }
        }

        return -1;
    }

    private computeBridgeCnt() {
        for(let cell of this.cells) {
            let cnt = 0;
            for(let bridge of this.bridges) {
                if(cell.equals(bridge.start) || cell.equals(bridge.end)) {
                    cnt += bridge.weight;
                }
            }
            cell.bridgeCnt = cnt;
        }
    }

    /**
     * Retrieves all possible bridges in the current grid.
     * Identical bridges are only added once, a bridge from a -> b, is identical to the bridge b -> a.
     */
    private getAllBridges(): Bridge[] {
        let res: Bridge[] = [];

        for(let cell of this.cells) {
            let neighbors = this.getFirstNeighbors(cell);

            for(let neighbor of neighbors) {
                let bridge = new Bridge(cell, neighbor);

                let index = this.indexOfArray(bridge, res);
                if(index === -1) res.push(bridge);
            }
        }

        return res;
    }

    /**
     * Retrieves all neighbors of a given position.
     * @param cell the row of the position
     */
    getFirstNeighbors(cell: Cell): Cell[] {
        let directions = [Direction.D1, Direction.D2, Direction.D3, Direction.D4, Direction.D5, Direction.D6];
        let neighbors: Cell[] = [];

        for(let dir of directions) {
            let neighbor = this.getFirstNeighbor(cell, dir);
            if(neighbor !== null) {
                neighbor.computeCanvasPosition();
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * Retrieves the first neighbor of a position in a given direction
     * @param cell the row of the position
     * @param d the direction to look in
     */
    private getFirstNeighbor(cell: Cell, d: Direction) : OptionalCell {
        let cur = this.getAdjacentNeighbor(cell.i, cell.j, d);
        if(cur === null) return null;

        while(cur.empty) {
            cur = this.getAdjacentNeighbor(cur.i, cur.j, d);
            if(cur === null) return null;
        }

        return cur;
    }

    /**
     * Retrieves the directly adjacent neighbor of a position in a given direction.
     * @param i the row of the position
     * @param j the column of the position
     * @param d the direction to look in
     */
    private getAdjacentNeighbor(i : number, j: number, d: Direction): OptionalCell {
        if(i < 0 || i > this.rows - 1 || j < 0 || j > this.cols - 1) return null;

        //up and down are the same for each position
        if (d == Direction.D2 && i > 0) {
            return this.grid[i - 1][j];
        } else if (d == Direction.D5 && i < this.rows - 1) {
            return this.grid[i + 1][j];
        }

        if(j % 2 == 1) {
            if (d == Direction.D1 && j > 0) {
                return this.grid[i][j - 1];
            } else if (d == Direction.D3 && j < this.cols - 1) {
                return this.grid[i][j + 1];
            } else if (d == Direction.D4 && i < this.rows - 1 && j < this.cols - 1) {
                return this.grid[i + 1][j + 1];
            } else if (d == Direction.D6 && i < this.rows - 1 && j > 0) {
                return this.grid[i + 1][j - 1];
            }
        } else {
            if (d == Direction.D1 && i > 0 && j > 0) {
                return this.grid[i - 1][j - 1];
            } else if (d == Direction.D3 && i > 0 && j < this.cols - 1) {
                return this.grid[i - 1][j + 1];
            } else if (d == Direction.D4 && j < this.cols - 1) {
                return this.grid[i][j + 1];
            } else if (d == Direction.D6 && j > 0) {
                return this.grid[i][j - 1];
            }
        }

        return null;
    }
}

export default Grid;