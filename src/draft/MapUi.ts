import { MapUiBase } from "./MapUi.generated";
import { mapBuilder } from "../ui/MapBuilder";
import Utils = Laya.Utils;
import Sprite = Laya.Sprite;
import Texture = Laya.Texture;

const { regClass, property } = Laya;

interface IMapPoint {
    type?: 'road' | 'house';
    id?: number;
}

const WIDTH = 1136;
const HEIGHT = 640;

// 宽度单位长度
const GRID_UNIT_W = 40;
// 高度单位长度
const GRID_UNIT_H = 40;

// 网格宽度
const GRID_UNIT_W_NUM = Math.floor(WIDTH / GRID_UNIT_W);
// 网格高度
const GRID_UNIT_H_NUM = Math.floor(HEIGHT / GRID_UNIT_H);

function getRandom(n: number, m: number): number {
    return Math.floor(Math.random() * (m - n + 1) + n);
}

@regClass()
export class Script extends MapUiBase {
    //declare owner : Laya.Sprite3D;
    private building: Sprite;

    // 地图数据
    public map: Array<IMapPoint[]> = []; // 1-表示道路，2-表示房子
    public idToMap: Record<number, [number, number]> = {};
    public mapPoint: Array<number[]> = [];
    public mapRelation: Record<number, Record<number, number>> = {};

    constructor() {
        super();
    }

    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    // onAwake(): void { }

    onEnable(): void {
        Laya.init(WIDTH, HEIGHT, Laya.WebGL);

        console.log('Build Map UI!');
        const { point, map } = mapBuilder();
        this.mapPoint = point;
        this.mapRelation = map;

        // 计算房屋和路径的位置
        // 1. 初始化地图数据
        this.map = [];
        for (let i = 0; i < GRID_UNIT_H_NUM; i++) {
            this.map.push(new Array(GRID_UNIT_W_NUM).fill(null));
        }
        // 2. 放置房子位置：每个房子周围都必须为空
        this.map[0][0] = { type: 'house', id: 0 };
        this.idToMap[0] = [0, 0];
        let nextY = 2;
        for (let i = 1; i < point.length; i++) {
            const curY = getRandom(nextY, GRID_UNIT_W_NUM - (point.length - i - 1) * 2 - 1);
            nextY = curY + 2;

            let nextX = 0;
            for (let j = 0; j < point[i].length; j++) {
                const curX = getRandom(nextX, GRID_UNIT_H_NUM - (point[i].length - j - 1) * 2 - 1);
                nextX = curX + 2;
                this.map[curX][curY] = { type: 'house', id: point[i][j] };
                this.idToMap[point[i][j]] = [curX, curY];
            }
        }
        // 3. 从每个房子找路径：最短路径查找
        for (let source in map) {
            for (let target in map[source]) {
                this.PaveRoad(parseInt(source), parseInt(target));
            }
        }
        // this.PaveRoad(0, 1);
        this.onLoaded();
    }

    // 查找有效路径
    PaveRoad(source: number, target: number) {
        const [startX, startY] = this.idToMap[source];
        const visited = new Set();
        visited.add(`${startX}-${startY}`);

        // 深度优先算法
        const queue = [[this.idToMap[source]]];

        while (queue.length) {
            const parentPoints = queue[queue.length - 1];
            const [[x, y]] = parentPoints;

            const nextPointInfos: { point: [number, number]; distance: number; }[] = [];
            const points: Array<[number, number]> = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
            // 1.检查是否存在终点   
            if (points.some((point) => this.isSame(point, this.idToMap[target]))) {
                break;
            }
            // 2. 获取有效节点
            points.forEach((point) => {
                if (!this.isValidPoint(point[0], point[1]) || visited.has(`${point[0]}-${point[1]}`)) {
                    return;
                }
                nextPointInfos.push({
                    point,
                    distance: this.cost(point, this.idToMap[source]) + this.cost(point, this.idToMap[target])
                })
                visited.add(`${point[0]}-${point[1]}`);
            })
            nextPointInfos.sort((a, b) => a.distance - b.distance || this.distance(a.point, this.idToMap[target]) - this.distance(b.point, this.idToMap[target]));
            if (!nextPointInfos.length) {
                parentPoints.shift();
                if (!parentPoints.length) {
                    queue.pop();
                }
            } else {
                queue.push(nextPointInfos.map((data) => data.point));
            }
        }
        if (!queue.length) {
            return;
        }
        for (let i = 1; i < queue.length; i++) {
            const [[x, y]] = queue[i];
            this.map[x][y] = { type: 'road' };
        }
    }

    isSame(cur: number[], node: number[]): boolean {
        return cur[0] === node[0] && cur[1] === node[1];
    }

    cost(cur: number[], node: number[]): number {
        const a = cur[0] - node[0], b = cur[1] - node[1];
        return Math.abs(a) + Math.abs(b);
    }

    distance(cur: number[], node: number[]): number {
        const a = cur[0] - node[0], b = cur[1] - node[1];
        return Math.sqrt(a * a + b * b);
    }

    isValidPoint(x: number, y: number) {
        if (x < 0 || y < 0) {
            return false;
        }
        if (x >= GRID_UNIT_H_NUM || y >= GRID_UNIT_W_NUM) {
            return false;
        }
        if (this.map[x][y]?.type === 'house') {
            return false;
        }
        return true;
    }

    /**
     * 组件被启用后执行，例如节点被添加到舞台后
     */
    onLoaded(): void {
        // 绘制第一层：地面纹理
        const groundTexture: Texture = Texture.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 5 * 33 + 1, 3 * 33 + 1, 30, 30);
        // const groundTexture: Texture = Texture.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 0, 0, GRID_UNIT_W, GRID_UNIT_H);
        this.bg.graphics.fillTexture(groundTexture, 0, 0, WIDTH, HEIGHT);

        // 绘制第二层：房屋&road
        this.building = new Laya.Sprite();
        this.bg.addChild(this.building);

        // for (let source in this.mapRelation) {
        //     for (let target in this.mapRelation[source]) {
        //         const start = this.idToMap[source];
        //         const end = this.idToMap[target];
        //         this.building.graphics.drawLine((start[1] + 0.5) * GRID_UNIT_W, (start[0] + 0.5) * GRID_UNIT_H, (end[1] + 0.5) * GRID_UNIT_W, (end[0] + 0.5) * GRID_UNIT_H, 'black');
        //     }
        // }
        // 获取house纹理
        const houseTexture: Texture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
        // 获取road纹理
        const roadTexture: Texture = Texture.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 1 * 33 + 1, 4 * 33 + 1, 30, 30);
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x]?.type === 'house') {
                    this.building.graphics.drawTexture(houseTexture, x * GRID_UNIT_W, y * GRID_UNIT_H, GRID_UNIT_W, GRID_UNIT_H);
                }
                else if (this.map[y][x]?.type === 'road') {
                    this.building.graphics.fillTexture(roadTexture, x * GRID_UNIT_W, y * GRID_UNIT_H, GRID_UNIT_W, GRID_UNIT_H);
                }
            }
        }
        this.building.pos(0, 0);
    }

    /**
     * 组件被禁用时执行，例如从节点从舞台移除后
     */
    //onDisable(): void {}

    /**
     * 第一次执行update之前执行，只会执行一次
     */
    // onStart(): void { }

    /**
     * 手动调用节点销毁时执行
     */
    //onDestroy(): void {

    /**
     * 每帧更新时执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     */
    //onUpdate(): void {}

    /**
     * 每帧更新时执行，在update之后执行，尽量不要在这里写大循环逻辑或者使用getComponent方法
     */
    //onLateUpdate(): void {}

    /**
     * 鼠标点击后执行。与交互相关的还有onMouseDown等十多个函数，具体请参阅文档。
     */
    //onMouseClick(): void {}
}