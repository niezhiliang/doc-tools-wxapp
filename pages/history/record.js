const app = getApp();
import { requestApi } from "../../utils/service";

Page({
  data: {
    isRefreshing: false, // 是否正在刷新
    refreshText: '下拉刷新', // 下拉刷新文字提示
    bgColor: '',
    active: 1,
    records:[],
    typeEnum:['','待转换','转换中','转换完成','转换失败']
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
            console.log(res.data)
            that.setData({
                records: res.data.data
            })
            console.log(that.data.records)
        } else {
            Toast.fail('转换列表获取失败');
        }
    })
  },
    // 完成的跳转到结果页面
    redirectToResult(e) {
        const id = e.currentTarget.dataset.id;
        const appId = e.currentTarget.dataset.type;
        console.log('resultId:'+id + ' ' + appId)
        wx.reLaunch({
            url: '/pages/result/result?id=' + id
          })
    },
  // 下拉刷新事件
  onPullDownRefresh: function () {
    if (this.data.isRefreshing) {
      return;
    }
    this.setData({
      isRefreshing: true,
      refreshText: '正在刷新...'
    });

    // 模拟异步请求数据
    setTimeout(() => {
      // 更新数据
      this.getConvertReocrd();
      this.setData({
        isRefreshing: false,
        refreshText: '下拉刷新'
      });
      wx.stopPullDownRefresh(); // 停止下拉刷新
    }, 1500);
  }
})