import WxRequest from '../assets/plugins/wx-request/lib/index'

class HttpService extends WxRequest {
	constructor(options) {
		super(options)
		this.$$prefix = ''
		this.$$path = {
			wxLogin: '/user/login',//登录

        }
        this.interceptors.use({
            request(request) {
            	request.header = request.header || {}
            	request.header['content-type'] = 'application/json'
                if (wx.getStorageSync('token')) {
                    request.header.Authorization = wx.getStorageSync('token')
                }
                wx.showLoading({
                    title: '加载中', 
                })
                return request
            },
            requestError(requestError) {
            	wx.hideLoading()
                return Promise.reject(requestError)
            },
            response(response) {
            	wx.hideLoading()
            	if(response.statusCode === 401) {
                    wx.removeStorageSync('token')                    
                }
                return response
            },
            responseError(responseError) {
            	wx.hideLoading()
                return Promise.reject(responseError)
            },
        })
	}

  wxLogin(params) {
    return this.postRequest(this.$$path.wxLogin, {
			data: params,
		})
	}

}

export default HttpService