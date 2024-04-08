const app = getApp();
const baseUrl = app.globalData.baseUrl;

// 同时发送异步代码的次数
let ajaxTimes = 0;
export const requestApi = (parmas) => {
    // 当有地方调用请求方法的时候，就增加全局变量，用于判断有几个请求了
    ajaxTimes++;
    // 显示加载中loading效果
   if (parmas.url !== '/doc/convert') {
    wx.showLoading({
        title: "加载中",
        mask: true  //开启蒙版遮罩
    });
   }
    /**
     *   根据不同的url接口,来设置不同的header请求头
     **  判断 url中是否带有 /my/ 请求的是私有的路径 带上header token
     **  { ...parmas.header }  ==> 先解构出传进来的header对象,然后再往这个对象里面添加Authorization字段数据，这样即使有传入header的其他字段也能保留下来
     *?  如果传入的parmas参数中没有header，那myHeader就是个空的对象 {} 因为啥都没有
     */
    let myHeader = { ...parmas.header };
    if (parmas.url.includes("/neddToken/")) {
        // 往myHeader这个对象里插入键值对 带上Storage中存储的token
        myHeader["Authorization"] = wx.getStorageSync("token");
    }
    return new Promise((resolve, reject) => {
        /**
             *  ...parmas ===>就是将传进来的参数扩展开，一行行展示在这里面
             * 比如：传进来
             * {
             *  url:'xx',
             *  data:{key1:val1,key2:val2}
             * }
             * 那么通过  ...parmas  就会把这些内容展示到这里了
        */
        wx.request({
            ...parmas,
            // 注意，此行必须放在   ...parmas  之下，才能覆盖其传入的url:xxx参数
            url: baseUrl + parmas.url,
            timeout: 30000,
            /**
             * !可以设置上默认的content-type，然后再扩展出传入的myHeader，如果传入的myHeader为空，那header就还是默认的content-type一个键值对
             * !{ 'content-type': 'application/json', ...myHeader } ==》 扩展出myHeader这个对象中的键值对;
             */
            header: { 'content-type': 'application/json', ...myHeader },
            success: (result) => {
                // 请求成功，就将成功的数据返回出去
                resolve(result)
            },
            fail: (err) => {
                reject(err)
            },
            // 不管请求成功还是失败，都会触发
            complete: () => {
                /**
                 * !loading效果同时被多个请求触发是可以显示一个的，但是关闭loading一旦被第一个请求完成后关闭，后面的请求触发的loading效果就没了
                 * !所以，需要通过全局设置一个变量，来监听同时触发了几个请求，当最后一个请求完成后，再关闭loading
                 * ?每次结束请求后，就减少全局变量，当为0时，就表示这是最后一个请求了
                 */
                ajaxTimes--;
                // 此时就可以关闭loading效果了
                if (ajaxTimes === 0) {
                    //  关闭正在等待loading效果
                    wx.hideLoading();
                }
 
            }
        });
 
    })
}
 