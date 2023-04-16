import Texture = Laya.Texture;
import MapAction from "./MapAction";
const { regClass, property } = Laya;

interface IData {
    building: Array<number[]>;
    relation: Record<number, Record<number, string>>;
}

interface IPos {
    x: number;
    y: number;
}
interface IRoadPoint extends IPos {
    turn?: number; // 第几个拐弯
    isTurn?: boolean; // 当前是否为拐弯
    value?: number; // 距离start和距离end相加的权重，越小越正确
}
interface IRoad {
    cost: number;
    points: IRoadPoint[];
}
interface IBuilding extends IPos {
    id: number;
    targets?: Record<number, IRoad>;
}
type IMapPoint = IBuilding;

@regClass()
export class MapPanel extends Laya.Panel {
    // 网格列数
    private gridColumns: number = 0;
    // 网格行数
    private gridRows: number = 0;
    // 网格列宽
    private gridColumnWidth: number = 40;
    // 网格行高
    private gridRowHeight: number = 40;
    // 地图数据
    public map: IMapPoint[][] = [];
    // 建筑物数据
    public buildingMapper: Record<number, IMapPoint> = {};
    // 原始地图数据
    public mapInfo: MapAction = null;
    // sprite
    private roadSprite: Laya.Sprite = new Laya.Sprite();
    private highLightRoadSprite: Laya.Sprite = new Laya.Sprite();
    private buildingSprite: Laya.Sprite = new Laya.Sprite();
    

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
        this.initGrid();
        this.addChild(this.roadSprite);
        this.roadSprite.pos(0, 0);
        this.addChild(this.highLightRoadSprite);
        this.highLightRoadSprite.pos(0, 0);
        this.addChild(this.buildingSprite);
        this.buildingSprite.pos(0, 0);

    }

    initGrid(rowHeight = 40, columnWidth = 40) {
        this.gridColumnWidth = columnWidth;
        this.gridRowHeight = rowHeight;
        this.gridRows = Math.floor(this.height / this.gridRowHeight);
        this.gridColumns = Math.floor(this.width / this.gridColumnWidth);
    }

    generate(): void {
        // 1. 初始化数据
        this.mapInfo = new MapAction();
        this.initMap();
        // 2. 绘制地图
        this.drawMap();
    }

    initMap(): void {
        const { point: building, map: relation } = this.mapInfo;
        // 1. 初始化地图数据
        this.buildingMapper = {};
        this.map = [];
        for (let i = 0; i < this.gridRows; i++) {
            this.map.push(new Array(this.gridColumns).fill(null));
        }
        // 2. 确定building位置，尽可能充满地图(随机性)
        const firstBuilding = { id: 0, x: 0, y: 0 }
        this.map[0][0] = firstBuilding;
        this.buildingMapper[firstBuilding.id] = firstBuilding;

        let nextX = 2;
        for (let column = 1; column < building.length; column++) {
            const curX = this.getRandom(nextX, this.gridColumns - (building.length - column - 1) * 2 - 1);

            let nextY = 0;
            for (let row = 0; row < building[column].length; row++) {
                const curY = this.getRandom(nextY, this.gridRows - (building[column].length - row - 1) * 2 - 1);
                const curBuilding = { id: building[column][row], x: curX, y: curY };
                this.map[curY][curX] = curBuilding;
                this.buildingMapper[curBuilding.id] = curBuilding;
                nextY = curY + 2;
            }
            nextX = curX + 2;
        }
        // 3. 确定road经过节点，确保路径短，拐弯少
        for (let source in relation) {
            for (let target in relation[source]) {
                if (!this.buildingMapper[source]) {
                    continue;
                }
                if (!this.buildingMapper[source].targets) {
                    this.buildingMapper[source].targets = {};
                }
                const points = this.getRoadPoints(this.buildingMapper[source], this.buildingMapper[target]);
                if (points.length) {
                    this.buildingMapper[source].targets[target] = {
                        cost: parseInt(relation[source][target]),
                        points
                    };
                }
            }
        }
    }

    drawMap() {
        this.drawGround();
        this.drawRoads();
        this.drawBuildings();
    }

    drawGround() {
        // 清除历史痕迹
        this.graphics.clear();
        // 纹理绘制
        const groundTexture: Texture = Texture.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 5 * 33 + 1, 3 * 33 + 1, 30, 30);
        this.graphics.fillTexture(groundTexture, 0, 0, this.width, this.height);
    }

    drawRoads() {
        // 清除历史痕迹
        this.roadSprite.graphics.clear();
        // 路径绘制
        for (let source in this.buildingMapper) {
            for (let target in this.buildingMapper[source].targets) {
                const { points } = this.buildingMapper[source].targets[target];
                this.drawRoad(this.roadSprite, this.buildingMapper[source].targets[target]);
            }
        }
    }

    drawRoad(sprite: Laya.Sprite, { points }: IRoad, color: any = 'black', width: number = 1) {
        sprite.graphics.drawLines(
            this.getXPos(points[0].x, 'center'),
            this.getYPos(points[0].y, 'center'),
            points.map(point => [this.getXPos(point.x - points[0].x), this.getYPos(point.y - points[0].y)]).flat(),
            color,
            width
        );
    }

    drawBuildings() {
        // 清除历史痕迹
        this.buildingSprite.graphics.clear();
        // 建筑物绘制
        const houseTexture: Texture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x]?.id !== undefined) {
                    this.buildingSprite.graphics.drawTexture(houseTexture, this.getXPos(x), this.getYPos(y), this.gridColumnWidth, this.gridRowHeight);
                }
            }
        }
    }

    highLightRoads(id: number) {
        // 清除历史痕迹
        this.highLightRoadSprite.graphics.clear();
        const building = this.buildingMapper[id];
        if (!building?.targets) {
            return;
        }
        for (let target in building.targets) {
            this.drawRoad(this.highLightRoadSprite, building.targets[target], 'black', 5);
        }
    }

    calcPointValue(start: IPos, end: IPos): number {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }

    getRoadPoints(start: IBuilding, end: IBuilding): IRoadPoint[] {
        if (!start || !end) {
            return [];
        }
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        // 路径顺序
        const queue: IRoadPoint[][] = [[{ ...start, turn: 0 }]];
        // 访问过的位置
        const visited = new Set();
        visited.add(`${start.x}-${start.y}`);
        // 往下查找
        while (queue.length) {
            // 1. 寻找下一个点
            const curPoints = queue[0];
            const [curPoint] = curPoints;
            
            let isEnd = false;
            const nextPoints = [];
            for (let i = 0; i < directions.length; i++) {
                const nextPoint: IRoadPoint = {
                    x: curPoint.x + directions[i][0],
                    y: curPoint.y + directions[i][1],
                    turn: curPoint.turn || 0
                };
                // 1. 判断节点是否有效
                if (nextPoint.x < 0 || nextPoint.y < 0 ||
                    nextPoint.x >= this.gridColumns || nextPoint.y >= this.gridRows ||
                    visited.has(`${nextPoint.x}-${nextPoint.y}`)) {
                    continue;
                }
                // 2. 判断节点是否为终点
                if (nextPoint.x === end.x && nextPoint.y === end.y) {
                    isEnd = true;
                    queue.unshift([end]);
                    break;
                }
                // 3. 判断节点是否拐弯
                if (queue[1]) {
                    const [prevPoint] = queue[1];
                    if (new Set([prevPoint.x, curPoint.x, nextPoint.x]).size !== 1 &&
                        new Set([prevPoint.y, curPoint.y, nextPoint.y]).size !== 1) {
                        nextPoint.turn++;
                    }
                }
                // 4. 计算节点的cost
                nextPoint.value = this.calcPointValue(start, nextPoint) + this.calcPointValue(end, nextPoint);
                nextPoints.push(nextPoint);
            }
            if (isEnd) {
                break;
            }
            if (nextPoints.length) {
                nextPoints.sort((a, b) => a.value === b.value ? a.turn - b.turn : a.value - b.value);
                queue.unshift(nextPoints);
                visited.add(`${nextPoints[0].x}-${nextPoints[0].y}`)
                continue;
            }
            // 2. 回到上一个节点
            while (queue.length) {
                // 1. 移除第一个节点
                queue[0].shift();
                // 2. 如果非空，继续往下
                if (queue[0].length) {
                    const [curPoint] = queue[0];
                    visited.add(`${curPoint.x}-${curPoint.y}`);
                    break;
                }
                // 3. 为空，删掉节点
                queue.shift();
            }
        }
        if (!queue.length) {
            return [];
        }
        return queue.reverse().map(points => points[0]);
    }

    getRandom(n: number, m: number): number {
        return Math.floor(Math.random() * (m - n + 1) + n);
    }

    getXPos(x: number, placement?: 'center') {
        if (placement === 'center') {
            return (x + 0.5) * this.gridColumnWidth;
        }
        return x * this.gridColumnWidth;
    }

    getYPos(y: number, placement?: 'center') {
        if (placement === 'center') {
            return (y + 0.5) * this.gridRowHeight;
        }
        return y * this.gridRowHeight;
    }
}