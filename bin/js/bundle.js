(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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

  // src/Index.generated.ts
  var IndexBase = class extends Laya.Scene {
  };
  __name(IndexBase, "IndexBase");

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
      let newEvent = [];
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
            if (e.value == 0) {
              v = 0;
            } else {
              v += e.value;
            }
            if (e.path == 0) {
              event.splice(i, 1);
              i--;
            }
          }
        }
        dps(target, [...road, target], value + v + value_, [...event, newEvent]);
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
    const defaultValue = Math.round(minCause + (maxCause - minCause) * 0.3);
    return { map, defaultValue, point, pointEvent, endPoint: pointNumber };
  }
  __name(mapBuilder, "mapBuilder");

  // src/ui/MapPanel.ts
  var Texture = Laya.Texture;
  var { regClass, property } = Laya;
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
      this.building = {};
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
    generate() {
      const { point, map } = mapBuilder();
      this.data = { building: point, relation: map };
      this.initMap();
      this.drawMap();
    }
    initMap() {
      const { building, relation } = this.data;
      this.map = [];
      for (let i = 0; i < this.gridRows; i++) {
        this.map.push(new Array(this.gridColumns).fill(null));
      }
      const firstBuilding = { id: 0, x: 0, y: 0 };
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
      var _a;
      const groundTexture = Texture.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 5 * 33 + 1, 3 * 33 + 1, 30, 30);
      this.graphics.fillTexture(groundTexture, 0, 0, this.width, this.height);
      const building = new Laya.Sprite();
      this.addChild(building);
      const houseTexture = Texture.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
      for (let y = 0; y < this.map.length; y++) {
        for (let x = 0; x < this.map[y].length; x++) {
          if (((_a = this.map[y][x]) == null ? void 0 : _a.id) !== void 0) {
            building.graphics.drawTexture(houseTexture, this.getXPos(x), this.getYPos(y), this.gridColumnWidth, this.gridRowHeight);
          }
        }
      }
      building.pos(0, 0);
    }
    getRoadPoints(start, end) {
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      const queue = [{ turn: 0, direct: 0, x: start.x, y: start.y }];
      const visited = /* @__PURE__ */ new Set();
      const isValidPos = /* @__PURE__ */ __name((pos) => {
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
      }, "isValidPos");
      return [];
    }
    getDistance(a, b) {
      const x = a.x - b.x, y = a.y - b.y;
      return Math.sqrt(x * x + y * y);
    }
    getRandom(n, m) {
      return Math.floor(Math.random() * (m - n + 1) + n);
    }
    getXPos(x) {
      return x * this.gridColumnWidth;
    }
    getYPos(y) {
      return y * this.gridRowHeight;
    }
  };
  __name(MapPanel, "MapPanel");
  MapPanel = __decorateClass([
    regClass("8e8acd19-9514-4a59-b19e-ea56fed60c71", "../src/ui/MapPanel.ts")
  ], MapPanel);

  // src/Index.ts
  var { regClass: regClass2, property: property2 } = Laya;
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
      this.map = new MapPanel(1136, 640);
      this.map.generate();
      this.addChild(this.map);
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
  };
  __name(Index, "Index");
  Index = __decorateClass([
    regClass2("f0297df7-2262-4d82-afb2-2d0f83a1613b", "../src/Index.ts")
  ], Index);

  // src/Loading.generated.ts
  var LoadingBase = class extends Laya.Scene {
  };
  __name(LoadingBase, "LoadingBase");

  // src/Loading.ts
  var { regClass: regClass3 } = Laya;
  var resources = [
    "resources/tmw_desert_spacing.png",
    "resources/map/house.png"
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
        Laya.loader.load(resources, null, Laya.Handler.create(this, this.onLoading, null, false)).then(() => {
          this.progress.value = 0.98;
          Laya.timer.once(1e3, this, () => {
            Laya.Scene.open("scenes/Index.ls");
          });
        });
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
    }
  };
  __name(Loading, "Loading");
  Loading = __decorateClass([
    regClass3("ce1c8aad-836c-4269-88cd-2c0a2d843f4d", "../src/Loading.ts")
  ], Loading);

  // src/draft/MapUi.generated.ts
  var MapUiBase = class extends Laya.Scene {
  };
  __name(MapUiBase, "MapUiBase");

  // src/draft/MapUi.ts
  var Texture2 = Laya.Texture;
  var { regClass: regClass4, property: property3 } = Laya;
  var WIDTH = 1136;
  var HEIGHT = 640;
  var GRID_UNIT_W = 40;
  var GRID_UNIT_H = 40;
  var GRID_UNIT_W_NUM = Math.floor(WIDTH / GRID_UNIT_W);
  var GRID_UNIT_H_NUM = Math.floor(HEIGHT / GRID_UNIT_H);
  function getRandom(n, m) {
    return Math.floor(Math.random() * (m - n + 1) + n);
  }
  __name(getRandom, "getRandom");
  var Script = class extends MapUiBase {
    constructor() {
      super();
      // 地图数据
      this.map = [];
      // 1-表示道路，2-表示房子
      this.idToMap = {};
      this.mapPoint = [];
      this.mapRelation = {};
    }
    /**
     * 组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
     */
    // onAwake(): void { }
    onEnable() {
      Laya.init(WIDTH, HEIGHT, Laya.WebGL);
      console.log("Build Map UI!");
      const { point, map } = mapBuilder();
      this.mapPoint = point;
      this.mapRelation = map;
      this.map = [];
      for (let i = 0; i < GRID_UNIT_H_NUM; i++) {
        this.map.push(new Array(GRID_UNIT_W_NUM).fill(null));
      }
      this.map[0][0] = { type: "house", id: 0 };
      this.idToMap[0] = [0, 0];
      let nextY = 2;
      for (let i = 1; i < point.length; i++) {
        const curY = getRandom(nextY, GRID_UNIT_W_NUM - (point.length - i - 1) * 2 - 1);
        nextY = curY + 2;
        let nextX = 0;
        for (let j = 0; j < point[i].length; j++) {
          const curX = getRandom(nextX, GRID_UNIT_H_NUM - (point[i].length - j - 1) * 2 - 1);
          nextX = curX + 2;
          this.map[curX][curY] = { type: "house", id: point[i][j] };
          this.idToMap[point[i][j]] = [curX, curY];
        }
      }
      for (let source in map) {
        for (let target in map[source]) {
          this.PaveRoad(parseInt(source), parseInt(target));
        }
      }
      this.onLoaded();
    }
    // 查找有效路径
    PaveRoad(source, target) {
      const [startX, startY] = this.idToMap[source];
      const visited = /* @__PURE__ */ new Set();
      visited.add(`${startX}-${startY}`);
      const queue = [[this.idToMap[source]]];
      while (queue.length) {
        const parentPoints = queue[queue.length - 1];
        const [[x, y]] = parentPoints;
        const nextPointInfos = [];
        const points = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
        if (points.some((point) => this.isSame(point, this.idToMap[target]))) {
          break;
        }
        points.forEach((point) => {
          if (!this.isValidPoint(point[0], point[1]) || visited.has(`${point[0]}-${point[1]}`)) {
            return;
          }
          nextPointInfos.push({
            point,
            distance: this.cost(point, this.idToMap[source]) + this.cost(point, this.idToMap[target])
          });
          visited.add(`${point[0]}-${point[1]}`);
        });
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
        this.map[x][y] = { type: "road" };
      }
    }
    isSame(cur, node) {
      return cur[0] === node[0] && cur[1] === node[1];
    }
    cost(cur, node) {
      const a = cur[0] - node[0], b = cur[1] - node[1];
      return Math.abs(a) + Math.abs(b);
    }
    distance(cur, node) {
      const a = cur[0] - node[0], b = cur[1] - node[1];
      return Math.sqrt(a * a + b * b);
    }
    isValidPoint(x, y) {
      var _a;
      if (x < 0 || y < 0) {
        return false;
      }
      if (x >= GRID_UNIT_H_NUM || y >= GRID_UNIT_W_NUM) {
        return false;
      }
      if (((_a = this.map[x][y]) == null ? void 0 : _a.type) === "house") {
        return false;
      }
      return true;
    }
    /**
     * 组件被启用后执行，例如节点被添加到舞台后
     */
    onLoaded() {
      var _a, _b;
      const groundTexture = Texture2.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 5 * 33 + 1, 3 * 33 + 1, 30, 30);
      this.bg.graphics.fillTexture(groundTexture, 0, 0, WIDTH, HEIGHT);
      this.building = new Laya.Sprite();
      this.bg.addChild(this.building);
      const houseTexture = Texture2.create(Laya.loader.getRes("resources/map/house.png"), 0, 0, 280, 280);
      const roadTexture = Texture2.create(Laya.loader.getRes("resources/tmw_desert_spacing.png"), 1 * 33 + 1, 4 * 33 + 1, 30, 30);
      for (let y = 0; y < this.map.length; y++) {
        for (let x = 0; x < this.map[y].length; x++) {
          if (((_a = this.map[y][x]) == null ? void 0 : _a.type) === "house") {
            this.building.graphics.drawTexture(houseTexture, x * GRID_UNIT_W, y * GRID_UNIT_H, GRID_UNIT_W, GRID_UNIT_H);
          } else if (((_b = this.map[y][x]) == null ? void 0 : _b.type) === "road") {
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
  };
  __name(Script, "Script");
  Script = __decorateClass([
    regClass4("111dc0ae-4a43-4f82-8004-289f668e79f3", "../src/draft/MapUi.ts")
  ], Script);
})();
//# sourceMappingURL=bundle.js.map
