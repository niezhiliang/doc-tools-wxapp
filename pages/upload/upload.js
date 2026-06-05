const app = getApp();
import { requestApi } from "../../utils/service";
import Toast from '@vant/weapp/toast/toast';

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
    appInfo:{
        id: 1,
        title: "APP标题",
        supportType: '',
        maxSize: 5,
        fileType: 2,
    },
    fileTypeArray:['file','all','file','image','video'],
    appPrompt:[],
    msg: "功能说明",
    loadStatus: false
  },
  onLoad(option) {
    wx.setNavigationBarTitle({
        title: '文件上传',
      })
    this.setData({
        bgColor: app.globalData.bgColor
    }),
    this.getAppInfo(option.appId);
    this.getAppPrompt(option.appId);
  },
  openShow() {
    this.uploadChatMsgFile();
  },
formatBytes(bytes) {
    if (bytes === 0) return '0 B';
   
    const k = 1024;
    const dm = 2;
    const sizes = ['B','KB','MB','GB','TB','PB','EB','ZB','YB'];
   
    const i = Math.floor(Math.log(bytes) / Math.log(k));
   
    return parseFloat((bytes / Math.pow(k,i)).toFixed(dm)) + ' ' + sizes[i];
},
uploadChatMsgFile() {
  const appId = this.data.appInfo.id;
  const type = this.data.fileTypeArray[this.data.appInfo.fileType];
  const extension = this.data.appInfo.supportType.split(',');
  const that = this;
  wx.chooseMessageFile({
    count: type == 'image' ? 9 : 1,
    type: type,
    extension: extension,
    sourceType: ['message'],
    success (res) {
      const fileName = res.tempFiles[0].name;   
      let path = res.tempFiles[0].path;
      const size = that.formatBytes(res.tempFiles[0].size);

      let toPage = '/pages/view/view?name=' + fileName+'&data=';
        if (type === 'image') {
            toPage = '/pages/imgview/imgview?name=' + fileName+'&data=';
            path = JSON.stringify(res.tempFiles.map(item => item.path));
        }
        wx.navigateTo({
            url: toPage + '&appId=' + appId + '&path=' + path
            + '&size=' +  size
        })
    }
  })
},
getAppInfo(appId) {
    const that = this;
        requestApi({ url: "/app/getById", data: {"appId": appId} })
        .then((res) => {
            if (res.data.code === 'SUCCESS') {
                that.setData({
                    appInfo: res.data.data
                })
            } else {
                Toast.fail('功能列表获取失败');
            }
        })
},
getAppPrompt(appId) {
    const that = this;
    requestApi({ url: "/app/getAppPrompt", data: {"appId": appId} })
    .then((res) => {
        if (res.data.code === 'SUCCESS') {
            that.setData({
                appPrompt: res.data.data.promptList
            })
        } else {
            Toast.fail('功能列表获取失败');
        }
    })
}
})