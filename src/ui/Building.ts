import Texture = Laya.Texture;
const { regClass, property } = Laya;


@regClass()
export class Building extends Laya.Sprite {
    constructor() {
        super();
        this.width = 40;
        this.height = 40;
        this.draw();
    }

    draw() {
        let texture: Texture;
        if (Math.ceil(Math.random() * 20) === 1) {
            texture = Texture.create(Laya.loader.getRes("resources/map/guangzhoutower.png"), 140, 0, 232, 512);
            this.graphics.drawTexture(texture, 0, -this.height, this.width, this.height * 2);
        } else {
            texture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
            this.graphics.drawTexture(texture, 0, 0, this.width, this.height);
        }
    }
}