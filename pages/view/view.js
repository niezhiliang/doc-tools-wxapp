import Toast from '@vant/weapp/toast/toast';
const baseUrl = getApp().globalData.baseUrl;
const docView = require('../../utils/viewutil');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    appId: 1,
    fileInfo: {},
    loadStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let obj = JSON.parse(options.data)
    console.log('____'+ JSON.stringify(obj.data));
    this.setData({
        fileInfo: obj.data,
        appId: options.appId
    });
    docView.fileViwe(this.data.fileInfo.url);
  },
  onConvert() {
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
      // 持续展示 toast
      duration: 0,     
    });
    console.log(this.data.fileList)
    const requestUrl = baseUrl + '/doc/convert';
    wx.request({
        url: requestUrl,
        method:'POST',
        header:{
          'content-type':'application/json'  // 设置请求头为json格式
        },
        data:{
          pathKeys: new Array(this.data.fileInfo.urlKey),
          type: this.data.appId
          // 添加更多需要发送的数据
        },
        success:function (res) {
            console.log(JSON.stringify(res) + "999")
            console.log(res.statusCode + "---" + res.data.code)
            if (res.statusCode ===200 && res.data.code === 'SUCCESS') {
                Toast.clear();
                var response = JSON.stringify(res.data.data);
                wx.reLaunch({
                  url: '/pages/result/result?isImg=false&respData=' + response,
                })
            } else {
                Toast.fail('转换失败',5)
            }
            console.log(res.data)  // 请求成功，处理返回的数据
        },
        fail:function (error) {
          console.log(error)  // 请求失败处理
          Toast.fail('服务网络异常',5)
        }
       })
  },
})