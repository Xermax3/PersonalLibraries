class Checkpoint {
    constructor(number, x, y, width, length, shape) {
        this.number = number;
        this.shape = shape;
        this.WIDTH = width;
        this.LENGTH = length;
        // this.x and this.y represent the center
        this.x = x;
        this.y = y;
    }

    isColliding(x, y) {
        switch(this.shape) {
            case "Circle":
                if (Math.hypot(y - this.y, x - this.x) < this.LENGTH) {
                    return true;
                }
                return false;
            default:
                if (x < this.x + (this.WIDTH / 2) && x > this.x - (this.WIDTH / 2) && 
                    y < this.y + (this.LENGTH / 2) && y > this.y - (this.LENGTH / 2)) {
                    return true;
                }
                return false;
        }
    }
}