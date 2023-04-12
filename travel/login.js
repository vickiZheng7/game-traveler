// 封装判断用户微信是否授权登录小程序的函数
function isAuthorized() {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 封装请求用户授权的函数
function authorize() {
  return new Promise((resolve, reject) => {
    wx.authorize({
      scope: 'scope.userInfo',
      success: () => {
        resolve();
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 封装微信登录的函数
function login() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res.code) {
          resolve(res.code);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 封装根据用户open_id读取本地存储在浏览器的数据的函数
function getData(openid) {
  return new Promise((resolve, reject) => {
    const data = wx.getStorageSync(openid);
    if (data) {
      resolve(data);
    } else {
      reject('Data not found');
    }
  });
}

// 封装整个流程的函数
async function process() {
  try {
    const isAuth = await isAuthorized();
    if (!isAuth) {
      await authorize();
    }
    const code = await login();
    const data = await getData(code);
    console.log(data);
    return data
  } catch (err) {
    console.error(err);
  }
}
