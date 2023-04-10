import { mapBuilder } from "./mapBuilder.js";

export default class MapAction {
    position = 0;
    lastPoint = 0;
    map = {};
    pointEvent = [];
    eventList = [];
    eventFlag = {};
    endPoint = 0;
    isFinish = false;
    constructor() {
        const { map, defaultValue, point, pointEvent, endPoint } = mapBuilder();
        this.lastPoint = defaultValue;
        this.map = map;
        this.pointEvent = pointEvent;
        this.endPoint = endPoint;
        this.showRoad(this.position);
    }
    showRoad = (position) => {
        const roadList = this.map[position];
        console.log('showRoad', position, roadList);
    }
    meetEvent = (position) => {
        let event = this.pointEvent[position];

        console.log('event', position, event);
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
    positionChange = (newPosition) => {
        let value = this.map[this.position][newPosition];
        for (let i = 0; i < this.eventList.length; i++) {
            let event = this.eventList[i];
            if (event.value == 0) {
                value = 0;
            } else {
                value += event.value;
            }
            if (event.path === 0) {
                this.eventList.splice(i, 1);
                i--;
            }
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