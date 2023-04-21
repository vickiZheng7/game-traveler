// 判断用户是否授权登录小程序
function checkUserAuth(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    // 已授权，返回 true
                    resolve(true);
                } else {
                    // 未授权，返回 false
                    resolve(false);
                }
            },
            fail: (error) => {
                reject(error);
            },
        });
    });
}

// 请求用户授权
function requestUserAuth(): Promise<WechatMiniprogram.UserInfo> {
    return new Promise((resolve, reject) => {
        wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
                resolve(res.userInfo);
            },
            fail: (error) => {
                reject(error);
            },
        });
    });
}

// 进行微信登录
function wxLogin(): Promise<WechatMiniprogram.LoginSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
                resolve(res);
            },
            fail: (error) => {
                reject(error);
            },
        });
    });
}

// 调用以上三个函数实现完整的登录流程
async function login(): Promise<string> {
    const isAuth = await checkUserAuth();
    if (!isAuth) {
        await requestUserAuth();
    }
    const wxLoginRes = await wxLogin();
    // 在这里进行登录成功后的后续操作
    console.log("wxLoginRes: " + wxLoginRes)
    if (wxLoginRes.code) {
        const code2SessionRes = await wxCode2Session(wxLoginRes.code);
        console.log("code2SessionRes: " + code2SessionRes)
        return code2SessionRes
    }
    return testID
}

async function wxCode2Session(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
        // 登录成功，获取用户open_id
        wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            data: {
                appid: 'your_appid',
                secret: 'your_secret',
                js_code: code,
                grant_type: 'authorization_code'
            },
            success(res) {
                console.log("resp.data: " + res.data);
                resolve(res)
            },
            fail(error) {
                console.log('微信登录失败');
                reject(error)
            }
        });
    });
}

