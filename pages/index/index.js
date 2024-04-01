
Page({
    data: {
      },
      openShow(params) {
        wx.request({
            url: 'http://localhost:8080/doc/test',
            header:{
                'content-type':'application/json' 
              },
              method:'GET',
              success(res) {
                console.log(res.data) 
              },
              fail(error) {
                console.error('请求失败',error)
              }
          })
     },
    
})
