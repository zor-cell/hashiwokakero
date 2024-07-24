import {Position} from "./position";
import {Color} from "./color";
import {Shape} from "./shape";

export class Tile {
    public position: Position;
    public color: Color;
    public shape: Shape;

    constructor(position: Position, color: Color, shape: Shape) {
        this.position = position;
        this.color = color;
        this.shape = shape;
    }
}