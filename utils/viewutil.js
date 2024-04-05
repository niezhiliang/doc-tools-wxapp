 /**
* 文件并预览
*/
function fileViwe(url) {
    console.log('方法被调用了 + ' + url)
    wx.downloadFile({
        url: url,
        success: function (res) {
            if(res.statusCode != 200) {
                Toast.fail(res.statusCode)
            }
            var Path = res.tempFilePath 
            wx.openDocument({
                filePath: Path,
                showMenu: true,
                success: function (res) {
                    console.log(url + '打开了')
                }
            })
        },
        fail: function (err) {
            console.log(err, "wx.downloadFile fail err");
            Toast.success('文件加载失败')
        }
    })
}

function directViwe(path) {
    wx.openDocument({
        filePath: path,
        showMenu: true,
        success: function (res) {
            console.log(path + '打开了')
        }
    })
}

module.exports = {
    fileViwe:fileViwe,
    directViwe:directViwe
};