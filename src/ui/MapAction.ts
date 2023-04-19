import { mapBuilder } from "./MapBuilder";

export default class MapAction {
    position = 0;
    lastPoint = 0;
    map: Record<number, Record<number, any>> = {};
    pointEvent: Record<number, any> = [];
    eventList: Array<any> = [];
    eventFlag = {};
    point: Array<number[]> = [];
    endPoint = 0;
    isFinish = false;
    nextPoint: Array<number> = [];
    constructor() {
        const { map, defaultValue, point, pointEvent, endPoint } = mapBuilder();
        this.lastPoint = defaultValue;
        this.map = map;
        this.point = point;
        this.pointEvent = pointEvent;

        this.endPoint = endPoint;
        this.showRoad(this.position);
    }
    checkArrival = (position: number) => {
        return this.nextPoint.includes(position);
    }
    showRoad = (position: number) => {
        this.nextPoint = [];
        const roadList: Record<number, any> = this.map[position];
        for (let key in this.map[position]) {
            this.nextPoint.push(parseInt(key));
        }
    }
    meetEvent = (position: number) => {
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
    }
    positionChange = (newPosition: number) => {

        let value = this.map[this.position][newPosition];
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
        console.log('剩余点数', this.lastPoint);

        if (this.lastPoint <= 0) {
            console.log('游戏结束，旅途失败');
            this.isFinish = true;
            return;
        }
        this.position = newPosition;

        if (this.position == this.endPoint) {
            console.log('游戏结束，顺利通关');
            this.isFinish = true;
            return;
        }

        this.meetEvent(this.position);
        this.showRoad(this.position);

    }

}