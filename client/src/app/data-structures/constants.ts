import { LineDashStyle, LineJoinStyle } from './line-styles';

export const DRAWING_KEYS_COUNT = 7;
export const DEFAULT_LINEJOIN = 'round';
export const DEFAULT_DASHARRAY = 'none';
export const DEFAULT_LINECAP = 'butt';
export const STRAIGHT_ENDS = 'butt';
export const CURVY_ENDS = 'round';
export const LINEJOIN_ANGLE = 'miter';
export const LINEJOIN_ROUND = 'round';
export const DEFAULT_LINEJOINSTYLE = LineJoinStyle.Round;
export const DEFAULT_LINEDASHSTYLE = LineDashStyle.Continuous;
export const DEFAULT_POLYLINE_WIDTH = 5;
export const DASHARRAY_DOT_SIZE = '1';
export const DEFAULT_POLYLINE_MARKER_DIAMETER = 5;
export const PENCIL_KEY = 'c';
export const PAINTBRUSH_KEY = 'w';
export const LINE_KEY = 'l';
export const DELETE_FULL_ELEMENT_KEY = 'Escape';
export const DELETE_LAST_ELEMENT_KEY = 'Backspace';
export const RECTANGLE_KEY = '1';
export const ELLIPSE_KEY = '2';
export const POLYGON_KEY = '3';
export const COLOR_APPLICATOR_KEY = 'r';
export const NEW_DRAWING_KEY = 'o';
export const EYEDROPPER_KEY = 'i';
export const GRID_KEY = 'g';
export const SELECT_ALL_KEY = 'a';
export const COPY_KEY = 'c';
export const CUT_KEY = 'x';
export const DUPLICATE_KEY = 'd';
export const DELETE_KEY = 'Delete';
export const PASTE_KEY = 'v';
export const SAVE_DRAWING_KEY = 's';
export const OPEN_DRAWING_KEY = 'g';
export const PEN_KEY = 'y';
export const SELECTION_KEY = 's';
export const ERASER_KEY = 'e';
export const UNDO_KEY = 'z';
export const REDO_KEY = 'z';
export const FEATHER_KEY = 'p';
export const AEROSOL_KEY = 'a';
export const DEFAULT_FEATHER_STROKE_WIDTH = 15;
export const DEFAULT_FEATHER_ANGLE = 90;
export const MIN_ROTATION_STEP = 1;
export const MAX_ROTATION_STEP = 15;
export const TOP_BEFORE = 0;
export const BOTTOM_BEFORE = 1;
export const BOTTOM_AFTER = 2;
export const TOP_AFTER = 3;
export const X = 0;
export const Y = 1;
export const DEFAULT_AEROSOL_SPRAY_DIAMETER = 20;
export const DEFAULT_AEROSOL_DOT_RADIUS = 2;
export const DEFAULT_SPRAY_INTERVAL_SPEED = 5;
