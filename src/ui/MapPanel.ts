import { Building } from "./Building";
import Texture = Laya.Texture;
import MapAction from "./MapAction";
const { regClass, property } = Laya;

interface IPos {
    x: number;
    y: number;
}
interface IRoadPoint extends IPos {
    turn?: number; // 第几个拐弯
    isTurn?: boolean; // 当前是否为拐弯
    value?: number; // 当前distance和距离end相加的权重，越小越正确
}
interface IRoad {
    cost: number;
    points: IRoadPoint[];
}
interface IBuilding extends IPos {
    id: number;
    sprite?: Building;
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
    public buildingMapper: Record<number | string, IMapPoint> = {};
    // 原始地图数据
    public mapInfo: MapAction = null;
    // sprite
    private roadSprite: Laya.Sprite = new Laya.Sprite();
    private highLightRoadSprite: Laya.Sprite = new Laya.Sprite();
    private buildingSprite: Laya.Sprite = new Laya.Sprite();
    private characterSprite: Laya.Sprite = new Laya.Sprite();


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
        this.addChild(this.characterSprite);
        this.characterSprite.pos(0, 0);

    }

    initGrid(rowHeight = 40, columnWidth = 40) {
        this.gridColumnWidth = columnWidth;
        this.gridRowHeight = rowHeight;
        this.gridRows = Math.floor(this.height / this.gridRowHeight);
        this.gridColumns = Math.floor(this.width / this.gridColumnWidth);
    }

    generate(mapInfo: MapAction): void {
        // 1. 初始化数据
        // if (mapInfo != null) {
        //     this.mapInfo = mapInfo;
        // } else {
        //     this.mapInfo = new MapAction();
        // }
        this.mapInfo = new MapAction();

        this.initMap();
        // 2. 绘制地图
        this.drawMap();
        this.highLightRoads(0);
    }

    initMap(): void {
        // 1. 销毁历史sprite
        for (let source in this.buildingMapper) {
            this.buildingMapper[source].sprite?.destroy(true);
            this.buildingMapper[source].sprite = null;
        }
        // 2. 初始化地图数据
        const { point: building, map: relation } = this.mapInfo;
        this.buildingMapper = {};
        this.map = [];
        for (let i = 0; i < this.gridRows; i++) {
            this.map.push(new Array(this.gridColumns).fill(null));
        }
        // 3. 确定building位置，尽可能充满地图(随机性)
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
        // 4. 确定road经过节点，确保路径短，拐弯少
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
        this.drawCharacter();
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
        this.buildingSprite.destroyChildren();
        // 建筑物绘制
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x]?.id !== undefined) {
                    const building = new Building();
                    building.size(this.gridColumnWidth, this.gridRowHeight);
                    building.pos(this.getXPos(x), this.getYPos(y));
                    this.buildingSprite.addChild(building);
                    this.map[y][x].sprite = building;

                    // 绑定事件
                    building.on('click', () => {
                        if (this.mapInfo.isFinish) {
                            console.log('Game Finish!')
                            return;
                        }
                        if (this.mapInfo.checkArrival(this.map[y][x].id)) {
                            this.mapInfo.positionChange(this.map[y][x].id);
                            this.highLightRoads(this.map[y][x].id)
                            this.characterSprite.pos(this.getXPos(x), this.getYPos(y))
                        }
                        if (this.mapInfo.isFinish) {
                            console.log('Game Finish!')
                        }
                    })
                }
            }
        }
    }
    drawCharacter() {
        const carTexture: Texture = Texture.create(Laya.loader.getRes("resources/map/car.png"), 0, 0, 330, 230);
        this.characterSprite.graphics.drawTexture(carTexture, 0, 0, 50, 50);
    }
    highLightRoads(id: number | string) {
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

    // (已走 + 预测cost)路径最短 -> 拐弯最少
    getRoadPoints(start: IBuilding, end: IBuilding): IRoadPoint[] {
        if (!start || !end) {
            return [];
        }
        const queue: IRoadPoint[][] = [[{ x: start.x, y: start.y, turn: 0 }]];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        while (queue.length) {
            const lastRoad = queue.shift();
            const [curPoint, prevPoint] = lastRoad;
            const lastRoadNum = queue.length;
            let isEnd = false;
            for (let i = 0; i < directions.length; i++) {
                const nextPoint: IRoadPoint = {
                    x: curPoint.x + directions[i][0],
                    y: curPoint.y + directions[i][1],
                    turn: curPoint.turn || 0
                };
                // 1. 判断节点是否为终点
                if (nextPoint.x === end.x && nextPoint.y === end.y) {
                    isEnd = true;
                    queue.unshift([nextPoint, ...lastRoad]);
                    break;
                }
                // 2. 判断节点是否有效
                if (nextPoint.x < 0 || nextPoint.y < 0 ||
                    nextPoint.x >= this.gridColumns || nextPoint.y >= this.gridRows ||
                    this.map[nextPoint.y][nextPoint.x] !== null) {
                    continue;
                }
                // 3. 判断节点是否拐弯
                if (prevPoint) {
                    if (new Set([prevPoint.x, curPoint.x, nextPoint.x]).size !== 1 &&
                        new Set([prevPoint.y, curPoint.y, nextPoint.y]).size !== 1) {
                        nextPoint.turn++;
                        nextPoint.isTurn = true;
                    }
                }
                // 4. 计算节点的cost
                nextPoint.value = lastRoad.length + this.calcPointValue(nextPoint, end);
                queue.unshift([nextPoint, ...lastRoad]);
            }
            if (isEnd) {
                break;
            }
            if (queue.length !== lastRoadNum) {
                queue.sort((a, b) => a[0].value === b[0].value ? a[0].turn - b[0].turn : a[0].value - b[0].value);
            }
        }
        return queue[0].reverse();
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