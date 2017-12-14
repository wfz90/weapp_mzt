import WxValidate from './assets/plugins/wx-validate/WxValidate'
import WxService from './assets/plugins/wx-service/WxService'
import HttpResource from './helpers/HttpResource'
import HttpService from './helpers/HttpService'
import __config from './etc/config'
const Auth = require('./helpers/auth')

App({
  onLaunch() {
    console.log('onLaunch')
    this.login()
  },
  onShow() {
    console.log('onShow')
  },
  onHide() {
    console.log('onHide')
  },
  globalData: {
    user: null,
    userInfo: null
  },
  login() {//登录
    if (Auth.check()) return
    this.wxLogin()
      .then(res => {
        console.log(res)
        Auth.storageUser(res.data)
      })
  },
  /**
   * 微信登录
   */
  wxLogin() {
    return this.WxService.login()
      .then(res => {
        return this.HttpService.wxLogin({
          code: res.code
        })
      })
      .then(res => {
        if (res) { return res.data }
      })
  },
  getUserInfo() {
    return this.WxService.login()
      .then(data => {
        console.log(data)
        return this.WxService.getUserInfo()
      })
      .then(data => {
        console.log(data)
        this.globalData.userInfo = data.userInfo
        return this.globalData.userInfo
      })
  },
  WxValidate: (rules, messages) => new WxValidate(rules, messages),
  HttpResource: (url, paramDefaults, actions, options) => new HttpResource(url, paramDefaults, actions, options).init(),
  HttpService: new HttpService({
    baseURL: __config.basePath,
  }),
  WxService: new WxService,
  __config,
  Auth,
})