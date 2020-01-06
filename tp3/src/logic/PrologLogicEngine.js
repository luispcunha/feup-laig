/**
 * Class that interfaces with the Prolog server that contains the game's logic
 */
class PrologLogicEngine extends LogicEngine {
    /**
     * Gets initial state of the game
     *
     * @param {*} nColumns  desired number of columns of the board
     * @param {*} nRows     desired number of rows of the board
     */
    async getInitialState(nColumns, nRows) {
        const response = await PrologLogicEngine.makeRequest('initialstate', `[generate_initial_game_state, ${nRows.toFixed(0)}, ${nColumns.toFixed(0)}, 1, 1]`);

        return PrologLogicEngine.deserializeGameState(response.state);
    }

    /**
     * Receives a game state and a move, returning the an updated game state
     *
     * @param {} gameState  current game state
     * @param {*} move      move to apply to the current game state
     */
    async makeMove(gameState, move) {
        const response = await PrologLogicEngine.makeRequest('makemove', `[move, ${move.col}-${move.row}, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeGameState(response.newGameState);
    }

    /**
     * Checks if the game is over, returning -1 if not, and 1 or 2 depending on the player who won the game
     *
     * @param {*} gameState game state to check
     */
    async gameOver(gameState) {
        const response = await PrologLogicEngine.makeRequest('gameover', `[gameover, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return response.winner;
    }

    /**
     * Gets a random valid move for the game state
     *
     * @param {*} gameState game state for which a move is wanted
     */
    async getRandomMove(gameState) {
        const response = await PrologLogicEngine.makeRequest('getmove', `[random_move, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeMove(response.move);
    }

    /**
     * Gets the best move for the current game state, according to a greedy strategy
     *
     * @param {*} gameState game state for which a move is wanted
     */
    async getGreedyMove(gameState) {
        const response = await PrologLogicEngine.makeRequest('getmove', `[greedy_move, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeMove(response.move);
    }

    /**
     * Makes a request for the prolog
     *
     * @param {*} endpoint
     * @param {*} requestString
     */
    static async makeRequest(endpoint, requestString) {
        const headers = new Headers();

        headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        const response = await fetch(
            `http://${window.location.host}/${endpoint}`,
            {
                method: 'POST',
                headers,
                body: `requestString=${encodeURIComponent(requestString)}`
            }
            );

        if (!response.ok) throw 'An error ocurred';
        return await response.json();
    }

    /**
     * Parses a string containg a move in the prolog format
     *
     * @param {*} serialized string to parse
     */
    static deserializeMove(serialized) {
        const array = serialized.split('-');

        return {
            col: Number(array[0]),
            row: Number(array[1])
        }
    }

    /**
     * Converts a string representing a game state that comes from prolog to an object format
     *
     * @param {*} serialized string containing game state to convert
     */
    static deserializeGameState(serialized) {
        const elements = serialized.split(',');
        const lastElements = elements.splice(-6, 6);

        lastElements[lastElements.length - 1] = lastElements[lastElements.length - 1].slice(0, -1);

        const boardsString = elements.join(',') + ']';
        const boards = JSON.parse(boardsString);

        return {
            boards: {
                octagons: boards[0],
                squares: boards[1]
            },
            size: {
                width: lastElements[0],
                height: lastElements[1]
            },
            playerTypes: {
                p1: lastElements[2],
                p2: lastElements[3],
            },
            nextPlay: {
                player: lastElements[4],
                cut : lastElements[5]
            }
        };
    }

    /**
     * Converts object representing a game state to a string, ready for prolog
     *
     * @param {*} state state to convert
     */
    static serializeGameState(state) {
        const values = [];

        Object.values(state).forEach(element => {
            values.push(...Object.values(element));
        });

        return JSON.stringify(values).replace(/\"/g, "");
    }
}