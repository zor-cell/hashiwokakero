import Island from "./island";
import Direction from "./direction";
import Cell from "./cell";
import Bridge from "./bridge";
import Vector2 from "./vector2";
import GridOptions from "./grid-options";
import Colors from "./colors";

class Grid {
    static readonly CELL_RADIUS: number = 30;
    static readonly ANGLE: number = 2 * Math.PI/ 6;

    private readonly width: number;
    private readonly height: number;
    private readonly rows: number;
    private readonly cols: number;
    private readonly options: GridOptions;

    private cells: Cell[] = [];
    private possibleBridges: Bridge[] = [];
    private currentBridges: Bridge[] = [];


    grid!: (Island | null)[][];
    ctx: CanvasRenderingContext2D;

    constructor(width: number, height: number, ctx: CanvasRenderingContext2D, options: GridOptions) {
        this.options = options;
        this.width = width;
        this.height = height;
        this.ctx = ctx;

        this.rows = Math.floor(this.height / (Grid.CELL_RADIUS * 2)) + 2;
        this.cols = Math.floor(this.width / (Grid.CELL_RADIUS * 2)) + 6;

        this.initGrid();

        this.possibleBridges = this.getPossibleBridges();
    }

    private initGrid(): void {
        this.grid = new Array<Island[]>(this.rows);
        for(let i = 0;i < this.rows;i++) {
            this.grid[i] = new Array<Island>(this.cols);
            for(let j = 0;j < this.cols;j++) {
                this.grid[i][j] = null;
            }
        }

        for(let c = 1;c <= 20;c++) {
            let i = Math.floor(Math.random() * (this.rows - 2) + 1);
            let j = Math.floor(Math.random() * (this.cols - 2) + 1);

            let island = new Island(c);

            if(this.grid[i][j] == null) {
                this.grid[i][j] = island;

                let cell = new Cell(i, j, Grid.CELL_RADIUS / 2, island);
                this.cells.push(cell);
            }
        }
    }

    private createValidGrid(): void {

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
            if(this.currentBridges.indexOf(bridge) == -1) this.currentBridges.push(bridge);

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
                let index = this.currentBridges.indexOf(bridge);
                if(index != -1) this.currentBridges.splice(index, 1);
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
        for(let bridge of this.currentBridges) {
            if(cell.equals(bridge.start) || cell.equals(bridge.end)) {
                cnt += bridge.weight;
            }
        }
        if(cnt === cell.island?.bridgeCnt) {
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
        this.ctx.fillText(cell.island!.bridgeCnt.toString(), x, y);
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
        for(let bridge of this.currentBridges) {
            this.drawBridge(bridge);
        }

        //draw cells
        for(let cell of this.cells) {
            this.drawCell(cell);
        }
    }

    /**
     * Handles mouse presses from the user.
     * @param mousePos the position where the mouse was pressed
     */
    mouseClick(mousePos: Vector2): void {
        this.draw();

        //draw hover bridges to neighbors
        for(let cell of this.cells) {
            if(mousePos.isInRangeOfPoint(cell.pos, cell.r)) {
                let neighbors = this.getFirstNeighbors(cell.i, cell.j);
                for(let neighbor of neighbors) {
                    this.drawBridge(new Bridge(cell, neighbor, 1), true);
                }
                return;
            }
        }

        //add new bridge
        for(let bridge of this.possibleBridges) {
            let onLine = mousePos.isOnLine(bridge.start.pos, bridge.end.pos, this.options.lineThreshold);
            if(onLine) {
                //check bridge intersection
                let valid = true;
                for(let other of this.currentBridges) {
                    if(other.equals(bridge)) continue;

                    /*if(Vector2.intersects(bridge.start.pos, bridge.end.pos, other.start.pos, other.end.pos)) {
                        valid = false;
                        console.log("intersects: ", other);
                        break;
                    }*/
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

    /**
     * Retrieves all possible bridges in the current grid.
     * Identical bridges are only added once, a bridge from a -> b, is identical to the bridge b -> a.
     */
    private getPossibleBridges(): Bridge[] {
        let bridges: Bridge[] = [];
        for(let cell of this.cells) {
            let neighbors = this.getFirstNeighbors(cell.i, cell.j);

            for(let neighbor of neighbors) {
                let bridge = new Bridge(cell, neighbor);

                let found = false;
                for(let stored of bridges) {
                    if(bridge.equals(stored)) {
                        found = true;
                        break;
                    }
                }

                if(!found) bridges.push(bridge);
            }
        }

        return bridges;
    }

    /**
     * Retrieves all neighbors of a given position.
     * @param i the row of the position
     * @param j the column of the position
     */
    getFirstNeighbors(i: number, j: number): Cell[] {
        let directions = [Direction.D1, Direction.D2, Direction.D3, Direction.D4, Direction.D5, Direction.D6];
        let neighbors: Cell[] = [];

        for(let dir of directions) {
            let neighbor = this.getFirstNeighbor(i, j, dir);
            if(neighbor != null) {
                neighbor.computeCanvasPosition();
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * Retrieves the directly adjacent neighbor of a position in a given direction.
     * @param i the row of the position
     * @param j the column of the position
     * @param d the direction to look in
     */
    private getAdjacentNeighbor(i : number, j: number, d: Direction): Cell {
        let cell = new Cell(-1, -1,Grid.CELL_RADIUS / 2, null);

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
    private getFirstNeighbor(i: number, j: number, d: Direction) : Cell | null {
        let cur = this.getAdjacentNeighbor(i, j, d);
        if(cur.i == -1 && cur.j == -1) return null;

        while(cur.island === null) {
            cur = this.getAdjacentNeighbor(cur.i, cur.j, d);
            if(cur.i == -1 && cur.j == -1) return null;
        }

        return cur;
    }
}

export default Grid;