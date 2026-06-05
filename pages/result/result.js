import { fileView, directView } from '../../utils/viewutil';
import Toast from '@vant/weapp/toast/toast';
const app = getApp();
import { requestApi } from "../../utils/service";

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
  data: {
    bgColor: '',
    fileName: '',
    respData: [],
    appId: 0,
    preBtnColor: '',
    preBtnText: '预览',
    noticeMsg: '预览样式可能会有差异，请以电脑查看为准。文件太大，预览可能会出现白屏，请耐心等一会。',
    tempFilePath: '',
    preViewLoading: false,
    shareLoading: false,
    saveLoading: false,
    disabled: false,
    dataReady: false
  },

  onLoad(options) {
      this.getConvertDetail(options.id);
      this.setData({
        bgColor: app.globalData.bgColor
      });
  },
  fileShare() {
      const fileName = this.data.fileName;
      if (this.data.tempFilePath === '') {
        this.setData({
            shareLoading: true,
            disabled: true
        });
        const that = this;
        wx.downloadFile({
            url: that.data.respData[0],
            success(res) {
                that.setData({
                    shareLoading: false,
                    disabled: false,
                    tempFilePath: res.tempFilePath
                });
                wx.shareFileMessage({
                    filePath: res.tempFilePath,
                    fileName: fileName,
                    success() {},
                    fail() {
                        Toast.fail('分享失败');
                    },
                });
            },
            fail() {
                that.setData({
                    shareLoading: false,
                    disabled: false
                });
                Toast.fail('文件下载失败');
            },
        });
      } else {
        wx.shareFileMessage({
            filePath: this.data.tempFilePath,
            fileName: fileName,
            success() {},
            fail() {
                Toast.fail('分享失败');
            },
        });
      }
  },
  saveFile() {
      const that = this;
      if (this.data.appId == 1) {
          wx.previewImage({
              current: this.data.respData[0],
              urls: this.data.respData
          });
          return;
      }
      if (this.data.tempFilePath !== '') {
          wx.openDocument({
              filePath: this.data.tempFilePath,
              showMenu: true,
              fail() {
                  Toast.fail('文件打开失败');
              }
          });
          return;
      }
      this.setData({ saveLoading: true, disabled: true });
      wx.downloadFile({
          url: that.data.respData[0],
          success(res) {
              if (res.statusCode !== 200) {
                  Toast.fail('文件下载失败');
                  that.setData({ saveLoading: false, disabled: false });
                  return;
              }
              that.setData({
                  tempFilePath: res.tempFilePath,
                  saveLoading: false,
                  disabled: false
              });
              wx.openDocument({
                  filePath: res.tempFilePath,
                  showMenu: true,
                  fail() {
                      Toast.fail('文件打开失败');
                  }
              });
          },
          fail() {
              Toast.fail('文件下载失败');
              that.setData({ saveLoading: false, disabled: false });
          }
      });
  },
  preView() {
    if (this.data.appId != 1) {
        if (this.data.tempFilePath.trim() === '') {
            this.setData({
                preViewLoading: true,
                disabled: true
            });
            this.preDownload();
        } else {
            directView(this.data.tempFilePath);
        }
    } else {
        wx.previewImage({
            current: this.data.respData[0],
            urls: this.data.respData
        });
    }
  },
  preDownload() {
    const that = this;
    wx.downloadFile({
        url: that.data.respData[0],
        success: function (res) {
            if (res.statusCode !== 200) {
                Toast.fail('文件下载失败');
                that.setData({
                    preViewLoading: false,
                    disabled: false
                });
                return;
            }
            that.setData({
                tempFilePath: res.tempFilePath,
                preViewLoading: false,
                disabled: false
            });
            directView(res.tempFilePath);
        },
        fail: function () {
            Toast.fail('文件加载失败');
            that.setData({
                preViewLoading: false,
                disabled: false
            });
        }
    });
  },
  getConvertDetail(id) {
    const that = this;
    requestApi({ url: "/doc/getConvertRecordDetail", data: {"id": id} })
    .then((res) => {
        if (res.data.code === 'SUCCESS') {
            const appId = res.data.data.convertType;
            that.setData({
                appId: appId,
                respData: JSON.parse(res.data.data.convertedFile),
                fileName: res.data.data.fileName,
                dataReady: true
            });
            if (appId == 1) {
                that.setData({
                    preBtnText: '预览图片',
                    noticeMsg: '预览时图片可左右滑动，长按目标图片可转发到微信或保存到相册。',
                    preBtnColor: app.globalData.bgColor,
                });
            }
        } else {
            Toast.fail('获取转换详情失败');
        }
    })
    .catch(() => {
        Toast.fail('网络异常，请稍后重试');
    });
  }
});
