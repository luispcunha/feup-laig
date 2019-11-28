:- ensure_loaded('game_model.pl').

%   In this file:
% 
% -  valid_moves(+GameState, -Moves)
% -  validate_move(+OctagonBoard,-Move)
% -  move(+Move,+GameState,-NewGameState)
% -  update_next_player(+Player, +CutInfo, -NewPlayer,-NewCutInfo,+NumCuts)
% -  get_diagonals_pos(+OctagonPos,+Height,+Width, -DiagonalPos)
% -  update_squares(+Player,+Pos,+OctagonBoard,+SquareBoard,-NewSquareBoard,+Height,+Width,-NumCuts)
% -  check_cut(+Player,+SquareBoard,+SquarePos,-NumCuts)
% -  get_squares_pos(+Player,+OctagonBoard,+OctagonPositionX - +OctagonPositionY, +DiagonalPositions, -SquaresPositions)
% -  place_squares(+Player,+SquareBoard, +SquarePositions, -NewSquareBoard)


/**
*   valid_moves(+GameState, -Moves)
*
*   Get a list of moves(Moves) that are valid in GameState
*/
valid_moves(GameState, Moves) :-
    get_game_octagon_board(GameState, OctagonBoard),
    findall(Move, validate_move(OctagonBoard, Move), Moves).

/**
*
*   validate_move(+OctagonBoard,-Move)
*
*   Succeeds if Move is a valid move in OctagonBoard.
*/
validate_move(OctagonBoard, Move) :-
    board_get_element_at(OctagonBoard, Move, 0).


/**
*   move(+Move,+GameState,-NewGameState)
*
*   Apply Move in GameState returning the result in NewGameState. move updates the boards, the cut info and the player info. If Move is
*   not valid in GameState, the predicate fails.
*/
move(Move,GameState,NewGameState) :-

    % Fetch the GameState attributes    
    get_game_attributes(GameState, OctagonBoard, SquareBoard, Height, Width, P1Type, P2Type, Player, CutInfo), 

    % Validate the move and insert the octagon
    validate_move(OctagonBoard, Move),

    % Update the OctagonBoard, SquareBoard, Player and CutInfo
    board_insert_element_at(OctagonBoard, Move, Player, NewOctagonBoard),
    update_squares(Player, Move, OctagonBoard, SquareBoard, NewSquareBoard, Height, Width, NumCuts),
    update_next_player(Player, CutInfo, NewPlayer, NewCutInfo, NumCuts),

    % "Build" the result
    get_game_attributes(NewGameState, NewOctagonBoard, NewSquareBoard, Height, Width, P1Type, P2Type, NewPlayer, NewCutInfo).

/**
*   update_next_player(+Player, +CutInfo, -NewPlayer,-NewCutInfo,+NumCuts)
*
*   Get the values of CutInfo and Player for next GameState
*/
update_next_player(1, _, 2, 2-1, NumCuts) :- NumCuts > 0.
update_next_player(2, _, 1, 2-1, NumCuts) :- NumCuts > 0.
update_next_player(1, 2-1, 1, 1-1, NumCuts) :- NumCuts == 0. 
update_next_player(2, 2-1, 2, 1-1, NumCuts) :- NumCuts == 0.
update_next_player(2, 1-1, 1, 1-0, NumCuts) :- NumCuts == 0.
update_next_player(1, 1-1, 2, 1-0, NumCuts) :- NumCuts == 0.
update_next_player(2, 1-0, 1, 1-0, NumCuts) :- NumCuts == 0.
update_next_player(1, 1-0, 2, 1-0, NumCuts) :- NumCuts == 0.


/**
*   get_diagonals_pos(+OctagonPos,+Height,+Width, -DiagonalPos)
*
*   Get the position of the octagons that are diagonally to the octagon in OctagonPos.
*/
get_diagonals_pos(0-0, _, _, [1-1]).
get_diagonals_pos(X-0, _, Width, [CoordX-1]) :-
    X =:= Width - 1,
    CoordX is X - 1.

get_diagonals_pos(0-Y, Height, _, [1-CoordY]) :-
    Y =:= Height - 1,
    CoordY is Y - 1.


get_diagonals_pos(X-Y, Height, Width, [CoordX-CoordY]) :-
    Y =:= Height - 1,
    X =:= Width - 1,
    CoordX is X - 1,
    CoordY is Y - 1.

get_diagonals_pos(X-Y, _, Width, Res) :-
    X =:= Width - 1,
    XLeft is X - 1,
    YUp is Y - 1,
    YBottom is Y + 1,
    Res = [
        XLeft-YUp,
        XLeft-YBottom
    ].

get_diagonals_pos(X-Y, Height, _, Res) :-
    Y =:= Height - 1,
    YTop is Y - 1,
    XLeft is X - 1,
    XRight is X + 1,
    Res = [
        XLeft-YTop,
        XRight-YTop
    ].


get_diagonals_pos(0-Y, _, _, Res) :-
    XRight is 1,
    YUp is Y - 1,
    YBottom is Y + 1,
    Res = [
        XRight-YUp,
        XRight-YBottom
    ].

get_diagonals_pos(X-0, _, _, Res) :-
    XLeft is X - 1,
    XRight is X + 1,
    YBottom is 1,
    Res = [
        XLeft-YBottom,
        XRight-YBottom
    ].

get_diagonals_pos(X-Y, _, _, Res) :-
    XLeft is X - 1,
    XRight is X + 1,
    YUp is Y - 1,
    YBottom is Y + 1,
    Res = [
        XLeft-YUp,
        XRight-YUp,
        XLeft-YBottom,
        XRight-YBottom
    ].

/**
*   update_squares(+Player,+Pos,+OctagonBoard,+SquareBoard,-NewSquareBoard,+Height,+Width,-NumCuts)
*
*   Given a Player move equal to Pos, update the squares in NewSquareBoard and unify NumCuts with the number of cuts that happened
*/
update_squares(Player, Pos, OctagonBoard, SquareBoard, NewSquareBoard, Height, Width, NumCuts) :-

    % Get the diagonal octagon positions
    get_diagonals_pos(Pos, Height, Width, DiagonalsPos),

    % Get the square positions
    get_squares_pos(Player, OctagonBoard, Pos, DiagonalsPos, SquaresPos),

    % Check for cuts
    check_cut(Player, SquareBoard, SquaresPos, NumCuts),

    % Place the squares
    place_squares(Player, SquareBoard, SquaresPos, NewSquareBoard).


/**
*   check_cut(+Player,+SquareBoard,+SquarePos,-NumCuts)
*
*   Get the number of cuts done by Player.
*/
check_cut(Player, SquareBoard, SquaresPos, NumCuts) :- 
    findall(Pos, (member(Pos, SquaresPos), board_get_element_at(SquareBoard, Pos, Element), Element \== Player, Element \== 0), Cuts),
    length(Cuts, NumCuts).

/**
*   get_squares_pos(+Player,+OctagonBoard,+OctagonPositionX - +OctagonPositionY, +DiagonalPositions, -SquaresPositions)
*
*   Get the positions of squares of Player adjacent to octagon in position OctagonPositionX-OctagonPositionY
*/
get_squares_pos(_, _, _, [], []).

get_squares_pos(Player, OctagonBoard, X-Y, [DiagonalX-DiagonalY | DiagonalsPos], [SquareX-SquareY | SquaresPos]) :-
    board_get_element_at(OctagonBoard, DiagonalX-DiagonalY, Element),
    Player == Element,
    max(X, DiagonalX, SquareX),
    max(Y, DiagonalY, SquareY),
    get_squares_pos(Player, OctagonBoard, X-Y, DiagonalsPos, SquaresPos).

get_squares_pos(Player, OctagonBoard, X-Y, [DiagonalX-DiagonalY | DiagonalsPos], SquaresPos) :-
    board_get_element_at(OctagonBoard, DiagonalX-DiagonalY, Element),
    Player \== Element, 
    get_squares_pos(Player, OctagonBoard, X-Y, DiagonalsPos, SquaresPos).

/**
*   place_squares(+Player,+SquareBoard, +SquarePositions, -NewSquareBoard)
*
*   Place squares in SquarePositions returning NewSquareBoard
*/
place_squares(_, SquareBoard, [], SquareBoard).
place_squares(Player, SquareBoard, [Pos | SquaresPos], FinalSquareBoard) :-
    board_insert_element_at(SquareBoard, Pos, Player, NewSquareBoard),
    place_squares(Player, NewSquareBoard, SquaresPos, FinalSquareBoard).
    
max(V1, V2, M) :- V1 > V2, M = V1.
max(V1, V2, M) :- V2 > V1, M = V2.