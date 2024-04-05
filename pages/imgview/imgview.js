import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const baseUrl = app.globalData.baseUrl;
import { requestApi } from "../../utils/service";

Page({
  data: {
    appId: 1,
    bgColor: '',
    adSwitch: false,
    currentTouchIndex: -1,
    currentX: 0,
    currentY: 0,
    defaultX: 0,
    defaultY: 0,
    moveIng: false,
    picObjList: []
  },
  onLoad(options){
    let obj = JSON.parse(options.data)
    this.setData({
        appId: options.appId,
        picObjList: this.data.picObjList.concat(obj.data),
        bgColor: app.globalData.bgColor,
        adSwitch: app.globalData.adSwitch,
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
    const picObjList = this.data.picObjList;
    picObjList.splice(i,1);
    this.setData({
        picObjList: picObjList
    })
  },
  // 预览图片
  previewImg(e){
    const i = e.currentTarget.dataset.index
    console.log('7777777'+this.data.picObjList[i].url)
    console.log('7777777'+this.data.picObjList.map(item => item.url))
    wx.previewImage({
      current: this.data.picObjList[i].url, // 当前显示图片的 http 链接
      urls: this.data.picObjList.map(item => item.url) // 需要预览的图片 http 链接列表
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
    const appId = this.data.appId;
    requestApi({ url: "/doc/convert", method: 'POST',
     data: {
        "type": appId,
        "pathKeys": this.data.picObjList.map(item => item.urlKey)
    }})
    .then((res) => {
        if (res.statusCode ===200 && res.data.code === 'SUCCESS') {
            var response = JSON.stringify(res.data);
            Toast.clear();
            wx.reLaunch({
              url: '/pages/result/result?respData=' + response,
            })
        } else {
            Toast.fail('转换失败',5)
        }
    })
  }
})
