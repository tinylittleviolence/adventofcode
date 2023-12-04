const { open } = require('node:fs/promises');

const bagConfig = {
    colourLimits: [
      { colour: 'red', number: 12 },
      { colour: 'green', number: 13 },
      { colour: 'blue', number: 14 }
    ]
}

readGamesFromFile('../files/2.txt')
    .then((games) => {
        return createGameArray(games);
    })
    .then((games) => {
        //console.log(games)
        return getGameScore(games, bagConfig);
    })
    .then((score) => {
        return console.log(`The answer to challenge 2.1 is: ${score}`);
    })


async function createGameArray(games) {

    let gameData = [];

    for (game of games) {

        const gameDetails = await parseGameData(game);
        gameData.push(gameDetails);
    }

    return gameData;

}

async function readGamesFromFile (file) {

    const stream = await open(file);

    let games = [];

    for await (const l of stream.readLines()) {

        games.push(l);

    }

    return games;

}

async function parseGameData (game) {

    let gameData = {};
    let gameSets = [];

    let gameId = parseInt(game.split(":")[0].match(/\d+/)[0]);
    //console.log(gameId);
    let sets = game.split(":")[1].split(";");
    //console.log(sets);

    for (let i = 0; i < sets.length; i++) {

        let pulls = sets[i].split(",");
        //console.log(pulls);

        let gamePulls = [];

        for (let pull of pulls) {

            let pullData = pull.split(" ");
        

            let gamePull = {
                colour: pullData[2],
                number: pullData[1]
            };

            gamePulls.push(gamePull);

        }

        let gameSet = {
            setId: i,
            numberOfPulls: pulls.length,
            pulls: gamePulls
        }

        //console.log(gameSet);
        gameSets.push(gameSet);
        
    }

    gameData.gameId = gameId;
    gameData.numberOfSets = sets.length;
    gameData.sets = gameSets;

    //console.log(gameData);
   
    return gameData;

}

async function getGameScore(games, config) {

    let score = 0;

    for (game of games) {

        let isValid = false;
        
        isValid = await isValidGame(game, config);
      
        if (isValid) {
          score += game.gameId;
        }
    }

    return score;
}   

async function isValidGame(game, config) {

    for (set of game.sets) {

        for (pull of set.pulls) {

            for (limit of config.colourLimits) {

                console.log(`Set ${set.setId} in game ${game.gameId}: checking to see if ${pull.colour}: ${pull.number} violated the ${limit.colour}: max ${limit.number} rule.`)

                if (pull.colour === limit.colour && pull.number > limit.number) {
                  console.log(`Set ${set.setId} in game ${game.gameId} violated a colour limit rule. It is not a valid game.`);
                  return false;
                }

            }
        }

    }
    //if no rules violated
    return true;

}