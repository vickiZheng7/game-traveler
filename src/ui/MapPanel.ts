import { Building } from "./Building";
import Texture = Laya.Texture;
import MapAction from "./MapAction";
import { MyDialog } from "./dialog";
const { regClass, property } = Laya;

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
                this.drawRoad(this.roadSprite, points);
            }
        }
    }

    _drawRoad(sprite: Laya.Sprite, { points }: IRoad, color: any = 'black', width: number = 1) {
        sprite.graphics.drawLines(
            this.getXPos(points[0].x, 'center'),
            this.getYPos(points[0].y, 'center'),
            points.map(point => [this.getXPos(point.x - points[0].x), this.getYPos(point.y - points[0].y)]).flat(),
            color,
            width
        );
    }

    drawRoad(sprite: Laya.Sprite, points: IRoadPoint[], alpha: number = 1) {
        // 1. 加载素材图
        const roadsResource = Laya.loader.getRes("resources/map/roads.jpeg");
        // 2. 截取纹理图
        const straightTexture = Texture.create(roadsResource, 540, 0, 540, 540);
        const turnTexture = Texture.create(roadsResource, 0, 540, 540, 540);
        for (let i = 1; i < points.length - 1; i++) {
            // 1. 如果是拐弯
            const x = this.getXPos(points[i].x);
            const y = this.getYPos(points[i].y);
            if (points[i + 1].isTurn) {
                sprite.graphics.drawTexture(
                    turnTexture,
                    x,
                    y,
                    this.gridColumnWidth,
                    this.gridRowHeight,
                    this.getRotateMatrix(this.getTurnAngle(points[i - 1], points[i], points[i + 1]), x, y),
                    alpha
                )
                continue;
            }
            // 2. 如果是直行
            sprite.graphics.drawTexture(
                straightTexture,
                x,
                y,
                this.gridColumnWidth,
                this.gridRowHeight,
                this.getRotateMatrix(this.getStraightAngle(points[i], points[i + 1]), x, y),
                alpha
            )
        }
    }

    getRotateMatrix(angle: number, x: number, y: number) {
        const matrix = new Laya.Matrix();
        matrix.translate(- x - this.gridColumnWidth / 2, - y - this.gridRowHeight / 2);
        matrix.rotate(angle);
        matrix.translate(x + this.gridColumnWidth / 2, y + this.gridRowHeight / 2);
        return matrix;
    }

    getStraightAngle(start: IRoadPoint, end: IRoadPoint): number {
        if (end.x < start.x) {
            return Math.PI * 3 / 2;
        }
        if (end.x > start.x) {
            return Math.PI / 2;
        }
        if (end.y < start.y) {
            return 0;
        }
        return Math.PI;
    }
    getTurnAngle(prev: IRoadPoint, current: IRoadPoint, next: IRoadPoint): number {
        // 一个点在上
        if (prev.y < current.y || next.y < current.y) {
            // 一个点在右
            if (prev.x > current.x || next.x > current.x) {
                return 0;
            }
            return Math.PI * 3 / 2;
        } else {
            // 一个点在右
            if (prev.x > current.x || next.x > current.x) {
                return Math.PI / 2;
            }
            return Math.PI;
        }
    }

    drawBuildings() {
        // 清除历史痕迹
        this.buildingSprite.graphics.clear();
        this.buildingSprite.destroyChildren();
        // 建筑物绘制
        const houseTexture: Texture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x]?.id !== undefined) {
                    const building = new Building();
                    building.size(this.gridColumnWidth, this.gridRowHeight);
                    building.pos(this.getXPos(x), this.getYPos(y));
                    this.buildingSprite.addChild(building);
                    building.on('click', async () => {
                        // const pop = new MyDialog('test');
                        // pop.popup();
                        if (this.mapInfo.isFinish) {
                            console.log('Game Finish!')
                            return;
                        }
                        console.log('heiheihei', this.mapInfo.position, this.map[y][x].id)
                        if (this.mapInfo.checkArrival(this.map[y][x].id)) {
                            let count = 0;
                            const len = this.buildingMapper[this.mapInfo.position].targets[this.map[y][x].id].points.length;
                            this.buildingMapper[this.mapInfo.position].targets[this.map[y][x].id].points.map(e => {
                                console.log(e.x, e.y)
                                var tween = Laya.Tween.to(this.characterSprite, { x: this.getXPos(e.x), y: this.getYPos(e.y) }, 200, null, null, count * 200);
                                count++;
                            })
                            this.mapInfo.positionChange(this.map[y][x].id);
                            await new Promise((resolve) => { setTimeout(() => resolve(0), len * 200) })
                            this.highLightRoads(this.map[y][x].id)
                            
                        }
                        if (this.mapInfo.isFinish) {
                            console.log('Game Finish!')
                        }
                    })
                    this.map[y][x].sprite = building;
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
            this.drawRoad(this.highLightRoadSprite, building.targets[target].points);
        }
    }

    calcPointValue(start: IPos, end: IPos): number {
        return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }

    getRoadPoints(start: IBuilding, end: IBuilding): IRoadPoint[] {
        if (!start || !end) {
            return [];
        }
        const directions = [[0, 1], [-1, 0], [0, -1], [1, 0]];
        // 路径顺序
        const queue: IRoadPoint[][] = [[{ ...start, turn: 0, value: this.calcPointValue(start, end)}]];
        // 往下查找：广度优先
        while (queue.length && (queue[0][0].x !== end.x || queue[0][0].y !== end.y)) {
            // 1. 寻找下一个点
            const curPoints = queue.shift();
            const [curPoint, prevPoint] = curPoints;

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
                    curPoints.findIndex((point) => point.x === nextPoint.x && point.y === nextPoint.y) !== -1) {
                    continue;
                }
                // 2. 判断节点是否拐弯
                if (prevPoint) {
                    if (new Set([prevPoint.x, curPoint.x, nextPoint.x]).size !== 1 &&
                        new Set([prevPoint.y, curPoint.y, nextPoint.y]).size !== 1) {
                        nextPoint.turn++;
                        nextPoint.isTurn = true;
                    }
                }
                // 3. 如果是障碍物且不为终点，跳过
                if (this.map[nextPoint.y][nextPoint.x] !== null && (nextPoint.x !== end.x || nextPoint.y !== end.y)) {
                    continue;
                }
                // 4. 计算节点的cost
                nextPoint.value = curPoints.length + this.calcPointValue(end, nextPoint);
                nextPoints.push(nextPoint);
            }
            if (nextPoints.length) {
                queue.unshift(...nextPoints.map((point) => [point, ...curPoints]));
                queue.sort((a, b) => a[0].value === b[0].value ? a[0].turn - b[0].turn : a[0].value - b[0].value);
            }
        }
        if (!queue.length) {
            return [];
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