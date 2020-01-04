:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_path)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server_files)).

:- use_module(library(lists)).

% Set up routes at 'localhost:8083/$ROUTE' for out api endpoints
:- http_handler(root(game), prepReplyStringToJSON, []).
:- http_handler(root(initialstate), handleInitialState, []).
:- http_handler(root(makemove), handleMakeMove, []).
:- http_handler(root(gameover), handleGameOver, []).
:- http_handler(root(getmove), handleGetMove, []).

user:file_search_path(document_root, '.').
% Serve our game's frontend at 'localhost:8083/src'
:- http_handler(src('.'), serve_files_in_directory(src), [prefix]).
http:location(src, root(src), []).
user:file_search_path(src, document_root(src)).
% Serve WebCGF at 'localhost:8083/lib'
:- http_handler(lib('.'), serve_files_in_directory(lib), [prefix]).
http:location(lib, root(lib), []).
user:file_search_path(lib, document_root(lib)).

server(Port) :-
    http_server(http_dispatch, [port(Port)]).

%Receive Request as String via POST
prepReplyStringToJSON(Request) :-
        member(method(post), Request), !,						% if POST
        http_read_data(Request, Data, []),						% Retrieve POST Data
        processString(Data, Reply),								% Call processing predicate
        format('Content-type: application/json~n~n'),			% Reply will be JSON
        formatAsJSON(Reply).									% Send Reply as JSON

prepReplyStringToJSON(_Request) :-								% Fallback for non-POST Requests
        format('Content-type: text/plain~n~n'),					% Start preparing reply - reply type
        write('Can only handle POST Requests'),					% Standard Reply
        format('~n').											% End Reply

formatAsJSON(Reply):-
        write('{'),												% Start JSON Object
        Fields = [newPlayer, newBoard, message],				% Response Field Names
        writeJSON(Fields, Reply).								% Format content as JSON

writeJSON([Prop], [Val]):-
    write('"'), write(Prop),
    write('":"'), write(Val), write('"}').						% Last element
writeJSON([Prop|PT], [Val|VT]):-
    write('"'), write(Prop),
    write('":"'), write(Val), write('", '),						% Separator for next element
    writeJSON(PT, VT).

processString([_Par=Val], R):-
        term_string(List, Val),									% Convert Parameter String to Prolog List
        R = [_NB, _NP, _M],										% Variables for Response
        append(List, R, ListR),									% Add extra Vars to Request
        Term =.. ListR,											% Create Term from ListR
        Term.													% Call the Term

%---------------------------------------------

play(Player, Board, Play, NextPlayer, NewBoard, Message):-		% Example play predicate
    % Game Logic
    Board=[[_|A]|B], NewBoard=[[Play|A]|B],						% Example - changes [1,1] to Play
    next(Player, NextPlayer),									% Change Player
    Message = "Move Validated".									% Add some message (Game Over / Invalid Move / ...)

next(1,0).
next(0,1).

%--------------------------------------------

:- ensure_loaded('logic-engine/game_model.pl').
:- ensure_loaded('logic-engine/move.pl').
:- ensure_loaded('logic-engine/gameover.pl').
:- ensure_loaded('logic-engine/bot.pl').

% ENDPOINTS
% Here the general pattern is as follows:
% Prolog follows the convention that generally 'inputs' should come
% in the beginning of the term and 'outputs' in the end. Therefore,
% we convert the request string to a list of the term and the inputs,
% append it a list with the outputs, interpret it as a term, and call
% it. Then we serialize the outputs list and send it as a response.

handleInitialState(Request) :-
    member(method(post), Request), !,
    http_read_data(Request, Data, []),
    processInitialState(Data, Reply),
    format('Content-type: application/json~n~n'),
    initialFormatAsJSON(Reply).

processInitialState([_Par=Val], R) :-
    term_string(List, Val),
    R = [_State],
    append(List, R, ListR),
    Term =.. ListR,
    Term.

initialFormatAsJSON(Reply) :-
    write('{'),
    Fields = [state],
    writeJSON(Fields, Reply).


handleMakeMove(Request) :-
    member(method(post), Request), !,
    http_read_data(Request, Data, []),
    processMakeMove(Data, Reply),
    format('Content-type: application/json~n~n'),
    makeMoveFormatAsJSON(Reply).

processMakeMove([_Par=Val], R) :-
    term_string(List, Val),
    R = [_NewState],
    append(List, R, ListR),
    Term =.. ListR,
    Term.

makeMoveFormatAsJSON(Reply) :-
    write('{'),
    Fields = [newGameState],
    writeJSON(Fields, Reply).

handleGameOver(Request) :-
    member(method(post), Request), !,
    http_read_data(Request, Data, []),
    processGameOver(Data, Reply),
    format('Content-type: application/json~n~n'),
    gameOverFormatAsJSON(Reply).

processGameOver([_Par=Val], R) :-
    term_string(List, Val),
    R = [_Winner],
    append(List, R, ListR),
    Term =.. ListR,
    Term.

gameOverFormatAsJSON(Reply) :-
    write('{'),
    Fields = [winner],
    writeJSON(Fields, Reply).

handleGetMove(Request) :-
    member(method(post), Request), !,
    http_read_data(Request, Data, []),
    processGetMove(Data, Reply),
    format('Content-type: application/json~n~n'),
    getMoveFormatAsJSON(Reply).

processGetMove([_Par=Val], R) :-
    term_string(List, Val),
    R = [_Move],
    append(List, R, ListR),
    Term =.. ListR,
    Term.

getMoveFormatAsJSON(Reply) :-
    write('{'),
    Fields = [move],
    writeJSON(Fields, Reply).


:- server(8083).