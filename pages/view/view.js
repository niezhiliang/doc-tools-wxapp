// pages/view/view.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fileList: [
      {
        url:"https://img.yzcdn.cn/vant/leaf.jpg",
        urlKey:"2222",
        deletable: false,
      },
      {
        url:"https://img.yzcdn.cn/vant/tree.jpg'",
        urlKey:"22223",
        deletable: false,
      }
  ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let obj = JSON.parse(options.data)
    console.log(obj.data);
    this.setData({
      fileList: this.data.fileList.concat(obj.data)
    });
  },
  onConvert() {
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
    });
    console.log(this.data.fileList)
          wx.navigateTo({
            url: '/pages/result/result',
          })
    // wx.request({
    //     url:'http://127.0.0.1:8080/doc/convert',
    //     method:'POST',
    //     header:{
    //       'content-type':'application/json'  // 设置请求头为json格式
    //     },
    //     data:{
    //       pathKeys: this.data.fileList.map(item => item.urlKey),
    //       type: 2
    //       // 添加更多需要发送的数据
    //     },
    //     success:function (res) {
    //       console.log(res.data)  // 请求成功，处理返回的数据
    //       var response = JSON.stringify(res.data);
    //       wx.navigateTo({
    //         url: '/pages/result/result?url=' + response,
    //       })
    //     },
    //     fail:function (error) {
    //       console.log(error)  // 请求失败处理
    //     }
    //    })
  }
})