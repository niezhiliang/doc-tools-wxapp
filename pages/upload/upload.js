// pages/upload/upload.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    msg: "多张图片合成一个PDF文件",
    tips:[
        "1. 水电费水电费是东方闪电水电费水电费是哈哈哈哈哈",
        "2. 水电费水电费是东方闪电水电费水电费是",
        "3. 水电费水电费是东方闪电水电费水电费是",
    ],
    responseData:[],
    show: false,
    actions: [
      {
        name: '微信聊天文件',
      },
      {
        name: '本地文件',
      },
      {
        name: '取消',
      },
    ],
  },
  openShow(params) {
    console.log(params);
  this.setData({ show: true });
},
onClose() {
  this.setData({ show: false });
},
uploadChatMsgFile() {
  wx.chooseMessageFile({
      count: 1,
      type: 'pdf',
      success(res) {
          const file = res.tempFiles;
          console.log(file)
          // 取到文件后调用文件上传接口到后端
          wx.uploadFile({
            url: 'http://localhost:8080/doc/upload',
            filePath: file[0].path,
            name: 'file',
            success:function (res) {
              wx.navigateTo({
                url: '/pages/view/view?data=' + res.data,
              })
              // 上传成功后的处理逻辑
            },
            fail(err) {
              console.log(err);
            }
          })
      }
    })
},
onSelect(event) {
  this.uploadChatMsgFile();
  console.log(event.detail);
}
})