const app = getApp();
import { requestApi } from "../../utils/service";
import Toast from '@vant/weapp/toast/toast';

Page({
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
    responseData:[],
    show: false,
    actions: [
        { name:'微信聊天文件',value:0 },
        { name:'本地文件',value: 1 }
    ],
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
  openShow(params) {
    this.uploadChatMsgFile();
    // if (this.data.docType == 2) {
    //     this.chooseImage();
    // } else {
    //     this.setData({ show: true });
    // }
},
onClose() {
  this.setData({ show: false });
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
  console.log(JSON.stringify(this.data.appInfo))
  // TODO 文件类型排除
  const extension = this.data.appInfo.supportType.split(',');
  const that = this;
  wx.chooseMessageFile({
    count: type == 'image' ? 9 : 1,
    type: type,
    extension: extension,
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
onSelect(event) {
    const { value } = event.detail;
    // 微信聊天记录赛选文件
    if (value == 0) {
        this.uploadChatMsgFile();
    } else if(value == 1) {
        // TODO 打开本地资源路径
        this.uploadChatMsgFile();
        // this.chooseImage();
    }
    this.setData({
      loadStatus: false
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