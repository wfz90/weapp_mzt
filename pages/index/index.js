import { $wuxDialog } from '../../components/wux'
var App = getApp()

Page({

  data: {
    page: 1,
    contentList: [],
    currentType: wx.getStorageSync('currentType'),
    types: wx.getStorageSync('types') ? wx.getStorageSync('types') : []
  },

  onLoad: function () {
    this.type = App.HttpResource('pic/type/:id', { id: '@id' })
    this.list = App.HttpResource('pic/getlist/:id', { id: '@id' })
    this.pay = App.HttpResource('pay/:id', { id: '@id' })
    this.share = App.HttpResource('user/share/:id', { id: '@id' })

    this.init()
  },

  onShow: function () {

  },

  init() {
    this.setData({
      contentList: []
    })
    this.getType()
  },

  check() {
    return new Promise((resolve, reject) => {
      if (App.Auth.check()) {
        resolve(true)
        return true
      };
      App.wxLogin()
        .then(res => {
          App.Auth.storageUser(res.data)
          resolve(true)
        })
    })
  },

  getType() {
    let types = wx.getStorageSync("types");
    if (types && this.data.currentType) {
      this.getList()
      return
    }
    this.type.queryAsync({})
      .then(res => {
        var res = res.data
        if (res.errno !== 0) return false;
        this.setData({
          types: res.data,
          currentType: res.data[0].id
        })
        wx.setStorageSync("types", res.data);
        wx.setStorageSync('currentType', res.data[0].id)
        this.getList()
      })
  },

  getList(tid = wx.getStorageSync('currentType'), page = 1) {
    this.list.queryAsync({
      type: tid,
      page: page
    })
      .then(res => {
        var res = res.data
        if (res.errno == 0 && res.data) {
          this.setData({
            contentList: this.data.contentList.concat(res.data.list),
            page: res.data.page
          })
          wx.stopPullDownRefresh()
        }
      })
  },

  gotoAlbum(e) {
    this.check().then(() => {
      let param = e.currentTarget.dataset, title = param.title, id = param.id, lev = parseInt(param.lev)
      //判断过期时间
      if (lev == 0 || wx.getStorageSync('overtime') > Date.parse(new Date())) {
        var url = "../album/album?title=" + title + "&id=" + id;
        wx.navigateTo({ url: url })
        return true;
      }
      //弹出选择器
      this.choose()
    })
  },

  //付费方法
  userPay(rmb) {
    let that = this
    this.check().then(() => {
      this.pay.saveAsync({ rmb: rmb })
        .then(res => {
          var res = res.data
          wx.requestPayment({
            timeStamp: res.data.timeStamp,
            nonceStr: res.data.nonceStr,
            package: res.data.package,
            signType: 'MD5',
            paySign: res.data.paySign,
            success: function (res) {
              //支付成功
              that.alert()
              App.wxLogin()
                .then(res => {
                  App.Auth.storageUser(res.data)
                })
            },
            fail: function (res) {
              that.alert('失败', '已取消支付')
            },
            complete: function (res) { },
          })
        })
    })
  },

  onPullDownRefresh: function () {
    this.init()
  },

  onReachBottom: function () {
    let page = this.data.page
    if (page == 0) {
      return
    }
    this.getList(this.data.currentType, page)
  },

  //点击某一个title条
  changeType: function (e) {
    var type = e.currentTarget.dataset.value
    if (type == this.data.currentType) {
      return;
    }
    this.setData({ currentType: type, contentList: [] })
    this.getList(this.data.currentType)
  },

  //选择按钮
  choose() {
    var that = this
    $wuxDialog.open({
      title: '亲！打个赏呗！',
      content: '限时优惠！',
      verticalButtons: !0,
      buttons: [
        {
          text: '打赏1元(解锁一天)',
          bold: !0,
          onTap(e) {
            that.userPay(100)
          },
        },
        {
          text: '打赏9.9元(解锁一月)',
          bold: !0,
          onTap(e) {
            that.userPay(990)
          }
        },
        {
          text: '帮助中心',
          bold: !0,
          onTap(e) {
            //说明
            wx.navigateTo({
              url: 'about',
            })
          }
        },
        {
          text: '关闭',
          bold: !0,
          onTap(e) {
          }
        },
      ],
    })
  },

  //转发增加时长
  onShareAppMessage: function () {
    let that = this

    return {
      success: function (res) {
        // 转发成功
        that.share.queryAsync({})
          .then(res => {
            var res = res.data
            if (res.errno == 401) {
              //已转发或是vip
            }
            if (res.errno == 0) {
              //增加时间
              wx.setStorageSync('overtime', res.data * 1000)
              wx.showModal({
                title: '成功',
                content: '已为您解锁部分内容',
                showCancel: false,
                confirmText: '快去看',
                success: function (res) { },
              })
            }
          })
      },
    }
    
  },
alert(title = '支付成功', text = '已为您解锁内容') {
  $wuxDialog.alert({
    title: title,
    content: text,
    onConfirm(e) { },
  })
},

//选择按钮2
chooset() {
  var that = this
  $wuxDialog.open({
    title: '美女图小程序招商加盟',
    content: '详情请加微信：lover-7com',
    verticalButtons: !0,
    buttons: [
      {
        text: '打赏1元(仅为演示)',
        bold: !0,
        onTap(e) {
          that.alert()
        },
      },
      {
        text: '打赏9.9元(仅为演示)',
        bold: !0,
        onTap(e) {
          that.alert()
        }
      },
      {
        text: '帮助中心',
        bold: !0,
        onTap(e) {
          //说明
          wx.navigateTo({
            url: 'about',
          })
        }
      },
      {
        text: '关闭',
        bold: !0,
        onTap(e) {
        }
      },
    ],
  })
},
})