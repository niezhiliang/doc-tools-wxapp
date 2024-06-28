const app = getApp();
import { requestApi } from "../../utils/service";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    bgColor: '',
    active: 1,
    records:[],
    typeEnum:['','待转换','转换中','转换完成','转换失败'],
    noticeMsg: '转换记录和文件仅保留72小时，请及时保存！'
  },
  onLoad(options) {
    this.setData({
        bgColor: app.globalData.bgColor
    })
    this.getConvertReocrd();
  },
  onChange(event) {
    this.setData({ active: event.detail });
    if (event.detail == 0) {
        wx.redirectTo({
          url: '/pages/index/index',
        })
    }
  },
  getConvertReocrd() {
    const that = this;
    requestApi({ url: "/doc/getUserConvertRecord",
     data: {"openId": app.globalData.openId} })
    .then((res) => {
        if (res.data.code === 'SUCCESS') {
            that.setData({
              records: res.data.data
            })
        } else {
            Toast.fail('转换列表获取失败');
        }
    })
  },
    // 完成的跳转到结果页面
    redirectToResult(e) {
        const id = e.currentTarget.dataset.id;
        const appId = e.currentTarget.dataset.type;
        const status = e.currentTarget.dataset.status;
        console.log(status + '111111')
        if (status == 1) {
          Toast.fail("转换排队中");
        } else if (status == 2) {
          Toast.fail('文件转换中');
        } else if (status == 3) {
          wx.reLaunch({
            url: '/pages/result/result?id=' + id
          })
        } else if (status == 4) {
          Toast.fail('转换失败请,重试');
        }
    },
  // 下拉刷新事件
  onPullDownRefresh() {
    this.getConvertReocrd();
    wx.stopPullDownRefresh();
  },
})