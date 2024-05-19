function App() {
    const [state, setState] = React.useState(false);

    return (
      <main>
        <h1 id="header">Catan Dice Roll Simulation</h1>

        <section className="main-container">
            <div className="flex-container">
                <h2>Parameters</h2>
            </div>
            <div className="flex-container">
                <input type="number"></input>

                <div className="flex-container-horizontal">
                    <button>Button 1</button>
                    <button>Button 1</button>
                </div>

                <label>
                    <button>Button</button>
                </label>
            </div>
        </section>

        <section className="main-container">
            <div className="flex-container">
                <h2>Simulation</h2>
            </div>
        </section>
      </main>
    );
}

ReactDOM.render(
    <App/>,
    document.getElementById('container')
);