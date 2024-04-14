// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
        //判断机型(适配iphoneX)
		wx.getSystemInfo({
			success: (res) => {
				this.globalData.systemInfo = res;
				if (res.model.search('iPhone X') !== -1) {
					this.globalData.isIphoneX = true
				}
			}
		});

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    // baseUrl: 'http://192.168.3.92:9876', // 后端请求地址的常量
    baseUrl: 'https://api.doctool.cc/api',
    bgColor: '#BE99FF',
    adSwitch: true,
    isIphoneX: false
  }
})
