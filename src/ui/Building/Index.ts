import { BuildingInfo, buildingImage, buildingInfos } from "./data";
import Texture = Laya.Texture;
const { regClass, property } = Laya;


@regClass()
export class Building extends Laya.Sprite {
    
    info: BuildingInfo;

    constructor(x: number, y: number, width: number, height: number, scale: number = 1) {
        super();
        // 1.随机生成建筑信息
        this.info = {
            width: 250,
            height: 250,
            ...buildingInfos[this.random(0, buildingInfos.length - 1)]
        };
        
        // 2.根据建筑比例调整实际高度
        const actualHeight = this.info.height / this.info.width * width;
        const actualY = y + (height - actualHeight);
        // 3.对建筑进行缩放
        if (scale === 1) {
            this.pos(x, actualY);
            this.size(width, actualHeight);
        } else {
            const scaleWidth = width * scale;
            const scaleHeight = actualHeight * scale;
            this.pos(x + (scaleWidth - width) / 2, y + (scaleHeight - actualHeight) / 2);
            this.size(scaleWidth, scaleHeight);
        }
        // 绘制
        this.draw();
    }

    draw() {
        let texture: Texture = Texture.create(
            Laya.loader.getRes(buildingImage),
            this.info.x,
            this.info.y,
            this.info.width,
            this.info.height
        );
        this.graphics.drawTexture(texture, 0, 0, this.width, this.height);
    }

    random(minNum: number, maxNum: number): number {
        return Math.ceil(Math.random() * (maxNum - minNum) + minNum);
    }
}