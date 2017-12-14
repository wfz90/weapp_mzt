/*
|-------------------------------------------------------------------------------
| 基于token验证机制的微信小程序授权模块
|-------------------------------------------------------------------------------
Auth.setStorageSync   设置有过期时间的缓存
Auth.storageUser    保存用户数据
| logout()			- 注销
| check()			- 验证当前用户授权是否有效/过期
| guest()			- 判断当前用户是否为游客
| user()			- 获取当前用户信息
| openid()			- 获取当前用户的openid
| token()			- 获取本地token
*/
const Auth = {}
/**
 * 设置有过期时间的缓存
 */
Auth.setStorageSync = function (key, value, cache_time = 3600) {
  wx.setStorageSync(key, value);
  wx.setStorageSync(key + '_expired_in', Date.now() + cache_time * 1000);
}

/**
 * 保存用户数据
 */
Auth.storageUser = function (res) {
  getApp().globalData.user = res.user;
  wx.setStorageSync('overtime', parseInt(res.overtime) * 1000);
  wx.setStorageSync('user', res.user);
  wx.setStorageSync('token', res.token);
  wx.setStorageSync('expired_in', Date.now() + parseInt(res.expired_in, 10) * 1000 - 60000);
}

/**
 * 获取当前登陆用户的openid
 * @return {string}
 */
Auth.openid = function () {
  const user = Auth.user()
  if (user && user.openid) {
    return user.openid
  } else {
    return ''
  }
}

/**
 * 判断当前用户是否为游客
 * @return {boolean}
 */
Auth.guest = function () {
  if (!Auth.user()) {
    return true
  } else {
    return false
  }
}

/**
 * 获取当前登陆用户信息
 * @return {object}
 */
Auth.user = function () {
  return wx.getStorageSync('user');
}

/**
 * 获取token
 * @return {string}
 */
Auth.token = function () {
  return wx.getStorageSync('token');
}

/**
 * 获取微信运动加密数据
 */
Auth.getWeRunData = function (msg = '您必须授权才可以操作') {
  return new Promise(function (resolve, reject) {
    wx.getWeRunData({
      success: function (res) {
        resolve(res);
      }, fail: function (err) {
        console.log(err);
        if (err.errMsg.indexOf('device not support')) {
          wx.showModal({
            title: "设备不支持",
            content: "你懒得连微信都放弃你了！",
            showCancel: false,
            confirmText: "掩面而逃"
          });
          reject(err);
        } else {
          Auth.makeSure(msg).then(res => {
            resolve(res);
          }, err => {
            reject(err);
          });
        }
      }
    });
  });
}

/**
 * 注销
 * @return {boolean}
 */
Auth.logout = function () {
  wx.removeStorageSync('user')
  wx.removeStorageSync('token')
  wx.removeStorageSync('expired_in')
  return true
}

/**
 * 判断token还是否在有效期内
 * @return {boolean}
 */
Auth.check = function () {
  if (Auth.user() && Date.now() < wx.getStorageSync('expired_in') && Auth.token()) {
    console.log('access_token过期时间：', (wx.getStorageSync('expired_in') - Date.now()) / 1000, '秒');
    return true;
  } else {
    return false;
  }
}
module.exports = Auth