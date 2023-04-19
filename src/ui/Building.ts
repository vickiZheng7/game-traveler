import Texture = Laya.Texture;
const { regClass, property } = Laya;


@regClass()
export class Building extends Laya.Sprite {
    constructor() {
        super();
        this.width = 40;
        this.height = 40;
        const houseTexture: Texture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
        this.graphics.drawTexture(houseTexture, 0, 0, this.width, this.height);
    }
}