% In this file:
%
% display_game(+GameState)
% display_gameover(+GameState)
% display_board(+OctagonBoard, +SquareBoard, +FirstVerticalCoord, +BoardHeight, +BoardWidth)
% display_cut_message(+CutInfo)
% write_player(+Player)
% display_square_piece(+Player)
% display_octagon_piece(+Player)
% display_logo()
% display_menu()
% display_main_screen()
% display_octagon_row(+Row)
% display_square_row_borders(+Row, +CurrentY, +Height, +Width)
% display_square_row(+Row)
% display_cpu_choice(+Move)
% display_box_message(+Msg, +MsgLength, +Width)
% display_turn_message(+Player, +Width)


/**
*   display_cpu_choice(+Move)
*
*   Displays the move chosen by the CPU
*/
display_cpu_choice(X-Y) :-
    ansi_format([bold], '> CPU move ', [world]),
    int_to_letter(Letter, X),
    ansi_format([fg(green), bold], Letter, [world]),
    ansi_format([bold], ', ', [world]),
    ansi_format([fg(green), bold], Y, [world]), nl, nl.
    

int_to_letter(Letter, Int) :- Code is Int + 97, char_code(Letter, Code).



/**
*   display_game(+GameState)
*
*   Displays information about the current gamestate. Displays the board (with coordinates) and whose plays turn it is to play. It also displays 
*   information about cuts
*/
display_game([OctagonBoard, SquareBoard, Height, Width, _, _, Player, CutHappened |[]]) :-
    display_cut_message(CutHappened), nl, nl,
    display_horizontal_coordinates(a, Width), nl, 
    display_board(OctagonBoard, SquareBoard, 0, Height, Width), nl,
    display_turn_message(Player, Width), nl.

display_cut_message(2-1) :-
    ansi_format([bold], 'A ', [world]), 
    ansi_format([fg(green), bold], 'CUT', [world]),
    ansi_format([bold], ' has happened. Next player gets 2 consecutive turns.', [world]), !.

display_cut_message(_).

/**
*   display_box_message(+Msg, +MsgLength, +Width)
*
*   Displays a box with with a given width with a message centered inside
*/
display_box_message(Msg, MsgLength, Width) :- 
    MsgLength < Width * 8,
    display_box_top(Width, Width),
    display_box_middle(Msg, MsgLength, Width),
    display_box_bottom(Width, Width).


/**
* display_turn_message(+Player, +Width)
*
* Displays info about which player will play next in a box with a given width
*/
display_turn_message(Player, Width) :-
    display_box_message((ansi_format([bold], 'PLAYER ', [world]), write_player(Player), ansi_format([bold], '\'s TURN', [world])), 14, Width).

/**
*   display_gameover(+GameState)
*
*   Displays the message "PLAYER X WON!" where X is the number of the player who won
*/
display_gameover([OctagonBoard, SquareBoard, Height, Width | _], Player) :-
    display_horizontal_coordinates(a, Width), nl, 
    display_board(OctagonBoard, SquareBoard, 0, Height, Width), nl, nl,
    display_gameover_message(Player, Width), nl.

display_gameover_message(Player, Width) :-
    display_box_message((
    ansi_format([bold], 'PLAYER ', [world]), write_player(Player), ansi_format([bold], ' WON!', [world])), 12, Width).

display_box_middle(Msg, MsgLength, Width) :-
    ansi_format([bold], '   ║', [world]),
    NWhiteSpace is div(Width * 8 + 2 - MsgLength, 2),
    display_n_whitespace(NWhiteSpace),
    Msg,
    display_n_whitespace(NWhiteSpace),
    ansi_format([bold], '║\n', [world]).

display_n_whitespace(0).
display_n_whitespace(N) :- write(' '), N1 is N - 1, display_n_whitespace(N1).


display_box_top(_, 0) :- ansi_format([bold], '══╗\n', [world]).
display_box_top(Width, Width) :- ansi_format([bold], '   ╔═════════', [world]), N is Width - 1, display_box_top(Width, N).
display_box_top(Width, N) :- ansi_format([bold], '════════', [world]), N1 is N - 1, display_box_top(Width, N1).


display_box_bottom(_, 0) :- ansi_format([bold], '══╝\n', [world]).
display_box_bottom(Width, Width) :- ansi_format([bold], '   ╚═════════', [world]), N is Width - 1, display_box_bottom(Width, N).
display_box_bottom(Width, N) :- ansi_format([bold], '════════', [world]), N1 is N - 1, display_box_bottom(Width, N1).



write_player(1) :- ansi_format([bold, fg(blue)], 1, [world]).
write_player(2) :- ansi_format([bold, fg(red)], 2, [world]).

/**
*   display_board(+OctagonBoard, +SquareBoard, +FirstVerticalCoord, +BoardHeight, +BoardWidth)
*
*   Displays the game board. Also displays vertical coordinates.
*/

display_board([], [], _, _, _).
display_board([], [SquareRow | SquareBoard], Y, Height, Width) :- 
    display_square_row_borders(SquareRow, Y, Height, Width), 
    YNext is Y + 1,
    display_board([], SquareBoard, YNext, Width, Height).
display_board([OctagonRow | OctagonBoard], [SquareRow | SquareBoard], Y, Height, Width) :-
    display_square_row_borders(SquareRow, Y, Height, Width), nl,
    display_y_coord(Y),  
    display_octagon_hor_separator(), 
    display_octagon_row(OctagonRow), nl,
    YNext is Y + 1,
    display_board(OctagonBoard, SquareBoard, YNext, Height, Width).

display_y_coord(Y) :- Y >= 10, !, ansi_format(bold, Y, [world]).
display_y_coord(Y) :- ansi_format(bold, Y, [world]), write(' ').

% display pieces

display_square_piece(1) :- ansi_format(fg(blue), '\u25C6', [world]).
display_square_piece(2) :- ansi_format(fg(red), '\u25C6', [world]).
display_square_piece(_) :- ansi_format([], ' ', [world]).

display_octagon_piece(1) :- ansi_format(fg(blue), '\u2BC3', [world]).
display_octagon_piece(2) :- ansi_format(fg(red), '\u2BC3', [world]).
display_octagon_piece(_) :- ansi_format([], ' ', [world]).


% display rows

display_octagon_row([]).
display_octagon_row([H | T]) :- display_octagon_piece(H), display_octagon_hor_separator(), display_octagon_row(T). 

display_square_row_borders(SquareRow, Y, Height, Width) :-
    write('    '), display_lower_octagon_cell(Y, Height, Width, 0), nl,
    write('     '), display_square_row(SquareRow), nl,
    write('    '), display_upper_octagon_cell(Y, Height, Width, 0).

display_square_row([]).
display_square_row([H | []]) :- display_square_piece(H).
display_square_row([H | T]) :- display_square_piece(H), display_octagon_ver_separator(), display_square_row(T).


% auxiliary functions to display borders of the cells

display_upper_octagon_cell(_, _, Width, X) :- X > Width.

display_upper_octagon_cell(0, Height, Width, 0) :-
    ansi_format(bold, '  \u2571     ', [world]),
    display_upper_octagon_cell(0, Height, Width, 1).

display_upper_octagon_cell(0, _Height, Width, Width) :-
    ansi_format(bold, '\u2572', [world]).

display_upper_octagon_cell(Height, Height, Width, 0) :-
    ansi_format(bold, '        ', [world]),
    display_upper_octagon_cell(Height, Height, Width, 1).

display_upper_octagon_cell(Height, Height, Width, Width).

display_upper_octagon_cell(Y, Height, Width, X) :-
    X =< Width,
    ansi_format(bold, '\u2572 \u2571     ', [world]),
    XNext is X + 1,
    display_upper_octagon_cell(Y, Height, Width, XNext).

display_lower_octagon_cell(0, Height, Width, 0) :-
    ansi_format(bold, '        ', [world]),
    display_lower_octagon_cell(0, Height, Width, 1).

display_lower_octagon_cell(0, _Height, Width, Width).

display_lower_octagon_cell(Height, Height, Width, 0) :-
    ansi_format(bold, '  \u2572     ', [world]),
    display_lower_octagon_cell(Height, Height, Width, 1).

display_lower_octagon_cell(Height, Height, Width, Width) :-
    ansi_format(bold, '\u2571', [world]).

display_lower_octagon_cell(_, _, Width, X) :- X > Width.
display_lower_octagon_cell(Y, Height, Width, X) :-
    X =< Width,
    ansi_format(bold, '\u2571 \u2572     ', [world]),
    XNext is X + 1,
    display_lower_octagon_cell(Y, Height, Width, XNext).



display_octagon_ver_separator() :- write('  \u2501\u2501\u2501  ').
display_octagon_hor_separator() :- write('   \u2503   ').


% display coordinates

display_horizontal_coordinates(LastChar, 1) :- write('   '), ansi_format(bold, LastChar, [world]), nl.
display_horizontal_coordinates(a, Num) :-
    Num > 1, 
    write('         '), 
    ansi_format(bold, a, [world]), 
    write('    '),  
    char_code(a, Code),
    NewCode is Code + 1,
    NewNum is Num - 1,
    char_code(NewChar, NewCode),
    display_horizontal_coordinates(NewChar, NewNum).
display_horizontal_coordinates(Char, Num) :- 
    Num > 1,
    write('   '), 
    ansi_format(bold, Char, [world]), 
    write('    '), 
    char_code(Char, Code),
    NewCode is Code + 1,
    NewNum is Num - 1,
    char_code(NewChar, NewCode),
    display_horizontal_coordinates(NewChar, NewNum).

% ███████╗ ██████╗ ██╗   ██╗███████╗██╗  ██╗
% ██╔════╝██╔═══██╗██║   ██║██╔════╝╚██╗██╔╝
% ███████╗██║   ██║██║   ██║█████╗   ╚███╔╝ 
% ╚════██║██║▄▄ ██║██║   ██║██╔══╝   ██╔██╗ 
% ███████║╚██████╔╝╚██████╔╝███████╗██╔╝ ██╗
% ╚══════╝ ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝

display_main_screen :-
    nl, display_logo, nl, display_menu, nl.    
    
display_menu :-
    ansi_format(bold, '[1]\t   PLAYER 1 vs. PLAYER 2', [world]), nl,
    ansi_format(bold, '[2]\t     PLAYER vs. CPU', [world]), nl,
    ansi_format(bold, '[3]\t        CPU vs. PLAYER', [world]), nl,
    ansi_format(bold, '[4]\t      CPU 1 vs. CPU 2', [world]), nl,
    ansi_format(bold, '[0]\t           EXIT', [world]), nl.


display_logo :-
    ansi_format(fg(red), '███████', [world]),
    ansi_format(fg(blue), '╗ ', [world]),
    ansi_format(fg(red), '██████', [world]),
    ansi_format(fg(blue), '╗ ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗   ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗', [world]),
    ansi_format(fg(red), '███████', [world]),
    ansi_format(fg(blue), '╗', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗  ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗', [world]),
    nl,
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔════╝', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔═══', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║   ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔════╝╚', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔╝', [world]),
    nl,
    ansi_format(fg(red), '███████', [world]),
    ansi_format(fg(blue), '╗', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║   ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║   ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '█████', [world]),
    ansi_format(fg(blue), '╗   ╚', [world]),
    ansi_format(fg(red), '███', [world]),
    ansi_format(fg(blue), '╔╝', [world]),
    nl,
    ansi_format(fg(blue), '╚════', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '▄▄ ██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║   ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '║', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔══╝   ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗', [world]),
    nl,
    ansi_format(fg(red), '███████', [world]),
    ansi_format(fg(blue), '║╚', [world]),
    ansi_format(fg(red), '██████', [world]),
    ansi_format(fg(blue), '╔╝╚', [world]),
    ansi_format(fg(red), '██████', [world]),
    ansi_format(fg(blue), '╔╝', [world]),
    ansi_format(fg(red), '███████', [world]),
    ansi_format(fg(blue), '╗', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╔╝ ', [world]),
    ansi_format(fg(red), '██', [world]),
    ansi_format(fg(blue), '╗', [world]),
    nl,
    ansi_format(fg(blue), '╚══════╝ ╚══', [world]),
    ansi_format(fg(red), '▀▀', [world]),
    ansi_format(fg(blue), '═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝', [world]),
    nl.

