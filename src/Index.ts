import { IndexBase } from "./Index.generated";
import { MapPanel } from "./ui/MapPanel";
import Event = Laya.Event;
import MapAction from "./ui/MapAction";

const { regClass, property } = Laya;

@regClass()
export class Index extends IndexBase {
    //declare owner : Laya.Sprite3D;
    private map: MapPanel;
    
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
        // 1. 初始化地图
        this.map = new MapPanel(1136, 640);
        let lastMapInfo = null;
        let openid = null;
        if (testID) {
            openid = testID
        } else {
            openid = await login();
        }
        lastMapInfo = LocalStorage.getItem(openid) as MapAction;
        this.map.generate(lastMapInfo);
        this.addChild(this.map);
        // 2. 鼠标交互
        // for (let id in this.map.buildingMapper) {
        //     this.map.buildingMapper[id].sprite.on(Event.CLICK, () => {
        //         this.map.highLightRoads(id);
        //     })
        // }
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
        LocalStorage.setItem(testID, this.map.mapInfo);
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
}