const {requestApi} = require('../../utils/service');
const {describe} = require('../../utils/file-ui');

Page({
  data: {record: null, outputs: [], error: '', exporting: false},

  onLoad(options) { this.id = options.id; },
  onShow() { this.visible = true; this.refresh(); },
  onHide() { this.visible = false; clearTimeout(this.timer); },
  onUnload() { this.disposed = true; this.onHide(); },

  async refresh() {
    if (this.fetching) return;
    clearTimeout(this.timer);
    this.fetching = true;
    this.setData({error: ''});
    try {
      const response = await requestApi({url: '/doc/getConvertRecordDetail', data: {id: this.id}});
      if (!response.data.data) throw new Error('未找到任务，请返回转换记录查看');
      const record = {...response.data.data, ...describe(response.data.data.convertType)};
      const urls = record.convertedFile ? JSON.parse(record.convertedFile) : [];
      if (!Array.isArray(urls) || urls.some(url => typeof url !== 'string')) throw new Error('结果数据异常，请重试查询');
      const outputs = urls.map((url, index) => {
        const image = Number(record.convertType) === 1;
        const extension = (url.split('?')[0].match(/\.[a-zA-Z0-9]+$/) || [''])[0];
        const name = image ? '第 ' + (index + 1) + ' 页图片' :
          (record.fileName || '转换结果').replace(/\.[^.]+$/, '') + extension;
        return {url, name, image, extension};
      });
      if (this.disposed) return;
      this.setData({record, outputs});
      if (this.visible && [1, 2].includes(Number(record.convertStatus))) {
        this.timer = setTimeout(() => this.refresh(), 5000);
      }
    } catch (error) {
      if (!this.disposed) this.setData({error: error instanceof SyntaxError ? '结果数据异常，请重试查询' :
        (error.message || '暂时无法获取结果，任务可能仍在处理，请重试查询')});
    } finally {
      this.fetching = false;
    }
  },

  async exportFile(event) {
    if (this.data.exporting) return;
    const item = this.data.outputs[event.currentTarget.dataset.index];
    const action = event.currentTarget.dataset.action;
    if (!item || !['save', 'send', 'preview'].includes(action)) return;
    this.setData({exporting: true, error: ''});
    try {
      if (item.image && action === 'preview') {
        await new Promise((resolve, reject) => wx.previewImage({
          current: item.url, urls: this.data.outputs.map(output => output.url), success: resolve, fail: reject
        }));
        return;
      }
      const localPath = await new Promise((resolve, reject) => wx.downloadFile({
        url: item.url, timeout: 60000,
        success: response => response.statusCode === 200 ? resolve(response.tempFilePath) :
          reject(new Error('文件暂时无法下载，可能已过期，请重新转换')),
        fail: () => reject(new Error('下载失败，请检查网络后重试'))
      }));
      if (this.disposed) return;
      if (item.image) {
        await new Promise((resolve, reject) => wx.saveImageToPhotosAlbum({
          filePath: localPath, success: resolve, fail: reject
        }));
        wx.showToast({title: '已保存到相册'});
      } else if (action === 'send') {
        await new Promise((resolve, reject) => wx.shareFileMessage({
          filePath: localPath, fileName: item.name, success: resolve, fail: reject
        }));
      } else {
        await new Promise((resolve, reject) => wx.openDocument({
          filePath: localPath, fileType: item.extension.slice(1).toLowerCase(),
          showMenu: true, success: resolve, fail: reject
        }));
      }
    } catch (error) {
      if (!this.disposed && !/cancel/.test(error.errMsg || '')) {
        this.setData({error: error.message || '未能打开或导出文件，请检查网络和相册权限后重试'});
      }
    } finally {
      if (!this.disposed) this.setData({exporting: false});
    }
  },

  again() {
    if (this.data.record) wx.redirectTo({url: '/pages/upload/upload?appId=' + this.data.record.convertType});
  },
  history() { wx.switchTab({url: '/pages/history/record'}); }
});
