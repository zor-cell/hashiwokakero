import Bridge from "./bridge";

class Island {
    bridgeCnt: number;
    bridges: Bridge[];

    constructor(bridgeCnt: number, bridges: Bridge[] = new Array(bridgeCnt)) {
        this.bridgeCnt = bridgeCnt;
        this.bridges = bridges;
    }
}

export default Island;