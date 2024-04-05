import Toast from '@vant/weapp/toast/toast';
const app = getApp();
import { requestApi } from "../../utils/service";

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
     onLoad(options) {
        this.getAppSeeting();
        this.getAppList();
        // 全局变量存入缓存
        app.globalData.bgColor = this.data.appSeeting.bgColor;
        app.globalData.adSwich = this.data.appSeeting.adSwich;
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
    }
})
