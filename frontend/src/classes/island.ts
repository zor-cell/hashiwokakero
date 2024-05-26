import Bridge from "./bridge";

class Island {
    bridgeCnt: number;

    constructor(bridgeCnt: number) {
        this.bridgeCnt = bridgeCnt;
    }

    static deepCopy(island: Island) {
        return new Island(island.bridgeCnt)
    }
}

export default Island;