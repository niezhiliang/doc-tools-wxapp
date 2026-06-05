const app = getApp();
const baseUrl = app.globalData.baseUrl;

const activeRequests = new Set();

export const requestApi = (parmas) => {
    const reqId = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    activeRequests.add(reqId);
    const showLoading = parmas.url !== '/doc/convert';
    if (showLoading) {
        wx.showLoading({ title: '加载中', mask: true });
    }
    let myHeader = { ...parmas.header };
    if (parmas.url.includes('/neddToken/')) {
        myHeader['Authorization'] = wx.getStorageSync('token');
    }
    return new Promise((resolve, reject) => {
        wx.request({
            ...parmas,
            url: baseUrl + parmas.url,
            timeout: 60000,
            header: { 'content-type': 'application/json', ...myHeader },
            success: (result) => {
                resolve(result);
            },
            fail: (err) => {
                wx.showToast({ title: '网络异常', icon: 'none' });
                reject(err);
            },
            complete: () => {
                activeRequests.delete(reqId);
                if (activeRequests.size === 0 && showLoading) {
                    wx.hideLoading();
                }
            }
        });
    });
}
 