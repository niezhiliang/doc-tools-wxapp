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
    picObjList: [],
    localPaths: [],
    pathToServerMap: {},
    dragSize: 100,
    uploadTotal: 0,
    uploadDone: 0,
    allUploaded: false,
    uploadQueue: [],
    uploading: false
  },
  onLoad(options){
    let filePath = options.name;
    this.setData({
        appId: options.appId,
        bgColor: app.globalData.bgColor,
        fileTmpPath: options.path,
        fileName: filePath.substring(0,filePath.lastIndexOf('.')),
    });
    let pathArray = JSON.parse(options.path);
    this.setData({
        localPaths: pathArray,
        uploadTotal: pathArray.length,
        uploadDone: 0,
        allUploaded: false,
        uploadQueue: pathArray.slice()
    });
    this.processUploadQueue();
  },
  processUploadQueue() {
    if (this.data.uploading || this.data.uploadQueue.length === 0) {
        if (this.data.uploadQueue.length === 0 && this.data.uploadDone > 0) {
            this.setData({ allUploaded: true });
        }
        return;
    }
    this.setData({ uploading: true });
    const queue = this.data.uploadQueue.slice();
    const batchSize = Math.min(3, queue.length);
    const batch = queue.splice(0, batchSize);
    this.setData({ uploadQueue: queue });
    let completed = 0;
    const that = this;
    batch.forEach(tmpPath => {
        that.fileUpload(tmpPath, () => {
            completed++;
            if (completed >= batchSize) {
                that.setData({ uploading: false });
                that.processUploadQueue();
            }
        });
    });
  },
  deleteImg(e){
    const i = e.currentTarget.dataset.index;
    const picObjList = this.data.picObjList.filter((_, idx) => idx !== i);
    this.setData({ picObjList });
  },
  previewImg(e){
    const i = e.currentTarget.dataset.index;
    if (!this.data.picObjList[i] || !this.data.picObjList[i].url) {
      Toast.fail('图片上传中，请稍后');
      return;
    }
    wx.previewImage({
      current: this.data.picObjList[i].url,
      urls: this.data.picObjList.map(item => item.url)
    });
  },
  fileUpload(tmpPath, callback) {
    const that = this;
    const requestUrl = baseUrl + '/doc/upload?fileName=' + encodeURIComponent(this.data.fileName);
    wx.uploadFile({
      url: requestUrl,
      filePath: tmpPath,
      name: 'file',
      success(res) {
        let result = JSON.parse(res.data);
        if (result.code === 'SUCCESS') {
            const serverData = result.data;
            const map = Object.assign({}, that.data.pathToServerMap);
            map[tmpPath] = { url: serverData.url, urlKey: serverData.urlKey };
            const done = that.data.uploadDone + 1;
            const newPicList = that.data.picObjList.concat(
                Array.isArray(serverData) ? serverData : [serverData]
            );
            that.setData({
                pathToServerMap: map,
                uploadDone: done,
                picObjList: newPicList,
                allUploaded: done >= that.data.uploadTotal
            });
        } else {
            that.setData({
                uploadDone: that.data.uploadDone + 1,
                allUploaded: (that.data.uploadDone + 1) >= that.data.uploadTotal
            });
            Toast.fail('图片上传失败');
        }
      },
      fail() {
        that.setData({
            uploadDone: that.data.uploadDone + 1,
            allUploaded: (that.data.uploadDone + 1) >= that.data.uploadTotal
        });
        Toast.fail('服务端异常');
      },
      complete() {
        if (callback) callback();
      }
    });
  },
  onDragUpdate(e) {
    const sortedPaths = e.detail.list;
    const map = this.data.pathToServerMap;
    const picObjList = sortedPaths
      .filter(p => map[p])
      .map(p => map[p]);
    this.setData({ picObjList });
  },
  onUpload() {
    const picCount = 9 - this.data.picObjList.length;
    if (picCount <= 0) return;
    const that = this;
    wx.chooseMessageFile({
        count: picCount,
        type: 'image',
        sourceType: ['message'],
        success(res) {
            const newPaths = res.tempFiles.map(item => item.path);
            const allPaths = that.data.localPaths.concat(newPaths);
            const newTotal = that.data.uploadTotal + newPaths.length;
            that.setData({
                localPaths: allPaths,
                uploadTotal: newTotal,
                allUploaded: false,
                uploadQueue: that.data.uploadQueue.concat(newPaths)
            });
            that.processUploadQueue();
        }
    });
  },
  onConvert() {
    if (!this.data.allUploaded) {
        Toast.fail('图片上传中，请稍候');
        return;
    }
    if (this.data.picObjList.length === 0) {
        Toast.fail('请至少上传一张图片');
        return;
    }
    Toast.loading({
      message: '图片转换中...',
      forbidClick: true,
      duration: 0,
    });
    const appId = this.data.appId;
    requestApi({ url: "/doc/convert", method: 'POST',
     data: {
        "openId": app.globalData.openId,
        "type": appId,
        "pathKeys": this.data.picObjList.map(item => item.urlKey)
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
