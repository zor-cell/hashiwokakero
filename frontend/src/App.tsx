import React, {useEffect} from 'react';
import './App.css';
import Grid from "./classes/grid";
import Direction from "./classes/direction";

function App() {
    useEffect(() => {
       test();
    }, []);

    function test() {
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        let grid = new Grid(10, 10, ctx);
        grid.draw();

        let f = grid.getFirstNeighbors(0, 0);

        grid.draw();
        console.log("neighbors:", f);
    }

  return (
    <div className="App">
      <canvas id="canvas" width='400px' height='400px'></canvas>
    </div>
  );
}

export default App;
