import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const baseUrl = app.globalData.baseUrl;
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
  data: {
    appId: 1,
    bgColor: '',
    fileName: '',
    currentTouchIndex: -1,
    picObjList: []
  },
  onLoad(options){
    let filePath = options.name;
    this.setData({
        appId: options.appId,
        bgColor: app.globalData.bgColor,
        fileTmpPath: options.path,
        fileName: filePath.substring(0,filePath.lastIndexOf('.')),
    });
    console.log(options.path)
    let pathArray = JSON.parse(options.path)
    for (const e of pathArray) {
        this.fileUpload(e);
    }
  },
  deleteImg(e){
    const i = e.currentTarget.dataset.index
    console.log(i + 'xxx')
    const picObjList = this.data.picObjList;
    picObjList.splice(i,1);
    this.setData({
        picObjList: picObjList
    })
  },
  // 预览图片
  previewImg(e){
    const i = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.picObjList[i].url, // 当前显示图片的 http 链接
      urls: this.data.picObjList.map(item => item.url) // 需要预览的图片 http 链接列表
    })
  },
  fileUpload(tmpPath) {
    const that = this;
    const requestUrl = baseUrl + '/doc/upload?fileName=' + this.data.fileName;
    const uploadTask = wx.uploadFile({
      url: requestUrl,
      filePath: tmpPath,
      name: 'file',
      success:function (res) {
        let result = JSON.parse(res.data);
        console.log(result)
          // 上传成功后的处理逻辑
        if (result.code === 'SUCCESS') {
            that.setData({
                picObjList: that.data.picObjList.concat(result.data),
            });
          Toast.success('上传成功')
        } else {
            Toast.fail('图片上传失败');
        }
    },
    fail(err) {
      console.log(err.detail)
      Toast.fail('服务端异常');
    }
    })
  uploadTask.onProgressUpdate((res) => {
    // this.setData({
    //     percentage:res.progress
    //   });
      console.log('上传进度', res.progress)
  })
  },
  onUpload() {
    const picCount = 9 - this.data.picObjList.length;
    console.log(picCount)
    const that = this;
    wx.chooseMessageFile({
        count: picCount,
        type: 'image',
        success (res) {
            const pathArray = res.tempFiles.map(item => item.path)
            for (const e of pathArray) {
                that.fileUpload(e);
            }
        }
    })
  },
  onConvert() {
    Toast.loading({
      message: '图片转换中...',
      forbidClick: true,
      // 持续展示 toast
      duration: 0,     
    });
    const appId = this.data.appId;
    const fileName = this.data.fileName;
    requestApi({ url: "/doc/convert", method: 'POST',
     data: {
        "openId": app.globalData.openId,
        "type": appId,
        "openId": app.globalData.openId,
        "pathKeys": this.data.picObjList.map(item => item.urlKey)
    }})
    .then((res) => {
        if (res.statusCode ===200 && res.data.code === 'SUCCESS') {
            Toast.clear();
            wx.reLaunch({
              url: '/pages/history/record'
            })
        } else {
            Toast.fail('转换失败',5)
        }
    })
  }
})
