// pages/view/view.js

import Toast from '@vant/weapp/toast/toast';
const baseUrl = getApp().globalData.baseUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    convType: 0,
    fileList: {},
    loadStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // let obj = JSON.parse(options.data)
    // console.log(obj.data);
    // this.setData({
    // //   fileList: this.data.fileList.concat(obj.data),
    //   fileList: obj.data,
    //   convType: options.type
    // });
    this.downloadFile();
    // console.log(this.data)
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
          pathKeys: this.data.fileList.map(item => item.urlKey),
          type: this.data.convType
          // 添加更多需要发送的数据
        },
        success:function (res) {
          console.log(res.data)  // 请求成功，处理返回的数据
          Toast.clear();
          var response = JSON.stringify(res.data);
          wx.navigateTo({
            url: '/pages/result/result?url=' + response,
          })
        },
        fail:function (error) {
          console.log(error)  // 请求失败处理
          Toast.fail('转换失败')
          wx.navigateTo({
            url: '/pages/result/result',
          })
        }
       })
  },
  /**
* 下载文件并预览
*/
downloadFile: function(e) {
    console.log(this.data.fileList);
    let type = this.data.convType;
    let url = 'http://159.75.95.172:8080/20240403/202404032023112285.pdf'//this.data.fileList.url;
    // url += 'pdf';
    // switch (type) {
    // case "pdf":
    //     url += 'pdf';
    //     break;
    // case "word":
    //     url += 'docx';
    //     break;
    // case "excel":
    //     url += 'xlsx';
    //     break;
    // default:
    //     url += 'pptx';
    //     break;
    // }
    wx.downloadFile({
        url: url,
        header: {},
        success: function(res) {
            var filePath = res.tempFilePath;
            console.log(filePath);
            wx.openDocument({
                filePath: filePath,
                success: function(res) {
                    console.log('打开文档成功')
                },
                fail: function(res) {
                    console.log(res);
                },
                complete: function(res) {
                    console.log(res);
                }
            })
        },
        fail: function(res) {
            console.log('文件下载失败');
        },
        complete: function(res) {},
    })
}
})