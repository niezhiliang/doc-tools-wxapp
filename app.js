// app.js
App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    wx.setStorageSync('logs', logs)
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res;
        const model = res.model || '';
        if (model.includes('iPhone X') || model.includes('iPhone 1') || model.includes('iPhone 2')) {
          this.globalData.isIphoneX = true
        }
      }
    });
    this.loginPromise = new Promise((resolve) => {
      wx.login({
        success: res => {
          wx.request({
            url: this.globalData.baseUrl + '/app/getOpenId?code=' + res.code,
            timeout: 10000,
            success: (res) => {
              if (res.data.code === 'SUCCESS') {
                this.globalData.openId = res.data.data;
              }
              resolve(this.globalData.openId);
            },
            fail: () => {
              resolve('');
            }
          })
        },
        fail: () => {
          resolve('');
        }
      })
    });
  },
  globalData: {
    userInfo: null,
    baseUrl: 'https://api.doctool.cc/api',
    bgColor: '#BE99FF',
    adSwitch: true,
    isIphoneX: false,
    openId: ''
  }
})
