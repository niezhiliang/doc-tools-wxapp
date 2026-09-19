App({
  onLaunch() { this.login(); },
  login() {
    if (this.globalData.openId) return Promise.resolve(this.globalData.openId);
    if (this.loggingIn) return this.loginPromise;
    this.loggingIn = true;
    this.globalData.loginError = '';
    this.loginPromise = new Promise(resolve => {
      const fail = message => {
        this.globalData.openId = '';
        this.globalData.loginError = message;
        resolve('');
      };
      wx.login({
        success: result => {
          if (!result.code) { fail('未取得微信登录凭证，请重试'); return; }
          wx.request({
            url: this.globalData.baseUrl + '/app/getOpenId?code=' + encodeURIComponent(result.code),
            timeout: 10000,
            success: response => {
              const body = response.data || {};
              if (response.statusCode === 200 && body.code === 'SUCCESS' && body.data) {
                this.globalData.openId = body.data;
                resolve(body.data);
              } else {
                fail(body.message || body.msg || '微信登录失败，请稍后重试');
              }
            },
            fail: () => fail('无法连接登录服务，请检查网络后重试')
          });
        },
        fail: () => fail('微信登录失败，请稍后重试')
      });
    }).finally(() => { this.loggingIn = false; });
    return this.loginPromise;
  },
  globalData: {
    baseUrl: 'http://localhost:9876',
    openId: '',
    loginError: ''
  }
});
