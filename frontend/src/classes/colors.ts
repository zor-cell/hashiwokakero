abstract class Colors {
    static readonly BACKGROUND_COLOR = "rgba(200, 200, 200, 0.8)";
    static readonly BACKGROUND_LINE_WIDTH = 1;

    static readonly BRIDGE_COLOR = "rgb(255, 190, 0)";
    static readonly BRIDGE_LINE_WIDTH = 2;

    static readonly HOVER_COLOR = "rgba(255, 190, 0, 0.3)";//"rgba(150, 150, 150, 0.6)";
    static readonly HOVER_LINE_WIDTH = 8;

    static readonly CELL_BORDER_COLOR = Colors.BRIDGE_COLOR;//"rgb(0, 0, 0)"
    static readonly CELL_BORDER_LINE_WIDTH = 1;
    static readonly CELL_TEXT_COLOR = "rgb(0, 0, 0)"

    static readonly CELL_EMPTY_COLOR = "rgb(255, 255, 255)";
    static readonly CELL_ACTIVE_COLOR = Colors.BRIDGE_COLOR;
    static readonly CELL_FULL_COLOR = "rgb(0, 200, 0)";
}

export default Colors;