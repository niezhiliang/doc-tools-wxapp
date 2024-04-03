// pages/result/result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "https://img.yzcdn.cn/vant/leaf.jpg",
    convertMsg:"如需转发到微信，将在广告展示完成后转发"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      // this.setData({
      //   url: options.url
      // })
      // console.log(options.url)
  },
  // 文件分享到聊天记录
  fileShare() {
      // callback 写法
      wx.downloadFile({
        // 下载url
        url: this.data.url, 
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
  }
})