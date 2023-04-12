import { mapBuilder } from "./MapBuilder";
import Texture = Laya.Texture;
const { regClass, property } = Laya;

interface IData {
    building: Array<number[]>;
    relation: Record<number, Record<number, string>>;
}

interface IPos {
    x: number;
    y: number;
}
interface IRoad {
    cost: number;
    points: IPos[];
}
interface IBuilding extends IPos {
    id: number;
    targets?: Record<number, IRoad>;
}
type IMapPoint = IBuilding;

@regClass()
export class MapPanel extends Laya.Panel {
    // 原始数据
    private data: IData;
    // 网格列数
    private gridColumns: number = 0;
    // 网格行数
    private gridRows: number = 0;
    // 网格列宽
    private gridColumnWidth: number = 40;
    // 网格行高
    private gridRowHeight: number = 40;
    // 地图数据
    public map: Array<IMapPoint[]> = [];
    // 建筑物数据
    public building: Record<number, IMapPoint> = {};

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
        this.initGrid();
    }

    initGrid(rowHeight = 40, columnWidth = 40) {
        this.gridColumnWidth = columnWidth;
        this.gridRowHeight = rowHeight;
        this.gridRows = Math.floor(this.height / this.gridRowHeight);
        this.gridColumns = Math.floor(this.width / this.gridColumnWidth);
    }

    generate(): void {
        // 1. 初始化数据
        const { point, map } = mapBuilder();
        this.data = { building: point, relation: map };
        this.initMap();
        // 2. 绘制地图
        this.drawMap();
    }

    initMap(): void {
        const { building, relation } = this.data;
        // 1. 初始化地图数据
        this.map = [];
        for (let i = 0; i < this.gridRows; i++) {
            this.map.push(new Array(this.gridColumns).fill(null));
        }
        // 2. 确定building位置，尽可能充满地图(随机性)
        const firstBuilding = { id: 0, x: 0, y: 0 }
        this.map[0][0] = firstBuilding;
        this.building[firstBuilding.id] = firstBuilding;

        let nextX = 2;
        for (let column = 1; column < building.length; column++) {
            const curX = this.getRandom(nextX, this.gridColumns - (building.length - column - 1) * 2 - 1);

            let nextY = 0;
            for (let row = 0; row < building[column].length; row++) {
                const curY = this.getRandom(nextY, this.gridRows - (building[column].length - row - 1) * 2 - 1);
                const curBuilding = { id: building[column][row], x: curX, y: curY };
                this.map[curY][curX] = curBuilding;
                nextY = curY + 2;
            }
            nextX = curX + 2;
        }
        // 3. 确定road经过节点，确保路径短，拐弯少
        for (let source in relation) {
            for (let target in relation[source]) {
                if (!this.building[source]) {
                    return;
                }
                if (!this.building[source].targets) {
                    this.building[source].targets = {};
                }
                this.building[source].targets[target] = {
                    cost: parseInt(relation[source][target]),
                    points: this.getRoadPoints(this.building[source], this.building[target])
                };
            }
        }
    }

    drawMap() {
        // 1. 地面纹理
        const groundTexture: Texture = Texture.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 5 * 33 + 1, 3 * 33 + 1, 30, 30);
        this.graphics.fillTexture(groundTexture, 0, 0, this.width, this.height);

        // 2. 绘制房屋
        const building = new Laya.Sprite();
        this.addChild(building);
        // 2.1 获取house纹理
        const houseTexture: Texture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
        // 2.2 绘制
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x]?.id !== undefined) {
                    building.graphics.drawTexture(houseTexture, this.getXPos(x), this.getYPos(y), this.gridColumnWidth, this.gridRowHeight);
                }
            }
        }
        building.pos(0, 0);
    }

    getRoadPoints(start: IBuilding, end: IBuilding): IPos[] {
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        const queue = [{ turn: 0, direct: 0, x: start.x, y: start.y }];
        const visited = new Set();
        const isValidPos = (pos: IPos) => {
            if (pos.x < 0 || pos.y < 0) {
                return false;
            }
            if (pos.x >= this.gridColumnWidth || pos.y >= this.gridRowHeight) {
                return false;
            }
            if (visited.has(`${pos.x}-${pos.y}`)) {
                return false;
            }
            return true;
        }
        // while (queue.length) {
        //     const curPos = queue[0];
        //     const distance = this.getDistance(curPos, end);
        //     // 原先的方向优先
        //     const nextPos = {x: curPos.x + directions[curPos.turn][1], y: curPos.y + directions[curPos.turn][0]};
        //     if (isValidPos(nextPos) && this.getDistance(nextPos, end) < distance) {
        //         queue.unshift({ ...curPos, ...nextPos });
        //         visited.add(`${nextPos.x}-${nextPos.y}`)
        //         continue;
        //     }
        //     // 找找其他方向
        //     for (let i = queue[0].direct; i < directions.length; i++) {

        //     }
        //     // 会退到上一个节点
        // }

        return [];
    }

    getDistance(a: IPos, b: IPos): number {
        const x = a.x - b.x, y = a.y - b.y;
        return Math.sqrt(x * x + y * y);
    }

    getRandom(n: number, m: number): number {
        return Math.floor(Math.random() * (m - n + 1) + n);
    }

    getXPos(x: number) {
        return x * this.gridColumnWidth;
    }

    getYPos(y: number) {
        return y * this.gridRowHeight;
    }
}