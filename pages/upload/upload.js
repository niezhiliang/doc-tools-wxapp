// pages/upload/upload.js
const baseUrl = getApp().globalData.baseUrl;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "PDF转图片",
    msg: "功能说明",
    docType: 0,
    fileType: "file",
    supportType:[".png,"],
    tips:[
        "1. 水电费水电费是东闪，电水电费水电哈哈哈。",
        "2. 水电费水电费是东方闪电水电费水电费是。",
        "3. 水电费水电费是东方闪电，水电费水电费是。",
    ],
    responseData:[],
    show: false,
    actions: [
        { name:'微信聊天文件',value:0 },
        { name:'本地文件',value: 1 }
    ],
  },
  onLoad(option) {
    wx.setNavigationBarTitle({
        title: '文件上传',
      })
    this.setData({
        // 设置转换的类型
        docType: option.type,
        title: option.title
    })
    if (option.type == 2) {
        this.setData({
            fileType: "image"
        })
    }
  },
  openShow(params) {
    console.log(params);
    // 图片转pdf直接打开相册
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
  wx.chooseMessageFile({
    count: 1,
    type: this.data.fileType,
    extension:['png','.xlsx'],
    success (res) {
      const tempFilePath = res.tempFiles[0].path
      console.log(tempFilePath, "tempFilePaths")      
      wx.navigateTo({
        url: '/pages/view/view',
      })
      const requestUrl = baseUrl + '/doc/upload';
      // wx.uploadFile({
      //   url: requestUrl,
      //   filePath: tempFilePath,
      //   name: 'file',
      //   success:function (res) {
      //       wx.navigateTo({
      //       url: '/pages/view/view?data=' + res.data + '&type=' + convType
      //       })
      //       // 上传成功后的处理逻辑
      // },
      // fail(err) {
      //     console.log(err);
      // }
      // })
    }
  })
},
chooseImage() {
    wx.chooseImage({
      success:(res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          imagePath:tempFilePath
        });
      // wx.uploadFile({
      //   url: 'http://localhost:8080/doc/upload',
      //   filePath: tempFilePath,
      //   name: 'file',
      //   success:function (res) {
      //       wx.navigateTo({
      //       url: '/pages/imgview/imgview?data=' + res.data + '&type=' + convType
      //       })
      //       // 上传成功后的处理逻辑
      // },
      // fail(err) {
      //     console.log(err);
      // }
      // })
        wx.navigateTo({
          url: '/pages/imgview/imgview',
        })
      }
    });
  },
onSelect(event) {
    const { value } = event.detail;
    // 微信聊天记录赛选文件
    if (value == 0) {
        this.uploadChatMsgFile();
    } else if(value == 1) {
        console.log('本地资源文件选择')
        this.chooseImage();
    }
}
})