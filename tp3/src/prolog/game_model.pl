%   In this file:
% 
% - generate_initial_game_state(+BoardHeight,+BoardWidth,+P1Type.+P2Type,-InitialGameState)
% - board_get_element_at(+OctagonBoard,+X - +Y, -Element) 
% - board_insert_element_at(+OctagonBoard,+X - +Y, +Element, -NewOctagonBoard)
% - get_game_attributes(+GameState, -OctagonBoard, -SquareBoard, -Height, -Width, -P1Type, -P2Type, -CurrentPlayer, -Cut)
% - get_game_current_player(+GameState, -CurrentPlayer)
% - get_game_current_player_type(+GameState, -Type)
% - get_game_board_size(+GameState, -Height,-Width)
% - get_game_octagon_board(+GameState, -OctagonBoard)
% - get_game_board(+GameState, -GameBoard) 
% - get_game_previous_player(+GameState, -PreviousPlayer) 
% - get_other_player(+P1,-P2)
% - get_real_side_lengths(+Player,+Width,+Height,-RealWidth,-RealHeight)


/**
*   generate_initial_game_state(+BoardHeight,+BoardWidth,+P1Type.+P2Type,-InitialGameState)
*
*   Generates the an initial gamestate "struct" with the empty boards of the specified height and width (squareboard has side and top/bottom collumns)
*   filled with correct squares. Checks if Width and Height is greater than 2.
*/
generate_initial_game_state(Height,Width , P1Type, P2Type, [OctagonBoard, SquareBoard, Height, Width, P1Type, P2Type, 1, 1-0 |[]]) :-
    Width > 2, Width =< 15,
    Height > 2, Height =< 14,
    generate_octagon_board(Width, Height, OctagonBoard),
    generate_square_board(Width, Height, SquareBoard).

/**
*   board_get_element_at(+OctagonBoard,+X - +Y, -Element) 
*
*   Returns the "color" of the piece ad X-Y in the OctagonBoard
*/
board_get_element_at(Board, X-Y, Element) :-
    nth0(Y, Board, Row),
    nth0(X, Row, Element).

/**
*   board_insert_element_at(+OctagonBoard,+X - +Y, +Element, -NewOctagonBoard)
*
*   Inserts a piece of color Element in position X-Y of OctagonBoard. Returns result in NewOctagonBoard.
*/
board_insert_element_at(Board, X-Y, Element, NewBoard) :-
    nth0(Y, Board, Row),
    insert_element_at(Row, X, Element, NewRow),
    insert_element_at(Board, Y, NewRow, NewBoard).

insert_element_at(Row, X, Element, NewRow) :-
    insert_element_at_aux(Row, X, Element, NewRow, 0).

insert_element_at_aux([_HRow | TRow], X, Element, [Element | NewRow], XCount) :-
    X == XCount,
    NextXCount is XCount + 1,
    insert_element_at_aux(TRow, X, Element, NewRow, NextXCount).

insert_element_at_aux([HRow | TRow], X, Element, [HRow | NewRow], XCount) :-
    X \== XCount,
    NextXCount is XCount + 1,
    insert_element_at_aux(TRow, X, Element, NewRow, NextXCount).

insert_element_at_aux([], _, _, [], _).


/**
*   get_game_attributes(+GameState, -OctagonBoard, -SquareBoard, -Height, -Width, -P1Type, -P2Type, -CurrentPlayer, -Cut)
*
*   Unify the attributes of GameState into separate variables.
*/
get_game_attributes(GameState, OctagonBoard, SquareBoard, Height, Width, P1Type, P2Type, CurrentPlayer, Cut) :-
    GameState = [OctagonBoard, SquareBoard, Height, Width, P1Type, P2Type, CurrentPlayer, Cut | []].

/**
*   get_game_current_player(+GameState, -CurrentPlayer)
*
*   Get the current player value.
*/
get_game_current_player(GameState, CurrentPlayer) :-
    GameState = [_, _, _, _, _, _, CurrentPlayer | _ ].

/**
*   get_game_current_player_type(+GameState, -Type)
*
*   Get the current player type.
*/
get_game_current_player_type(GameState, Type) :-
    get_game_current_player(GameState, Player),
    PlayerTypeIndex is 3 + Player,
    nth0(PlayerTypeIndex, GameState, Type).

/**
*   get_game_board_size(+GameState, -Height,-Width)
*
*   Get the dimensions of the gameboard.
*/
get_game_board_size(GameState, Height, Width) :-
    GameState = [_, _, Height, Width | _].

/**
*   get_game_octagon_board(+GameState, -OctagonBoard)
*
*   Get the octagon board.
*/
get_game_octagon_board(GameState, OctagonBoard) :-
    GameState = [OctagonBoard | _].

/**
*   get_game_board(+GameState, -GameBoard) 
*
*   Get the gameboard. The gameboard contains the octagonboard, the squareboard and the board dimensions
*/
get_game_board(GameState,[OctagonBoard,SquareBoard,Height,Width]) :-
    GameState = [OctagonBoard, SquareBoard, Height, Width | _].

/**
*   get_game_previous_player(+GameState, -PreviousPlayer) 
*
*   Get the previous player.
*/
get_game_previous_player(GameState, NextPlayer) :-
    GameState = [_,_,_,_,_,_,NextPlayer, 1-1].

get_game_previous_player(GameState, PreviousPlayer) :-
    GameState = [_,_,_,_,_,_,NextPlayer, _],
    get_other_player(NextPlayer,PreviousPlayer).

/**
*   get_other_player(+P1,-P2)
*
*   Get the oponnent of P1
*/
get_other_player(1,2).
get_other_player(2,1).

/**
*   get_real_side_lengths(+Player,+Width,+Height,-RealWidth,-RealHeight)
*
*   Get the real width and height. The real width and height of Player 2 are equal to the height and width of Player 1
*/
get_real_side_lengths(1,Width,Height,Width,Height).
get_real_side_lengths(2,Width,Height,Height,Width).

generate_octagon_board(Width, Height, OctagonBoard) :-
    generate_octagon_board_row(Width, Row),
    generate_octagon_board_aux(Height, Row, OctagonBoard).

generate_octagon_board_aux(0, _, []).
generate_octagon_board_aux(Height, Row, [Row | OctagonBoard]) :-
    NextHeight is Height - 1,
    generate_octagon_board_aux(NextHeight, Row, OctagonBoard).

generate_octagon_board_row(0, []).
generate_octagon_board_row(Width, [0 | Row]) :-
    Width > 0,
    NextWidth is Width - 1,
    generate_octagon_board_row(NextWidth, Row).

generate_square_board(Width, Height, SquareBoard) :-
    generate_square_board_first_and_last_row(Width, 0, FirstLastRow),
    generate_square_board_middle_row(Width, 0, MiddleRow),
    generate_square_board_aux(Height, 0, FirstLastRow, MiddleRow, SquareBoard).

generate_square_board_aux(Height, 0, FirstLastRow, MiddleRow,  [FirstLastRow | SquareBoard]) :-
    generate_square_board_aux(Height, 1, FirstLastRow, MiddleRow, SquareBoard).

generate_square_board_aux(Height, Height, FirstLastRow, _, [FirstLastRow | []]).

generate_square_board_aux(Height, CurrentVerticalCoord, FirstLastRow, MiddleRow, [MiddleRow | SquareBoard]) :-
    CurrentVerticalCoord > 0,
    CurrentVerticalCoord < Height,
    NextVerticalCoord is CurrentVerticalCoord + 1,
    generate_square_board_aux(Height, NextVerticalCoord, FirstLastRow, MiddleRow, SquareBoard).

generate_square_board_first_and_last_row(Width, 0, [0 | Row]) :-
    generate_square_board_first_and_last_row(Width, 1, Row).

generate_square_board_first_and_last_row(Width, Width, [0 | []]).

generate_square_board_first_and_last_row(Width, CurrentHorizontalCoord, [1 | Row]) :-
    CurrentHorizontalCoord > 0,
    CurrentHorizontalCoord < Width,
    NextHorizontalCoord is CurrentHorizontalCoord + 1,
    generate_square_board_first_and_last_row(Width, NextHorizontalCoord, Row).

generate_square_board_middle_row(Width, 0, [2 | Row]) :-
    generate_square_board_middle_row(Width, 1, Row).

generate_square_board_middle_row(Width, Width, [2 | []]).

generate_square_board_middle_row(Width, CurrentHorizontalCoord, [0 | Row]) :-
    CurrentHorizontalCoord > 0,
    CurrentHorizontalCoord < Width,
    NextHorizontalCoord is CurrentHorizontalCoord + 1,
    generate_square_board_middle_row(Width, NextHorizontalCoord, Row).
     