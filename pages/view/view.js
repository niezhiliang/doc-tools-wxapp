import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const baseUrl = app.globalData.baseUrl;
import { requestApi } from "../../utils/service";
import { directView } from '../../utils/viewutil';

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
  data: {
    bgColor: '',
    percentage: 0,
    appId: 1,
    fileInfo: {},
    fileName: '',
    fileType: '',
    fileTmpPath: '',
    fileSize: '',
    loadStatus: true,
    uploadDone: false,
    uploadError: false,
    btnText: '文件上传中...',
    imgFlagRadio: 'true',
  },

  onLoad(options) {
    wx.setNavigationBarTitle({
        title: '文件预览',
    });
    let filePath = options.name;
    this.setData({
        bgColor: app.globalData.bgColor,
        appId: options.appId,
        fileName: filePath.substring(0, filePath.lastIndexOf('.')),
        fileType: filePath.substring(filePath.lastIndexOf('.') + 1),
        fileTmpPath: options.path,
        fileSize: options.size,
        percentage: 0,
        uploadDone: false,
        uploadError: false
    });
    this.fileUpload();
  },
  onChange(event) {
    this.setData({
      imgFlagRadio: event.detail,
    });
  },
  onPreView() {
      if (this.data.uploadDone) {
        directView(this.data.fileTmpPath);
      }
  },
  fileUpload() {
    const that = this;
    const requestUrl = baseUrl + '/doc/upload?fileName=' + encodeURIComponent(this.data.fileName);
    const uploadTask = wx.uploadFile({
      url: requestUrl,
      filePath: this.data.fileTmpPath,
      name: 'file',
      success(res) {
        let result = JSON.parse(res.data);
        if (result.code === 'SUCCESS') {
          that.setData({
            fileInfo: result.data,
            loadStatus: false,
            percentage: 100,
            uploadDone: true,
            uploadError: false
          });
          Toast.success('上传成功');
        } else {
          that.setData({
            loadStatus: false,
            uploadDone: false,
            uploadError: true
          });
          Toast.fail('文件上传失败');
        }
      },
      fail() {
        that.setData({
          loadStatus: false,
          uploadDone: false,
          uploadError: true
        });
        Toast.fail('文件上传失败');
      }
    });
    uploadTask.onProgressUpdate((res) => {
      that.setData({
        percentage: res.progress
      });
    });
  },
  onConvert() {
    if (!this.data.uploadDone) {
        Toast.fail('文件上传中，请稍候');
        return;
    }
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
      duration: 0,
    });
    const appId = this.data.appId;
    requestApi({ url: "/doc/convert", method: 'POST',
     data: {
        "type": appId,
        "pathKeys": [this.data.fileInfo.urlKey],
        "saveImgFlag": this.data.imgFlagRadio,
        "openId": app.globalData.openId
    }})
    .then((res) => {
        if (res.statusCode === 200 && res.data.code === 'SUCCESS') {
            Toast.clear();
            wx.reLaunch({
              url: '/pages/history/record'
            });
        } else {
            Toast.fail('转换失败');
        }
    })
    .catch(() => {
        Toast.fail('网络异常，请稍后重试');
    });
  }
});
