const { regClass } = Laya;
import { LoadingBase } from "./Loading.generated";
import { LocalStorage } from "./storage/local_storage";
import { login } from "./login/wx_login";

const resources = [
    "resources/ground.png",
    "resources/map/building.png",
    "resources/map/car.png"
];
  
@regClass()
export class Loading extends LoadingBase {
    onAwake(): void {
        Laya.loader.load(
            //加载首屏图片
            [
                "atlas/comp/progress.png",
                "atlas/comp/progress$bar.png"
            ]
        ).then(() => {
            Laya.loader.load(resources, null, Laya.Handler.create(this, this.onLoading, null, false)).then(async () => {
                // 加载完成后，处理逻辑
                // 1. 读取当前用户
                let openid = LocalStorage.getItem("game_traveler_user_id");
                if (openid == null) {
                    // 2. 尝试微信登录
                    console.log("openid为空, 尝试微信登录");
                    openid = await login();
                    console.log("openid: " + openid);
                }
                
                this.progress.value = 0.98;
                //预加载的东西太少，为了本地看效果延迟一秒，真实项目不需要延迟
                Laya.timer.once(1000, this, () => {
                    //跳转到入口场景
                    Laya.Scene.open("scenes/Index.ls", true, {"openid": openid}); //不要使用Laya.Scene.open("./Scenes/Index.ls");
                });
            });
            // 侦听加载失败
            Laya.loader.on(Laya.Event.ERROR, this, this.onError);
        });
    }

    /**
   * 当报错时打印错误
   * @param err 报错信息
   */
    onError(err: string): void {
        console.log("加载失败: " + err);
    }

    /**
     * 加载时侦听
     */
    onLoading(progress: number): void {
        //接近完成加载时，让显示进度比实际进度慢一点，这是为打开场景时的自动加载预留，尤其是要打开的场景资源多，并没有完全放到预加载中，还需要再自动加载一部分时。
        if (progress > 0.92) this.progress.value = 0.95;
        else this.progress.value = progress;
        if (Laya.Browser.onMiniGame) {
            Laya.Browser.window.wx.config({
                debug: false, // 是否开启调试模式
                appId: 'your_app_id', // 公众号的唯一标识
                timestamp: 'your_timestamp', // 生成签名的时间戳
                nonceStr: 'your_nonce_str', // 生成签名的随机串
                signature: 'your_signature', // 签名
                jsApiList: ['your_js_api_list'], // 需要使用的JS接口列表
            });
        }
              
    }
}