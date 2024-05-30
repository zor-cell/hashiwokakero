import React, {useEffect} from 'react';
import './App.css';
import GridOptions from "./classes/grid-options";
import Vector2 from "./classes/vector2";
import Grid from "./classes/grid";

function App() {
    let grid: Grid | null = null;
    const [width, setWidth] = React.useState(400);
    const [height, setHeight] = React.useState(300);

    const [cellRadius, setCellRadius] = React.useState(30);
    const [scale, setScale] = React.useState(1);
    const [islandCnt, setIslandCnt] = React.useState(20);
    const [lineThreshold, setLineThreshold] = React.useState(8);

    useEffect(() => {
        console.log("update")
        setWidth(Math.min(window.innerWidth, 800));
        setHeight(Math.min(window.innerHeight / 2, 400));
    }, []);

    function canvasClick(event: React.MouseEvent) {
        if(grid == null) return;
        const canvas = event.target as HTMLCanvasElement;
        const bounds = canvas.getBoundingClientRect();

        let x = event.clientX - bounds.left;
        let y = event.clientY - bounds.top;

        grid.mouseClick(new Vector2(x, y));
    }

    function changeIslandCnt(event: any) {
        setIslandCnt(event.target.value);
    }

    function changeScale(event: any) {
        setScale(event.target.value);
    }

    function changeCellRadius(event: any) {
        setCellRadius(event.target.value);
    }

    function generateGrid() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;

        let options: GridOptions = {
            lineThreshold: lineThreshold,
            cellRadius: cellRadius,
            islandCnt: islandCnt,
            scale: scale
        }
        grid = new Grid(canvas, options);
        grid.draw();
    }

  return (
    <div className="App">
        <div className="flex settings">
            <div className="flex">
                <label htmlFor="islandCntInput">Island count:</label>
                <input name="islandCntInput" type="number" min={1} value={islandCnt} onChange={changeIslandCnt}/>
            </div>
            <div className="flex">
                <label htmlFor="cellRadiusInput">Cell Radius:</label>
                <input name="cellRadiusInput" type="number" min={15} value={cellRadius} onChange={changeCellRadius}/>
            </div>
            <div className="flex">
                <label htmlFor="scaleInput">Scale:</label>
                <input name="scaleInput" type="number" min={0.1} step={0.1} value={scale} onChange={changeScale}/>
            </div>

            <button onClick={generateGrid}>Generate</button>
        </div>

        <canvas id="canvas" width={width + 'px'} height={height + 'px'} onClick={canvasClick}></canvas>
    </div>
  );
}

export default App;
