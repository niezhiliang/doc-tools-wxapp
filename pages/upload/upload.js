// pages/upload/upload.js
const baseUrl = getApp().globalData.baseUrl;
import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    appInfo:{
        title: "APP标题",
        supportType: '',
        maxSize: 5,
        fileType: 2,
    },
    fileTypeArray:['file','all','file','image','video'],
    appPrompt:[],
    msg: "功能说明",
    supportType:[".png"],
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
    this.getAppInfo(option.type);
    this.getAppPrompt(option.type);
    if (option.type == 2) {
        this.setData({
            fileType: "image"
        })
    }
  },
  openShow(params) {
    console.log(params);
    if (this.data.docType == 2) {
        this.chooseImage();
    } else {
      this.setData({ show: true });
    }
},
onClose() {
  this.setData({ show: false });
},
uploadChatMsgFile() {
  const convType = this.data.docType
  console.log("选择聊天文件" + convType)
  const type = this.data.fileTypeArray[this.data.appInfo.fileType];
  // TODO 文件类型排除
  wx.chooseMessageFile({
    count: 1,
    type: type,
    success (res) {
      const tempFilePath = res.tempFiles[0].path
      console.log(tempFilePath, "tempFilePaths")      
      const requestUrl = baseUrl + '/doc/upload';
      wx.uploadFile({
        url: requestUrl,
        filePath: tempFilePath,
        name: 'file',
        success:function (res) {
            if (type === 'image') {
                wx.navigateTo({
                    url: '/pages/imgview/imgview?data=' + res.data
                })
            } else {
                wx.navigateTo({
                    url: '/pages/view/view?data=' + res.data + '&type=' + convType
                })
            }
            // 上传成功后的处理逻辑
      },
      fail(err) {
        Toast.fail('文件上传失败');
        wx.navigateTo({
          url: '/pages/view/view',
        })
      }
      })
    }
  })
},
// chooseImage() {
//     wx.chooseImage({
//       success:(res) => {
//         const tempFilePath = res.tempFilePaths[0];
//         this.setData({
//           imagePath:tempFilePath
//         });
//       // wx.uploadFile({
//       //   url: 'http://localhost:8080/doc/upload',
//       //   filePath: tempFilePath,
//       //   name: 'file',
//       //   success:function (res) {
//       //       wx.navigateTo({
//       //       url: '/pages/imgview/imgview?data=' + res.data + '&type=' + convType
//       //       })
//       //       // 上传成功后的处理逻辑
//       // },
//       // fail(err) {
//       //     console.log(err);
//       // }
//       // })
//         wx.navigateTo({
//           url: '/pages/imgview/imgview',
//         })
//       }
//     });
//   },
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
    const reqUrl = baseUrl + '/app/getById?appId=' + appId;
    wx.request({
        url: reqUrl,
        method:'GET',
        success:function (res) {
            if (res.data.code === 'SUCCESS') {
                that.setData({
                    appInfo: res.data.data
                })
            } else {
                Toast.fail('功能列表获取失败');
            }
        },
        fail:function (error) {
          Toast.fail('服务网络异常');
        }
    })
},
getAppPrompt(appId) {
    const that = this;
    const reqUrl = baseUrl + '/app/getAppPrompt?appId=' + appId;
    wx.request({
        url: reqUrl,
        method:'GET',
        success:function (res) {
            if (res.data.code === 'SUCCESS') {
                that.setData({
                    appPrompt: res.data.data.promptList
                })
            } else {
                Toast.fail('功能列表获取失败');
            }
        },
        fail:function (error) {
          Toast.fail('服务网络异常');
        }
    })
}
})