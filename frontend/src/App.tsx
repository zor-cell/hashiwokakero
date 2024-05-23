import React, {BaseSyntheticEvent, useEffect} from 'react';
import './App.css';
import Grid from "./classes/grid";
import Direction from "./classes/direction";
import GridOptions from "./classes/grid-options";
import Vector2 from "./classes/vector2";

function App() {
    let grid: Grid | null = null;
    const [width, setWidth] = React.useState(800);
    const [height, setHeight] = React.useState(600);

    const [islandCnt, setIslandCnt] = React.useState(20);
    const [lineThreshold, setLineThreshold] = React.useState(8);

    useEffect(() => {
       start();
    }, []);

    function start() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        let options: GridOptions = {
            lineThreshold: lineThreshold
        }
        grid = new Grid(width, height, ctx, options);
        grid.draw();
    }

    function canvasClick(event: React.MouseEvent) {
        if(grid == null) return;
        const canvas = event.target as HTMLCanvasElement;
        const bounds = canvas.getBoundingClientRect();

        let x = event.clientX - bounds.left;
        let y = event.clientY - bounds.top;

        grid.mouseClick(new Vector2(x, y));
    }

  return (
    <div className="App">
      <canvas id="canvas" width={width} height={height} onClick={canvasClick}></canvas>
    </div>
  );
}

export default App;
