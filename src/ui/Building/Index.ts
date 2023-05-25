import data from "./data";
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
        const buildings = Object.values(data);
        const item = buildings[Math.ceil(Math.random() * (buildings.length - 1))];
        let texture: Texture = Texture.create(Laya.loader.getRes("resources/map/building.png"), item.x, item.y, 250, 250);
        this.graphics.drawTexture(texture, -this.width / 4, -this.height / 4, this.width * 1.5, this.height * 1.5);
    }
}