:- ensure_loaded('move.pl').
:- ensure_loaded('game_model.pl').
:- ensure_loaded('graph.pl').
:- ensure_loaded('gameover.pl').
:- ensure_loaded('display.pl').

%   In this file:
% 
% - random_move(+GameState,-Move)
% - greedy_move(+GameState,-BestMove)
% - value(+GameState,-Value)
% - value_next(+GameState, -Value)
% - get_highest_sub_board_value(+OctagonBoard,+Width,+Height,+Player,+Graph,-Value)
% - compute_next_player_value(+GameState, +ListOfMoves, -NextPlayerValue)

/**
*   Level-1 Bot - This bot chooses any of the possible moves given a gamestate
*/

/**
*   random_move(+GameState,-Move)
*
*   Choose a random valid Move given GameState
*/
random_move(GameState, Move) :-
    valid_moves(GameState, ListOfMoves),
    random_member(Move, ListOfMoves).

/**
* Level-2 Bot - This bot chooses the "best" possible move at a given gamestate
*/

/**
*   greedy_move(+GameState,-BestMove)
*
*   Choose the "best" possible move given a game-state. (The means by which a "best" move is selected are described ahead).
*/
greedy_move(GameState, BestMove) :-

    % Get all the valid moves
    valid_moves(GameState,ListOfMoves),

    % Find all pairs of valid moves and their corresponding values 
    findall(Value-Move, (member(Move, ListOfMoves),move(Move, GameState, NewGameState), value(NewGameState, Value)), Result),

    % Sort the pairs Value-Move in descending order according to Value
    keysort(Result,SortedResultAsc),
    reverse(SortedResultAsc,SortedResultDsc),

    % Get the moves that lead to the best value and randomly choose one of them
    group_pairs_by_key(SortedResultDsc, [_-BestMoves|_]),
    length(BestMoves,Length),
    random_between(1,Length,Rnd),
    nth1(Rnd,BestMoves,BestMove).

/**
*   value(+GameState,-Value)
*
*   Evaluate the given gamestate. A boards value is determined by three factors. The first is the length of the largest sub-board with a path between the margins. This makes it so that
*   the bot has an incentive to build a path that unites the margins. The second factor is the length of the largest un-cuttable sub-board where the player wins. This factor is
*   very similiar to the first one but it's meant to reward plays that don't lead to the possibility of receiving a cut. The last factor is the value of the next player's best-move.
*   This factor calculates what the next player would play given the current gamestate and "devalues"(subtracts) the current Gamestate's value accordingly to deturn the bot from making favourable 
*   plays to the opponent. This factor might be positive in case of a double play where the next move is still the bots move in which case the next most favourable play is of good value.
*/
value(GameState, Value) :- !,

    % Setup needed variables. Extract variables from gamestate, transpose the board  and switch the height/width values if needed
    GameState = [OctagonBoard,SquareBoard, DefaultHeight, DefaultWidth,_,_,NextPlayer, _-_ | []],
    get_game_previous_player(GameState,PrevPlayer),
    get_real_side_lengths(PrevPlayer,DefaultWidth,DefaultHeight,Width,Height),
    orient_board(OctagonBoard, SquareBoard,PrevPlayer,OrientedOctagonBoard,OrientedSquareBoard),

    % Get SBValue1 - Highest length of the sub-board in which Player has a path between the margins

    % Build the connection graph
    build_graph([OrientedOctagonBoard, OrientedSquareBoard, Height, Width], PrevPlayer, Graph1),!,
    get_highest_sub_board_value(OrientedOctagonBoard,Width,Height,PrevPlayer,Graph1,SBValue1),

    % Get SBValue2 - Highest length of the sub-board in which Player wins the game

    % Remove cuttable squares
    remove_cuttable_squares(OrientedOctagonBoard,OrientedSquareBoard,PrevPlayer,NewSquareBoard),

    % Build the connection graph
    build_graph([OrientedOctagonBoard, NewSquareBoard, Height, Width], PrevPlayer, Graph2),!,
    get_highest_sub_board_value(OrientedOctagonBoard,Width,Height,PrevPlayer,Graph2,SBValue2),

    % Calculate the value of the next player's move 

    % Get all the valid moves
    valid_moves(GameState,ListOfMoves),

    compute_next_player_value(GameState, ListOfMoves, NextPlayerValue),

    % Modifier used to make the value positive or negative in case of a double play
    get_modifier(PrevPlayer,NextPlayer,Modifier),

    Value is SBValue1 + SBValue2 + NextPlayerValue * Modifier.

/**
* compute_next_player_value(+GameState, +ListOfMoves, -NextPlayerValue)
*
* Find all pairs of valid moves and their corresponding values. The difference between this segment and the similar segment 
* in greedy_move(+GameState, -Move) is that this segment uses value_next(+GameState,Value) to obtain it's values. The
* essential difference is that value_next does not only values according to it's state and doesn't take the next player's 
* move into account.
*/
compute_next_player_value(_, [], 0).
compute_next_player_value(GameState, ListOfMoves, NextPlayerValue) :-
    findall(Val-Move, (member(Move, ListOfMoves),move(Move, GameState, NewGameState), value_next(NewGameState, Val)), Result),
    keysort(Result,SortedResultAsc),
    reverse(SortedResultAsc,SortedResultDsc),
    nth0(0,SortedResultDsc,NextPlayerValue-_).


/**
*   value_next(+GameState, -Value)
*
*   This predicate is very similiar 'value'. The only difference is that it only calculates the first two described factors and does try do predict the opponents play. The value returned
*   might be negative in case of a double play (after a cut, see explanation in 'value')  
*/
value_next(GameState, Value) :- !,

    % Setup needed variables. Extract variables from gamestate, transpose the board  and switch the height/width values if needed
    GameState = [OctagonBoard,SquareBoard, DefaultHeight, DefaultWidth,_,_,_, _-_ | []],
    get_game_previous_player(GameState,PrevPlayer),
    get_real_side_lengths(PrevPlayer,DefaultWidth,DefaultHeight,Width,Height),
    orient_board(OctagonBoard, SquareBoard,PrevPlayer,OrientedOctagonBoard,OrientedSquareBoard),

    % Get SBValue1 - Highest length of the sub-board in which Player wins the game

    % Build the connection graph    
    build_graph([OrientedOctagonBoard, OrientedSquareBoard, Height, Width], PrevPlayer, Graph1),!,
    get_highest_sub_board_value(OrientedOctagonBoard,Width,Height,PrevPlayer,Graph1,SBValue1),

    % Get SBValue2 - Highest length of the uncuttable sub-board in which Player wins the game

    % Remove cuttable squares
    remove_cuttable_squares(OrientedOctagonBoard,OrientedSquareBoard,PrevPlayer,NewSquareBoard),

    % Build the connection graph
    build_graph([OrientedOctagonBoard, NewSquareBoard, Height, Width], PrevPlayer, Graph2),!,
    get_highest_sub_board_value(OrientedOctagonBoard,Width,Height,PrevPlayer,Graph2,SBValue2),


    Value is (SBValue1 + SBValue2).


get_modifier(P,P,1):-!.
get_modifier(_,_,-1):-!.

/**
*   get_highest_sub_board_value(+OctagonBoard,+Width,+Height,+Player,+Graph,-Value)
*
*   This predicate returns in Value the length of the largest subboard where the Player wins according to the OctagonBoard and the adjacency Graph,
*/
get_highest_sub_board_value(OctagonBoard,Width,Height,Player,Graph,Value) :- !,get_highest_sub_board_value_iter(OctagonBoard,Width,Height,Player,Graph,Height,Value).

% Smallest length of a subboard (1 tile)
get_highest_sub_board_value_iter(_,_,_,_,[],_,1) :-!.  

% Value of an empty board is 0
get_highest_sub_board_value_iter(_,_,_,_,_,0,0) :-!.    

get_highest_sub_board_value_iter(OctagonBoard,Width,Height,Player,Graph,CurrentBoardSize,Value) :-

    % AlternativeCount designates the number of sub-boards of CurrentBoardSize that need to be checked
    AlternativeCount is Height - CurrentBoardSize + 1,

    % Check if there are any CurrentBoardSize subboards where Player wins
    \+check_sub_boards(OctagonBoard,Width,Height,Player,Graph,AlternativeCount,AlternativeCount),!,

    NewSize is CurrentBoardSize - 1,
    get_highest_sub_board_value_iter(OctagonBoard,Width,Height,Player,Graph,NewSize,Value).

get_highest_sub_board_value_iter(_,_,_,_,_,CurrentBoardSize,Value) :-

    % There is a subboard of size CurrentBoardSize where Player Wins
    Value is CurrentBoardSize.

check_sub_boards(_,_,_,_,_,_,0) :- !,fail.

check_sub_boards(OctagonBoard,Width,Height,Player,Graph,AlternativeCount,CurrentAlternative) :-
    LowBar is CurrentAlternative - 1,
    
    \+get_valid_starters(OctagonBoard,Player,LowBar,Width,_),!,

    CurrentAlternative1 is CurrentAlternative - 1, 
    check_sub_boards(OctagonBoard,Width,Height,Player,Graph,AlternativeCount,CurrentAlternative1).


check_sub_boards(OctagonBoard,Width,Height,Player,Graph,AlternativeCount,CurrentAlternative) :-
    LowBar is CurrentAlternative - 1,
    HighBar is LowBar + Height - AlternativeCount,
    
    % get starting cells
    get_valid_starters(OctagonBoard,Player,LowBar,Width,Starters),

    % get ending cell ids
    gen_row_ids(Width,HighBar,IDList),

    % Check if such cells are reachable
    \+reachable_from_list(Graph,Starters,IDList),!,
    CurrentAlternative1 is CurrentAlternative - 1, 
    check_sub_boards(OctagonBoard,Width,Height,Player,Graph,AlternativeCount,CurrentAlternative1).

check_sub_boards(_,_,_,_,_,_,_) :-!.