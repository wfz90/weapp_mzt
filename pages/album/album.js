var App = getApp()

/**
 * 根据图集id打开图片：getAlbum pic/album
 */

Page({

  data: {
    album: [],
    urls: [],
    title: '',
    id: '',
    countShow: true,
    currentIndex: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title: options.title,
      id: options.id,
    })
    this.album = App.HttpResource('pic/album/:id', { id: '@id' })

    this.getAlbum(options.id)
  },

  getAlbum(id){
    let that = this
    this.album.queryAsync({ aid: id })
    .then(res=>{
      var res = res.data
      if (res.errno == 0 && res.data) {
        var imgList = res.data;
        var imgObjList = [];
        imgList.forEach(function (item, index) {
          imgObjList.push({
            url: item,
            w: 750,
            h: 375
          })
          that.setData({
            urls: res.data,
            album: imgObjList,
            albumUrlList: imgList,
            total: imgList.length,
            loaded: 0
          })
        })
      }
    })
  },

  onReady: function () {
    wx.setNavigationBarTitle({ title: this.data.title })
  },

  imageload: function (e) {
    var h = e.detail.height
    var w = e.detail.width
    var index = e.currentTarget.dataset.index
    var album = this.data.album
    album[index].h = parseInt(750 * h / w)
    this.setData({
      album: album
    })
  },

  preiviewwImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.albumUrlList
    })
  },

  swiperChange: function (e) {
    this.setData({ currentIndex: parseInt(e.detail.current) + 1 });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }  
  }  
})