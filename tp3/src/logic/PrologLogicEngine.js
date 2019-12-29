class PrologLogicEngine extends LogicEngine {
    async getInitialState(width, height) {
        return await makeRequest('initialState', { width, height });
    }

    async isValidMove(gameState, move) {
        throw "Not Implemented";
    }

    async makeMove(gameState, move) {
        throw "Not Implemented";
    }

    async gameOver(gameState) {
        throw "Not Implemented";
    }
}