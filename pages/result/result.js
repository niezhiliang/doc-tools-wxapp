const docView = require('../../utils/viewutil');
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
import { requestApi } from "../../utils/service";

Page({
    onShareAppMessage: function (res) {
        return {
          title: 'PDF转换器',
          path: '/pages/index/index',
        }
      },
      onShareTimeline() {
        return {
          title: '[小程序] PDF转换器，支持PDF和多种文档之间的相互转换！快来体验一下吧！',
          query: 'zzfrom=pyq'
        }
      },
  /**
   * 页面的初始数据
   */
  data: {
    bgColor: '',
    fileName: '',
    respData: [],
    appId: 2,
    preBtnColor: '',
    preBtnText: '预览',
    convertMsg:"如需转发到微信，将在广告展示完成后转发。",
    noticeMsg: '预览样式可能会有差异，请以电脑查看为准。文件太大，预览可能会出现白屏，请耐心等一会。',
    tempFilePath: '',
    preViewLoading: false,
    shareLoading: false,
    disabled: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //   const respData = JSON.parse(options.respData);
    //   const url = respData[0];
    //   console.log('232' + JSON.stringify(url))
      this.getConvertDetail(options.id);
      this.setData({
        bgColor: app.globalData.bgColor
      })
      console.log(this.data.fileName)
      if (this.data.appId == 1) {
          this.setData({
            preBtnText: '预览分享保存',
            noticeMsg: '预览时，图片可左右滑动，长按目标图片，屏幕下方会弹出微信内置的转发到微信和保存到相册的选项。',
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
            shareLoading: true,
            disabled: true
        });
        const that = this
        wx.downloadFile({
            // 下载url
            url: that.data.respData[0], 
            success (res) {
                console.log("文件下载完成")
                that.setData({
                    shareLoading: false,
                    disabled: false,
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
                preViewLoading: true,
                disabled: true
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
    console.log(that.data.respData +'1111')
    wx.downloadFile({
        url: that.data.respData[0],
        success: function (res) {
            if(res.statusCode != 200) {
                Toast.fail(res.statusCode)
            }
            that.setData({
                tempFilePath: res.tempFilePath,
                preViewLoading: false,
                disabled: false
            })
            docView.directViwe(res.tempFilePath)
        },
        fail: function (err) {
            console.log(err, "wx.downloadFile fail err");
            Toast.success('文件加载失败')
        }
    })
  },
  // 获取转换详情
  getConvertDetail(id) {
    const that = this;
    requestApi({ url: "/doc/getConvertRecordDetail", data: {"id": id} })
    .then((res) => {
        if (res.data.code === 'SUCCESS') {
            that.setData({
                appId: res.data.data.convertType,
                respData: JSON.parse(res.data.data.convertedFile),
                fileName: res.data.data.fileNameme
            })
        } else {
            Toast.fail('获取转换详情失败');
        }
    })
  }
})