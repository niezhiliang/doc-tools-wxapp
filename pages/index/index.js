import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const baseUrl = app.globalData.baseUrl;

Page({
    data: {
        appList: [],
        appSeeting: {
            "id": 1,
            "bgColor": "#BE99FF",
            "gutter": 3,
            "columnNum": 4,
            "iconSize": 30,
            "appName": "PDF转换助手",
            "adSwich": 0
          }
      },
      openShow(params) {
     },
     onLoad(options) {
        this.getAppSeeting();
        this.getAppList();
        // 全局变量存入缓存
        app.globalData.bgColor = this.data.appSeeting.bgColor;
        app.globalData.adSwich = this.data.appSeeting.adSwich;
        console.log(app.globalData.bgColor)
    },
    getAppSeeting() {
        const that = this;
        const reqUrl = baseUrl + '/app/getAppSetting'
        wx.request({
            url: reqUrl,
            method:'GET',
            success:function (res) {
                if (res.data.code === 'SUCCESS') {
                console.log("--" + res.data)
                    that.setData({
                        appSeeting: res.data.data
                    })
                } else {
                    Toast.fail('功能列表获取失败');
                }
            },
            fail:function (error) {
              Toast.fail('服务网络异常');
            }
        })
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
