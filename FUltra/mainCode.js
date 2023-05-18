/*
    F-Ultra
    Created by: Maxence Roy
    Latest update: December 20, 2020
    Description: 'F-Ultra' is a solo racing game where the player must complete courses in order to get the highest
        score possible. The arrow above the player's car indicates the direction in which to go to complete laps. 
        It is quite unique in the sense that maps can be made from scratch using the given classes (see maps 1 and 2).
*/


document.addEventListener('DOMContentLoaded', () => {


// DOM Elements
const menuContainer = document.getElementById('menu-container');
const gameOverContainer = document.getElementById('gameover-container');
const canvasContainer = document.getElementById('canvas-container');
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const playButton = document.getElementById("play-btn");
const gameOverScore = document.getElementById("gameover-score");
const playAgainButton = document.getElementById("play-again-btn");
const goMenuButton = document.getElementById("go-menu-btn");
const textOnScreen = document.getElementById('text-on-screen');
const lapStats = document.getElementById('lap-stats');
const lapNumIndicator = document.getElementById('lap-num');
const lapTimer1 = document.getElementById('lap-1');
const speedIndicator = document.getElementById('speed-indicator');

// Assets
const CAR_IMG_SRC = 'Images/Car.png';
const FINISH_LINE_IMG_SRC = 'Images/FinishLine.png';
const raceStartMusic = new Audio()
raceStartMusic.src = 'Audio/RaceStart.mp3';
const newLapMusic = new Audio()
newLapMusic.src = 'Audio/NewLap.mp3';
const raceFinishMusic = new Audio()
raceFinishMusic.src = 'Audio/RaceFinish.mp3';

// Other
const PERFECT_RACE_SCORE = 100000;
let totalScore = 0;


// Game loop
menu();
async function menu() {
    while (true) {
        await new Promise( resolve => {
            playButton.addEventListener('click', e => {
                resolve();
            });
        });
        raceLoop();
    }
}

async function raceLoop() {
    totalScore = 0;
    gameOverContainer.style.display = "none"
    menuContainer.style.display = "none";
    canvasContainer.style.display = "flex";
    let raceResult = await race(1);
    //console.log(raceResult);
    canvasContainer.style.display = "none";
    if (raceResult == "Quit") {
        menuContainer.style.display = "flex";
        return;
    } else {
        gameOverScore.innerText = "Your final score was " + totalScore;
        gameOverContainer.style.display = "flex";
        let gameOverChoice = await new Promise( resolve => {
            playAgainButton.addEventListener('click', e => {
                resolve(1);
            });
            goMenuButton.addEventListener('click', e => {
                resolve(2);
            });
        });
        gameOverScore.innerText = "";
        if (gameOverChoice == 1) {
            raceLoop();
        } else {
            menuContainer.style.display = "flex";
            return;
        }
    }       
}


async function race(currentMapNum) {
    return new Promise( async resolve => {
        // Setup map, laps, checkpoints
        let map = maps[currentMapNum - 1];
        canvas.width = map.xSize;
        canvas.height = map.ySize;
        let currentLap = 1;
        let nextCheckpointNum = 1;
        let newLapTimers = [];
        let lapStartTime;
        let lapStartLapTime;
        let lapCurrentTime;
        lapNumIndicator.innerText = "Lap " + currentLap + "/" + map.lapNum;
        let animationLoop;
        let raceResolve = resolve;

        // Setup car
        let playerCar = new PlayerCar(context, map, map.checkpoints[0].x, map.checkpoints[0].y, CAR_IMG_SRC);
        playerCar.nextCheckpoint = map.checkpoints[nextCheckpointNum];

        // Player Controls
        window.addEventListener('keydown', event => {
            if (playerCar.canMove) {
                if (event.key == "w") {
                    playerCar.go();
                } if (event.key == "a") {
                    playerCar.turnLeft();
                } else if (event.key == "d") {
                    playerCar.turnRight();
                } else if (event.key == "Escape") {
                    //console.log("Quit")
                    if (animationLoop == null) {
                        raceStartMusic.pause();
                        raceStartMusic.currentTime = 0;
                    } else {
                        playerCar.canMove = false;
                        playerCar.audioVroom.pause();
                        cancelAnimationFrame(animationLoop);
                        speedIndicator.innerText = "0.0 km/h";
                        lapTimer1.innerText = "";
                        newLapTimers.forEach( lapTimer => {
                            lapStats.removeChild(lapTimer);
                        });
                    }
                    resolve("Quit");
                }
            }
        });
        window.addEventListener('keyup', event => {
            if (playerCar.canMove) {
                if (event.key == "w") {
                    playerCar.stop();
                } if (event.key == "a") {
                    playerCar.turnLeftStop();
                } else if (event.key == "d") {
                    playerCar.turnRightStop();
                }
            }
        });

        // Countdown
        requestAnimationFrame( () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            map.surfaces.forEach( surface => surface.draw() );
            map.decorations.forEach( decoration => decoration.draw() );
            map.walls.forEach( wall => wall.draw() );
            canvas.style.marginLeft = (-playerCar.x + (canvasContainer.clientWidth / 2)) + "px";
            canvas.style.marginTop = (-playerCar.y + (canvasContainer.clientHeight / 2)) + "px";
        });
        textOnScreen.innerText = "Press any key to start.";
        await new Promise( resolve => {
            window.addEventListener('keydown', onKeyDown);
            function onKeyDown(e) {
                window.removeEventListener('keydown', onKeyDown)
                resolve();
            }
        });
        requestAnimationFrame( () => {
            playerCar.updateArrow();
            playerCar.draw();
        });
        raceStartMusic.play();
        textOnScreen.innerText = "3";
        await sleep(1000);
        textOnScreen.innerText = "2";
        await sleep(1000);
        textOnScreen.innerText = "1";
        await sleep(1000);
        textOnScreen.innerText = "GO!!!";
        lapStartTime = lapStartLapTime = Date.now();
        playerCar.canMove = true;
        textInBG();
        async function textInBG() {
            await sleep(1000);
            textOnScreen.innerText = "";
        }
    
        // Animation loop
        async function animate() {
            // Draw and update all objects in the map
            animationLoop = requestAnimationFrame(animate);
            context.clearRect(0, 0, canvas.width, canvas.height);
            map.surfaces.forEach( surface => surface.update() );
            map.decorations.forEach( decoration => decoration.update() );
            map.walls.forEach( wall => wall.update() );
            playerCar.update();

            // Check for laps, checkpoints, race end
            if (playerCar.reachedCheckpoint()) {
                nextCheckpointNum = (nextCheckpointNum + 1) % map.checkpoints.length;
                if (nextCheckpointNum == 1) {
                    currentLap++;
                    if (currentLap > map.lapNum) {
                        raceFinishMusic.play();
                        playerCar.canMove = false;
                        playerCar.stop();
                        playerCar.turnLeftStop();
                        playerCar.turnRightStop();
                        playerCar.audioVroom.pause();
                        raceEnd();
                    } else {
                        updateLap();
                    }             
                }
                playerCar.nextCheckpoint = map.checkpoints[nextCheckpointNum]; 
                //console.log("Hit Checkpoint");
            }

            // Make canvas focus on the player's car
            canvas.style.marginLeft = (-playerCar.x + (canvasContainer.clientWidth / 2)) + "px";
            canvas.style.marginTop = (-playerCar.y + (canvasContainer.clientHeight / 2)) + "px";

            // Update DOM elements
            if (playerCar.canMove) {
                lapCurrentTime = Date.now();
                if (currentLap == 1) {
                    lapTimer1.innerText = readableLapTime();
                } else {
                    newLapTimers[currentLap - 2].innerText = readableLapTime();
                }
            }
            speedIndicator.innerText = playerCar.speedToKMH() + " km/h";
        }
        animate();

        function updateLap() {
            newLapMusic.play();
            lapNumIndicator.innerText = "Lap " + currentLap + "/" + map.lapNum;
            let newlapTimer = document.createElement("p");
            lapStats.appendChild(newlapTimer);
            newLapTimers.push(newlapTimer);
            lapStartLapTime = Date.now();
        }

        function readableLapTime() {
            let diff = lapCurrentTime - lapStartLapTime;
            let minutes = ("0" + Math.round(diff / 60000)).slice(-2);
            diff %= 60000;
            let seconds = ("0" + Math.round(diff / 1000)).slice(-2);
            diff %= 1000;
            return minutes + ":" + seconds + ":" + diff;
        }

        async function raceEnd() {
            let beginText = "COURSE CLEARED!\n\n"
            textOnScreen.innerText = beginText;
            await sleep(2000);
            let restOfText = "Your Score:"
            textOnScreen.innerText += restOfText;
            await sleep(1000);
            let score = getScore();
            restOfText += "\n" + score;
            textOnScreen.innerText = beginText + restOfText;
            await sleep(1000);
            if (score >= PERFECT_RACE_SCORE) {
                restOfText += "\nA perfect race!!!";
            } else if (score > (PERFECT_RACE_SCORE * 0.95)) {
                restOfText += "\nNear perfection!";
            } else if (score > (PERFECT_RACE_SCORE * 0.90)) {
                restOfText += "\nVery good!";
            } else if (score > (PERFECT_RACE_SCORE * 0.85)) {
                restOfText += "\nNice.";
            } else if (score > (PERFECT_RACE_SCORE * 0.80)) {
                restOfText += "\nThere's room for improvement.";
            } else if (score > (PERFECT_RACE_SCORE * 0.75)) {
                restOfText += "\nCould've been better...";
            } else if (score > (PERFECT_RACE_SCORE * 0.70)) {
                restOfText += "\nOof!";
            } else {
                restOfText += "\nDid you fall asleep!?";
            }
            await sleep(1000);
            if (currentMapNum == maps.mapNum) {
                textOnScreen.innerText = restOfText + "\n\nPress any key for next course.";
            } else {
                textOnScreen.innerText = restOfText + "\n\nPress any key to proceed.";
            }
            await new Promise( resolve => {
                window.addEventListener('keydown', onKeyDown);
                function onKeyDown(e) {
                    window.removeEventListener('keydown', onKeyDown)
                    resolve();
                }
            });
            textOnScreen.innerText = "";
            speedIndicator.innerText = "0.0 km/h";
            lapTimer1.innerText = "";
            newLapTimers.forEach( lapTimer => {
                lapStats.removeChild(lapTimer);
            });
            cancelAnimationFrame(animationLoop);
            totalScore += score;
            if (currentMapNum == maps.length) {
                raceResolve("Won");
            } else {
                raceResolve(await race(currentMapNum + 1));
            }
        }

        function getScore() {
            return Math.round(PERFECT_RACE_SCORE * map.perfectRace / (lapCurrentTime - lapStartTime));
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    });
}


// Maps
const maps = [
    // Map 1
    {
        xSize: 5000,
        ySize: 5000,
        lapNum: 3,
        perfectRace: 17100 * 3,
        checkpoints: [
            new Checkpoint(0, 400, 4000, 400, 200, "Block"),
            new Checkpoint(1, 2500, 2500, 200, 200, "Circle"),
            new Checkpoint(2, 4600, 1000, 200, 200, "Circle"),
            new Checkpoint(3, 4000, 400, 200, 200, "Circle"),
            new Checkpoint(4, 2500, 2500, 200, 200, "Circle"),
            new Checkpoint(5, 1000, 4600, 200, 200, "Circle")
        ],
        surfaces: [
            new Surface(context, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, "Block", "Grass"),
            new Surface(context, 1000, 4000, 800, 800, 0, "Circle", "Road"),
            new Surface(context, 4000, 1000, 800, 800, 0, "Circle", "Road"),
            new Surface(context, 2500, 2500, 300, 3700, 28, "Block", "Road"),
            new Surface(context, 2500, 2500, 300, 3700, 62, "Block", "Road"),
            new Surface(context, 1000, 4000, 485, 485, 0, "Circle", "Mud"),
            new Surface(context, 4000, 1000, 485, 485, 0, "Circle", "Mud"),
            new Surface(context, 2500, 2500, 80, 80, 0, "Circle", "Mud")
        ],
        decorations: [
            // Finish Line (same dimensions as Checkpoint 0)
            new Decoration(context, 400, 4000, 400, 200, 0, FINISH_LINE_IMG_SRC)
        ],
        walls: [
            new Wall(context, 1000, 4000, 400, 400, "Circle"),
            new Wall(context, 4000, 1000, 400, 400, "Circle")
        ]
    },

    // Map 2
    {
        xSize: 4000,
        ySize: 4000,
        lapNum: 3,
        perfectRace: 15000 * 3,
        checkpoints: [
            new Checkpoint(0, 1250, 2650, 500, 250, "Block"),
            new Checkpoint(1, 700, 1300, 1200, 1200, "Circle"),
            new Checkpoint(2, 1700, 350, 350, 350, "Circle"),
            new Checkpoint(3, 3600, 2200, 400, 400, "Circle"),
            new Checkpoint(4, 1300, 3650, 350, 350, "Circle"),
        ],
        surfaces: [
            new Surface(context, canvas.width / 2, canvas.height / 2, canvas.width, canvas.height, 0, "Block", "Grass"),
            new Surface(context, 2000, 1200, 3600, 2000, 0, "Block", "Mud"),
            new Surface(context, 2000, 2800, 3600, 2000, 0, "Block", "Road"),
            new Surface(context, 1200, 275, 2000, 150, 0, "Block", "Road"),
            new Surface(context, 1000, 1000, 1600, 1600, 0, "Block", "Road"),
            new Surface(context, 3800, 200, 1700, 1700, 0, "Circle", "Road"),
        ],
        decorations: [
            new Decoration(context, 1250, 2650, 500, 250, 0, FINISH_LINE_IMG_SRC)
        ],
        walls: [
            new Wall(context, 3800, 200, 1500, 1500, "Circle"),
            new Wall(context, 3150, 2200, 200, 800, "Block"),
            new Wall(context, 2450, 1900, 1600, 200, "Block"),
            new Wall(context, 3150, 2700, 200, 200, "Circle"),
            new Wall(context, 2850, 2900, 200, 200, "Circle"),
            new Wall(context, 2550, 3100, 200, 200, "Circle"),
            new Wall(context, 2250, 3300, 200, 200, "Circle"),
            new Wall(context, 1900, 3350, 200, 200, "Circle"),
            new Wall(context, 1600, 2500, 200, 2000, "Block"),
            new Wall(context, 1600, 1300, 600, 600, "Circle"),
            new Wall(context, 600, 900, 200, 200, "Circle"),
            new Wall(context, 900, 2000, 200, 200, "Circle"),
            new Wall(context, 1300, 3300, 800, 400, "Block"),
            new Wall(context, 500, 2700, 1000, 400, "Block"),
        ]
    },
]


});
