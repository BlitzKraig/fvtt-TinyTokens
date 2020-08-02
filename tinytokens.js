// TODO if grid is hexes
class TinyTokens {
    static skipCounter = 0;

    static Utilities = {
        roundDown: (input, roundTo) => {
            return Math.floor(input / roundTo) * roundTo;
        }
    }

    static Position = {
        center: (scene, token, basePosition) => {
            token.x = basePosition.x + scene.data.grid / 4
            token.y = basePosition.y + scene.data.grid / 4
            return token;
        },
        topLeft: (scene, token, basePosition) => {
            token.x = basePosition.x;
            token.y = basePosition.y;

            return token;
        },
        topRight: (scene, token, basePosition) => {
            token.x = basePosition.x + scene.data.grid / 2;
            token.y = basePosition.y;
            return token;
        },
        bottomLeft: (scene, token, basePosition) => {
            token.x = basePosition.x;
            token.y = basePosition.y + scene.data.grid / 2;
            return token;
        },
        bottomRight: (scene, token, basePosition) => {
            token.x = basePosition.x + scene.data.grid / 2
            token.y = basePosition.y + scene.data.grid / 2
            return token;
        },
        bottomCenter: (scene, token, basePosition) => {
            token.x = basePosition.x + scene.data.grid / 4
            token.y = basePosition.y + scene.data.grid / 2
            return token;
        }
    }


    static async positionTokens(tinyTokensOnSquare, scene, tokenData, tokenPosition) {
        switch (tinyTokensOnSquare.length) {
            case 1:
                TinyTokens.Position.topLeft(scene, tinyTokensOnSquare[0], tokenPosition);
                TinyTokens.Position.bottomRight(scene, tokenData, tokenPosition);
                break;
            case 2:
                TinyTokens.Position.topLeft(scene, tinyTokensOnSquare[0], tokenPosition);
                TinyTokens.Position.topRight(scene, tinyTokensOnSquare[1], tokenPosition);
                TinyTokens.Position.bottomCenter(scene, tokenData, tokenPosition);
                break;
            case 3:
                TinyTokens.Position.topLeft(scene, tinyTokensOnSquare[0], tokenPosition);
                TinyTokens.Position.topRight(scene, tinyTokensOnSquare[1], tokenPosition);
                TinyTokens.Position.bottomLeft(scene, tinyTokensOnSquare[2], tokenPosition);
                TinyTokens.Position.bottomRight(scene, tokenData, tokenPosition);
                break;
                //0, 4+
            default:
                TinyTokens.Position.center(scene, tokenData, tokenPosition);
                break;
        }
        let results = await canvas.tokens.updateMany(tinyTokensOnSquare, {
            diff: false,
            tinyTokenSkip: true
        });
    }

    static async positionPreviousTokens(tinyTokensOnSquare, scene, tokenPosition) {
        switch (tinyTokensOnSquare.length) {
            case 1:
                TinyTokens.Position.center(scene, tinyTokensOnSquare[0], tokenPosition);
                break;
            case 2:
                TinyTokens.Position.topLeft(scene, tinyTokensOnSquare[0], tokenPosition);
                TinyTokens.Position.bottomRight(scene, tinyTokensOnSquare[1], tokenPosition);
                break;
            case 3:
                TinyTokens.Position.topLeft(scene, tinyTokensOnSquare[0], tokenPosition);
                TinyTokens.Position.topRight(scene, tinyTokensOnSquare[1], tokenPosition);
                TinyTokens.Position.bottomCenter(scene, tinyTokensOnSquare[2], tokenPosition);
                break;
                //0, 4+
            default:
                break;
        }
        let results = await canvas.tokens.updateMany(tinyTokensOnSquare, {
            diff: false,
            tinyTokenSkip: true
        });
    }

    static preUpdate(scene, token, changes, options) {

        if (options.tinyTokenSkip) {
            return;
        }
        if (!changes.x && !changes.y) {
            return;
        }
        if (token.height > 0.5 || token.width > 0.5) {
            return;
        }
        if (canvas.tokens.controlled.length > 1) {
            // Just return for now, until we can work out how to finish the below code
            return;
            if (e && !e.shiftKey) {
                console.log('Dragged');
                return;
            }
            if (++TinyTokens.skipCounter >= canvas.tokens.controlled.length) {
                console.log("SKIPCOUNTER");
                TinyTokens.skipCounter = 0;
                // RESOLVE for all controlled tokens
                let tokenArray = [];
                let baseTokenPosition = {
                    x: changes.x || token.x,
                    y: changes.y || token.y
                };
                canvas.tokens.controlled.forEach((token)=>{
                    let updates = {}
                    TinyTokens.Position.center(scene, updates, baseTokenPosition);
                    token.update(updates, {diff: false, tinyTokenSkip: true});
                    // tokenArray.push(scene.data.tokens.find((t)=>{
                    //     return t._id === token.id;
                    // }))
                })
                // tokenArray.forEach((t) => {
                //     TinyTokens.Position.center(scene, t, baseTokenPosition);
                //     t.update(t, {diff: false, tinyTokenSkip: true});
                // })
                // setTimeout(()=>{
                // canvas.tokens.updateMany(tokenArray, {diff: false, tinyTokenSkip: true});
                // }, 100);
                return false;
            } else {
                return false;
            }
        }

        let previousBaseTokenPosition = {
            x: TinyTokens.Utilities.roundDown(token.x, scene.data.grid),
            y: TinyTokens.Utilities.roundDown(token.y, scene.data.grid)
        };
        let baseTokenPosition = {
            x: changes.x || token.x,
            y: changes.y || token.y
        };
        var previousGridSquare = [
            previousBaseTokenPosition.x,
            previousBaseTokenPosition.x + scene.data.grid,
            previousBaseTokenPosition.y,
            previousBaseTokenPosition.y + scene.data.grid
        ];
        var gridSquare = [baseTokenPosition.x, baseTokenPosition.x + scene.data.grid, baseTokenPosition.y, baseTokenPosition.y + scene.data.grid];

        let e = window.event;
        if (e && !e.shiftKey) {
            // console.log('Dragged');
            let correctedBaseTokenPosition = {
                x: TinyTokens.Utilities.roundDown(baseTokenPosition.x, scene.data.grid),
                y: TinyTokens.Utilities.roundDown(baseTokenPosition.y, scene.data.grid)
            };
            var correctedGridSquare = [correctedBaseTokenPosition.x, correctedBaseTokenPosition.x + scene.data.grid, correctedBaseTokenPosition.y, correctedBaseTokenPosition.y + scene.data.grid];

            var tinyTokensOnSquare = scene.data.tokens.filter((t) => {
                return t._id !== token._id && t.x >= correctedGridSquare[0] && t.x < correctedGridSquare[1] && t.y >= correctedGridSquare[2] && t.y < correctedGridSquare[3] && t.height <= 0.5 && t.width <= 0.5;
            });

            TinyTokens.positionTokens(tinyTokensOnSquare, scene, changes, correctedBaseTokenPosition);

        } else if (!e || !e.shiftKey) {
            var tinyTokensOnSquare = scene.data.tokens.filter((t) => {
                return t._id !== token._id && t.x >= gridSquare[0] && t.x < gridSquare[1] && t.y >= gridSquare[2] && t.y < gridSquare[3] && t.height <= 0.5 && t.width <= 0.5;
            });

            TinyTokens.positionTokens(tinyTokensOnSquare, scene, changes, baseTokenPosition);
        }

        var tinyTokensOnPreviousSquare = scene.data.tokens.filter((t) => {
            return t._id !== token._id && t.x >= previousGridSquare[0] && t.x < previousGridSquare[1] && t.y >= previousGridSquare[2] && t.y < previousGridSquare[3] && t.height <= 0.5 && t.width <= 0.5;
        });

        TinyTokens.positionPreviousTokens(tinyTokensOnPreviousSquare, scene, previousBaseTokenPosition);

    };

    static async preCreate(scene, token) {
        let sizeChanged = false;
        let baseTokenPosition = {
            x: token.x,
            y: token.y
        }
        if (game.system.id === "dnd5e" && game.actors.get(token.actorId).data.data.traits.size.toLowerCase() === "tiny" && token.height === 1 && token.width === 1) {
            token.height = 0.5;
            token.width = 0.5;
            sizeChanged = true;
        }
        // Return if shift is held, we don't want to change the position from user set
        if (window.event && window.event.shiftKey) {
            // console.log("SHIFT");
            if (sizeChanged) {
                // 'Centering' here actually offsets the size change, so the token will be dropped at the mouse point
                TinyTokens.Position.center(scene, token);
            }
            return;
        }

        var gridSquare = [token.x, token.x + scene.data.grid, token.y, token.y + scene.data.grid];

        var tinyTokensOnSquare = scene.data.tokens.filter((token) => {
            return token.x >= gridSquare[0] && token.x < gridSquare[1] && token.y >= gridSquare[2] && token.y < gridSquare[3] && token.height <= 0.5 && token.width <= 0.5;
        });

        if (token.height <= 0.5 && token.width <= 0.5) {
            await TinyTokens.positionTokens(tinyTokensOnSquare, scene, token, baseTokenPosition);
        }
    }
}

Hooks.on("preCreateToken", TinyTokens.preCreate);
Hooks.on("preUpdateToken", TinyTokens.preUpdate);
// Hooks.on("preUpdateToken", (scene, token, changes, options)=>{ return TinyTokens.preUpdate(scene, token, changes, options);});
// Hooks.on("preUpdateToken", this.preUpdate.bind(this));