const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function page(file, api, wx = {}) {
 let definition;
 const app = { login: () => Promise.resolve('test-user'), loginPromise: Promise.resolve(), globalData: { openId: 'test-user', baseUrl: '' } };
 const localRequire = require('node:module').createRequire(path.join(root, file));
 const context = { require: name => name === '../../utils/service' ? {requestApi: api} : localRequire(name), Page: p => definition = p, getApp: () => app, requestApi: api, wx, setTimeout, clearTimeout };
 vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8').replace(/^import .*;$/gm, ''), context);
 definition.data = JSON.parse(JSON.stringify(definition.data));
 definition.setData = function(data) { Object.assign(this.data, data); };
 return definition;
}
(async () => {
 let loginApp, loginCalls = 0;
 vm.runInNewContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), {
  App: app => loginApp = app,
  wx: {
   login: options => options.success({code:'fresh-code'}),
   request: options => {
    loginCalls++;
    options.success(loginCalls === 1
     ? {statusCode:500,data:{message:'微信登录仍是默认配置'}}
     : {statusCode:200,data:{code:'SUCCESS',data:'test-user'}});
   }
  }
 });
 assert.equal(await loginApp.login(), '');
 assert.match(loginApp.globalData.loginError, /默认配置/);
 assert.equal(await loginApp.login(), 'test-user', 'Login can retry after configuration is corrected');
 assert.equal(loginApp.globalData.loginError, '');
 let submissions = 0, destination;
 const p = page('pages/upload/upload.js', async args => {
  submissions++;
  assert.equal(args.data.pathKeys.join(','), 'a,b');
  return { data: { code: 'SUCCESS', data: { recordId: 12 } } };
 }, { navigateTo: args => destination = args.url });
 p.appId = 6;
 p.data.files = [{ name: 'a', key: '' }, { name: 'b', key: '' }];
 p.upload = async (file, index) => { if(index === 1) throw new Error('upload failed'); return file.name; };
 await p.convert();
 assert.equal(submissions, 0, 'A failed image must block submission');
 assert.equal(p.data.busy, false);
 assert.equal(p.data.files[0].key, 'a', 'Successful uploads are retained for retry');
 p.upload = async file => file.name;
 await p.convert();
 assert.equal(submissions, 1);
 assert.equal(destination, '/pages/result/result?id=12');
 await p.convert();
 assert.equal(submissions, 1, 'Returning to the work page must not create another task');
 const full = page('pages/upload/upload.js', async () => {throw new Error('当前排队人数较多，请稍后再试');});
 full.data.files=[{key:'already-uploaded'}];
 await full.convert();
 assert.match(full.data.error, /排队人数/);
 assert.equal(full.data.files[0].key, 'already-uploaded', 'Queue rejection preserves uploads');
 assert.equal(full.data.busy, false);
 let selected;
 const images = page('pages/upload/upload.js', null, {chooseMessageFile:options=>{selected=options;}});
 images.data.imageMode=true;
 images.data.info={maxImages:9,maxSize:10,maxImageTotalMb:20};
 images.choose();
 assert.equal(images.data.sourceSheet, true);
 images.selectSource({currentTarget:{dataset:{source:"chat"}}});
 selected.success({tempFiles:[1,2,3].map(i=>({path:'image'+i,name:'a.png',size:8*1024*1024}))});
 assert.equal(images.data.files.length, 0);
 assert.match(images.data.error, /合计/);
 let media;
 const album = page('pages/upload/upload.js', null, {chooseMedia:options=>{media=options;}});
 album.data.imageMode=true;
 album.data.info={maxImages:9,maxSize:10,maxImageTotalMb:20};
 album.selectSource({currentTarget:{dataset:{source:'album'}}});
 assert.equal(media.sourceType[0], 'album');
 media.success({tempFiles:[{tempFilePath:'/tmp/photo.jpg',size:1024}]});
 assert.equal(album.data.files[0].path, '/tmp/photo.jpg');
 assert.equal(album.data.files[0].bytes, 1024);
 album.selectSource({currentTarget:{dataset:{source:'camera'}}});
 assert.equal(media.sourceType[0], 'camera');
 media.success({tempFiles:[{tempFilePath:'/tmp/large.jpg',size:11*1024*1024}]});
 assert.equal(album.data.files.length, 1, 'Oversized camera images cannot be added');
 assert.match(album.data.error, /每个文件/);
 media.fail({errMsg:'chooseMedia:fail cancel'});
 assert.equal(album.data.files.length, 1, 'Cancelling retains previously chosen images');
 p.data.files = [{name:'a'}, {name:'b'}];
 p.move({currentTarget:{dataset:{index:1,step:-1}}});
 assert.equal(p.data.files.map(x=>x.name).join(','), 'b,a');
 const result = page('pages/result/result.js', async () => ({data:{code:'SUCCESS',data:{convertStatus:2}}}));
 result.visible = true;
 await result.refresh();
 assert.ok(result.timer, 'Pending results should refresh automatically');
 result.onHide();
 assert.equal(result.visible, false);
 const done = page('pages/result/result.js', async () => ({data:{code:'SUCCESS',data:{convertStatus:3,convertType:2,fileName:'plan.pdf',convertedFile:JSON.stringify(['https://example.test/plan.docx'])}}}));
 await done.refresh();
 assert.equal(done.data.outputs[0].name, 'plan.docx');
 const doc = page('pages/upload/upload.js', null, {chooseMessageFile:options=>{selected=options;}});
 doc.data.info={supportType:'pdf',maxSize:10};
 doc.choose();
 assert.equal(doc.data.sourceSheet, false, 'Documents open the file picker directly');
 assert.equal(selected.extension[0], 'pdf');
 let requestOptions;
 const serviceModule = {exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'utils/service.js'),'utf8'), {
  module:serviceModule,getApp:()=>({globalData:{baseUrl:'http://localhost:9876'}}),
  wx:{request:options=>{requestOptions=options;}}
 });
 const requestApi = serviceModule.exports.requestApi;
 let request = requestApi({url:'/app/getAppList'});
 requestOptions.success({statusCode:500,data:{code:'SUCCESS'}});
 await assert.rejects(request, /服务暂时不可用/);
 request = requestApi({url:'/doc/convert',method:'POST',data:{type:2}});
 assert.equal(requestOptions.method, 'POST');
 requestOptions.success({statusCode:200,data:{code:'BUSY',message:'队列已满'}});
 await assert.rejects(request, /队列已满/);
 request = requestApi({url:'/app/getAppList'});
 requestOptions.fail({errMsg:'timeout'});
 await assert.rejects(request, /网络连接失败/);
 request = requestApi({url:'/app/getAppList'});
 requestOptions.success({statusCode:200,data:{code:'SUCCESS',data:[]}});
 assert.equal((await request).data.code,'SUCCESS');
 let aborted = false, lateSubmissions = 0, uploadStarted;
 const started = new Promise(resolve=>{uploadStarted=resolve;});
 const leaving = page('pages/upload/upload.js', async () => {lateSubmissions++;}, {
  uploadFile: options => ({
   onProgressUpdate(){uploadStarted();},
   abort(){aborted=true;options.fail({errMsg:'abort'});}
  })
 });
 leaving.data.files=[{name:'plan.pdf',path:'/tmp/plan.pdf',key:''}];
 const pending = leaving.convert();
 await started;
 leaving.onUnload();
 await pending;
 assert.ok(aborted,'Leaving aborts the active upload');
 assert.equal(lateSubmissions,0,'Leaving while uploading must not submit a conversion');
 let documentOptions, downloads=0;
 const exporting = page('pages/result/result.js', null, {
  downloadFile: options=>{downloads++;options.success({statusCode:200,tempFilePath:'/tmp/result'});},
  openDocument: options=>{documentOptions=options;options.success();},
  previewImage: options=>options.success()
 });
 exporting.data.outputs=[{url:'https://example.test/result.docx',name:'plan.docx',extension:'.docx',image:false}];
 await exporting.exportFile({currentTarget:{dataset:{index:0,action:'preview'}}});
 assert.equal(documentOptions.fileType,'docx','Native document preview receives the output format');
 assert.equal(documentOptions.showMenu,true);
 exporting.data.outputs=[{url:'https://example.test/image.png',image:true}];
 await exporting.exportFile({currentTarget:{dataset:{index:0,action:'preview'}}});
 assert.equal(downloads,1,'Image preview must not perform a redundant download');
 assert.equal(exporting.data.exporting,false);
 const config = JSON.parse(fs.readFileSync(path.join(root, 'app.json')));
 for(const route of config.pages) for(const extension of ['js','json','wxml','wxss']) assert.ok(fs.existsSync(path.join(root, route+'.'+extension)), route+'.'+extension);
 for (const route of config.pages) {
  const definition = page(route+'.js', async()=>({data:{code:'SUCCESS'}}));
  const template = fs.readFileSync(path.join(root, route + '.wxml'), 'utf8');
  for(const [, handler] of template.matchAll(/(?:bindtap|catchtap)="([^"]+)"/g)) assert.equal(typeof definition[handler], 'function', route+': missing handler '+handler);
  for (const [, expression] of template.matchAll(/\{\{([\s\S]*?)\}\}/g)) {
   // WXML bindings receive raw operators; XML entities are not decoded here.
   assert.doesNotMatch(expression, /&(?:amp|lt|gt|quot|apos);/, route + ': escaped binding operator');
   new vm.Script('(' + expression + ')', {filename: route + '.wxml'});
  }
 }
 assert.equal(config.tabBar.list.length, 2);
 console.log('PASS: failed uploads, retry, image order, task reuse, queue-full feedback, image size limits, album/camera limits, direct document picker, output filename, polling lifecycle, HTTP errors, upload cancellation, native exports, registered pages, template expressions and event handlers');
})().catch(e => { console.error(e); process.exitCode=1; });
