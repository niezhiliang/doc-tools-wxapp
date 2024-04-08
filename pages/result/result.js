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
    convertMsg:"如需转发到微信，将在广告展示完成后转发",
    tempFilePath: '',
    preViewLoading: false,
    shareLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
      const respData = JSON.parse(options.respData);
      const url = respData[0];
      console.log('232' + JSON.stringify(url))
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
     if (this.data.tempFilePath === ''){
        this.setData({
            shareLoading: true
        });
        const that = this
        wx.downloadFile({
            // 下载url
            url: that.data.respData[0], 
            success (res) {
                console.log("文件下载完成")
                that.setData({
                    shareLoading: false,
                    tempFilePath: res.tempFilePath
                })
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
     } else {
        wx.shareFileMessage({
            filePath: this.data.tempFilePath,
            fileName: fileName,
            success() {
                console.log('文件分享成功')
            },
            fail: console.error,
        })
     }
  },
  preView() {
    if (this.data.appId != 1) {
        if (this.data.tempFilePath.trim() === '') {
            this.setData({
                preViewLoading: true
            })
            this.preDownload()
        } else {
            docView.directViwe(this.data.tempFilePath)
        }
    } else {
        wx.previewImage({
            current: this.data.respData[0], // 当前显示图片的 http 链接
            urls: this.data.respData // 需要预览的图片 http 链接列表
        })
    }
  },
  preDownload() {
    const that = this;
    wx.downloadFile({
        url: that.data.respData[0],
        success: function (res) {
            if(res.statusCode != 200) {
                Toast.fail(res.statusCode)
            }
            that.setData({
                tempFilePath: res.tempFilePath,
                preViewLoading: false
            })
            docView.directViwe(res.tempFilePath)
        },
        fail: function (err) {
            console.log(err, "wx.downloadFile fail err");
            Toast.success('文件加载失败')
        }
    })
  }
})