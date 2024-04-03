// pages/view/view.js

import Toast from '@vant/weapp/toast/toast';
const baseUrl = getApp().globalData.baseUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    convType: 0,
    fileList: [
  ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let obj = JSON.parse(options.data)
    console.log(obj.data);
    this.setData({
      fileList: this.data.fileList.concat(obj.data),
      convType: options.type
    });
    console.log(this.data)
  },
  onConvert() {
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
      // 持续展示 toast
      duration: 0,     
    });
    console.log(this.data.fileList)
    // wx.navigateTo({
    //   url: '/pages/result/result',
    // })
    const requestUrl = baseUrl + '/doc/convert';
    wx.request({
        url: requestUrl,
        method:'POST',
        header:{
          'content-type':'application/json'  // 设置请求头为json格式
        },
        data:{
          pathKeys: this.data.fileList.map(item => item.urlKey),
          type: this.data.convType
          // 添加更多需要发送的数据
        },
        success:function (res) {
          console.log(res.data)  // 请求成功，处理返回的数据
          var response = JSON.stringify(res.data);
          wx.navigateTo({
            url: '/pages/result/result?url=' + response,
          })
        },
        fail:function (error) {
          console.log(error)  // 请求失败处理
        }
       })
  }
})