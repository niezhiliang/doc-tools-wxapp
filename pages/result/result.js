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
    fileName: '',
    respData: [],
    appId: 2,
    preBtnColor: '',
    preBtnText: '预览',
    convertMsg:"如需转发到微信，将在广告展示完成后转发"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      const respData = JSON.parse(options.respData);
      const url = respData[0];
      this.setData({
        bgColor: app.globalData.bgColor,
        adSwitch: app.globalData.adSwitch,
        appId: options.appId,
        respData: respData,
        fileName: options.name + url.substring(url.lastIndexOf('.'))
      })
      console.log(this.data.fileName)
      if (this.data.appId == 1) {
          this.setData({
            preBtnText: '预览分享保存',
            preBtnColor: app.globalData.bgColor,
          })
      }
  },
  // 文件分享到聊天记录
  fileShare() {
      // callback 写法
      const fileName = this.data.fileName;
      wx.downloadFile({
        // 下载url
        url: this.data.respData[0], 
        success (res) {
          console.log("文件下载完成")
          // 下载完成后转发
          wx.shareFileMessage({
            filePath: res.tempFilePath,
            fileName: fileName,
            success() {
                console.log('文件分享成功')
            },
            fail: console.error,
          })
        },
        fail: console.error,
      })
  },
  preView() {
    if (this.data.appId != 1) {
        docView.fileViwe(this.data.respData[0]);
    } else {
        wx.previewImage({
            current: this.data.respData[0], // 当前显示图片的 http 链接
            urls: this.data.respData // 需要预览的图片 http 链接列表
        })
    }
  }
})