// pages/result/result.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: "https://img.yzcdn.cn/vant/leaf.jpg",
    convertMsg:"转换成功,下载文件并转发到微信，将在广告展示完成后下载"
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
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})