:- use_module(library(clpfd)).
:- [graph].
:- ensure_loaded('game_model.pl').


%   In this file:
% 
% -  gameover(+Board,-Winner)
% -  test_for_path(+Gamestate,+Player)
% -  orient_board(+OctagonBoard,+SquareBoard,+Player,-OrientedOctagonBoard,-OrientedSquareBoard)
% -  reachable_from_list(+Graph,+Starters,+Destinations)
% -  contains_any(+X,+Y)
% -  gen_row_ids(+BoardWidth,+RowID,-IDList)
% -  get_valid_starters(+OctagonBoard,+Player,+Index,+BoardWidth,-Starters)
% -  remove_cuttable_squares(+OctagonBoard, +SquareBoard, +Player, -NewSquareBoard)
% -  is_cuttable(+OctagonBoard, +Player, +SquareX, +SquareY)

/**
*   gameover(+Board,-Winner) 
*
*   Checks if the game is over, if so returns the player that won.
*/

    
gameover(GameState,Winner) :- 
    get_game_previous_player(GameState,Winner),
    check_for_win(GameState, Winner).

gameover(GameState,Winner) :- 
    valid_moves(GameState,[]),
    Winner = 0.

/**
*   check_for_win(+Gamestate, +Player)   
*   
*   Given a game state, check_for_win checks if Player won the game. A player wins the game if there is a path unitting the edges of it's color and if
*   there is no possible way to cut such path. As such, checking for a win condition envolves two steps: the first is to remove all squares that are
*   cuttable, this emulates all the possible moves in the games future that might alter the existing paths, the second step is finding if the aforementioned
*   path exists.
*/
check_for_win([OctagonBoard,SquareBoard,Height,Width | _] ,Player) :-

    remove_cuttable_squares(OctagonBoard, SquareBoard, Player, NewSquareBoard),

    % To allow for checking for both players, since the gameover predicates work form the top edge down, when the Player's number is equal to 2 and, as such,
    % his paths increase horizontally, the board must be transposed and the height/width must be switched.
    orient_board(OctagonBoard, NewSquareBoard,Player,OrientedOctagonBoard,OrientedSquareBoard),
    get_real_side_lengths(Player,Width,Height,RealWidth,RealHeight),

    % Get the octagons where the path may start(there are connected with the Player's top board edge). This function is meant to optimize the 
    % process as there is no need to build the graph(which is an operation that is computationally expensive) if there is no starting pice to begin with.
    get_valid_starters(OrientedOctagonBoard,Player,0,RealWidth,Starters),

    % Build the player-path graph
    build_graph([OrientedOctagonBoard,OrientedSquareBoard,RealHeight,RealWidth],Player,Graph),

    % Check if the opposing board edge is connected to the starting one via a path
    LastRowID is RealHeight -1,
    gen_row_ids(RealWidth,LastRowID,LastRowIDs),!,
    reachable_from_list(Graph,Starters,LastRowIDs).



/**
*   orient_board(+OctagonBoard,+SquareBoard,+Player,-OrientedOctagonBoard,-OrientedSquareBoard)
*
*   If Player is equal to 2, then the oriented boards are the transposed input boards.To avoid writting redundant code there was a choice to make the graph functions
*   process the board vertically, as such, for it to be able to process player 2 it must use the transposed version of the board.
*/
orient_board(OctagonBoard,SquareBoard,1, OctagonBoard, SquareBoard).

orient_board(OctagonBoard,SquareBoard,2, NewOctagonBoard, NewSquareBoard) :-
    transpose(OctagonBoard,NewOctagonBoard), 
    transpose(SquareBoard,NewSquareBoard).

/**
*   reachable_from_list(+Graph,+List,+Destinations)
*
*   This predicate succeeds if, following Graph, there is a path that connects an octagon from List with an Octagon from Destinations
*/
reachable_from_list(_,[],_) :- fail.

reachable_from_list(Graph,[H|_],Destinations) :-
    reachable(H,Graph,Result),
    contains_any(Result,Destinations).

reachable_from_list(Graph,[H|T],Destinations) :-
    reachable(H,Graph,Result),
    \+contains_any(Result,Destinations),
    reachable_from_list(Graph,T,Destinations).

/**
*   contains_any(+X,+Y)
*
*   Checks if any element from the list X is present in list Y. If X is an empty list the predicate will fail.
*/
contains_any([],_,_) :- fail.
contains_any([H|T],L) :- \+intersection([H|T],L,[]).


/**
*   gen_row_ids(+BoardWidth,+RowID,-IDList)
*
*   Fills IDList with the ids of the cells of the row number RowID of the Board with size BoardWidth/BoardHeight
*/
gen_row_ids(Width,RowID,IDList) :-gen_row_ids_iter(Width,RowID,IDList,[],0).

gen_row_ids_iter(Width,_,Result,Result,Width):-!.

gen_row_ids_iter(Width,RowID,Result,Acc,Cnt) :-

    length(Acc,Size),
    Element is Width * RowID + Size,
    append(Acc,[Element],Acc1),
    Cnt1 is Cnt + 1,
    gen_row_ids_iter(Width,RowID,Result,Acc1,Cnt1).


/**
*   get_valid_starters(+OctagonBoard,+Player,+Index,+BoardWidth,-Starters)
*
*   Fill Starters with the ID's of the pieces of the row Index of OctagonBoard with width equal to BoardWidth, that belong to Player
*/
get_valid_starters(OctagonBoard,Player,Index,Width,Starters) :- nth0(Index,OctagonBoard,H), member(Player,H), fetch_starters(H,Index,Width,Player,Starters).

fetch_starters(Row,Index,Width, Player, Result) :- fetch_starters_iter(Row,Index,Width,Player,Result,[],0).

fetch_starters_iter([],_,_,_,Result,Result,_).
fetch_starters_iter([H|T],Index,Width,Player,Result,Acc,N) :-  
        H =:= Player, 
        ID is Index*Width + N,
        append(Acc,[ID],Acc1),
        N1 is N + 1, 
        fetch_starters_iter(T,Index,Width,Player,Result,Acc1,N1).

fetch_starters_iter([H|T],Index,Width,Player,Result,Acc,N) :-  
        H =\= Player, 
        N1 is N + 1, 
        fetch_starters_iter(T,Index,Width,Player,Result,Acc,N1).

/**
*   remove_cuttable_squares(+OctagonBoard, +SquareBoard, +Player, -NewSquareBoard)
*
*   Removes all the cuttable squares from SquareBoard that belong to Player and stores it in NewSquareBoard.
*/
remove_cuttable_squares(OctagonBoard, [Row | SquareBoard], Player, [Row | NewSquareBoard]) :-
    remove_cuttable_squares_aux(OctagonBoard, SquareBoard, 1, Player, NewSquareBoard).

remove_cuttable_squares_aux(_OctagonBoard, [Row | []], _Y, _Player, [Row]).

remove_cuttable_squares_aux(OctagonBoard, [Row | SquareBoard], Y, Player, [NewRow | NewSquareBoard]) :-
    remove_cuttable_squares_row(OctagonBoard, Row, Y, Player, NewRow),
    YNext is Y + 1, 
    remove_cuttable_squares_aux(OctagonBoard, SquareBoard, YNext, Player, NewSquareBoard).

remove_cuttable_squares_row(OctagonBoard, [Element | Row], Y, Player, [Element | NewRow]) :-
    remove_cuttable_squares_row_aux(OctagonBoard, Row, 1, Y, Player, NewRow).

remove_cuttable_squares_row_aux(_OctagonBoard, [Element | []], _X, _Y, _Player, [Element]).

remove_cuttable_squares_row_aux(OctagonBoard, [Player | Row], X, Y, Player, [0 | NewRow]) :-
    is_cuttable(OctagonBoard, Player, X, Y),
    XNext is X + 1,
    remove_cuttable_squares_row_aux(OctagonBoard, Row, XNext, Y, Player, NewRow).

remove_cuttable_squares_row_aux(OctagonBoard, [Player | Row], X, Y, Player, [Player | NewRow]) :-
    XNext is X + 1,
    remove_cuttable_squares_row_aux(OctagonBoard, Row, XNext, Y, Player, NewRow).

remove_cuttable_squares_row_aux(OctagonBoard, [Element | Row], X, Y, Player, [Element | NewRow]) :-
    XNext is X + 1,
    remove_cuttable_squares_row_aux(OctagonBoard, Row, XNext, Y, Player, NewRow).


/**
*   is_cuttable(+OctagonBoard, +Player, +SquareX, +SquareY)
*
*   Checks wheter the square with coordinates SquareX-SquareY is cuttable.
*/
is_cuttable(OctagonBoard, _Player, X, Y) :-
    board_get_element_at(OctagonBoard, X-Y, 0),
    OtherX is X - 1,
    OtherY is Y - 1,
    board_get_element_at(OctagonBoard, OtherX-OtherY, 0).

is_cuttable(OctagonBoard, _Player, X, Y) :-
    OtherX is X - 1,
    OtherY is Y - 1,
    board_get_element_at(OctagonBoard, X-OtherY, 0),
    board_get_element_at(OctagonBoard, OtherX-Y, 0).

is_cuttable(OctagonBoard, Player, X, Y) :-
    get_other_player(Player, OtherPlayer),
    board_get_element_at(OctagonBoard, X-Y, OtherPlayer),
    OtherX is X - 1,
    OtherY is Y - 1,
    board_get_element_at(OctagonBoard, OtherX-OtherY, 0).

is_cuttable(OctagonBoard, Player, X, Y) :-
    get_other_player(Player, OtherPlayer),
    OtherX is X - 1,
    OtherY is Y - 1,
    board_get_element_at(OctagonBoard, X-OtherY, OtherPlayer),
    board_get_element_at(OctagonBoard, OtherX-Y, 0).

is_cuttable(OctagonBoard, Player, X, Y) :-
    get_other_player(Player, OtherPlayer),
    board_get_element_at(OctagonBoard, X-Y, 0),
    OtherX is X - 1,
    OtherY is Y - 1,
    board_get_element_at(OctagonBoard, OtherX-OtherY, OtherPlayer).

is_cuttable(OctagonBoard, Player, X, Y) :-
    get_other_player(Player, OtherPlayer),
    OtherX is X - 1,
    OtherY is Y - 1,
    board_get_element_at(OctagonBoard, X-OtherY, 0),
    board_get_element_at(OctagonBoard, OtherX-Y, OtherPlayer).
