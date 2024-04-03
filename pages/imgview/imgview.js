import Toast from '@vant/weapp/toast/toast';
const baseUrl = getApp().globalData.baseUrl;

Page({
  data: {
    currentTouchIndex: -1,
    currentX: 0,
    currentY: 0,
    defaultX: 0,
    defaultY: 0,
    moveIng: false,
    picList: ['https://picsum.photos/200?a=1','https://picsum.photos/200?a=2','https://picsum.photos/200?a=3','https://picsum.photos/200?a=4','/imgs/add.png'],
    picObjList: [
      {url:'',urlKey: '',tempPath: ''}
    ]
  },
  // 显示底层可移动模块
  showMoveBlock(e){
    const { index } = e.currentTarget.dataset
    this.setData({
      currentTouchIndex: index
    })
  },
  deleteImg(e){

    const i = e.currentTarget.dataset.index
    console.log("删除图片" + i)
    const picList = this.data.picList;
    picList.splice(i,1);
    this.setData({
      picList: picList
    })
  },
  // 预览图片
  previewImg(e){
    console.log('图片预览')
    const indexs = e.currentTarget.dataset.index
    if (indexs === this.data.picList.length -1) {
      const requestUrl = baseUrl + '/doc/upload';
      wx.chooseImage({
        count: 1,
        success:(res) => {
          const tempFilePath = res.tempFiles[0].path
          wx.uploadFile({
            url: requestUrl,
            filePath: tempFilePath,
            name: 'file',
            success:function (res) {
               console.log(res.data);
          },
          fail(err) {
              console.log(err);
          }
          })
        }
      })
    }
    let urlList = []
    this.data.picList.forEach((item)=>{
      urlList.push(item.tempFilePath)
    })
    wx.previewImage({
      current: this.data.picList[0], // 当前显示图片的 http 链接
      urls: urlList // 需要预览的图片 http 链接列表
    })
  },
  onConvert() {
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
      // 持续展示 toast
      duration: 0,     
    });
    console.log(this.data.picList)
    wx.navigateTo({
      url: '/pages/result/result',
    })
    // wx.request({
    //     url:'http://127.0.0.1:8080/doc/convert',
    //     method:'POST',
    //     header:{
    //       'content-type':'application/json'  // 设置请求头为json格式
    //     },
    //     data:{
    //       pathKeys: this.data.fileList.map(item => item.urlKey),
    //       type: this.data.convType
    //       // 添加更多需要发送的数据
    //     },
    //     success:function (res) {
    //       console.log(res.data)  // 请求成功，处理返回的数据
    //       var response = JSON.stringify(res.data);
    //       wx.navigateTo({
    //         url: '/pages/result/result?url=' + response,
    //       })
    //     },
    //     fail:function (error) {
    //       console.log(error)  // 请求失败处理
    //     }
    // })
  }
})
