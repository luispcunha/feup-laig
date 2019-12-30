class PrologLogicEngine extends LogicEngine {
    async getInitialState(width, height) {
        const response = await PrologLogicEngine.makeRequest('initialstate', `[generate_initial_game_state, ${height.toFixed(0)}, ${width.toFixed(0)}, 1, 1]`);

        return PrologLogicEngine.deserializeGameState(response.state);
    }

    async makeMove(gameState, move) {
        const response = await PrologLogicEngine.makeRequest('makemove', `[move, ${move.x}-${move.y}, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return PrologLogicEngine.deserializeGameState(response.newGameState);
    }

    async gameOver(gameState) {
        console.log(`[gameover, ${PrologLogicEngine.serializeGameState(gameState)}]`);
        const response = await PrologLogicEngine.makeRequest('gameover', `[gameover, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return response.winner;
    }

    async getRandomMove(gameState) {
        const response = await PrologLogicEngine.makeRequest('getmove', `[random_move, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return response.move;
    }

    async getGreedyMove(gameState) {
        const response = await PrologLogicEngine.makeRequest('getmove', `[greedy_move, ${PrologLogicEngine.serializeGameState(gameState)}]`);

        return response.move;
    }

    static async makeRequest(endpoint, requestString) {
        const headers = new Headers();

        headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        const response = await fetch(`http://127.0.0.1:8083/${endpoint}`, { method: 'POST', headers, body: 'requestString=' + encodeURIComponent(requestString) });

        if (!response.ok) throw 'An error ocurred';
        return await response.json();
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