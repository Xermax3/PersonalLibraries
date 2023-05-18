class Decoration {
    constructor(context, x, y, width, length, rotation, imgSrc) {
        this.context = context;
        this.image = new Image();
        this.image.src = imgSrc;
        this.WIDTH = width;
        this.LENGTH = length;
        this.ROTATION = rotation * Math.PI / 180;
        this.x = x;
        this.y = y; 
    }

    draw() {
        if (this.image.complete) {
            this.context.save();
            this.context.translate(this.x, this.y);
            this.context.rotate(this.rotation);
            this.context.translate(-this.x, -this.y);
            this.context.drawImage(this.image, this.x - (this.WIDTH / 2), this.y - (this.LENGTH / 2), this.WIDTH, this.LENGTH);

            //this.context.fillStyle = "Yellow";
            //this.context.fillRect(this.x - (this.WIDTH / 2), this.y - (this.LENGTH / 2), this.WIDTH, this.LENGTH);

            this.context.restore();
        }
    }

    update() {
        this.draw();
    }
}