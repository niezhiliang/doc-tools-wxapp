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
    picList: [],
    picObjList: [
      {url:'',urlKey: '',tempPath: ''}
    ]
  },
  onLoad(options){
    let obj = JSON.parse(options.data)
    console.log('viewimages' + obj.data);
    this.setData({
        picObjList: this.data.picObjList.concat(obj.data),
        picList: this.data.picList.concat(obj.data.url),
      });
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
    const i = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.picList[i], // 当前显示图片的 http 链接
      urls: this.data.picList // 需要预览的图片 http 链接列表
    })
  },
  onUpload() {
    const requestUrl = baseUrl + '/doc/upload';
    wx.chooseImage({
        count: 1,
        success:(res) => {
        const tempFilePath = res.tempFiles[0].path
        const that = this;
        wx.uploadFile({
            url: requestUrl,
            filePath: tempFilePath,
            name: 'file',
            success:function (res) {
                let obj = JSON.parse(res.data)
                that.setData({
                    picObjList: that.data.picObjList.concat(obj.data),
                    picList: that.data.picList.concat(obj.data.url),
                  });
            },
            fail(err) {
                console.log(err);
                Toast.fail('服务网络异常')
            }
        })
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
    console.log(this.data.picList)
    wx.navigateTo({
      url: '/pages/result/result',
    })
    const reqUrl = baseUrl + '/doc/convert'
    wx.request({
        url: reqUrl,
        method:'POST',
        header:{
          'content-type':'application/json'
        },
        data:{
          pathKeys: this.data.fileList.map(item => item.urlKey),
          type: this.data.convType
        },
        success:function (res) {
          console.log(res.data)  // 请求成功，处理返回的数据
          var response = JSON.stringify(res.data);
          Toast.clear();
          wx.navigateTo({
            url: '/pages/result/result?url=' + response,
          })
        },
        fail:function (error) {
          console.log(error)  // 请求失败处理
          Toast.fail('图片转换失败');
        }
    })
  }
})
