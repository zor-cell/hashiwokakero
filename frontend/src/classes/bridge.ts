import Island from "./island";

class Bridge {
    start: Island;
    end: Island;
    weight: number;

    constructor(start: Island, end: Island, weight: number = 0) {
        this.start = start;
        this.end = end;
        this.weight = weight;
    }
}

export default Bridge;