class Wall {
    constructor(context, x, y, width, length, shape) {
        this.context = context;
        this.shape = shape;
        this.WIDTH = width;
        this.LENGTH = length;
        //this.ROTATION = rotation * Math.PI / 180;
        this.x = x;
        this.y = y;
    }

    draw() {
        this.context.fillStyle = "Grey";
        switch(this.shape) {
            case "Circle":
                this.context.beginPath();
                this.context.arc(this.x, this.y, this.LENGTH, 0, 2 * Math.PI);
                this.context.closePath();
                this.context.fill();
                break;
            default:
                //this.context.save();
                //this.context.translate(this.x, this.y);
                //this.context.rotate(this.ROTATION);
                //this.context.translate(-this.x, -this.y);
                this.context.fillRect(this.x - (this.WIDTH / 2), this.y - (this.LENGTH / 2), this.WIDTH, this.LENGTH);
                //this.context.restore();
        }
    }

    update() {
        this.draw();
    }

    angleOfPoint(x, y) {
        return Math.atan2(y - this.y, x - this.x);
    }

    circleSizeX(x, y) {
        return Math.cos(this.angleOfPoint(x, y)) * this.LENGTH;
    }

    circleSizeY(x, y) {
        return Math.sin(this.angleOfPoint(x, y)) * this.LENGTH;
    }

    isCollidingX(x, y, xSize, ySize) {
        switch(this.shape) {
            case "Circle":
                if (y > this.y - this.LENGTH && y < this.y + this.LENGTH) {
                    if (x < this.x && x > this.x + this.circleSizeX(x, y) - xSize - (ySize / 2)) {
                        return this.x + this.circleSizeX(x, y) - xSize - (ySize / 2);
                    } else if (x > this.x && x < this.x + this.circleSizeX(x, y) + xSize + (ySize / 2)) {
                        return this.x + this.circleSizeX(x, y) + xSize + (ySize / 2);
                    }
                }
                return x;
            default:
                //if (this.rotation == 0) {
                    if (y > this.y - (this.LENGTH / 2) && y < this.y + (this.LENGTH / 2)) {
                        if (x < this.x && x > this.x - (this.WIDTH / 2) - xSize - (ySize / 2)) {
                            return this.x - (this.WIDTH / 2) - xSize - (ySize / 2);
                        } else if (x > this.x && x < this.x + (this.WIDTH / 2) + xSize + (ySize / 2)) {
                            return this.x + (this.WIDTH / 2) + xSize + (ySize / 2);
                        }
                    }
                //} else {

                //}
                return x;
        }
    }

    isCollidingY(x, y, xSize, ySize) {
        switch(this.shape) {
            case "Circle":
                if (x > this.x - this.LENGTH && x < this.x + this.LENGTH) {
                    if (y < this.y && y > this.y + this.circleSizeY(x, y) - ySize - (xSize / 2)) {
                        return this.y + this.circleSizeY(x, y) - ySize - (xSize / 2);
                    } else if (y > this.y && y < this.y + this.circleSizeY(x, y) + ySize + (xSize / 2)) {
                        return this.y + this.circleSizeY(x, y) + ySize + (xSize / 2);
                    }
                }
                return y;
            default:
                // if (this.rotation == 0) {
                    if (x > this.x - (this.WIDTH / 2) && x < this.x + (this.WIDTH / 2)) {
                        if (y < this.y && y > this.y - (this.LENGTH / 2) - ySize - (xSize / 2)) {
                            return this.y - (this.LENGTH / 2) - ySize - (xSize / 2);
                        } else if (y > this.y && y < this.y + (this.LENGTH / 2) + ySize + (xSize / 2)) {
                            return this.y + (this.LENGTH / 2) + ySize + (xSize / 2);
                        }
                    }
                // } else {

                // }
                return y;
        }
    }
}