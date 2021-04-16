var instantClick,InstantClick=instantClick=function(document,location,$userAgent){var $isChromeForIOS=$userAgent.indexOf(' CriOS/')>-1,$currentLocationWithoutHash,$urlToPreload,$preloadTimer,$lastTouchTimestamp,$preloadCacheTimeLimit=30000,$preloadTimeDict={},$xhrDict={},$history={},$xhr,$url=false,$title=false,$mustRedirect=false,$body=false,$timing={},$isPreloading=false,$isWaitingForCompletion=false,$trackedAssets=[],$preloadOnMousedown,$delayBeforePreload,$eventsCallbacks={fetch:[],receive:[],wait:[],change:[],restore:[]}
function removeHash(url){var index=url.indexOf('#')
if(index<0){return url}
return url.substr(0,index)}
function getLinkTarget(target){while(target&&target.nodeName!='A'){target=target.parentNode}
return target}
function isBlacklisted(elem){do{if(!elem.hasAttribute){break}
if(elem.hasAttribute('data-instant')){return false}
if(elem.hasAttribute('data-no-instant')){return true}}
while(elem=elem.parentNode)
return false}
function isPreloadable(a){var domain=location.protocol+'//'+location.host
if(a.target||a.hasAttribute('download')||a.href.indexOf(domain+'/')!=0||(a.href.indexOf('#')>-1&&removeHash(a.href)==$currentLocationWithoutHash)||isBlacklisted(a)){return false}
return true}
function triggerPageEvent(eventType,arg1,arg2,arg3){var returnValue=false
for(var i=0;i<$eventsCallbacks[eventType].length;i++){if(eventType=='receive'){var altered=$eventsCallbacks[eventType][i](arg1,arg2,arg3)
if(altered){if('body'in altered){arg2=altered.body}
if('title'in altered){arg3=altered.title}
returnValue=altered}}
else{$eventsCallbacks[eventType][i](arg1,arg2,arg3)}}
return returnValue}
function changePage(title,body,newUrl,scrollY,pop){document.documentElement.replaceChild(body,document.body)
if(newUrl){if(location.href!==newUrl){history.pushState(null,null,newUrl)}
var hashIndex=newUrl.indexOf('#'),hashElem=hashIndex>-1&&document.getElementById(newUrl.substr(hashIndex+1)),offset=0
if(hashElem){while(hashElem.offsetParent){offset+=hashElem.offsetTop
hashElem=hashElem.offsetParent}}
scrollTo(0,offset)
$currentLocationWithoutHash=removeHash(newUrl)}
else{scrollTo(0,scrollY)}
if($isChromeForIOS&&document.title==title){document.title=title+String.fromCharCode(160)}
else{document.title=title}
instantanize()
if(pop){triggerPageEvent('restore')}
else{triggerPageEvent('change',false)}}
function setPreloadingAsHalted(){$isPreloading=false
$isWaitingForCompletion=false}
function removeNoscriptTags(html){return html.replace(/<noscript[\s\S]+?<\/noscript>/gi,'')}
function mousedownListener(e){if($lastTouchTimestamp>(+new Date-500)){return}
var a=getLinkTarget(e.target)
if(!a||!isPreloadable(a)){return}
preload(a.href)}
function mouseoverListener(e){if($lastTouchTimestamp>(+new Date-500)){return}
var a=getLinkTarget(e.target)
if(!a||!isPreloadable(a)){return}
a.addEventListener('mouseout',mouseoutListener)
if(!$delayBeforePreload){preload(a.href)}
else{$urlToPreload=a.href
$preloadTimer=setTimeout(preload,$delayBeforePreload)}}
function touchstartListener(e){$lastTouchTimestamp=+new Date
var a=getLinkTarget(e.target)
if(!a||!isPreloadable(a)){return}
if($preloadOnMousedown){a.removeEventListener('mousedown',mousedownListener)}
else{a.removeEventListener('mouseover',mouseoverListener)}
preload(a.href)}
function clickListener(e){var a=getLinkTarget(e.target)
if(!a||!isPreloadable(a)){return}
if(e.which>1||e.metaKey||e.ctrlKey){return}
e.preventDefault()
display(a.href)}
function mouseoutListener(){if($preloadTimer){clearTimeout($preloadTimer)
$preloadTimer=false
return}
if(!$isPreloading||$isWaitingForCompletion){return}
$xhr.abort()
setPreloadingAsHalted()}
function cloneXhr(xhr){var clone={};var responseHeader=xhr.getResponseHeader('Content-Type')
clone.isFromCache=true;clone.readyState=xhr.readyState;clone.status=xhr.status;clone.responseText=xhr.responseText;clone.getResponseHeader=function(arg){return responseHeader;}
return clone;}
function readystatechangeListener(xhr){if(xhr.readyState<4){return}
if(xhr.status==0){return}
$timing.ready=+new Date-$timing.start
if(!xhr.isFromCache){$xhrDict[$url]=cloneXhr(xhr);$preloadTimeDict[$url]=new Date().getTime();}
if(xhr.getResponseHeader('Content-Type').match(/\/(x|ht|xht)ml/)){var doc=document.implementation.createHTMLDocument('')
doc.documentElement.innerHTML=removeNoscriptTags(xhr.responseText)
$title=doc.title
$body=doc.body
var alteredOnReceive=triggerPageEvent('receive',$url,$body,$title)
if(alteredOnReceive){if('body'in alteredOnReceive){$body=alteredOnReceive.body}
if('title'in alteredOnReceive){$title=alteredOnReceive.title}}
var urlWithoutHash=removeHash($url)
$history[urlWithoutHash]={body:$body,title:$title,scrollY:urlWithoutHash in $history?$history[urlWithoutHash].scrollY:0}
var elems=doc.head.children,found=0,elem,data
for(var i=0;i<elems.length;i++){elem=elems[i]
if(elem.hasAttribute('data-instant-track')){data=elem.getAttribute('href')||elem.getAttribute('src')||elem.innerHTML
for(var j=0;j<$trackedAssets.length;j++){if($trackedAssets[j]==data){found++}}}}
if(found!=$trackedAssets.length){$mustRedirect=true}}
else{$mustRedirect=true}
if($isWaitingForCompletion){$isWaitingForCompletion=false
display($url)}}
function popstateListener(){var loc=removeHash(location.href)
if(loc==$currentLocationWithoutHash){return}
if(!(loc in $history)){location.href=location.href
return}
$history[$currentLocationWithoutHash].scrollY=pageYOffset
$currentLocationWithoutHash=loc
changePage($history[loc].title,$history[loc].body,false,$history[loc].scrollY,true)}
function instantanize(isInitializing){document.body.addEventListener('touchstart',touchstartListener,true)
if($preloadOnMousedown){document.body.addEventListener('mousedown',mousedownListener,true)}
else{document.body.addEventListener('mouseover',mouseoverListener,true)}
document.body.addEventListener('click',clickListener,true)
if(!isInitializing){var scripts=document.body.getElementsByTagName('script'),script,copy,parentNode,nextSibling
for(var i=0,j=scripts.length;i<j;i++){script=scripts[i]
if(script.hasAttribute('data-no-instant')){continue}
copy=document.createElement('script')
if(script.src){copy.src=script.src}
if(script.innerHTML){copy.innerHTML=script.innerHTML}
parentNode=script.parentNode
nextSibling=script.nextSibling
parentNode.removeChild(script)
parentNode.insertBefore(copy,nextSibling)}}}
function preload(url){if(!$preloadOnMousedown&&'display'in $timing&&+new Date-($timing.start+$timing.display)<100){return}
if($preloadTimer){clearTimeout($preloadTimer)
$preloadTimer=false}
if(!url){url=$urlToPreload}
if($isPreloading&&(url==$url||$isWaitingForCompletion)){return}
$isPreloading=true
$isWaitingForCompletion=false
$url=url
$body=false
$mustRedirect=false
$timing={start:+new Date}
triggerPageEvent('fetch')
if($xhrDict[$url]&&$preloadTimeDict[$url]+$preloadCacheTimeLimit>new Date().getTime()){readystatechangeListener($xhrDict[$url])}else{$xhr.open('GET',url)
$xhr.send()}}
function display(url){if(!('display'in $timing)){$timing.display=+new Date-$timing.start}
if($preloadTimer||!$isPreloading){if($preloadTimer&&$url&&$url!=url){location.href=url
return}
preload(url)
triggerPageEvent('wait')
$isWaitingForCompletion=true
return}
if($isWaitingForCompletion){location.href=url
return}
if($mustRedirect){location.href=$url
return}
if(!$body){triggerPageEvent('wait')
$isWaitingForCompletion=true
return}
$history[$currentLocationWithoutHash].scrollY=pageYOffset
setPreloadingAsHalted()
changePage($title,$body,$url)}
var supported='pushState'in history&&(!$userAgent.match('Android')||$userAgent.match('Chrome/'))&&location.protocol!="file:"
function init(options){var preloadingMode;if(typeof options!=='object'){preloadingMode=options;}else{preloadingMode=options.preloadingMode||0;if(options.preloadCacheTimeLimit!==undefined){$preloadCacheTimeLimit=options.preloadCacheTimeLimit;}}
if($currentLocationWithoutHash){return}
if(!supported){triggerPageEvent('change',true)
return}
if(preloadingMode=='mousedown'){$preloadOnMousedown=true}
else if(typeof preloadingMode=='number'){$delayBeforePreload=preloadingMode}
$currentLocationWithoutHash=removeHash(location.href)
$history[$currentLocationWithoutHash]={body:document.body,title:document.title,scrollY:pageYOffset}
var elems=document.head.children,elem,data
for(var i=0;i<elems.length;i++){elem=elems[i]
if(elem.hasAttribute('data-instant-track')){data=elem.getAttribute('href')||elem.getAttribute('src')||elem.innerHTML
$trackedAssets.push(data)}}
$xhr=new XMLHttpRequest()
$xhr.addEventListener('readystatechange',function(){readystatechangeListener($xhr);})
instantanize(true)
triggerPageEvent('change',true)
addEventListener('popstate',popstateListener)}
function on(eventType,callback){$eventsCallbacks[eventType].push(callback)}
return{supported:supported,init:init,on:on}}(document,location,navigator.userAgent);if(typeof module==='object'&&typeof module.exports==='object'){module.exports=InstantClick;};(function(){var $container,$element,$transformProperty,$progress,$timer,$hasTouch='createTouch'in document
function init(){$container=document.createElement('div')
$container.id='instantclick'
$element=document.createElement('div')
$element.id='instantclick-bar'
$element.className='instantclick-bar'
$container.appendChild($element)
var vendors=['Webkit','Moz','O']
$transformProperty='transform'
if(!($transformProperty in $element.style)){for(var i=0;i<3;i++){if(vendors[i]+'Transform'in $element.style){$transformProperty=vendors[i]+'Transform'}}}
var transitionProperty='transition'
if(!(transitionProperty in $element.style)){for(var i=0;i<3;i++){if(vendors[i]+'Transition'in $element.style){transitionProperty='-'+vendors[i].toLowerCase()+'-'+transitionProperty}}}
var style=document.createElement('style')
style.innerHTML='#instantclick{position:'+($hasTouch?'absolute':'fixed')+';top:0;left:0;width:100%;pointer-events:none;z-index:2147483647;'+transitionProperty+':opacity .2s .1s}'
+'.instantclick-bar{background:#27ae60;width:100%;margin-left:-100%;height:2px;'+transitionProperty+':all .2s}'
document.head.appendChild(style)
if($hasTouch){updatePositionAndScale()
addEventListener('resize',updatePositionAndScale)
addEventListener('scroll',updatePositionAndScale)}}
function start(at,jump){$progress=at
if(document.getElementById($container.id)){document.body.removeChild($container)}
$container.style.opacity='1'
if(document.getElementById($container.id)){document.body.removeChild($container)}
update()
if(jump){setTimeout(jumpStart,0)}
clearTimeout($timer)
$timer=setTimeout(inc,500)}
function jumpStart(){$progress=10
update()}
function inc(){$progress+=1+(Math.random()*2)
if($progress>=98){$progress=98}
else{$timer=setTimeout(inc,500)}
update()}
function update(){$element.style[$transformProperty]='translate('+$progress+'%)'
if(!document.getElementById($container.id)){document.body.appendChild($container)}}
function done(){if(document.getElementById($container.id)){clearTimeout($timer)
$progress=100
update()
$container.style.opacity='0'
return}
start($progress==100?0:$progress)
setTimeout(done,0)}
function updatePositionAndScale(){$container.style.left=pageXOffset+'px'
$container.style.width=innerWidth+'px'
$container.style.top=pageYOffset+'px'
var landscape='orientation'in window&&Math.abs(orientation)==90,scaleY=innerWidth/screen[landscape?'height':'width']*2
$container.style[$transformProperty]='scaleY('+scaleY+')'}
instantClick.on('change',function(isInitialPage){if(isInitialPage&&instantClick.supported){init()}
else if(!isInitialPage){done()}})
instantClick.on('wait',start)})();
