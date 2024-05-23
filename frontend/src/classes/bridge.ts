import BridgeState from "./bridgestate";
import Cell from "./cell";

class Bridge {
    start: Cell;
    end: Cell;
    weight: number;
    state: BridgeState;

    constructor(start: Cell, end: Cell, weight: number = 0) {
        this.start = start;
        this.end = end;
        this.weight = weight;
        this.state = BridgeState.INACTIVE
    }

    incrementWeight(increment: number = 1): void {
        this.weight = (this.weight + increment) % 3;
    }

    equals(other: any): boolean {
        if(!(other instanceof Bridge)) return false;

        const bridge = other as Bridge;

        return (this.start.equals(other.start) && this.end.equals(other.end))
            || (this.end.equals(other.start) && this.start.equals(other.end));
    }
}

export default Bridge;