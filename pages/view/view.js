import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const baseUrl = app.globalData.baseUrl;
import { requestApi } from "../../utils/service";
const docView = require('../../utils/viewutil');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bgColor: '',
    adSwitch: false,
    percentage: 0,
    appId: 1,
    fileInfo: {},
    fileName: '',
    fileType: '',
    fileTmpPath: '',
    fileSize: '',
    loadStatus: true,
    btnText: '文件上传中...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
        title: '文件预览',
      })
    let filePath = options.name;
    this.setData({
        bgColor: app.globalData.bgColor,
        adSwitch: app.globalData.adSwitch,
        appId: options.appId,
        fileName: filePath.substring(0,filePath.lastIndexOf('.')),
        fileType: filePath.substring(filePath.lastIndexOf('.') + 1),
        fileTmpPath: options.path,
        fileSize: options.size,
    });
    this.fileUpload();
  },
  // 文件预览功能
  onPreView() {
      if (this.data.percentage == 100) {
        docView.directViwe(this.data.fileTmpPath);
      }
  },
  fileUpload() {
    const that = this;
    const requestUrl = baseUrl + '/doc/upload?fileName=' + this.data.fileName;
    const uploadTask = wx.uploadFile({
      url: requestUrl,
      filePath: this.data.fileTmpPath,
      name: 'file',
      success:function (res) {
        let result = JSON.parse(res.data);
          // 上传成功后的处理逻辑
        if (result.code === 'SUCCESS') {
          that.setData({
            fileInfo: result.data,
            loadStatus: false
          })
          Toast.success('上传成功')
        } else {
            Toast.fail('文件上传失败');
        }
    },
    fail(err) {
        console.log(err.detail)
      Toast.fail('文件上传失败');
    }
    })
  uploadTask.onProgressUpdate((res) => {
    this.setData({
        percentage:res.progress
      });
      console.log('上传进度', res.progress)
  })
  },
  onConvert() {
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
      // 持续展示 toast
      duration: 0,     
    });
    console.log(this.data.fileInfo)

    const appId = this.data.appId;
    requestApi({ url: "/doc/convert", method: 'POST',
     data: {
        "type": appId,
        "pathKeys":new Array(this.data.fileInfo.urlKey)
    }})
    .then((res) => {
        if (res.statusCode ===200 && res.data.code === 'SUCCESS') {
            Toast.clear();
            var response = JSON.stringify(res.data.data);
            wx.reLaunch({
              url: '/pages/result/result?appId=' + appId + '&respData=' + response,
            })
        } else {
            Toast.fail('转换失败',5)
        }
    })
  },
})