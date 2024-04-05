const docView = require('../../utils/viewutil');
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bgColor: '',
    adSwitch: false,
    respData: [],
    isImg: false,
    convertMsg:"如需转发到微信，将在广告展示完成后转发"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      const respData = JSON.parse(options.respData);
      this.setData({
        bgColor: app.globalData.bgColor,
        adSwitch: app.globalData.adSwitch,
        isImg: options.isImg,
        respData: respData
      })
  },
  // 文件分享到聊天记录
  fileShare() {
      // callback 写法
      wx.downloadFile({
        // 下载url
        url: this.data.respData[0], 
        success (res) {
          console.log("文件下载完成")
          // 下载完成后转发
          wx.shareFileMessage({
            filePath: res.tempFilePath,
            success() {},
            fail: console.error,
          })
        },
        fail: console.error,
      })
  },
  preView() {
    docView.fileViwe(this.data.respData[0]);
  }
})