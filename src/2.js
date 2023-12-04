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
        return getGameScore(games, bagConfig);
    })
    .then((scores) => {
        console.log(`The answer to challenge 2.1 is: ${scores.valid}`);
        console.log(`The answer to challenge 2.2 is: ${scores.power}`);
        return;
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
    let redLowest = 0;
    let greenLowest = 0;
    let blueLowest = 0;

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
                number: parseInt(pullData[1])
            };

            console.log(gamePull)

            switch (gamePull.colour) {
                case 'red':
                    console.log(`Colour is ${gamePull.colour}, number is ${gamePull.number}, lowest for this is currently ${redLowest}`)
                    console.log(gamePull.number > redLowest);
                    if (gamePull.number > redLowest) {
                        redLowest = gamePull.number;
                        console.log(`Setting redLowest to ${gamePull.number}`)
                    }
                    break;

                case 'green':
                    console.log(`Colour is ${gamePull.colour}, number is ${gamePull.number}, lowest for this is currently ${greenLowest}`)
                    if (gamePull.number > greenLowest) {
                        greenLowest = gamePull.number;
                        console.log(`Setting greenLowest to ${gamePull.number}`)
                    }
                    break;
                        
                case 'blue':
                    console.log(`Colour is ${gamePull.colour}, number is ${gamePull.number}, lowest for this is currently ${blueLowest}`)
                    if (gamePull.number > blueLowest) {
                        blueLowest = gamePull.number;
                        console.log(`Setting blueLowest to ${gamePull.number}`)
                    }
                    break;
            }

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
    gameData.redLowest = redLowest;
    gameData.blueLowest = blueLowest;
    gameData.greenLowest = greenLowest;
    gameData.power = redLowest * blueLowest * greenLowest;

    console.log(gameData);
   
    return gameData;

}

async function getGameScore(games, config) {

    let validScore = 0;
    let powerScore = 0;
    let scores = {};

    for (game of games) {

        let isValid = false;
        
        isValid = await isValidGame(game, config);
      
        if (isValid) {
            validScore += game.gameId;
        }
    }

    for (game of games) {

        powerScore += game.power;

    }

    scores =  {
        valid: validScore,
        power: powerScore
    };

    return scores;
}   

async function isValidGame(game, config) {

    for (set of game.sets) {

        for (pull of set.pulls) {

            for (limit of config.colourLimits) {

                //console.log(`Set ${set.setId} in game ${game.gameId}: checking to see if ${pull.colour}: ${pull.number} violated the ${limit.colour}: max ${limit.number} rule.`)

                if (pull.colour === limit.colour && pull.number > limit.number) {
                  //console.log(`Set ${set.setId} in game ${game.gameId} violated a colour limit rule. It is not a valid game.`);
                  return false;
                }

            }
        }

    }
    //if no rules violated
    return true;

}