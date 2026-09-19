const {requestApi} = require('../../utils/service');
const {describe} = require('../../utils/file-ui');

Page({
  data: {tools: [], loading: true, error: ''},

  onLoad() { this.load(); },
  onUnload() { this.disposed = true; },
  onPullDownRefresh() {
    this.load().finally(() => wx.stopPullDownRefresh());
  },

  async load() {
    if (this.fetching) return;
    this.fetching = true;
    this.setData({loading: true, error: ''});
    try {
      const response = await requestApi({url: '/app/getAppList'});
      const groups = response.data.data;
      if (!Array.isArray(groups)) throw new Error('工具列表异常，请重试');
      const tools = groups.reduce((list, group) => list.concat(group.appList || []), [])
        .map(tool => ({...tool, ...describe(tool.id)}));
      if (!tools.length) throw new Error('暂时没有可用工具，请稍后重试');
      if (!this.disposed) this.setData({tools});
    } catch (error) {
      if (!this.disposed) this.setData({error: error.message || '工具加载失败，请重试'});
    } finally {
      this.fetching = false;
      if (!this.disposed) this.setData({loading: false});
    }
  },

  open(event) {
    wx.navigateTo({url: '/pages/upload/upload?appId=' + event.currentTarget.dataset.id});
  },
  history() { wx.switchTab({url: '/pages/history/record'}); },
  onShareAppMessage() {
    return {title: 'PDF转换器 · 文件轻松转换', path: '/pages/index/index'};
  }
});
