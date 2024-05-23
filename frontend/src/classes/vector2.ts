import Grid from "./grid";

class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    plus(v: Vector2): Vector2 {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    minus(v: Vector2): Vector2 {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    divideScalar(l: number): Vector2 {
        return new Vector2(this.x / l, this.y / l);
    }

    multiplyScalar(l: number) : Vector2 {
        return new Vector2(this.x * l, this.y * l);
    }

    magnitude(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dotProduct(v: Vector2): number {
        return this.x * v.x + this.y * v.y;
    }

    crossProduct(v: Vector2): number {
        return this.x * v.y - this.y * v.x;
    }

    unitVector(): Vector2 {
        return this.divideScalar(this.magnitude());
    }

    normalVector(): Vector2 {
        return new Vector2(this.y, -this.x);
    }

    isInRangeOfPoint(v: Vector2, radius: number): boolean {
        let diff = this.minus(v);
        return diff.x * diff.x + diff.y * diff.y <= radius * radius;
    }

    isOnLine(a: Vector2, b: Vector2, threshold: number = 10): boolean {
        let aToB = b.minus(a);
        let thisToA = this.minus(a);

        let len = aToB.x * aToB.x + aToB.y * aToB.y;
        let dot = aToB.dotProduct(thisToA);
        let cross = aToB.crossProduct(thisToA);

        let distance = Math.abs(cross) / Math.sqrt(len);

        return distance <= threshold && dot >= 0 && dot <= len;
    }

    static intersects(start1: Vector2, end1: Vector2, start2: Vector2, end2: Vector2): boolean {
        return Vector2.ccw(start1, start2, end2) != Vector2.ccw(end1, start2, end2) && Vector2.ccw(start1, end1, start2) && Vector2.ccw(start1, end1, end2);
    }

    private static ccw(a: Vector2, b: Vector2, c: Vector2) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    }

    static gridToCanvasPosition(i: number, j: number, sx: number = 0, sy: number = 0): Vector2 {
        const r = Grid.CELL_RADIUS;
        const a = Grid.ANGLE;

        let x = sx + j * (r + r * Math.cos(a));
        let y = sy + i * (2 * r * Math.sin(a));
        if(j > 0 && j % 2 == 1) y += r * Math.sin(a);

        return new Vector2(x, y);
    }
}

export default Vector2;