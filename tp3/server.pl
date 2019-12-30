:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_path)).
:- use_module(library(http/http_client)).
:- use_module(library(http/http_server_files)).

:- use_module(library(lists)).

:- http_handler(root(game), prepReplyStringToJSON, []).						% Predicate to handle requests on server/game (for Prolog Game Logic)

:- http_handler(root(initialstate), handleInitialState, []).
:- http_handler(root(validmove), handleValidMove, []).
:- http_handler(root(makemove), handleMakeMove, []).
:- http_handler(root(gameover), handleInitialState, []).

:- http_handler(src('.'), serve_files_in_directory(src), [prefix]).			% Serve files in /pub as requested (for WebGL Game Interface)
:- http_handler(lib('.'), serve_files_in_directory(lib), [prefix]).
http:location(src, root(src), []).											% Location of /pub alias on server
user:file_search_path(document_root, '.').									% Absolute location of HTTP server document root
user:file_search_path(src, document_root(src)).								% location of /pub in relation to document root
http:location(lib, root(lib), []).
user:file_search_path(lib, document_root(lib)).

server(Port) :-
    http_server(http_dispatch, [port(Port)]).		% Start server on port Port

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

handleInitialState(Request) :-
    member(method(post), Request), !,
    http_read_data(Request, Data, []),
    processInitialState(Data, Reply),
    format('Content-type: application/json~n~n'),
    initialFormatAsJSON(Reply).

processInitialState([_Par=Val], R):-
    term_string(List, Val),
    R = [_State],
    append(List, R, ListR),
    Term =.. ListR,
    Term.

initialFormatAsJSON(Reply):-
    write('{'),
    Fields = [state],
    writeJSON(Fields, Reply).


:- server(8083).