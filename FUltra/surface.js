class Surface {
    constructor(context, x, y, width, length, rotation, shape, type) {
        // Constants
            this.context = context;
            this.shape = shape;
            this.WIDTH = width;
            this.LENGTH = length;
            // Rotation should always be > 0 and < 180
            this.ROTATION = rotation * Math.PI / 180;
            this.points = null;
            this.x = x;
            this.y = y;
            switch(type) {
                case "Mud":
                    this.speedFactor = 0.96;
                    this.color = "rgb(94, 71, 43)";
                    break;
                case "Grass":
                    this.speedFactor = 0.98;
                    this.color = "rgb(108, 163, 72)";
                    break;
                case "Road":
                    this.speedFactor = 1;
                    this.color = "rgb(12, 12, 13)";
                    break;
                default:
                    this.speedFactor = 1;
                    this.color = "rgb(255, 255, 255)";
                    break;
            }
            
    }

    draw() {
        this.context.fillStyle = this.color;
        switch(this.shape) {
            case "Circle":
                this.context.beginPath();
                this.context.arc(this.x, this.y, this.LENGTH, 0, 2 * Math.PI);
                this.context.closePath();
                this.context.fill();
                break;
            default:
                this.context.save();
                this.context.translate(this.x, this.y);
                this.context.rotate(this.ROTATION);
                this.context.translate(-this.x, -this.y);
                this.context.fillRect(this.x - (this.WIDTH / 2), this.y - (this.LENGTH / 2), this.WIDTH, this.LENGTH);
                this.context.restore();
        }
        
    }

    update() {
        this.draw();
    }  

    isColliding(x, y) {
        switch(this.shape) {
            case "Circle":
                if (Math.hypot(y - this.y, x - this.x) < this.LENGTH) {
                    return true;
                }
                return false;
            default:
                if (this.ROTATION == 0) {
                    if (x < this.x + (this.WIDTH / 2) && x > this.x - (this.WIDTH / 2) && 
                        y < this.y + (this.LENGTH / 2) && y > this.y - (this.LENGTH / 2)) {
                        return true;
                    }
                } else {
                    // Equation borrowed form Stack Overflow:
                    // https://stackoverflow.com/questions/2259476/rotating-a-point-about-another-point-2d
                    let relX = x - this.x;
                    let relY = y - this.y;
                    relX = relX * Math.cos(Math.PI - this.ROTATION) - relY * Math.sin(Math.PI - this.ROTATION);
                    relY = relX * Math.sin(Math.PI - this.ROTATION) - relY * Math.cos(Math.PI - this.ROTATION);
                    relX = relX + this.x;
                    relY = relY + this.y;
                    if (relX < this.x + (this.WIDTH / 2) && relX > this.x - (this.WIDTH / 2) && 
                    relY < this.y + (this.LENGTH / 2) && relY > this.y - (this.LENGTH / 2)) {
                        return true;
                    }
                }
                return false;
        }
        
    }
}