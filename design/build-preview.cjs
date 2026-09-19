// Offline design review: render the actual WXML and WXSS using sample states.
// This is a visual preview, not a replacement for WeChat device testing.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const {describe} = require('../utils/file-ui');
const names = {1:'PDF转图片',2:'PDF转Word',3:'PDF转Excel',4:'PDF转PPT',6:'图片转PDF',7:'Word转PDF',8:'Excel转PDF',9:'PPT转PDF'};
const tools = [2,7,6,1,3,8,4,9].map(id=>({id,appName:names[id],...describe(id)}));
const info = type=>({...describe(type),appName:names[type],supportType:'pdf',maxSize:10,maxImages:9,maxImageTotalMb:20,maxPdfPages:50});
const file = {path:'',name:'2026 年秋季活动方案.pdf',size:'2.36 MB'};
const base = {loading:false,error:'',files:[],busy:false,imageMode:false,submittedId:null,sourceSheet:false,status:''};
const record = status=>({id:1,convertStatus:status,convertType:2,fileName:file.name,queueAhead:2,createTime:'2026-09-19 13:17',appName:'PDF转Word',...describe(2)});
const outputs = [{url:'sample.docx',name:'2026 年秋季活动方案.docx',image:false}];
const labels = ['','排队中','转换中','已完成','转换失败'];
const screens = [
 ['首页','index/index',{...base,tools}],
 ['选择文件','upload/upload',{...base,info:info(2)}],
 ['选择文件来源','upload/upload',{...base,info:info(6),imageMode:true,sourceSheet:true}],
 ['转换设置','upload/upload',{...base,info:info(2),files:[file]}],
 ['排队等待','result/result',{...base,record:record(1),outputs:[],exporting:false}],
 ['转换完成','result/result',{...base,record:record(3),outputs,exporting:false}],
 ['转换记录','history/record',{...base,labels,records:[record(2),{...record(3),id:2,fileName:'项目预算表.xlsx',convertType:8,...describe(8),appName:'Excel转PDF'},{...record(4),id:3,fileName:'会议纪要.pdf'}]}],
 ['正在转换','result/result',{...base,record:record(2),outputs:[],exporting:false}],
 ['转换失败','result/result',{...base,record:{...record(4),remark:'文件可能已加密或损坏，请确认文件可以正常打开后重新选择。'},outputs:[],exporting:false}],
 ['空记录','history/record',{...base,labels,records:[]}],
 ['加载失败','history/record',{...base,labels,records:[],error:'暂时无法连接，请检查网络后重试'}],
 ['文件上传中','upload/upload',{...base,info:info(2),files:[file],busy:true,status:'上传 1/1 · 68%'}],
 ['逐页图片结果','result/result',{...base,record:{...record(3),convertType:1,...describe(1)},outputs:[1,2,3].map(i=>({name:'第 '+i+' 页图片',url:i+'.png',image:true})),exporting:false}],
 ['图片排序','upload/upload',{...base,info:info(6),imageMode:true,files:[1,2].map(i=>({name:'活动照片 '+i+'.jpg',size:'1.28 MB',path:'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="180"><rect width="160" height="180" fill="#e8e6fa"/><circle cx="114" cy="48" r="18" fill="#bbb3ec"/><path d="M0 145L60 67L114 145Z" fill="#8274ce"/><path d="M80 180L130 96L180 180Z" fill="#aa9fdf"/></svg>')}))}],
 ['加载中','index/index',{...base,tools:[],loading:true}]
];
const nativeButtonCSS = 'button{font-size:17px;font-weight:700;padding:8px 24px;line-height:1.41176471}button:not([size=mini]){width:184px;margin-left:auto;margin-right:auto}';
const globalCSS=nativeButtonCSS+'\n'+fs.readFileSync(path.join(root,'app.wxss'),'utf8');
const pages={};
for(const [,route] of screens) if(!pages[route])pages[route]={wxml:fs.readFileSync(path.join(root,'pages',route+'.wxml'),'utf8'),css:globalCSS+'\n'+fs.readFileSync(path.join(root,'pages',route+'.wxss'),'utf8')};
const html=`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PDF 转换器 · 全页面设计</title><style>
*{box-sizing:border-box}body{margin:0;background:#eeedf4;color:#292735;font:15px -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif}header{max-width:1240px;margin:48px auto 32px;padding:0 24px}h1{font-size:32px;letter-spacing:-1px;margin:12px 0}header p{color:#777381;line-height:1.8}small{color:#6860d4;letter-spacing:2px}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:24px}nav a{color:#5d56bf;text-decoration:none;background:#fff;padding:8px 14px;border-radius:99px}.boards{display:grid;grid-template-columns:repeat(auto-fit,375px);gap:36px 28px;justify-content:center;padding:0 20px 64px}.board{scroll-margin-top:20px}.board h2{font-size:15px;font-weight:500;margin:0 0 12px;color:#716c80}.board h2 span{color:#aaa3bc;font-size:12px;margin-right:12px}iframe{width:375px;height:812px;border:0;border-radius:28px;box-shadow:0 8px 32px #27203b0c;background:white}@media(max-width:420px){.boards{display:block;padding:0 10px}.board{margin-bottom:28px}iframe{width:100%}header{margin-top:24px}}
</style><header><small>PDF CONVERTER / DESIGN 01</small><h1>让文件转换，变得简单。</h1><p>白色留白 · 蓝紫主色 · 清晰的文件状态<br>以下页面使用小程序实际模板与样式生成，内容为演示数据。可滚动查看长页面；真实文件选择及微信分享需在小程序中体验。</p><nav id="nav"></nav></header><main class="boards" id="boards"></main><script>
const screens=${JSON.stringify(screens)};
const pages=${JSON.stringify(pages)};
function expr(code,data){try{return Function(...Object.keys(data),'return ('+code+')')(...Object.values(data))}catch(e){return ''}}
function bind(text,data){return text.replace(/\\{\\{([\\s\\S]*?)\\}\\}/g,(_,code)=>expr(code,data))}
function render(parent,data,doc){const frag=doc.createDocumentFragment();let passed=false;for(const node of parent.childNodes){if(node.nodeType===3){frag.append(doc.createTextNode(bind(node.textContent,data)));continue}if(node.nodeType!==1)continue;
 if(node.hasAttribute('wx:for')){const items=expr(node.getAttribute('wx:for').slice(2,-2),data)||[];items.forEach((item,index)=>{const copy=node.cloneNode(true);copy.removeAttribute('wx:for');const wrap=doc.createElement('div');wrap.append(copy);frag.append(render(wrap,{...data,item,index},doc))});continue}
 const condition=node.getAttribute('wx:if'),elseIf=node.getAttribute('wx:elif'),otherwise=node.hasAttribute('wx:else');
 if(condition!==null){passed=!!expr(condition.slice(2,-2),data);if(!passed)continue}else if(elseIf!==null){if(passed)continue;passed=!!expr(elseIf.slice(2,-2),data);if(!passed)continue}else if(otherwise){if(passed)continue;passed=true}
 const tag=node.tagName.toLowerCase();if(tag==='block'){frag.append(render(node,data,doc));continue}
 const el=doc.createElement(tag==='view'?'div':tag==='text'?'span':tag==='image'?'img':tag);
 for(const a of node.attributes){if(a.name.startsWith('wx:')||a.name.startsWith('bind')||a.name.startsWith('catch'))continue;const value=bind(a.value,data);if(a.name==='disabled'){if(value==='true')el.disabled=true}else el.setAttribute(a.name,value)}el.append(render(node,data,doc));frag.append(el)
 }return frag}
screens.forEach(([title,route,data],index)=>{const section=document.createElement('section');section.className='board';section.id='screen-'+index;section.innerHTML='<h2><span>'+String(index+1).padStart(2,'0')+'</span>'+title+'</h2>';const frame=document.createElement('iframe');frame.title=title;section.append(frame);document.querySelector('#boards').append(section);const d=frame.contentDocument;
 const css=pages[route].css.replace(/([\\d.]+)rpx/g,(_,n)=>Number(n)/2+'px').replace(/\\bpage\\b/g,'body').replace(/env\\(safe-area-inset-bottom\\)/g,'18px').replace(/min-height:100vh/g,'min-height:100%');
 d.open();d.write('<!doctype html><meta charset="utf-8"><style>'+css+'\\nbody{margin:0}button{border:0;cursor:pointer}img{object-fit:cover}.native-top{height:88px;background:white;padding:12px 22px 0;position:sticky;top:0;z-index:5}.statusbar{display:flex;justify-content:space-between;font-size:13px;font-weight:600;height:30px}.navbar{text-align:center;font-size:17px;font-weight:600;position:relative}.capsule{position:absolute;right:0;top:0;border:1px solid #f0f0f3;border-radius:20px;font-size:12px;padding:2px 10px}.navback{position:absolute;left:0;font-weight:400;font-size:22px}.native-tabs{position:fixed;bottom:0;left:0;right:0;height:74px;background:white;display:flex;justify-content:space-around;padding:18px 0 28px;font-size:14px;color:#aaa;z-index:4}.native-tabs .active{color:#5952ed;font-weight:600;}.screen{min-height:calc(100vh - 88px)}.home-screen,.history-screen{padding-bottom:100px}.homebar{position:fixed;bottom:7px;left:calc(50% - 48px);width:96px;height:4px;border-radius:5px;background:#202029;z-index:20}.sheet-mask{position:fixed}.bottom-actions{position:fixed}</style><div class="native-top"><div class="statusbar"><span>9:41</span><span>▮▮▮ &nbsp; ◕ &nbsp; ▰</span></div><div class="navbar">'+(route.startsWith('index')?'首页':route.startsWith('history')?'转换记录':route.startsWith('upload')?data.info.appName:'转换任务')+'<span class="capsule">••• &nbsp;│&nbsp; ◎</span>'+(route.startsWith('upload')||route.startsWith('result')?'<span class="navback">‹</span>':'')+'</div></div>');d.close();
 const tpl=d.createElement('template');tpl.innerHTML=pages[route].wxml.replace(/<image([^>]*?)\\/>/g,'<image$1></image>');d.body.append(render(tpl.content,data,d));
 if(route.startsWith('index')||route.startsWith('history')){const tabs=d.createElement('div');tabs.className='native-tabs';tabs.innerHTML='<span class="'+(route.startsWith('index')?'active':'')+'">首页</span><span class="'+(route.startsWith('history')?'active':'')+'">转换记录</span>';d.body.append(tabs)}const bar=d.createElement('div');bar.className='homebar';d.body.append(bar);
 const a=document.createElement('a');a.href='#screen-'+index;a.textContent=title;document.querySelector('#nav').append(a)
});
</script></html>`;
fs.writeFileSync(path.join(__dirname,'preview.html'),html);
console.log('Generated design/preview.html from native page templates');
