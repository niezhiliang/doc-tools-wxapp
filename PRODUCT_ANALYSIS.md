# PDF转换器小程序 - 产品与技术分析报告

> 基于前后端代码深度分析 | 2026-06-05

---

## 一、综合评分概览

| 维度 | 评分 | 说明 |
|------|------|------|
| 功能完整性 | 6.5/10 | 基础转换功能齐全，但缺少保存、批量、实时状态等关键能力 |
| UI/UX 体验 | 5.0/10 | 页面布局简陋，缺乏加载态和状态反馈 |
| 代码质量 | 5.5/10 | 存在变量拼写错误、竞态问题、数组直接 mutate 等缺陷 |
| 产品定位清晰度 | 7.0/10 | 工具类定位明确，但名称过窄、缺少场景引导 |
| 市场竞争力 | 5.5/10 | 功能同质化严重，缺乏差异化亮点 |

---

## 二、产品架构与用户流程

### 页面结构（8个页面）

```
index 首页 → upload 上传 → view/imgview 预览 → history 记录 → result 结果
```

- 另有 home、drag 两个页面（用途不明确，疑似废弃或未启用功能）

### 后端技术栈

- Spring Boot + MyBatis-Plus + Redis
- 转换库：icepdf（PDF转图片）、aspose-words/cells/pdf/slides、itext7（图片转PDF）
- 异步转换：CompletableFuture + ThreadPoolExecutor（核心2线程，最大5线程，队列100）
- 10种转换类型：PDF↔Word/Excel/PPT/HTML/IMG

---

## 三、功能完整性评估（6项关键缺口）

### 缺口1：文件来源功能断裂

- 位置：`pages/upload/upload.js:101`
- 问题：ActionSheet 展示"微信聊天文件"和"本地文件"两个选项，但 `onSelect()` 中两者调用的是同一个 `uploadChatMsgFile()` 函数
- 影响：用户选择"本地文件"后行为与预期不符

### 缺口2：缺少保存到手机功能

- 位置：`pages/result/result.js`
- 问题：只有"预览"和"转发到微信"两个操作，用户无法将转换后的文件保存到手机本地存储
- 影响：文档转换工具的核心闭环缺失

### 缺口3：转换状态无实时反馈

- 位置：`pages/view/view.js:122`
- 问题：转换请求发出后直接 `wx.reLaunch` 跳转到记录页，用户需手动下拉刷新查看状态
- 影响：等待体验差，不知道转换是否完成

### 缺口4：不支持批量文件转换

- 位置：`pages/upload/upload.js:81`
- 问题：`wx.chooseMessageFile({ count: 1 })` 限制只能选1个文件
- 影响：多文件场景需反复操作

### 缺口5：记录页缺乏管理能力

- 位置：`pages/history/record.js`
- 问题：不支持删除、搜索、筛选操作。72小时过期提示是静态文字
- 影响：记录过多时无法定位目标文件

### 缺口6：result 页面 appId 逻辑缺陷

- 位置：`pages/result/result.js:45`
- 问题：`data.appId` 初始值硬编码为2，`onLoad` 中 `if (this.data.appId == 1)` 在异步回调前执行，条件永远为 false
- 影响：图片类转换结果的预览按钮文案和逻辑永远不正确

---

## 四、README 已知问题定位与修复

### BUG-1：图片转PDF预览页变量 undefined（README #6）

根因：`imgview.wxml` 中有3处变量引用错误

```diff
- wx:key="p"
+ wx:key="urlKey"
  // "p" 是无效字符串，所有 item key 相同，导致渲染异常

- wx:if="{{0 !== picList.length}}"
+ wx:if="{{picObjList.length > 0}}"
  // picList 变量不存在，应为 picObjList

- src="/imgs/delete.png"
+ src="/imgs/delete.png" bind:tap="deleteImg"
  // bindtap 是旧语法，统一为 bind:tap
```

另外 `previewImg` 方法需增加空值保护：

```javascript
// imgview.js - previewImg 方法
if (!this.data.picObjList[i] || !this.data.picObjList[i].url) {
  Toast.fail('图片上传中，请稍后');
  return;
}
```

### BUG-2：图片转PDF文件来源不一致（README #2）

`onUpload` 方法（添加更多图片）也使用 `wx.chooseMessageFile`，但在某些场景下会弹出相册选择。

```diff
- wx.chooseMessageFile({ count: picCount, type: 'image', success(res) {...} })
+ wx.chooseMessageFile({
+   count: picCount,
+   type: 'image',
+   sourceType: ['message'],  // 仅从微信聊天选取
+   success(res) {...}
+ })
```

### BUG-3：view.js 拼写错误 directViwe

位置：`pages/view/view.js:64`

```diff
- docView.directViwe(this.data.fileTmpPath);
+ docView.directView(this.data.fileTmpPath);
```

### BUG-4：result.js appId 竞态问题

`data.appId` 初始值为2，但 `onLoad` 中在 `getConvertDetail` 回调之前就判断 `if (this.data.appId == 1)`。

修复方案 - 将 appId 相关逻辑移入异步回调：

```javascript
onLoad(options) {
    this.getConvertDetail(options.id);
    this.setData({ bgColor: app.globalData.bgColor });
},

getConvertDetail(id) {
    const that = this;
    requestApi({ url: "/doc/getConvertRecordDetail", data: {"id": id} })
    .then((res) => {
        if (res.data.code === 'SUCCESS') {
            const appId = res.data.data.convertType;
            that.setData({
                appId: appId,
                respData: JSON.parse(res.data.data.convertedFile),
                fileName: res.data.data.fileName
            });
            if (appId == 1) {
                that.setData({
                    preBtnText: '预览分享保存',
                    noticeMsg: '预览时图片可左右滑动...',
                    preBtnColor: app.globalData.bgColor,
                });
            }
        }
    })
}
```

---

## 五、图片拖拽排序实现方案（README #5）

### 方案选型

| 方案 | 优势 | 劣势 | 推荐 |
|------|------|------|------|
| A. wx-drag-img 组件（已安装） | 已安装依赖；touch 事件实现完整 | 需改造数据绑定 | **推荐** |
| B. 自研 touch 事件 | 完全可控 | 开发量大 | 备选 |
| C. pages/drag 使用的组件 | 有 demo 可参考 | 过重，适用于通用列表排序 | 不推荐 |

### 推荐方案：改造 imgview 使用 wx-drag-img

**步骤1：注册组件 - imgview.json**

```json
{
  "usingComponents": {
    "wx-drag-img": "wx-drag-img"
  }
}
```

**步骤2：改造 imgview.wxml 模板**

```xml
<!-- 替换原有 movable-area 区域 -->
<view class="drag-section">
  <view class="section-hint">长按图片可拖动排序</view>
  <wx-drag-img
    preview-size="{{dragSize}}"
    columns="{{3}}"
    gap="{{9}}"
    max-count="{{9}}"
    default-img-list="{{localPaths}}"
    bind:update-image-list="onDragUpdate">
    <view slot="upload" class="upload-slot">+</view>
  </wx-drag-img>
</view>
```

**步骤3：改造 imgview.js 数据流**

关键：维护 localPath -> serverData 的映射关系

```javascript
// 新增 data 字段
data: {
  localPaths: [],        // 本地图片路径列表（给组件回显用）
  pathToServerMap: {},   // localPath -> {url, urlKey} 映射
  dragSize: 100,         // 预览图尺寸 px
}

// onLoad 中：先记录本地路径，上传成功后建立映射
onLoad(options) {
  const pathArray = JSON.parse(options.path);
  this.setData({ localPaths: pathArray });
  pathArray.forEach(p => this.fileUpload(p));
}

// fileUpload 成功回调中：建立映射
success(res) {
  const serverData = JSON.parse(res.data).data;
  const map = { ...that.data.pathToServerMap };
  map[tmpPath] = { url: serverData.url, urlKey: serverData.urlKey };
  that.setData({ pathToServerMap: map });
}

// 拖拽排序回调：同步更新 picObjList
onDragUpdate(e) {
  const sortedPaths = e.detail.list;
  const map = this.data.pathToServerMap;
  const picObjList = sortedPaths
    .filter(p => map[p])
    .map(p => map[p]);
  this.setData({ picObjList });
}
```

**步骤4：onConvert 时使用排序后的 picObjList**

转换时 `pathKeys` 自然取自排序后的 `picObjList.map(item => item.urlKey)`，无需额外改动。

---

## 六、文件上传进度条实现（README #7）

### view 页面（单文件）

现状：进度条卡在 96% 不动，上传完成后直接跳 100%。

```javascript
// data 修改
data: {
  percentage: 0,          // 原初始值 1 -> 0
  uploadDone: false,      // 上传是否完成
  uploadError: false,     // 上传是否失败
}

// fileUpload 改造
fileUpload() {
  const that = this;
  this.setData({ percentage: 0, uploadDone: false, loadStatus: true });

  const uploadTask = wx.uploadFile({
    url: baseUrl + '/doc/upload?fileName=' + encodeURIComponent(this.data.fileName),
    filePath: this.data.fileTmpPath,
    name: 'file',
    success(res) {
      const result = JSON.parse(res.data);
      if (result.code === 'SUCCESS') {
        that.setData({
          fileInfo: result.data,
          percentage: 100,
          uploadDone: true,
          loadStatus: false
        });
        Toast.success('上传成功');
      } else {
        that.setData({ uploadError: true, loadStatus: false });
        Toast.fail('文件上传失败');
      }
    },
    fail(err) {
      that.setData({ uploadError: true, loadStatus: false });
      Toast.fail('文件上传失败');
    }
  });

  uploadTask.onProgressUpdate((res) => {
    that.setData({ percentage: res.progress });
    // 不再限制 96%，让进度条自然走到 100
  });
}
```

view.wxml 增加状态展示：

```xml
<van-progress
  color="{{uploadError ? '#ee0a24' : bgColor}}"
  percentage="{{percentage}}"
  stroke-width="6" />
<view class="upload-status">
  <text wx:if="{{!uploadDone && !uploadError}}">上传中 {{percentage}}%</text>
  <text wx:if="{{uploadDone}}" style="color:#07c160">上传完成</text>
  <text wx:if="{{uploadError}}" style="color:#ee0a24">上传失败，请重试</text>
</view>

<!-- 转换按钮增加上传完成校验 -->
<van-button disabled="{{!uploadDone}}" ...>立即转换</van-button>
```

### imgview 页面（多图）

多图场景不适合单文件进度条，改为展示上传计数进度：

```javascript
data: {
  uploadTotal: 0,      // 需要上传的总数
  uploadDone: 0,       // 已上传完成数
  allUploaded: false,  // 是否全部上传完成
}

onLoad(options) {
  const pathArray = JSON.parse(options.path);
  this.setData({ uploadTotal: pathArray.length });
  pathArray.forEach(p => this.fileUpload(p));
}

// fileUpload 成功回调中计数
success(res) {
  const done = that.data.uploadDone + 1;
  that.setData({
    uploadDone: done,
    picObjList: that.data.picObjList.concat(result.data),
    allUploaded: done >= that.data.uploadTotal
  });
}

// 失败时也计数，避免永久等待
fail(err) {
  that.setData({ uploadDone: that.data.uploadDone + 1 });
  Toast.fail('部分图片上传失败');
}
```

imgview.wxml 顶部进度提示：

```xml
<view wx:if="{{!allUploaded}}" class="upload-progress-bar">
  <van-progress
    percentage="{{uploadTotal > 0 ? (uploadDone / uploadTotal * 100) : 0}}"
    color="{{bgColor}}" />
  <text class="progress-text">正在上传图片 {{uploadDone}}/{{uploadTotal}}</text>
</view>
```

---

## 七、代码架构优化点

### 前端性能瓶颈

| 优先级 | 问题 | 位置 | 方案 |
|--------|------|------|------|
| P1 | imgview 多图并发上传无控制 | `imgview.js:36` | 实现上传队列，最多3个并发 |
| P1 | picObjList 直接 mutate 原数组 | `imgview.js:43` | 使用 `filter` 生成新数组 |
| P2 | service.js 全局 ajaxTimes 计数器 | `service.js:6` | 使用请求ID集合跟踪 |
| P2 | record.js 轮询等待 openId | `record.js:33` | 统一使用 `app.loginPromise.then()` |

### 前端代码规范

- `viewutil.js` 混用 `import` 和 `require`，应统一为 ES Module
- 多处 `console.log` 残留，生产环境应移除或使用日志工具
- 注释掉的代码块应清理（如 view.wxml 中被注释的 radio-group）
- Tabbar 使用 `van-tabbar` + `switchTab` 导致页面栈问题，应改为原生 tabBar

---

## 八、新增功能建议

### P0 - 必做

| 功能 | 前端改动 | 后端配合 |
|------|----------|----------|
| 保存到手机 | result.wxml 增加按钮，调用 `wx.openDocument({ showMenu: true })` | 无需改动 |
| 转换状态轮询 | view.js/imgview.js 转换后轮询接口，2秒间隔 | `getConvertRecordDetail` 缓存从60秒缩短到5秒 |
| 批量文件转换 | upload.js 修改 count 限制，view 页面增加文件队列 | ConvertDTO.pathKeys 已支持 List |

### P1 - 重要

| 功能 | 前端改动 | 后端配合 |
|------|----------|----------|
| 记录删除 | history/record.wxml 增加左滑删除 | 新增 `DELETE /doc/deleteRecord/{id}` 接口 |
| 使用次数限制与会员体系 | 增加 pay-wall 组件 | 新增用户系统和次数统计 |
| 记录搜索和筛选 | 记录页增加搜索框和状态 Tab | 增加分页参数 `page + pageSize` |

### P2 - 后续

| 功能 | 前端改动 | 后端配合 |
|------|----------|----------|
| PDF 合并/拆分 | 新增工具入口 + 专门页面 | 新增 PdfMergeService 实现 ConvertService 接口 |
| 文件压缩 | 前端展示压缩前后大小 | 上传时自动压缩大图 |

---

## 九、后端 API 改进建议

| 接口 | 改进内容 |
|------|----------|
| `POST /doc/convert` | 响应中返回 `{ recordId: Long }`，前端用于轮询。当前只返回空 success |
| `GET /doc/getConvertRecordDetail` | 移除60秒缓存（轮询场景下延迟状态）。增加 `convertTypeName` 字段 |
| `GET /doc/getUserConvertRecord` | 增加分页参数 `page + pageSize`。当前返回近3天全部记录 |
| 新增 `DELETE /doc/deleteRecord` | 支持用户主动删除记录。入参：recordId + openId |
| `UploadVO` | 增加 `fileSize`（Long，字节数）字段 |

---

## 十、UI/UX 改进建议

| 页面 | 问题 | 改进 |
|------|------|------|
| index | 主题色 `#BE99FF` 硬编码在 wxss 中 | 提取为 CSS 变量，支持动态配置 |
| index | 无骨架屏加载态 | 使用 van-skeleton 组件 |
| index | 缺少搜索入口 | 顶部添加搜索框 |
| index | Tabbar 实现不当 | 改用原生 tabBar 配置 |
| upload | 页面布局简陋 | 添加支持格式标签、文件大小限制提示 |
| upload | 文件来源误导 | 移除无效的 ActionSheet |
| view | 进度条无百分比数字 | 进度条下方显示文案 |
| view | 上传未完成就能点转换 | 按钮 disabled 绑定 uploadDone |
| imgview | 无拖拽提示 | 顶部增加"长按图片可拖动排序" |
| result | 缺少保存按钮 | 增加"保存到手机"主操作 |
| result | 成功反馈平淡 | 增加文件大小、转换耗时统计 |
| record | 记录卡片信息密度低 | 自定义布局，颜色区分状态 |
| record | 空状态无引导 | 增加"去转换"引导按钮 |

---

## 十一、产品定位优化

### 当前问题

- 名称"PDF转换器"过窄，实际支持多格式转换
- 缺乏使用场景引导（办公文档、学习资料、证件扫描件等）
- 无用户分层策略，免费和付费体验完全一致

### 差异化竞争力建议

1. **极速转换体验**：减少操作步骤，转换完成即时推送通知
2. **文件工具箱定位**：增加 PDF 合并/拆分/压缩/加密/水印等轻量工具
3. **场景化入口**：按使用场景组织工具，降低选择成本
4. **文件管理闭环**：转换历史 + 云端存储 + 文件管理，提高用户粘性
