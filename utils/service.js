// Pages own their loading and error UI. Keep background polling silent.
function requestApi({url, method = 'GET', data, header}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: getApp().globalData.baseUrl + url,
      method,
      data,
      header: {'content-type': 'application/json', ...header},
      timeout: 60000,
      success(response) {
        const body = response.data;
        if (response.statusCode !== 200 || !body || body.code !== 'SUCCESS') {
          reject(new Error(body && (body.message || body.msg) || '服务暂时不可用，请稍后重试'));
          return;
        }
        resolve(response);
      },
      fail() {
        reject(new Error('网络连接失败，请检查网络后重试'));
      }
    });
  });
}
module.exports = {requestApi};
