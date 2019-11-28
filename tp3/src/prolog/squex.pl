:- [display], [input], [game_model], [move], [gameover], [bot]. 

%   In this file:
% 
% - play()
% - get_players_type(+Option,-P1Type, -P2Type)
% - continue_game(+NewGameState) 
% - game_loop(+GameState)
% - get_move(+GameState,+Move)
% - choose_move(+GameState,+Level,-Move)


/**
*   play()
*   
*   Main predicate that starts the game, displaying the menu screen and menu options.
*/
play :-
    display_main_screen,
    input_menu_option(Option), !,
    start_game(Option).

start_game(0).
start_game(Option) :-
    get_players_type(Option, P1Type, P2Type),
    repeat, input_board_size(Height, Width), generate_initial_game_state(Height, Width, P1Type, P2Type, GameState), !,
    game_loop(GameState), !,
    press_enter_to_continue,
    play.

/**
*   get_players_type(+Option,-P1Type, -P2Type)
*
*   Initialize the player type variables. In case that one or both of the types are a bot also get the bot level from the user
*/

get_players_type(1, 'P', 'P').
get_players_type(2, 'P', P2Type) :-
    input_bot_level(P2Type).
get_players_type(3, P1Type, 'P') :-
    input_bot_level(P1Type).
get_players_type(4, P1Type, P2Type) :-
    input_bot_level(P1Type, 1),
    input_bot_level(P2Type, 2).

/**
*   continue_game(+NewGameState) 
*
*   This predicate checks wheter the game is over and if so displays a gameover message. If not proceeds with the gameloop.
*/
continue_game(NewGameState) :-
    gameover(NewGameState, Player), !, display_gameover(NewGameState, Player).

continue_game(NewGameState) :-
    game_loop(NewGameState).

/**
*   game_loop(+GameState)
*
*   Main game loop. Cycle that draws the game, fetchs a move from the bot or the userm,applies it, checks for gameover and repeats the process.
*/
game_loop(GameState) :-
    display_game(GameState), 
    repeat, get_move(GameState, Move), move(Move, GameState, NewGameState),
    continue_game(NewGameState).

/**
*   get_move(+GameState,+Move)
*   
*   Get a move from the user or from the bots.
*/
get_move(GameState, Move) :-
    get_game_current_player_type(GameState, Type),
    choose_move(GameState, Type, Move), !.

/**
*   choose_move(+GameState,+Level,-Move)
*
*   Given a Gamestate and it's move-limitations choose_move will prompt the user (if the current player type is a human player) or fetch the next
*   move from the correct bot.
*/
choose_move(GameState, 'P', Move) :-
    get_game_board_size(GameState, Height, Width),
    input_move(Move, Height, Width).

choose_move(GameState, 1, Move) :-
    random_move(GameState, Move),
    display_cpu_choice(Move),
    press_enter_to_continue.

choose_move(GameState, 2, Move) :-
    greedy_move(GameState, Move),
    display_cpu_choice(Move),
    press_enter_to_continue.


init_game_state([
     [[1, 0, 0, 0], 
      [0, 0, 0, 0],
      [0, 0, 2, 0],
      [0, 0, 0, 0]],
     [[0, 1, 1, 1, 0], 
      [2, 1, 2, 2, 2],
      [2, 2, 2, 1, 2],
      [2, 2, 1, 1, 2],
      [0, 1, 1, 1, 0]],
      4, 4, 'P', 2, 1, 1-0]).

test(NewGameState) :- init_game_state(GameState), repeat, get_move(GameState, Move), move(Move, GameState, NewGameState).
