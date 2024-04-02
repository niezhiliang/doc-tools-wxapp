Page({
    data:{
        imageList:["/imgs/a.png","/imgs/b.png","/imgs/c.png"],
        canvasHeight:0,
        startY:0,
        moveY:0
    },
    onLoad:function () {
        this.ctx = wx.createCanvasContext('myCanvas');
        this.loadImages();
      },
     
      loadImages:function() {
        let imagePromises = this.data.imageList.map((src) => {
          return new Promise((resolve,reject) => {
            wx.getImageInfo({
              src:src,
              success:(res) => {
                resolve({ path:src,width:res.width,height:res.height });
              },
              fail:() => {
                reject();
              }
            });
          });
        });
     
        Promise.all(imagePromises).then((images) => {
          this.drawImages(images);
          this.canvasHeight = this.data.canvasHeight;// 保存canvas的高度
        }).catch(() => {
          console.error('图片加载失败');
        });
      },
     
      drawImages:function(images) {
        let y = 0;
        let canvasHeight = 0;
        const canvasWidth = wx.getSystemInfoSync().windowWidth;
     
        images.forEach((image) => {
          const heightOnCanvas = canvasWidth * (image.height / image.width);
          this.ctx.drawImage(image.path,0,y,canvasWidth,heightOnCanvas);
          y += heightOnCanvas;
          canvasHeight += heightOnCanvas;
        });
     
        this.setData({
          canvasHeight:canvasHeight
        });
     
        this.ctx.draw();
      },
     
      handleTouchStart:function (e) {
          console.log("----------")
        this.startY = e.touches[0].clientY;// 记录起始触摸位置
        this.setData({ moveY:0 });// 每次开始触摸时重置moveY
        console.log(this.data.moveY + '--' + this.startY)
      },
     
      handleTouchMove:function (e) {
        let moveY = e.touches[0].clientY - this.startY + this.data.moveY;// 计算滑动距离
        console.log('moveY--' + moveY)
        if (moveY < 0) {
          moveY = 0;
        } else if (moveY > this.canvasHeight - wx.getSystemInfoSync().windowHeight) {
          moveY = this.canvasHeight - wx.getSystemInfoSync().windowHeight;
        }
     
        this.setData({ moveY:moveY });// 更新moveY
     
        this.startY = e.touches[0].clientY;// 更新起始触摸位置
      },
      // 保存图片到相册
 saveImageToPhotosAlbum:function() {
    wx.canvasToTempFilePath({
      canvasId:'myCanvas',
      success:function(res) {
        wx.saveImageToPhotosAlbum({
          filePath:res.tempFilePath,
          success:function() {
            wx.showToast({
              title:'保存成功',
              icon:'success',
              duration:2000
            });
          },
          fail:function() {
            wx.showToast({
              title:'保存失败',
              icon:'none',
              duration:2000
            });
          }
        });
      },
      fail:function() {
        wx.showToast({
          title:'保存失败',
          icon:'none',
          duration:2000
        });
      }
    });
  }
   });