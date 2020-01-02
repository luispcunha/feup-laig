class PrologLogicEngine extends LogicEngine {
    async getInitialState(nColumns, nRows) {
        const response = await PrologLogicEngine.makeRequest('initialstate', `[generate_initial_game_state, ${nColumns.toFixed(0)}, ${nRows.toFixed(0)}, 1, 1]`);

        return PrologLogicEngine.deserializeGameState(response.state);
    }

    async makeMove(gameState, move) {
        const response = await PrologLogicEngine.makeRequest('makemove', `[move, ${move.col}-${move.row}, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeGameState(response.newGameState);
    }

    async gameOver(gameState) {
        const response = await PrologLogicEngine.makeRequest('gameover', `[gameover, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return response.winner;
    }

    async getRandomMove(gameState) {
        const response = await PrologLogicEngine.makeRequest('getmove', `[random_move, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeMove(response.move);
    }

    async getGreedyMove(gameState) {
        const response = await PrologLogicEngine.makeRequest('getmove', `[greedy_move, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeMove(response.move);
    }

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

    static deserializeMove(serialized) {
        const array = serialized.split('-');

        return {
            col: Number(array[0]),
            row: Number(array[1])
        }
    }

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

    static serializeGameState(state) {
        const values = [];

        Object.values(state).forEach(element => {
            values.push(...Object.values(element));
        });

        return JSON.stringify(values).replace(/\"/g, "");
    }
}