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

  // src/Loading.generated.ts
  var LoadingBase = class extends Laya.Scene {
  };

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
        Laya.loader.load(resources, null, Laya.Handler.create(this, this.onLoading, null, false)).then(() => __async(this, null, function* () {
          let openid = LocalStorage.getItem("game_traveler_user_id");
          let lastMapInfo = null;
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
