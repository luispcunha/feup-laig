%   In this file:
% 
% -  input_menu_option(-Option)
% -  input_board_size(-Height, -Width)
% -  input_bot_level(-Level)
% -  input_bot_level(-Level, +Player)
% -  input_move(-X - -Y, +Height, +Width)
% -  input_ver_coord(-Coord, +Height)
% -  input_hor_coord(-Coord, +Width)
% -  get_int_between(+Prompt, -Option, +Min, +Max) 
% -  get_letter(+Letter) 
% -  letter_to_int(+Letter, -Int) 
% -  get_int(+Int)
% -  press_enter_to_continue
% -  wait_for_enter

/**
*   input_menu_option(-Option)
*
*   Prompt the user to choose a gamemode, saving the chosen option.
*/
input_menu_option(Option) :-
    get_int_between(' > Choose game mode ', Option, 0, 4).

/**
*   input_board_size(-Height, -Width)
*
*   Prompt the user to choose the board dimensions (Height and Width).
*/
input_board_size(Height, Width) :-
    ansi_format([bold], ' > Choose board size ', [world]), nl,
    repeat, ansi_format([bold], '\t> Height ', [world]), get_int(Height),
    repeat, ansi_format([bold], '\t> Width ', [world]), get_int(Width), !.
    

/**
*   input_bot_level(-Level)
*
*   Prompt the user to choose the bot level
*/
input_bot_level(Level) :-
    get_int_between(' > CPU level ', Level, 1, 2).

/**
*   input_bot_level(-Level, +Player)
*
*   Prompt the user to choose the bot level of Player
*/
input_bot_level(Level, 1) :-
    get_int_between(' > CPU 1 level ', Level, 1, 2).

input_bot_level(Level, 2) :-
    get_int_between(' > CPU 2 level ', Level, 1, 2).


/**
*   input_move(-X - -Y, +Height, +Width)
*
*   Prompt the user to input a coordinate of the board.
*/
input_move(X-Y, Height, Width) :- 
    ansi_format([bold], ' > Choose move ', [world]), nl,
    input_hor_coord(X, Width), 
    input_ver_coord(Y, Height).

/**
*   input_ver_coord(-Coord, +Height)
*
*   Prompt the user to choose the vertical coordinate.
*/
input_ver_coord(Coord, Height) :- 
    MaxCoord is Height - 1,
    get_int_between('\t> Vertical coordinate ', Coord, 0, MaxCoord).

/**
*   input_hor_coord(-Coord, +Width)
*
*   Prompt the user to choose the horizontal coordinate.
*/
input_hor_coord(Coord, Width) :- 
    repeat,
    ansi_format([bold], '\t> Horizontal coordinate ', [world]), 
    get_letter(Letter),
    letter_to_int(Letter, Coord),
    Coord >= 0, Coord =< Width - 1.

/**
*   get_int_between(+Prompt, -Option, +Min, +Max) 
*
*   Read from the keyboard an integer(option) between Min and Max (inclusive), displaying Prompt before.
*/
get_int_between(Prompt, Option, Min, Max) :- 
    repeat, 
    ansi_format([bold], Prompt, [world]), 
    get_int(Option), 
    Option >= Min, Option =< Max.

/**
*   get_letter(+Letter) 
*
*   Read a letter from the keyboard. If the word 'exit' is read, abort.
*/
get_letter(Letter) :- get_char_list(InputList), InputList \== [], char_list_to_letter(InputList, Letter).

char_list_to_letter(['e', 'x', 'i', 't'], _) :- abort. 
char_list_to_letter([Letter | []], Letter).

/**
*   letter_to_int(+Letter, -Int)
*
*   Put in Int the ASCII code of Letter
*/
letter_to_int(Letter, Int) :- atom_codes(Letter, Code), Code >= 97, Code =< 122, Int is Code - 97. 

flush :- get_char('\n').
flush :- flush_aux, !, fail.
flush_aux :- repeat, get_char(C), C == '\n'.

/**
*   get_int(+Int) 
*
*   Read a integer from the keyboard. If the word 'exit' is read, abort.
*/
get_int(Int) :- get_char_list(InputList), InputList \== [], char_list_to_int(InputList, Int).

get_char_list([]) :- peek_char('\n'), !, get_char(_).
get_char_list([Input | InputList]) :- get_char(Input), get_char_list(InputList).

char_list_to_int(['e', 'x', 'i', 't'], 0) :- abort.
char_list_to_int(DigitList, Int) :- char_list_to_int_aux(DigitList, 0, Int).

char_list_to_int_aux([], Int, Int).
char_list_to_int_aux([Digit | DigitList], Int, Res) :- 
    atom_number(Digit, Num), 
    NewInt is Int * 10 + Num, 
    char_list_to_int_aux(DigitList, NewInt, Res).

/** 
*   press_enter_to_continue
*
*   Display the message: "Press <ENTER> to continue." . Wait for <Enter to be pressed>
*/
press_enter_to_continue :-
    ansi_format([bold], 'Press ', [world]),
    ansi_format([bold, fg(green)], '<ENTER>', [world]),
    ansi_format([bold], ' to continue.', [world]),
    wait_for_enter, nl, nl.

/**
*   wait_for_enter
*
*   Wait for the <ENTER> key to be pressed.
*/
wait_for_enter :- get_char('\n'), !.
wait_for_enter :- get_char(_), wait_for_enter. 