import Toast from '@vant/weapp/toast/toast';
const app = getApp();
const baseUrl = app.globalData.baseUrl;
const docView = require('../../utils/viewutil');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bgColor: '',
    adSwitch: false,
    percentage: 5,
    appId: 1,
    fileInfo: {},
    fileName: '',
    fileType: '',
    fileTmpPath: '',
    fileSize: '',
    loadStatus: true,
    btnText: '文件上传中...'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
        title: '文件预览',
      })
    let obj = JSON.parse(options.data)
    let filePath = options.name;
    this.setData({
        bgColor: app.globalData.bgColor,
        adSwitch: app.globalData.adSwitch,
        percentage: 5,
        fileInfo: obj.data,
        appId: options.appId,
        fileName: filePath.substring(0,filePath.lastIndexOf('.')),
        fileType: filePath.substring(filePath.lastIndexOf('.') + 1),
        fileTmpPath: options.path,
        fileSize: options.size,
    });
    this.startTimer();
  },
  // 启动定时器
 startTimer:function() {
    // 每1000ms（1秒）更新一次进度条
    this.timer = setInterval(() => {
      const newPercentage = this.data.percentage + this.getRandomInt(5);
      if (newPercentage <= 100) {
        this.setData({
          percentage:newPercentage
        });
      } else {
        this.setData({
            percentage:100,
            loadStatus: false
          });
          
        Toast.success('上传成功')
        // 当进度条达到100%时清除定时器
        clearInterval(this.timer);
      }
    },200);
  },
  // 页面隐藏时清除定时器
  onHide:function () {
    clearInterval(this.timer);
  },
  getRandomInt(max) {
    let min = 1;
    min = Math.ceil(min);
    max = Math.floor(max);
    // 使用 Math.random() 生成 [0,1) 之间的随机数，然后乘以范围长度并取整，再加上最小值
    return Math.floor(Math.random() * (max - min + 1)) + min;
   },
  // 文件预览功能
  onPreView() {
      if (this.data.percentage == 100) {
        docView.directViwe(this.data.fileTmpPath);
      }
  },
  onConvert() {
    Toast.loading({
      message: '文件转换中...',
      forbidClick: true,
      // 持续展示 toast
      duration: 0,     
    });
    console.log(this.data.fileList)
    const requestUrl = baseUrl + '/doc/convert';
    const appId = this.data.appId;
    wx.request({
        url: requestUrl,
        method:'POST',
        header:{
          'content-type':'application/json'  // 设置请求头为json格式
        },
        data:{
          pathKeys: new Array(this.data.fileInfo.urlKey),
          type: appId
          // 添加更多需要发送的数据
        },
        success:function (res) {
            console.log(JSON.stringify(res) + "999")
            console.log(res.statusCode + "---" + res.data.code)
            if (res.statusCode ===200 && res.data.code === 'SUCCESS') {
                Toast.clear();
                var response = JSON.stringify(res.data.data);
                wx.reLaunch({
                  url: '/pages/result/result?appId=' + appId + '&respData=' + response,
                })
            } else {
                Toast.fail('转换失败',5)
            }
            console.log(res.data)  // 请求成功，处理返回的数据
        },
        fail:function (error) {
          console.log(error)  // 请求失败处理
          Toast.fail('服务网络异常',5)
        }
       })
  },
})