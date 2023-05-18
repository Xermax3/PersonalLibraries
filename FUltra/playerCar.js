class PlayerCar {
    constructor(context, map, x, y, imgSrc) {
        // Constants
            this.context = context;
            this.map = map;
            this.image = new Image();
            this.image.src = imgSrc;
            
            this.WIDTH = 15;
            this.LENGTH = 30;

            this.arrowImg = new Image();
            this.arrowImg.src = 'Images/Arrow.png';
            this.ARROW_SIZE = 40;
            this.ARROW_GAP = 80;

            this.audioVroom = new Audio();
            this.audioVroom.src = 'Audio/Vroom.ogg';
            this.AUDIO_VOLUME_CAP = 0.25;
            this.playVroom();

            this.SPEED_UNIT_IN_KMH = 20;

            // Maximum speed of the car. Stops accelerating after this point.
            this.SPEED_CAP = 12;

            // How fast the car speeds up when moving.
            this.GO_ACCELERATION_RATE = 0.00200;

            // How fast the car slows down when braking.
            this.STOP_ACCELERATION_RATE = -0.00550;

            // How much the car turns per rotation input (in angles).
            this.ROTATION_RATE = 2.5;

            // How much the car slows down when turning. Should be > GO_ACC to have an effect.
            this.ROTATION_ACCELERATION_RATE = -0.00205;

            // Speed at which rotation slows down the car. 0 = will fully stop the car.
            this.ROTATION_SPEED_CAP = 1;

        // Variables
            // this.x and this.y represent the center of the car
            this.x = x;
            this.y = y;
            this.speed = 0;
            this.acceleration = 0;
            this.rotation = 0;
            this.surfaceSpeedFactor = 1;

            // For collision detection
            this.xSize;
            this.ySize;

            // For checkpoints
            this.nextCheckpoint;

            // For arrow
            this.arrowRotation = 0;

            // For controls
            this.canMove = false;
            this.goingForward = false;
            this.turningLeft = false;
            this.turningRight = false;         
    }

    draw() {
        if (this.image.complete) {
            this.context.save();
            this.context.translate(this.x, this.y);
            this.context.rotate(this.rotation * Math.PI / 180);
            this.context.translate(-this.x, -this.y);
            this.context.drawImage(this.image, this.x - (this.WIDTH / 2), this.y - (this.LENGTH / 2), this.WIDTH, this.LENGTH);
            this.context.restore();
        }
        if (this.arrowImg.complete) {
            this.context.save();
            this.context.translate(this.x, this.y - this.ARROW_GAP);
            this.context.rotate(this.arrowRotation);
            this.context.translate(-this.x, -this.y + this.ARROW_GAP);
            this.context.drawImage(this.arrowImg, this.x - (this.ARROW_SIZE / 2), 
                this.y - this.ARROW_GAP - (this.ARROW_SIZE / 2), this.ARROW_SIZE, this.ARROW_SIZE);
            this.context.restore();
        }
    }

    update() {
        this.checkSurface();
        this.updateRotation();
        this.updateAcceleration();
        this.updateSpeed();
        this.updatePosition();
        this.checkWalls();
        this.checkMapEdges();
        this.updateArrow();
        this.updateVroom();
        this.draw();
    }

    updateRotation() {
        if (this.turningLeft) {
            this.rotation -= this.ROTATION_RATE * (1 / this.surfaceSpeedFactor);
        }
        if (this.turningRight) {
            this.rotation += this.ROTATION_RATE * (1 / this.surfaceSpeedFactor);            
        }
    }

    updateAcceleration() {
        if (this.speed == 0 && this.acceleration < 0) {
            this.acceleration = 0;
        } else if (this.goingForward) {
            if (this.speed < this.SPEED_CAP) {
                //console.log("Good to go");
                this.acceleration += this.GO_ACCELERATION_RATE;
            } else {
                //console.log("Cap reached -> stop acceleration");
                this.acceleration = 0;
            }
            if (this.speed > this.ROTATION_SPEED_CAP && (this.turningLeft || this.turningRight)) {
                //console.log("Rotation");
                this.acceleration += this.ROTATION_ACCELERATION_RATE;
            }
        } else {
            if (this.speed > this.ROTATION_SPEED_CAP && (this.turningLeft || this.turningRight)) {
                //console.log("Rotation");
                this.acceleration += this.ROTATION_ACCELERATION_RATE;
            }
            if (this.speed > 0) {
                //console.log("Decelerate");
                this.acceleration += this.STOP_ACCELERATION_RATE;
            } else {
                //console.log("Stopped");
                this.acceleration = 0;
            }
        }
        this.acceleration *= this.surfaceSpeedFactor;
    }

    updateSpeed() {
        this.speed += this.acceleration;
        this.speed *= this.surfaceSpeedFactor;
        if (this.speed < 0) {
            this.speed = 0;
        } else if (this.speed > this.SPEED_CAP) {
            this.speed = this.SPEED_CAP;
        }
    }

    updatePosition() {
        this.x = this.x + Math.sin(this.rotation * Math.PI / 180) * this.speed;
        this.y = this.y - Math.cos(this.rotation * Math.PI / 180) * this.speed;
        this.xSize = Math.abs(Math.sin(this.rotation * Math.PI / 180) * this.LENGTH) / 2;
        this.ySize = Math.abs(Math.cos(this.rotation * Math.PI / 180) * this.LENGTH) / 2;
    }

    checkSurface() {
        this.surfaceSpeedFactor = 1;
        this.map.surfaces.forEach( surface => {
            if (surface.isColliding(this.x, this.y)) {
                this.surfaceSpeedFactor = surface.speedFactor;
                return;
            };
        });
    }

    checkWalls() {
        this.map.walls.forEach(wall => {
            this.x = wall.isCollidingX(this.x, this.y, this.xSize, this.ySize);
            return;
        });
        this.map.walls.forEach(wall => {
            this.y = wall.isCollidingY(this.x, this.y, this.xSize, this.ySize);
            return;
        });
    }

    checkMapEdges() {
        if (this.x < this.xSize + (this.ySize / 2)) {
            this.x = this.xSize + (this.ySize / 2);
		} else if (this.x > canvas.width - this.xSize - (this.ySize / 2)) {
            this.x = canvas.width - this.xSize - (this.ySize / 2);
        }
        if (this.y < this.ySize + (this.xSize / 2)) {
            this.y = this.ySize + (this.xSize / 2);
		} else if (this.y > canvas.height - this.ySize - (this.xSize / 2)) {
            this.y = canvas.height - this.ySize - (this.xSize / 2);
        }
    }

    updateArrow() {
        this.arrowRotation = Math.atan2(this.nextCheckpoint.y - this.y + 50, this.nextCheckpoint.x - this.x);
    }

    updateVroom() {
        if (this.audioVroom) {
            this.audioVroom.volume = this.AUDIO_VOLUME_CAP * (this.speed / this.SPEED_CAP);
        }
    }

    playVroom() {
        // Audio - Done using Web Audio API (makes looping sounds more seamless)
        let audioContext = new (window.AudioContext || window.webkitAudioContext)();
        let audioSource = audioContext.createMediaElementSource(this.audioVroom);
        let audioAnalyser = audioContext.createAnalyser();
        audioSource.connect(audioAnalyser);
        audioAnalyser.connect(audioContext.destination);
        this.audioVroom.loop = true;
        this.audioVroom.volume = 0;
        this.audioVroom.play();
    }

    speedToKMH() {
        return (Math.round(this.speed * this.SPEED_UNIT_IN_KMH * 100) / 100).toFixed(1);
    }


    reachedCheckpoint() {
        return this.nextCheckpoint.isColliding(this.x, this.y);
    }


    // User input methods
    turnLeft() { this.turningLeft = true; }
    turnRight() { this.turningRight = true; }
    turnLeftStop() { this.turningLeft = false; }
    turnRightStop() { this.turningRight = false; }
    go() { this.goingForward = true; }
    stop() { this.goingForward = false; }
}