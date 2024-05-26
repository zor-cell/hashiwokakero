import React, {useEffect} from 'react';
import './App.css';
import Grid from "./classes/grid";
import GridOptions from "./classes/grid-options";
import Vector2 from "./classes/vector2";

function App() {
    let grid: Grid | null = null;
    const [width, setWidth] = React.useState(400);
    const [height, setHeight] = React.useState(400);

    const [islandCnt, setIslandCnt] = React.useState(20);
    const [lineThreshold, setLineThreshold] = React.useState(8);

    useEffect(() => {
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

    function generateGrid() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        let options: GridOptions = {
            lineThreshold: lineThreshold,
            islandCnt: islandCnt
        }
        grid = new Grid(width, height, ctx, options);
        grid.draw();
    }

  return (
    <div className="App">
        <div className="settings">
            <label>
                Island count: <input type="number" value={islandCnt} onChange={changeIslandCnt}/>
            </label>

            <button onClick={generateGrid}>Generate</button>

        </div>

      <canvas id="canvas" width={width} height={height} onClick={canvasClick}></canvas>
    </div>
  );
}

export default App;
