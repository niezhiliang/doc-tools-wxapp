const {requestApi} = require('../../utils/service');
const {describe} = require('../../utils/file-ui');
const app = getApp();

Page({
  data: {
    info: null, files: [], loading: true, busy: false, error: '', status: '',
    imageMode: false, submittedId: null, sourceSheet: false
  },

  onLoad(options) {
    this.appId = Number(options.appId);
    this.load();
  },
  onUnload() {
    this.disposed = true;
    if (this.uploadTask) this.uploadTask.abort();
  },

  async load() {
    this.setData({loading: true, error: ''});
    try {
      if (!Number.isInteger(this.appId) || this.appId <= 0) throw new Error('转换工具无效，请返回首页重新选择');
      const response = await requestApi({url: '/app/getById', data: {appId: this.appId}});
      const info = response.data.data;
      if (!info) throw new Error('该工具暂不可用，请返回首页重新选择');
      if (this.disposed) return;
      this.setData({info: {...info, ...describe(this.appId)}, imageMode: Number(info.fileType) === 3});
      wx.setNavigationBarTitle({title: info.appName});
    } catch (error) {
      if (!this.disposed) this.setData({error: error.message || '工具加载失败，请重试'});
    } finally {
      if (!this.disposed) this.setData({loading: false});
    }
  },

  choose() {
    if (this.data.busy || !this.data.info) return;
    if (this.data.imageMode) this.setData({sourceSheet: true});
    else this.pickFiles('chat');
  },
  closeSource() { this.setData({sourceSheet: false}); },
  stopTap() {},
  selectSource(event) { this.pickFiles(event.currentTarget.dataset.source); },

  pickFiles(source) {
    if (this.data.busy || !this.data.info || !['chat', 'album', 'camera'].includes(source)) return;
    const {imageMode, info, files} = this.data;
    const count = imageMode ? info.maxImages - files.length : 1;
    if (count <= 0) return;
    this.closeSource();
    const fail = error => {
      if (!this.disposed && !/cancel/.test(error.errMsg || '')) {
        this.setData({error: '未能选择文件，请检查权限后重试'});
      }
    };
    if (source === 'chat') {
      wx.chooseMessageFile({
        count, type: imageMode ? 'image' : 'file',
        ...(imageMode ? {} : {extension: info.supportType.split(',')}),
        success: result => this.acceptFiles(result.tempFiles), fail
      });
    } else if (imageMode) {
      wx.chooseMedia({
        count, mediaType: ['image'], sourceType: [source],
        success: result => this.acceptFiles(result.tempFiles.map((file, index) => ({
          path: file.tempFilePath, size: file.size,
          name: '图片' + (files.length + index + 1) + '.' + (file.tempFilePath.split('.').pop() || 'jpg')
        }))),
        fail
      });
    }
  },

  acceptFiles(selectedFiles) {
    if (this.disposed || this.data.busy) return;
    const {info, imageMode} = this.data;
    if (!selectedFiles.length) return;
    if (selectedFiles.some(file => !file.path || !Number.isFinite(file.size) || file.size <= 0)) {
      this.setData({error: '无法读取文件，或文件内容为空，请重新选择'});
      return;
    }
    if (selectedFiles.some(file => file.size > info.maxSize * 1024 * 1024)) {
      this.setData({error: '每个文件不能超过 ' + info.maxSize + 'MB，请重新选择'});
      return;
    }
    const files = selectedFiles.map(file => ({
      path: file.path, name: file.name || '图片', bytes: file.size, key: '',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));
    const selected = imageMode ? this.data.files.concat(files) : files.slice(0, 1);
    if (imageMode && (selected.length > info.maxImages ||
        selected.reduce((sum, file) => sum + file.bytes, 0) > info.maxImageTotalMb * 1024 * 1024)) {
      this.setData({error: '最多 ' + info.maxImages + ' 张图片，图片合计不能超过 ' + info.maxImageTotalMb + 'MB，请减少图片'});
      return;
    }
    this.setData({files: selected, error: '', submittedId: null});
  },

  remove(event) {
    if (this.data.busy) return;
    const index = Number(event.currentTarget.dataset.index);
    this.setData({files: this.data.files.filter((_, i) => i !== index), error: '', submittedId: null});
  },
  move(event) {
    if (this.data.busy) return;
    const index = Number(event.currentTarget.dataset.index);
    const target = index + Number(event.currentTarget.dataset.step);
    const files = this.data.files.slice();
    if (!files[index] || !files[target]) return;
    [files[index], files[target]] = [files[target], files[index]];
    this.setData({files, submittedId: null});
  },
  preview(event) {
    const file = this.data.files[event.currentTarget.dataset.index];
    if (this.data.imageMode && file) wx.previewImage({current: file.path, urls: this.data.files.map(item => item.path)});
  },

  upload(file, index) {
    return new Promise((resolve, reject) => {
      this.uploadTask = wx.uploadFile({
        url: app.globalData.baseUrl + '/doc/upload?fileName=' + encodeURIComponent(file.name.replace(/\.[^.]+$/, '')),
        filePath: file.path, name: 'file', timeout: 60000,
        success(response) {
          try {
            const body = JSON.parse(response.data);
            if (response.statusCode !== 200 || body.code !== 'SUCCESS' || !body.data || !body.data.urlKey) {
              throw new Error(body.message || body.msg || '文件上传失败，请重试');
            }
            resolve(body.data.urlKey);
          } catch (error) {
            reject(new Error(error instanceof SyntaxError ? '上传响应异常，请重试' : error.message));
          }
        },
        fail: () => reject(new Error('第 ' + (index + 1) + ' 个文件上传失败，请检查网络后重试'))
      });
      this.uploadTask.onProgressUpdate(progress => {
        if (!this.disposed) this.setData({status: '上传 ' + (index + 1) + '/' + this.data.files.length + ' · ' + progress.progress + '%'});
      });
    }).finally(() => { this.uploadTask = null; });
  },

  async convert() {
    if (this.data.busy || !this.data.files.length) return;
    if (this.data.submittedId) {
      wx.navigateTo({url: '/pages/result/result?id=' + this.data.submittedId});
      return;
    }
    this.setData({busy: true, error: '', status: '正在准备任务…'});
    try {
      await app.login();
      if (this.disposed) return;
      if (!app.globalData.openId) throw new Error(app.globalData.loginError || '微信登录失败，请重试');
      const files = this.data.files.slice();
      // Upload sequentially; retain completed keys so retries do not upload them again.
      for (let index = 0; index < files.length; index++) {
        if (!files[index].key) files[index].key = await this.upload(files[index], index);
        if (this.disposed) return;
        this.setData({files: files.slice()});
      }
      this.setData({status: '正在加入队列…'});
      const response = await requestApi({
        url: '/doc/convert', method: 'POST',
        data: {type: this.appId, pathKeys: files.map(file => file.key), openId: app.globalData.openId}
      });
      const result = response.data.data;
      if (!result || !result.recordId) throw new Error('未收到任务编号，请到转换记录查看，避免重复提交');
      // A submitted task remains in history even if the user has already left this page.
      if (this.disposed) return;
      this.setData({submittedId: result.recordId});
      if (result.existing) wx.showToast({title: '已有任务，已为你打开', icon: 'none'});
      wx.navigateTo({url: '/pages/result/result?id=' + result.recordId});
    } catch (error) {
      if (!this.disposed) this.setData({error: error.message || '操作失败，请重试'});
    } finally {
      if (!this.disposed) this.setData({busy: false, status: ''});
    }
  }
});
