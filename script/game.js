"use strict";

// Register a key-event listener, bind a location transformer based on the last (valid)input
const snakeInputFactory = () => {
    const moveUpTransformer = ({row, column}) => ({row: row + 1, column});
    const moveDownTransformer = ({row, column}) => ({row: row - 1, column});
    const moveLeftTransformer = ({row, column}) => ({row, column: column - 1});
    const moveRightTransformer = ({row, column}) => ({row, column: column + 1});

    let nextLocationTransformer = moveRightTransformer;

    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 37) {
            nextLocationTransformer = moveLeftTransformer;
        }
        else if (event.keyCode === 38) {
            nextLocationTransformer = moveDownTransformer;
        } else if (event.keyCode === 39) {
            nextLocationTransformer = moveRightTransformer;
        } else if (event.keyCode === 40) {
            nextLocationTransformer = moveUpTransformer;
        }
    });
    return {
        nextLocation(snakeHead) {
            return nextLocationTransformer(snakeHead);
        }
    }
};

//Configure the arena with css grit-template properties, return an object representing the arena
const arenaFactory = (size) => {
    const arenaElement = document.getElementById("arena");
    arenaElement.style.cssText = `grid-template: repeat(${size}, 1fr)/repeat(${size}, 1fr);`;

    const powerUpElement = document.createElement("div");
    powerUpElement.style.cssText = `display:none;`;
    arenaElement.appendChild(powerUpElement);

    let powerUpLocation;

    const randomIntBetween = (min, max) => {

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
    };
    const placeNewPowerUp = (snake) => {

        const row = randomIntBetween(2, 8);
        const column = randomIntBetween(2, 8);
        powerUpLocation = {row, column};
        if (containsLocation(snake, powerUpLocation)) {
            placeNewPowerUp(snake);
        } else {
            powerUpElement.style.cssText = `background-color: red; grid-area: ${powerUpLocation.row}/${powerUpLocation.column};`;
        }
    };


    return {
        size,
        pickupPowerUpIfHitBy(snake) {
            if (!powerUpLocation) {
                placeNewPowerUp(snake);
                return false;
            }
            if (equalLocations(powerUpLocation, snake[0])) {
                placeNewPowerUp(snake);
                return true;
            } else {
                return false;
            }

        }
    };
};

const equalLocations = (first, second) => {
    return first.row === second.row && first.column === second.column;
};

const containsLocation = (snake, location) => {
    return snake.findIndex(snakePart => equalLocations(snakePart, location)) !== -1;
};

//Draw a snake with css grid-item properties
const drawSnake = (snake) => {
    const arena = document.getElementById("arena");
    const snakeParts = arena.querySelectorAll('*[id^="snake-part"]');
    snakeParts.forEach(snakePart => {
        arena.removeChild(snakePart);
    });

    snake.forEach((snakePart, index) => {
        const snakePartElement = document.createElement("div");
        snakePartElement.id = `snake-part-${index}`;
        snakePartElement.style.cssText = `background-color: green; grid-area: ${snakePart.row}/${snakePart.column};`;
        arena.appendChild(snakePartElement);
    });

};

const showOverlay = () => {
    document.getElementById("overlay").style.display = 'flex';
};

const collidesWithArenaBorder = ({size}, {row, column}) => {
    return row < 1 || column < 1 || row > size || column > size
};

const collidesWithSelf = (snake) => {
    const [head, ...tail] = snake;
    return containsLocation(tail, head);
};


//construct components
const arena = arenaFactory(20);
const snakeInput = snakeInputFactory();

let snake = [{row: 10, column: 10}];


//game ticks
const gameTick = () => {
    //transform location
    const movedHead = snakeInput.nextLocation(snake[0]);
    snake = [movedHead, ...snake];

    //Don't add a block if no 'PowerUp' is picked up
    if (!arena.pickupPowerUpIfHitBy(snake)) {
        snake = snake.slice(0, -1);
    }

    //collision with arena
    if (collidesWithArenaBorder(arena, snake[0])) {
        gameOver();
    }

    //collision with self
    if (collidesWithSelf(snake)) {
        gameOver();
    }

    //draw snake
    drawSnake(snake);
};

//start
const timeoutId = setInterval(gameTick, 88);

//End callback
const gameOver = () => {
    showOverlay();
    clearTimeout(timeoutId)
};
