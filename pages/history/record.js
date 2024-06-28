const app = getApp();
import { requestApi } from "../../utils/service";
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    bgColor: '',
    active: 1,
    records:[],
    typeEnum:['','待转换','转换中','转换完成','转换失败'],
    noticeMsg: '转换记录和文件仅保留72小时，请及时保存！',
    tmplIds: ['zXXukfVtqys-7gntC7Vd8LTXFOALBXK3T0mQ3mYdHYc']
  },
  onLoad(options) {
    this.setData({
        bgColor: app.globalData.bgColor
    })
    this.getConvertReocrd();
    // 询问是否开通授权
    this.authPushMsg();
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
  authPushMsg() {
    var that = this;
    wx.getSetting({
      withSubscriptions: true,   //  这里设置为true,下面才会返回mainSwitch
      success: function(res){         
        // 调起授权界面弹窗
        if (res.subscriptionsSetting.mainSwitch) {  // 用户打开了订阅消息总开关
          if (res.subscriptionsSetting.itemSettings != null) {   // 用户同意总是保持是否推送消息的选择, 这里表示以后不会再拉起推送消息的授权
            let moIdState = res.subscriptionsSetting.itemSettings[that.data.tmplIds];  // 用户同意的消息模板id
            if(moIdState === 'accept'){   
              console.log('接受了消息推送');

            }else if(moIdState === 'reject'){
              console.log("拒绝消息推送");

            }else if(moIdState === 'ban'){
              console.log("已被后台封禁");

            }
          }else {
          	// 当用户没有点击 ’总是保持以上选择，不再询问‘  按钮。那每次执到这都会拉起授权弹窗
            wx.showModal({
              title: '提示',
              content:'请授权接收转换结果推送通知功能',
              showCancel: true,
              success: function (ress) {
                if (ress.confirm) {  
                  wx.requestSubscribeMessage({
                    tmplIds: that.data.tmplIds,
                    success: res => {
                      console.log('调起成功');
                      if (res[that.data.tempId[0]] === 'accept') {
                          console.log('允许')
                      }
                      if (res[that.data.tempId[0]] === 'reject') {
                        console.log('拒绝')
                      }
                    },
                    fail: err => {
                      if (err.errCode == 20004) {
                        console.log('关闭小程序主开关')
                      } else {
                        console.log('订阅失败')
                      }
                    }
                  });                        
                }
              }
            })
          }

        }else {
          console.log('订阅消息未开启')
        }      
      },
      fail: function(error){
        console.log(error);
      },
    })
  }
})