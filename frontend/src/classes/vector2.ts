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

        let squaredLen = aToB.x * aToB.x + aToB.y * aToB.y;
        let dot = aToB.dotProduct(thisToA);
        let cross = aToB.crossProduct(thisToA);

        //u x v = A, area of parallelogram spread out by vectors, area of parallelogram is a * ha
        //-> (u x v) / |v| = ha -> distance of u and v
        let distance = Math.abs(cross) / Math.sqrt(squaredLen);

        //u.v < 0 -> v to the left of u
        //((v.u)/|u|^2) * u = proj, scalar projection
        //v.u > |u|^2 -> |proj| > |u| -> v to the right of u
        return distance <= threshold && dot >= 0 && dot <= squaredLen;
    }

    static gridToCanvasPosition(i: number, j: number, sx: number = 0, sy: number = 0): Vector2 {
        const r = Grid.CELL_RADIUS;
        const a = Grid.ANGLE;

        let x = sx + j * (r + r * Math.cos(a));
        let y = sy + i * (2 * r * Math.sin(a));
        if(j > 0 && j % 2 == 1) y += r * Math.sin(a);

        return new Vector2(x, y);
    }

    static intersects(p1: Vector2, q1: Vector2, p2: Vector2, q2: Vector2): boolean {
        let o1 = Vector2.orientation(p1, q1, p2);
        let o2 = Vector2.orientation(p1, q1, q2);
        let o3 = Vector2.orientation(p2, q2, p1);
        let o4 = Vector2.orientation(p2, q2, q1);

        // general case
        if (o1 != o2 && o3 != o4)
            return true;

        // Special Cases
        // p1, q1 and p2 are collinear and p2 lies on segment p1q1
        if (o1 == 0 && Vector2.onSegment(p1, p2, q1)) return true;

        // p1, q1 and q2 are collinear and q2 lies on segment p1q1
        if (o2 == 0 && Vector2.onSegment(p1, q2, q1)) return true;

        // p2, q2 and p1 are collinear and p1 lies on segment p2q2
        if (o3 == 0 && Vector2.onSegment(p2, p1, q2)) return true;

        // p2, q2 and q1 are collinear and q1 lies on segment p2q2
        if (o4 == 0 && Vector2.onSegment(p2, q1, q2)) return true;

        return false; // Doesn't fall in any of the above cases
    }

    private static orientation(p: Vector2, q: Vector2, r: Vector2) {
        let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

        if (val == 0) return 0; // collinear

        return (val > 0) ? 1: 2; // clock or counterclock wise
    }

    private static onSegment(p: Vector2, q: Vector2, r: Vector2) {
        if(q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) return true;

        return false;
    }
}

export default Vector2;