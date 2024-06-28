import Toast from '@vant/weapp/toast/toast';
const app = getApp();
import { requestApi } from "../../utils/service";

Page({
    onShareAppMessage: function (res) {
        return {
          title: 'PDF转换器',
          path: '/pages/index/index',
        }
      },
      onShareTimeline() {
        return {
          title: '[小程序] PDF转换器，支持PDF和多种文档之间的相互转换！快来体验一下吧！',
          query: 'zzfrom=pyq'
        }
      },
    adLoad() {
        console.log('Banner 广告加载成功')
      },
      adError(err) {
        console.error('Banner 广告加载失败', err)
      },
      adClose() {
        console.log('Banner 广告关闭')
      },
    data: {
        active: 0,
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
     onLoad(options) {
        this.getAppSeeting();
        this.getAppList();
        // 全局变量存入缓存
        app.globalData.bgColor = this.data.appSeeting.bgColor;
        app.globalData.adSwich = this.data.appSeeting.adSwich == 1;
    },
    onChange(event) {
        this.setData({ active: event.detail });
        if (event.detail == 1) {
            wx.redirectTo({
              url: '/pages/history/record',
            })
        }
      },
    getAppSeeting() {
        const that = this;
        requestApi({ url: "/app/getAppSetting", data: {} })
        .then((res) => {
            if (res.data.code === 'SUCCESS') {
                that.setData({
                    appSeeting: res.data.data
                })
            } else {
                console.log('获取服务失败啦')
                Toast.fail('功能列表获取失败');
            }
        })
        //     fail:function (error) {
        //       Toast.fail('服务网络异常');
        //     }
    },
    getAppList() {
        const that = this;
        requestApi({ url: "/app/getAppList", data: {} })
        .then((res) => {
            if (res.data.code === 'SUCCESS') {
                that.setData({
                    appList: res.data.data
                })
            } else {
                Toast.fail('功能列表获取失败');
            }
        })
    },
      // 下拉刷新事件
  onPullDownRefresh() {
    this.getAppSeeting();
    this.getAppList();
    wx.stopPullDownRefresh();
  },
})
