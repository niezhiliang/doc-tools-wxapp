const {requestApi} = require('../../utils/service');
const {describe} = require('../../utils/file-ui');
const app = getApp();

Page({
  data: {
    records: [], loading: true, error: '',
    labels: ['', '排队中', '转换中', '已完成', '转换失败']
  },

  onShow() { this.visible = true; this.load(); },
  onHide() { this.visible = false; clearTimeout(this.timer); },
  onUnload() { this.disposed = true; this.onHide(); },
  onPullDownRefresh() {
    this.load().finally(() => wx.stopPullDownRefresh());
  },

  async load() {
    if (this.fetching) return;
    this.fetching = true;
    clearTimeout(this.timer);
    this.setData({error: '', loading: !this.data.records.length});
    try {
      await app.login();
      if (!app.globalData.openId) throw new Error(app.globalData.loginError || '微信登录失败，请重试');
      const response = await requestApi({
        url: '/doc/getUserConvertRecord', data: {openId: app.globalData.openId}
      });
      if (!Array.isArray(response.data.data)) throw new Error('转换记录异常，请重试');
      const records = response.data.data.map(record => ({...record, ...describe(record.convertType)}));
      if (this.disposed) return;
      this.setData({records});
      if (this.visible && records.some(record => [1, 2].includes(Number(record.convertStatus)))) {
        this.timer = setTimeout(() => this.load(), 5000);
      }
    } catch (error) {
      if (!this.disposed) this.setData({error: error.message || '记录加载失败，请重试'});
    } finally {
      this.fetching = false;
      if (!this.disposed) this.setData({loading: false});
    }
  },

  open(event) {
    wx.navigateTo({url: '/pages/result/result?id=' + event.currentTarget.dataset.id});
  },
  home() { wx.switchTab({url: '/pages/index/index'}); }
});
