import { IndexBase } from "./Index.generated";
import { MapPanel } from "./ui/MapPanel";
import Event = Laya.Event;
import MapAction from "./ui/MapAction";
import { LocalStorage } from "./storage/local_storage";

const { regClass, property } = Laya;

@regClass()
export class Index extends IndexBase {
    //declare owner : Laya.Sprite3D;
    private map: MapPanel;
    private lastMapInfo: MapAction;
    private openid: string;

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
    async onEnable(): Promise<void> {
        console.log("onEnable");
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
    onDestroy(): void {
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
    onOpened(param: any) {
        this.openid = param["openid"]
        if (this.openid != null) {
            // 读取上次记录
            this.lastMapInfo = LocalStorage.getItem(this.openid) as MapAction;
        }
        console.log("onOpened: " + this.openid + " " + this.lastMapInfo);
        // 1. 初始化地图
        this.map = new MapPanel(1136, 640, 10);
        this.map.generate(this.lastMapInfo);
        this.addChild(this.map);
        // 2. 鼠标交互
        // for (let id in this.map.buildingMapper) {
        //     this.map.buildingMapper[id].sprite.on(Event.CLICK, () => {
        //         this.map.highLightRoads(id);
        //     })
        // }
        // Laya.timer.loop(1000, this, this.onTimer);
    }
}