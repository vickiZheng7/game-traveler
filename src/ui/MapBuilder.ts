const RANDOM_CONFIG = {
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
    EVENT_ROAD_MAX: 3,
};

const PERCENT_CONFIG = {
    EVENT: {
        TOTAL: 10000,
        TOTAL_PRICE_CHANGE: 5000,
        ROAD_PRICE_CHANGE: 8999,
        POSITION_CHANGE: 9999,
        GAME_FAILED: 1,
    },
    EVENT_ROAD_PRICE: {
        TOTAL: 10,
        FREE: 2,
    },
};

export function createRandom(min: number, max: number) {
    let rander = max - min + 1;
    return Math.floor(Math.random() * rander) + min;
}

export function mapBuilder() {
    let roadNumber = 0,
        deepNumber = createRandom(RANDOM_CONFIG.DEEP_MIN, RANDOM_CONFIG.DEEP_MAX);

    let point: Array<number[]> = [[0]],
        pointNumber = 1;
    let map: Record<number, Record<number, any>> = {};
    let mapV: Record<number, any> = [],
        pointEvent: Record<number, any> = [],
        topology: Record<number, any> = {},
        mapLength = 0;
    let maxCause = 0,
        maxPath: number[] = [],
        minCause = 0,
        minPath: number[] = [];

    //create point with deep number
    function createPoint() {
        for (let i = 0; i < deepNumber; i++) {
            let random = createRandom(
                i == 0
                    ? RANDOM_CONFIG.EACH_DEEP_POINT_MAX - 2
                    : RANDOM_CONFIG.EACH_DEEP_POINT_MIN,
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
    function createMap() {
        for (let i = 0; i < deepNumber - 1; i++) {
            for (let j = 0; j < point[i].length; j++) {
                let start = point[i][j];
                map[start] = {};
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
                    map[start][limitArr[end]] = createRandom(
                        RANDOM_CONFIG.ROAD_PRICE_MIN,
                        RANDOM_CONFIG.ROAD_PRICE_MAX
                    );
                    if (!topology[limitArr[end]]) topology[limitArr[end]] = 0;
                    topology[limitArr[end]]++;
                    mapV[mapLength] = {
                        x: start,
                        y: limitArr[end],
                        z: map[start][limitArr[end]],
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
                        z: map[startP][point[i][j]],
                    };
                    mapLength++;
                }
            }
        }
    }
    function createEvent() {
        pointEvent[0] = {};
        pointEvent[pointNumber - 1] = {};
        for (let i = 1; i < pointNumber - 1; i++) {
            let pecent = createRandom(1, PERCENT_CONFIG.EVENT.TOTAL);
            let type =
                pecent <= PERCENT_CONFIG.EVENT.TOTAL_PRICE_CHANGE
                    ? 0
                    : pecent <= PERCENT_CONFIG.EVENT.ROAD_PRICE_CHANGE
                        ? 1
                        : pecent <= PERCENT_CONFIG.EVENT.POSITION_CHANGE
                            ? 2
                            : 3;
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
                    value:
                        isFree <= PERCENT_CONFIG.EVENT_ROAD_PRICE.FREE
                            ? 0
                            : type == 0
                                ? value
                                : value * -1,
                    path,
                };
            }
        }
    }
    let resultRecord = [];
    function dps(pos: any, road: any[], value: number, event: any[]) {
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
    function calculateValue() {
        let st = 0;
        let road = [0];
        let value = 0;
        dps(st, road, value, []);
    }

    createPoint();
    createMap();
    createEvent();

    // console.log(`节点数量:`, pointNumber);
    // console.log(`深度:`, deepNumber);
    // console.log(`节点深度图:`, point);
    // console.log(`地图:`, map);
    // console.log(`节点事件:`, pointEvent);
    // console.log(
    //     "事件说明:\n type:0 为获得或失去部分点数 value 为点数的具体数值 \n type:1 为接下来n条路,费用增加或者减少 value 为点数的具体数值,如果为0,则代表接下来的n条路免费 path 为对应的n条路 \n type:2 从当前点移动到别处 target为移动的目的地 \n type:3 游戏失败"
    // );

    calculateValue();
    const defaultValue = Math.round(minCause + (maxCause - minCause) * 0.3);

    // console.log(`最少费用:`, minCause);
    // console.log(`最短路径:`, minPath);
    // console.log(`最多费用:`, maxCause);
    // console.log(`最长路径:`, maxPath);
    // console.log(`初始费用:`, defaultValue);
    return { map, defaultValue, point, pointEvent, endPoint: pointNumber };
}
//   mapBuilder();
