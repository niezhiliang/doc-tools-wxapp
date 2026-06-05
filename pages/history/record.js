const app = getApp();
import { requestApi } from "../../utils/service";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    bgColor: '',
    active: 1,
    records: [],
    typeEnum: ['', '待转换', '转换中', '转换完成', '转换失败'],
    statusColorMap: {
      1: '#ff976a',
      2: '#1989fa',
      3: '#07c160',
      4: '#ee0a24'
    },
    noticeMsg: '转换记录和文件仅保留72小时，请及时保存！',
    tmplIds: ['zXXukfVtqys-7gntC7Vd8LTXFOALBXK3T0mQ3mYdHYc']
  },
  onLoad(options) {
    this.setData({
        bgColor: app.globalData.bgColor
    });
    this.getConvertReocrd();
    this.authPushMsg();
  },
  onChange(event) {
    this.setData({ active: event.detail });
    if (event.detail == 0) {
        wx.switchTab({
          url: '/pages/index/index',
        });
    }
  },
  getConvertReocrd() {
    const that = this;
    if (!app.globalData.openId) {
        if (app.loginPromise) {
            app.loginPromise.then(() => {
                that.getConvertReocrd();
            });
        } else {
            setTimeout(() => { that.getConvertReocrd(); }, 500);
        }
        return;
    }
    return requestApi({ url: "/doc/getUserConvertRecord",
     data: {"openId": app.globalData.openId} })
    .then((res) => {
        if (res.data.code === 'SUCCESS') {
            that.setData({
              records: res.data.data
            });
        } else {
            Toast.fail('转换列表获取失败');
        }
    })
    .catch(() => {
        Toast.fail('网络异常，请稍后重试');
    });
  },
  redirectToResult(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    if (status == 1) {
      Toast.fail("转换排队中");
    } else if (status == 2) {
      Toast.fail('文件转换中');
    } else if (status == 3) {
      wx.reLaunch({
        url: '/pages/result/result?id=' + id
      });
    } else if (status == 4) {
      Toast.fail('转换失败，请重试');
    }
  },
  onPullDownRefresh() {
    const p = this.getConvertReocrd();
    if (p && p.finally) {
      p.finally(() => { wx.stopPullDownRefresh(); });
    } else {
      setTimeout(() => { wx.stopPullDownRefresh(); }, 1000);
    }
  },
  authPushMsg() {
    const that = this;
    wx.getSetting({
      withSubscriptions: true,
      success: function(res) {
        if (res.subscriptionsSetting.mainSwitch) {
          if (res.subscriptionsSetting.itemSettings != null) {
            let moIdState = res.subscriptionsSetting.itemSettings[that.data.tmplIds[0]];
          } else {
            wx.showModal({
              title: '提示',
              content: '请授权接收转换结果推送通知功能',
              showCancel: true,
              success: function (ress) {
                if (ress.confirm) {
                  wx.requestSubscribeMessage({
                    tmplIds: that.data.tmplIds,
                    success: function() {},
                    fail: function() {}
                  });
                }
              }
            });
          }
        }
      },
      fail: function() {},
    });
  }
});
