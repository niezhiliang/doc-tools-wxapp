import Toast from '@vant/weapp/toast/toast';

/**
 * 文件下载并预览
 */
export function fileView(url) {
    wx.downloadFile({
        url: url,
        success: function (res) {
            if (res.statusCode !== 200) {
                Toast.fail('文件下载失败: ' + res.statusCode);
                return;
            }
            const filePath = res.tempFilePath;
            wx.openDocument({
                filePath: filePath,
                showMenu: false,
                fail: function () {
                    Toast.fail('文件打开失败');
                }
            });
        },
        fail: function () {
            Toast.fail('文件加载失败');
        }
    });
}

export function directView(path) {
    wx.openDocument({
        filePath: path,
        showMenu: false,
        fail: function () {
            Toast.fail('文件打开失败');
        }
    });
}
