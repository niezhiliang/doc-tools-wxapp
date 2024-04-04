import Toast from '@vant/weapp/toast/toast';
const baseUrl = getApp().globalData.baseUrl;

Page({
    data: {
        appList: []
      },
      openShow(params) {
     },
     onLoad(options) {
        this.getAppList();
    },
    getAppList() {
        const that = this;
        const reqUrl = baseUrl + '/app/getAppList'
        wx.request({
            url: reqUrl,
            method:'GET',
            success:function (res) {
                if (res.data.code === 'SUCCESS') {
                console.log("--" + res.data)
                    that.setData({
                        appList: res.data.data
                    })
                } else {
                    Toast.fail('功能列表获取失败');
                }
            },
            fail:function (error) {
              Toast.fail('服务网络异常');
            }
        })
    }
})
