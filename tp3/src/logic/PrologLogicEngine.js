class PrologLogicEngine extends LogicEngine {
    async getInitialState(width, height) {
        const response = await makeRequest('initialstate', `[generate_initial_game_state, ${height.toFixed(0)}, ${width.toFixed(0)}, P, P]`);
        return deserializeGameState(response.state);
    }

    async isValidMove(gameState, move) {
        const response = await makeRequest('validmove', `[is_valid_move, ${serializeGameState(gameState)}, ${move.x}-${move.y}]`);
        return response.bool;
    }

    async makeMove(gameState, move) {
        const response = await makeRequest('makemove', `[move, ${move.x}-${move.y}, ${serializeGameState(gameState)}]`);
        return response.newGameState;
    }

    async gameOver(gameState) {
        const response = await makeRequest('gameover', `[checkgameover, ${serializeGameState(gameState)}]`);
        return response.response;
    }

    static async makeRequest(endpoint, requestString) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        const response = await fetch(`http://localhost:8083/${endpoint}`, { method: 'POST', headers, body: 'requestString=' + encodeURIComponent(requestString) });
        if (!response.ok) throw 'An error ocurred';
        return await response.json();
    }

    static deserializeGameState(serialized) {
        return {
            boards: {
                octagon: serialized[0],
                square: serialized[1]
            },
            size: {
                width: serialized[3],
                height: serialized[2]
            },
            playerTypes: {
                p1: serialized[4],
                p2: serialized[5]
            },
            nextPlay: {
                player: serialized[6]
            }
        };
    }

    static serializeGameState(state) {
        return [state.boards.octagon, state.boards.square, state.size.height, state.size.width, state.playerTypes.p1, state.playerTypes.p2, state.nextPlay.player];
    }
}