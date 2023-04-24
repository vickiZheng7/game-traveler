(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result)
      __defProp(target, key, result);
    return result;
  };

  // src/Loading.generated.ts
  var LoadingBase = class extends Laya.Scene {
  };

  // src/Loading.ts
  var { regClass } = Laya;
  var resources = [
    "resources/tmw_desert_spacing.png",
    "resources/map/house.png",
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
  };
  Loading = __decorateClass([
    regClass("ce1c8aad-836c-4269-88cd-2c0a2d843f4d")
  ], Loading);
})();
