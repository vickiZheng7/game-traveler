(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b ||= {})
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/Index.generated.ts
  var IndexBase = class extends Laya.Scene {
  };
  __name(IndexBase, "IndexBase");

  // src/ui/Building/data.ts
  var data_default = {
    "\u897F\u9910\u5385": { x: 0, y: 0 },
    "\u97F3\u54CD\u5E97": { x: 250, y: 0 },
    "ktv": { x: 500, y: 0 },
    "\u9152\u5427": { x: 750, y: 0 },
    "\u5496\u5561\u5E97": { x: 0, y: 250 },
    "\u706B\u9505\u5E97": { x: 250, y: 250 },
    "\u5065\u8EAB\u623F": { x: 500, y: 250 },
    "\u7535\u5F71\u9662": { x: 750, y: 250 },
    "\u6E38\u4E50\u56ED": { x: 0, y: 500 },
    "\u8336\u9986": { x: 250, y: 500 },
    "\u5DF4\u897F\u70E4\u8089": { x: 500, y: 500 },
    "\u8C6A\u534E\u6D77\u9C9C\u996D\u5E97": { x: 750, y: 750 },
    "\u8C6A\u534E\u897F\u9910\u5385": { x: 750, y: 0 },
    "\u9C9C\u82B1\u5E97": { x: 750, y: 250 },
    "\u533B\u9662": { x: 750, y: 500 },
    "\u6D17\u8863\u673A": { x: 750, y: 750 }
  };

  // src/ui/Building/Index.ts
  var Texture = Laya.Texture;
  var { regClass, property } = Laya;
  var Building = class extends Laya.Sprite {
    constructor() {
      super();
      this.width = 40;
      this.height = 40;
      this.draw();
    }
    draw() {
      const buildings = Object.values(data_default);
      const item = buildings[Math.ceil(Math.random() * (buildings.length - 1))];
      let texture = Texture.create(Laya.loader.getRes("resources/map/building.png"), item.x, item.y, 250, 250);
      this.graphics.drawTexture(texture, -this.width / 4, -this.height / 4, this.width * 1.5, this.height * 1.5);
    }
  };
  __name(Building, "Building");
  Building = __decorateClass([
    regClass("cacf0a54-d6fe-4266-a93a-5adf7c756bfc", "../src/ui/Building/Index.ts")
  ], Building);

  // src/ui/MapBuilder.ts
  var RANDOM_CONFIG = {
    DEEP_MIN: 8,
    DEEP_MAX: 12,
    EACH_DEEP_POINT_MIN: 1,
    EACH_DEEP_POINT_MAX: 4,
    POINT_ROAD_MIN: 1,
    POINT_ROAD_MAX: 4,
    ROAD_PRICE_MIN: 10,
    ROAD_PRICE_MAX: 20,
    EVENT_VALUE_MIN: 1,
    EVENT_VALUE_MAX: 5,
    EVENT_ROAD_MIN: 1,
    EVENT_ROAD_MAX: 3
  };
  var PERCENT_CONFIG = {
    EVENT: {
      TOTAL: 1e4,
      TOTAL_PRICE_CHANGE: 5e3,
      ROAD_PRICE_CHANGE: 8999,
      POSITION_CHANGE: 9999,
      GAME_FAILED: 1
    },
    EVENT_ROAD_PRICE: {
      TOTAL: 10,
      FREE: 2
    }
  };
  function createRandom(min, max) {
    let rander = max - min + 1;
    return Math.floor(Math.random() * rander) + min;
  }
  __name(createRandom, "createRandom");
  function mapBuilder() {
    let roadNumber = 0, deepNumber = createRandom(RANDOM_CONFIG.DEEP_MIN, RANDOM_CONFIG.DEEP_MAX);
    let point = [[0]], pointNumber = 1;
    let map = {};
    let mapV = [], pointEvent = [], topology = {}, mapLength = 0;
    let maxCause = 0, maxPath = [], minCause = 0, minPath = [];
    function createPoint() {
      for (let i = 0; i < deepNumber; i++) {
        let random = createRandom(
          i == 0 ? RANDOM_CONFIG.EACH_DEEP_POINT_MAX - 2 : RANDOM_CONFIG.EACH_DEEP_POINT_MIN,
          RANDOM_CONFIG.EACH_DEEP_POINT_MAX
        );
        let r = [];
        for (let j = 0; j < random; j++) {
          pointNumber++;
          r[j] = pointNumber - 1;
        }
        point.push([...r]);
      }
      pointNumber++;
      point.push([pointNumber]);
      deepNumber = point.length;
    }
    __name(createPoint, "createPoint");
    function createMap() {
      for (let i = 0; i < deepNumber - 1; i++) {
        for (let j = 0; j < point[i].length; j++) {
          let start2 = point[i][j];
          map[start2] = {};
          let limit = point[i + 1].length;
          let limitArr = [...point[i + 1]];
          if (i + 2 != deepNumber) {
            limit += point[i + 2].length;
            limitArr = [...limitArr, ...point[i + 2]];
          }
          let road = createRandom(
            RANDOM_CONFIG.POINT_ROAD_MIN,
            Math.min(limit - 1, RANDOM_CONFIG.POINT_ROAD_MAX)
          );
          for (var t = 0; t < road; t++) {
            var end = Math.floor(Math.random() * (limitArr.length - t));
            map[start2][limitArr[end]] = createRandom(
              RANDOM_CONFIG.ROAD_PRICE_MIN,
              RANDOM_CONFIG.ROAD_PRICE_MAX
            );
            if (!topology[limitArr[end]])
              topology[limitArr[end]] = 0;
            topology[limitArr[end]]++;
            mapV[mapLength] = {
              x: start2,
              y: limitArr[end],
              z: map[start2][limitArr[end]]
            };
            mapLength++;
            limitArr[end] = limitArr[limitArr.length - t - 1];
          }
        }
      }
      for (let i = 1; i < deepNumber - 1; i++) {
        for (let j = 0; j < point[i].length; j++) {
          if (!topology[point[i][j]]) {
            let limitArr = [...point[i - 1]];
            var start = Math.floor(Math.random() * (limitArr.length - t));
            let startP = limitArr[start];
            topology[point[i][j]]++;
            map[startP][point[i][j]] = createRandom(
              RANDOM_CONFIG.ROAD_PRICE_MIN,
              RANDOM_CONFIG.ROAD_PRICE_MAX
            );
            mapV[mapLength] = {
              x: startP,
              y: point[i][j],
              z: map[startP][point[i][j]]
            };
            mapLength++;
          }
        }
      }
    }
    __name(createMap, "createMap");
    function createEvent() {
      pointEvent[0] = {};
      pointEvent[pointNumber - 1] = {};
      for (let i = 1; i < pointNumber - 1; i++) {
        let pecent = createRandom(1, PERCENT_CONFIG.EVENT.TOTAL);
        let type = pecent <= PERCENT_CONFIG.EVENT.TOTAL_PRICE_CHANGE ? 0 : pecent <= PERCENT_CONFIG.EVENT.ROAD_PRICE_CHANGE ? 1 : pecent <= PERCENT_CONFIG.EVENT.POSITION_CHANGE ? 2 : 3;
        if (type == 3) {
          pointEvent[i] = { type: 3 };
          continue;
        }
        if (type == 2) {
          let target = createRandom(2, pointNumber - 1);
          while (target == i) {
            target = createRandom(2, pointNumber - 1);
          }
          pointEvent[i] = { type: 2, target };
          continue;
        }
        let event = createRandom(0, 1);
        if (event == 0) {
          let value = createRandom(
            RANDOM_CONFIG.EVENT_VALUE_MIN,
            RANDOM_CONFIG.EVENT_VALUE_MAX
          );
          pointEvent[i] = { type: 0, value: type == 0 ? value : value * -1 };
        } else {
          let value = createRandom(
            RANDOM_CONFIG.EVENT_VALUE_MIN,
            RANDOM_CONFIG.EVENT_VALUE_MAX
          );
          let path = createRandom(
            RANDOM_CONFIG.EVENT_ROAD_MIN,
            RANDOM_CONFIG.EVENT_ROAD_MAX
          );
          let isFree = createRandom(1, PERCENT_CONFIG.EVENT_ROAD_PRICE.TOTAL);
          pointEvent[i] = {
            type: 1,
            value: isFree <= PERCENT_CONFIG.EVENT_ROAD_PRICE.FREE ? 0 : type == 0 ? value : value * -1,
            path
          };
        }
      }
    }
    __name(createEvent, "createEvent");
    let resultRecord = [];
    function dps(pos, road, value, event) {
      let value_ = 0;
      let newEvent = null;
      if (pos == pointNumber) {
        resultRecord.push({ value, road });
        if (minCause == 0 || minCause > value) {
          minCause = value;
          minPath = [...road];
        }
        if (maxCause < value) {
          maxCause = value;
          maxPath = [...road];
        }
        return;
      }
      if (pointEvent[pos].type == 3) {
        return;
      }
      if (pointEvent[pos].type == 2) {
        if (!road.includes(pos)) {
          dps(
            pointEvent[pos].target,
            [...road, pointEvent[pos].target],
            value,
            event
          );
          return;
        }
      }
      if (pointEvent[pos].type == 1) {
        newEvent = pointEvent[pos];
      }
      if (pointEvent[pos].type == 0) {
        value_ = pointEvent[pos].value;
      }
      let paths = map[pos];
      for (let target in paths) {
        let v = paths[target];
        if (event.length != 0) {
          for (let i = 0; i < event.length; i++) {
            let e = event[i];
            if (e.path == 0)
              continue;
            if (e.value == 0) {
              v = 0;
            } else {
              v += e.value;
            }
            e.path--;
          }
        }
        dps(target, [...road, target], value + v + value_, newEvent ? [...event, newEvent] : [...event]);
      }
    }
    __name(dps, "dps");
    function calculateValue() {
      let st = 0;
      let road = [0];
      let value = 0;
      dps(st, road, value, []);
    }
    __name(calculateValue, "calculateValue");
    createPoint();
    createMap();
    createEvent();
    calculateValue();
    const defaultValue = Math.round(minCause + (maxCause - minCause) * 0.1);
    return { map, defaultValue, point, pointEvent, endPoint: pointNumber };
  }
  __name(mapBuilder, "mapBuilder");

  // src/ui/MapAction.ts
  var MapAction = class {
    constructor() {
      this.position = 0;
      this.lastPoint = 0;
      this.map = {};
      this.pointEvent = [];
      this.eventList = [];
      this.eventFlag = {};
      this.point = [];
      this.endPoint = 0;
      this.isFinish = false;
      this.nextPoint = [];
      this.checkArrival = /* @__PURE__ */ __name((position) => {
        return this.nextPoint.includes(position);
      }, "checkArrival");
      this.showRoad = /* @__PURE__ */ __name((position) => {
        this.nextPoint = [];
        const roadList = this.map[position];
        for (let key in this.map[position]) {
          this.nextPoint.push(parseInt(key));
        }
      }, "showRoad");
      this.meetEvent = /* @__PURE__ */ __name((position) => {
        let event = this.pointEvent[position];
        if (event.type == 1) {
          this.eventList.push(event);
        }
        if (event.type == 0) {
          this.lastPoint += event.value;
        }
        if (event.type == 2) {
          this.positionChange(event.target);
        }
      }, "meetEvent");
      this.positionChange = /* @__PURE__ */ __name((newPosition) => {
        let value = this.map[this.position][newPosition];
        console.log(value);
        for (let i = 0; i < this.eventList.length; i++) {
          let event = this.eventList[i];
          if (event.path === 0) {
            continue;
          }
          if (event.value == 0) {
            value = 0;
          } else {
            value += event.value;
          }
          event.path--;
        }
        this.lastPoint -= value;
        console.log("\u5269\u4F59\u70B9\u6570", this.lastPoint);
        if (isNaN(this.lastPoint))
          console.log(JSON.stringify(this.eventList), value);
        if (this.lastPoint <= 0) {
          console.log("\u6E38\u620F\u7ED3\u675F\uFF0C\u65C5\u9014\u5931\u8D25");
          this.isFinish = true;
          return;
        }
        this.position = newPosition;
        if (this.position == this.endPoint) {
          console.log("\u6E38\u620F\u7ED3\u675F\uFF0C\u987A\u5229\u901A\u5173");
          this.isFinish = true;
          return;
        }
        this.meetEvent(this.position);
        this.showRoad(this.position);
      }, "positionChange");
      const { map, defaultValue, point, pointEvent, endPoint } = mapBuilder();
      this.lastPoint = defaultValue;
      this.map = map;
      this.point = point;
      this.pointEvent = pointEvent;
      this.endPoint = endPoint;
      this.showRoad(this.position);
    }
  };
  __name(MapAction, "MapAction");

  // src/ui/MapPanel.ts
  var Texture2 = Laya.Texture;
  var { regClass: regClass2, property: property2 } = Laya;
  var MapPanel = class extends Laya.Panel {
    constructor(width, height) {
      super();
      // 网格列数
      this.gridColumns = 0;
      // 网格行数
      this.gridRows = 0;
      // 网格列宽
      this.gridColumnWidth = 40;
      // 网格行高
      this.gridRowHeight = 40;
      // 地图数据
      this.map = [];
      // 建筑物数据
      this.buildingMapper = {};
      // 原始地图数据
      this.mapInfo = null;
      // sprite
      this.roadSprite = new Laya.Sprite();
      this.highLightRoadSprite = new Laya.Sprite();
      this.buildingSprite = new Laya.Sprite();
      this.characterSprite = new Laya.Sprite();
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
    generate(mapInfo) {
      this.mapInfo = new MapAction();
      this.initMap();
      this.drawMap();
      this.highLightRoads(0);
    }
    initMap() {
      var _a;
      for (let source in this.buildingMapper) {
        (_a = this.buildingMapper[source].sprite) == null ? void 0 : _a.destroy(true);
        this.buildingMapper[source].sprite = null;
      }
      const { point: building, map: relation } = this.mapInfo;
      this.buildingMapper = {};
      this.map = [];
      for (let i = 0; i < this.gridRows; i++) {
        this.map.push(new Array(this.gridColumns).fill(null));
      }
      const firstBuilding = { id: 0, x: 0, y: 0 };
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
      this.graphics.clear();
      const groundTexture = Texture2.create(Laya.loader.getRes("resources/ground.png"), 0, 0, 30, 30);
      this.graphics.fillTexture(groundTexture, 0, 0, this.width, this.height);
    }
    drawRoads() {
      this.roadSprite.graphics.clear();
      for (let source in this.buildingMapper) {
        for (let target in this.buildingMapper[source].targets) {
          const { points } = this.buildingMapper[source].targets[target];
          this.drawRoadLine(this.roadSprite, points, "drak");
        }
      }
    }
    _drawRoad(sprite, { points }, color = "black", width = 1) {
      sprite.graphics.drawLines(
        this.getXPos(points[0].x, "center"),
        this.getYPos(points[0].y, "center"),
        points.map((point) => [this.getXPos(point.x - points[0].x), this.getYPos(point.y - points[0].y)]).flat(),
        color,
        width
      );
    }
    drawRoad(sprite, points, alpha = 1) {
      const roadsResource = Laya.loader.getRes("resources/map/roads.jpeg");
      const straightTexture = Texture2.create(roadsResource, 540, 0, 540, 540);
      const turnTexture = Texture2.create(roadsResource, 0, 540, 540, 540);
      for (let i = 1; i < points.length - 1; i++) {
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
          );
          continue;
        }
        sprite.graphics.drawTexture(
          straightTexture,
          x,
          y,
          this.gridColumnWidth,
          this.gridRowHeight,
          this.getRotateMatrix(this.getStraightAngle(points[i], points[i + 1]), x, y),
          alpha
        );
      }
    }
    drawRoadLine(sprite, points, type = "light") {
      sprite.graphics.drawLines(
        this.getXPos(points[0].x, "center"),
        this.getYPos(points[0].y, "center"),
        points.map((point) => [this.getXPos(point.x - points[0].x), this.getYPos(point.y - points[0].y)]).flat(),
        type === "light" ? "#a1a1a1" : "#717171",
        20
      );
      sprite.graphics.drawLines(
        this.getXPos(points[0].x, "center"),
        this.getYPos(points[0].y, "center"),
        points.map((point) => [this.getXPos(point.x - points[0].x), this.getYPos(point.y - points[0].y)]).flat(),
        type === "light" ? "white" : "#dadada",
        16
      );
      sprite.graphics.drawLines(
        this.getXPos(points[0].x, "center"),
        this.getYPos(points[0].y, "center"),
        points.map((point) => [this.getXPos(point.x - points[0].x), this.getYPos(point.y - points[0].y)]).flat(),
        type === "light" ? "#a1a1a1" : "#717171",
        12
      );
    }
    getRotateMatrix(angle, x, y) {
      const matrix = new Laya.Matrix();
      matrix.translate(-x - this.gridColumnWidth / 2, -y - this.gridRowHeight / 2);
      matrix.rotate(angle);
      matrix.translate(x + this.gridColumnWidth / 2, y + this.gridRowHeight / 2);
      return matrix;
    }
    getStraightAngle(start, end) {
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
    getTurnAngle(prev, current, next) {
      if (prev.y < current.y || next.y < current.y) {
        if (prev.x > current.x || next.x > current.x) {
          return 0;
        }
        return Math.PI * 3 / 2;
      } else {
        if (prev.x > current.x || next.x > current.x) {
          return Math.PI / 2;
        }
        return Math.PI;
      }
    }
    drawBuildings() {
      var _a;
      this.buildingSprite.graphics.clear();
      this.buildingSprite.destroyChildren();
      for (let y = 0; y < this.map.length; y++) {
        for (let x = 0; x < this.map[y].length; x++) {
          if (((_a = this.map[y][x]) == null ? void 0 : _a.id) !== void 0) {
            const building = new Building();
            building.size(this.gridColumnWidth, this.gridRowHeight);
            building.pos(this.getXPos(x), this.getYPos(y));
            this.buildingSprite.addChild(building);
            building.on("click", () => __async(this, null, function* () {
              if (this.mapInfo.isFinish) {
                console.log("Game Finish!");
                return;
              }
              console.log("heiheihei", this.mapInfo.position, this.map[y][x].id);
              if (this.mapInfo.checkArrival(this.map[y][x].id)) {
                let count = 0;
                const len = this.buildingMapper[this.mapInfo.position].targets[this.map[y][x].id].points.length;
                this.buildingMapper[this.mapInfo.position].targets[this.map[y][x].id].points.map((e) => {
                  console.log(e.x, e.y);
                  var tween = Laya.Tween.to(this.characterSprite, { x: this.getXPos(e.x), y: this.getYPos(e.y) }, 200, null, null, count * 200);
                  count++;
                });
                this.mapInfo.positionChange(this.map[y][x].id);
                yield new Promise((resolve) => {
                  setTimeout(() => resolve(0), len * 200);
                });
                this.highLightRoads(this.map[y][x].id);
              }
              if (this.mapInfo.isFinish) {
                console.log("Game Finish!");
              }
            }));
            this.map[y][x].sprite = building;
          }
        }
      }
    }
    drawCharacter() {
      const carTexture = Texture2.create(Laya.loader.getRes("resources/map/car.png"), 0, 0, 330, 230);
      this.characterSprite.graphics.drawTexture(carTexture, 0, 0, 50, 50);
    }
    highLightRoads(id) {
      this.highLightRoadSprite.graphics.clear();
      const building = this.buildingMapper[id];
      if (!(building == null ? void 0 : building.targets)) {
        return;
      }
      for (let target in building.targets) {
        this.drawRoadLine(this.highLightRoadSprite, building.targets[target].points);
      }
    }
    calcPointValue(start, end) {
      return Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    }
    getRoadPoints(start, end) {
      if (!start || !end) {
        return [];
      }
      const directions = [[0, 1], [-1, 0], [0, -1], [1, 0]];
      const queue = [[__spreadProps(__spreadValues({}, start), { turn: 0, value: this.calcPointValue(start, end) })]];
      while (queue.length && (queue[0][0].x !== end.x || queue[0][0].y !== end.y)) {
        const curPoints = queue.shift();
        const [curPoint, prevPoint] = curPoints;
        const nextPoints = [];
        for (let i = 0; i < directions.length; i++) {
          const nextPoint = {
            x: curPoint.x + directions[i][0],
            y: curPoint.y + directions[i][1],
            turn: curPoint.turn || 0
          };
          if (nextPoint.x < 0 || nextPoint.y < 0 || nextPoint.x >= this.gridColumns || nextPoint.y >= this.gridRows || curPoints.findIndex((point) => point.x === nextPoint.x && point.y === nextPoint.y) !== -1) {
            continue;
          }
          if (prevPoint) {
            if ((/* @__PURE__ */ new Set([prevPoint.x, curPoint.x, nextPoint.x])).size !== 1 && (/* @__PURE__ */ new Set([prevPoint.y, curPoint.y, nextPoint.y])).size !== 1) {
              nextPoint.turn++;
              nextPoint.isTurn = true;
            }
          }
          if (this.map[nextPoint.y][nextPoint.x] !== null && (nextPoint.x !== end.x || nextPoint.y !== end.y)) {
            continue;
          }
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
    getRandom(n, m) {
      return Math.floor(Math.random() * (m - n + 1) + n);
    }
    getXPos(x, placement) {
      if (placement === "center") {
        return (x + 0.5) * this.gridColumnWidth;
      }
      return x * this.gridColumnWidth;
    }
    getYPos(y, placement) {
      if (placement === "center") {
        return (y + 0.5) * this.gridRowHeight;
      }
      return y * this.gridRowHeight;
    }
  };
  __name(MapPanel, "MapPanel");
  MapPanel = __decorateClass([
    regClass2("8e8acd19-9514-4a59-b19e-ea56fed60c71", "../src/ui/MapPanel.ts")
  ], MapPanel);

  // src/storage/local_storage.ts
  var LocalStorage = class {
    static setItem(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
    static getItem(key) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    static removeItem(key) {
      localStorage.removeItem(key);
    }
    static clear() {
      localStorage.clear();
    }
  };
  __name(LocalStorage, "LocalStorage");

  // src/Index.ts
  var { regClass: regClass3, property: property3 } = Laya;
  var Index = class extends IndexBase {
    constructor() {
      super();
    }
    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    //onAwake(): void {}
    /**
     * 组件被启用后执行，例如节点被添加到舞台后
     */
    onEnable() {
      return __async(this, null, function* () {
        console.log("onEnable");
      });
    }
    /**
     * 组件被禁用时执行，例如从节点从舞台移除后
     */
    //onDisable(): void {}
    /**
     * 第一次执行update之前执行，只会执行一次
     */
    //onStart(): void {}
    /**
     * 手动调用节点销毁时执行
     */
    onDestroy() {
      LocalStorage.setItem(this.openid, this.map.mapInfo);
    }
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
    // 定时器回调函数
    // onTimer() {
    //     console.log("定时器触发");
    //     LocalStorage.setItem(this.openid, this.map.mapInfo);
    // }
    // 新场景加载完成后执行
    onOpened(param) {
      this.openid = param["openid"];
      if (this.openid != null) {
        this.lastMapInfo = LocalStorage.getItem(this.openid);
      }
      console.log("onOpened: " + this.openid + " " + this.lastMapInfo);
      this.map = new MapPanel(1136, 640);
      this.map.generate(this.lastMapInfo);
      this.addChild(this.map);
    }
  };
  __name(Index, "Index");
  Index = __decorateClass([
    regClass3("f0297df7-2262-4d82-afb2-2d0f83a1613b", "../src/Index.ts")
  ], Index);

  // src/Loading.generated.ts
  var LoadingBase = class extends Laya.Scene {
  };
  __name(LoadingBase, "LoadingBase");

  // src/login/wx_login.ts
  function checkUserAuth() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting["scope.userInfo"]) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
  __name(checkUserAuth, "checkUserAuth");
  function requestUserAuth() {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        withCredentials: true,
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
  __name(requestUserAuth, "requestUserAuth");
  function wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          resolve(res);
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }
  __name(wxLogin, "wxLogin");
  function login() {
    return __async(this, null, function* () {
      try {
        const isAuth = yield checkUserAuth();
        if (!isAuth) {
          yield requestUserAuth();
        }
        const wxLoginRes = yield wxLogin();
        console.log("wxLoginRes: " + wxLoginRes);
        if (wxLoginRes.code) {
          const code2SessionRes = yield wxCode2Session(wxLoginRes.code);
          console.log("code2SessionRes: " + code2SessionRes);
          return code2SessionRes;
        }
      } catch (error) {
        console.log("login err: " + error);
      }
      return null;
    });
  }
  __name(login, "login");
  function wxCode2Session(code) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        wx.request({
          url: "https://api.weixin.qq.com/sns/jscode2session",
          data: {
            appid: "your_appid",
            secret: "your_secret",
            js_code: code,
            grant_type: "authorization_code"
          },
          success(res) {
            console.log("resp.data: " + res.data);
            resolve(res);
          },
          fail(error) {
            console.log("\u5FAE\u4FE1\u767B\u5F55\u5931\u8D25");
            reject(error);
          }
        });
      });
    });
  }
  __name(wxCode2Session, "wxCode2Session");

  // src/Loading.ts
  var { regClass: regClass4 } = Laya;
  var resources = [
    "resources/ground.png",
    "resources/map/building.png",
    "resources/map/car.png"
  ];
  var Loading = class extends LoadingBase {
    onAwake() {
      Laya.loader.load(
        //加载首屏图片
        [
          "atlas/comp/progress.png",
          "atlas/comp/progress$bar.png"
        ]
      ).then(() => {
        Laya.loader.load(resources, null, Laya.Handler.create(this, this.onLoading, null, false)).then(() => __async(this, null, function* () {
          let openid = LocalStorage.getItem("game_traveler_user_id");
          if (openid == null) {
            console.log("openid\u4E3A\u7A7A, \u5C1D\u8BD5\u5FAE\u4FE1\u767B\u5F55");
            openid = yield login();
            console.log("openid: " + openid);
          }
          this.progress.value = 0.98;
          Laya.timer.once(1e3, this, () => {
            Laya.Scene.open("scenes/Index.ls", true, { "openid": openid });
          });
        }));
        Laya.loader.on(Laya.Event.ERROR, this, this.onError);
      });
    }
    /**
    * 当报错时打印错误
    * @param err 报错信息
    */
    onError(err) {
      console.log("\u52A0\u8F7D\u5931\u8D25: " + err);
    }
    /**
     * 加载时侦听
     */
    onLoading(progress) {
      if (progress > 0.92)
        this.progress.value = 0.95;
      else
        this.progress.value = progress;
      if (Laya.Browser.onMiniGame) {
        Laya.Browser.window.wx.config({
          debug: false,
          // 是否开启调试模式
          appId: "your_app_id",
          // 公众号的唯一标识
          timestamp: "your_timestamp",
          // 生成签名的时间戳
          nonceStr: "your_nonce_str",
          // 生成签名的随机串
          signature: "your_signature",
          // 签名
          jsApiList: ["your_js_api_list"]
          // 需要使用的JS接口列表
        });
      }
    }
  };
  __name(Loading, "Loading");
  Loading = __decorateClass([
    regClass4("ce1c8aad-836c-4269-88cd-2c0a2d843f4d", "../src/Loading.ts")
  ], Loading);
})();
//# sourceMappingURL=bundle.js.map
