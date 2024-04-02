// pages/upload/upload.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: "PDF转图片",
    msg: "功能说明",
    tips:[
        "1. 水电费水电费是东方闪，电水电费水电费是哈哈哈哈哈。",
        "2. 水电费水电费是东方闪电水电费水电费是。",
        "3. 水电费水电费是东方闪电，水电费水电费是。",
    ],
    responseData:[],
    show: false,
    actions: [
      {
        name: '微信聊天文件',
      },
      {
        name: '本地文件',
      }
    ],
  },
  onLoad(option) {
    wx.setNavigationBarTitle({
      title: '文件上传',
    })
  },
  openShow(params) {
    console.log(params);
  this.setData({ show: true });
},
onClose() {
  this.setData({ show: false });
},
uploadChatMsgFile() {
  console.log("选择聊天文件")
  wx.chooseMessageFile({
    count: 9,
    type: 'all',
    success (res) {
      const tempFilePath = res.tempFiles[0].path
      // 文件后缀名
      const type = res.tempFiles[0].type
      console.log(tempFilePath, "tempFilePaths")
      wx.navigateTo({
        url: '/pages/view/view',
      })
      // wx.uploadFile({
      //   url: 'http://localhost:8080/doc/upload',
      //   filePath: tempFilePath,
      //   name: 'file',
      //   success:function (res) {
      //     wx.navigateTo({
      //       url: '/pages/view/view?data=' + res.data,
      //     })
      //     // 上传成功后的处理逻辑
      //   },
      //   fail(err) {
      //     console.log(err);
      //   }
      // })
    }
  })
},
onSelect(event) {
  this.uploadChatMsgFile();
}
})