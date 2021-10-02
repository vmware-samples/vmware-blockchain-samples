declare var clients: any;
declare var skipWaiting: any;

interface UrlInfo {
  isAPI?: boolean;
  filekey?: string;
  filename?: string; extension?: string; directory?: string;
  version?: string; hashedVersion?: string;
  hostname?: string; hostnamePathR?: string;
  path?: string; pathClean?: string;
  params?: any;
  protocol?: string;
  hash?: string;
  target?: string;
  // script_hostname:location.hostname;
  // script_hostname_rpath:script_rpath;
  samehost?: boolean;
  subname?: string;
  subdomain?: boolean;
  sibling?: boolean;
  paramsBase64?: string;
  url?: string;
  pathkey?: string;
  pathkeyFront?: string;
  basicStatic?: boolean;
  t?: number;
}

const env: any = {};

const envPrepare = () => {
  const nv = navigator;
  const ua = nv.userAgent;
  const ual = ua.toLowerCase();
  const nptu = nv.platform.toUpperCase();
  const hn = location.hostname;
  const uas = ua.split(' ');
  const uae = uas[uas.length - 1];
  function mobileCheck() {
    let check = false;
    // tslint:disable-next-line: max-line-length
    ((a) => { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) { check = true; } }) (
      // tslint:disable-next-line: no-string-literal
      ua || nv.vendor || window['opera']
    );
    return check;
  }
  function getBrowser() {
    let tem;
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return {name: 'IE', version: (tem[1] || '')};
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem !== null) { return {name: tem[1].replace('OPR', 'Opera'), version: tem[2]}; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    tem = ua.match(/version\/(\d+)/i);
    if (tem !== null) { M.splice(1, 1, tem[1]); }
    return { name: M[0], version: M[1] };
  }

  // OS Detect
  const browserInfo = getBrowser();
  browserInfo.version = parseInt(browserInfo.version, 10);
  env.isMac = nptu.indexOf('MAC') !== -1; if (env.isMac) { env.os = 'mac'; }
  env.isWindows = nptu.indexOf('WIN') !== -1; if (env.isWindows) { env.os = 'win'; }
  env.isLinux = nptu.indexOf('LINUX') !== -1; if (env.isLinux) { env.os = 'linux'; }
  env.isAndroid = nptu.indexOf('ANDROID') !== -1; if (env.isAndroid) { env.os = 'andro'; }
  env.isIX = (ua.match(/(iPad|iPhone|iPod)/g) ? true : false ); if (env.isIX) { env.os = 'ios'; }
  env.isIXWebApp = false; // (_nptu.standalone == true);
  env.isIPhone = (ua.match(/(iPhone|iPod)/g) ? true : false );
  env.isIPad = (ua.match(/(iPad)/g) ? true : false );
  env.isMobile = mobileCheck();
  if (!env.os) { env.os = 'other'; }

  // Browser Detect
  env.isFirefox = uae.indexOf('Firefox/') >= 0;  if (env.isFirefox) { env.browser = 'firefox'; }
  env.isSafari = (nv.vendor === 'Apple Computer, Inc.'); if (env.isSafari) { env.browser = 'safari'; }
  env.isBadSafari = (env.isIX && env.isSafari && browserInfo.version < 10);
  env.isWeirdSafari = (env.isBadSafari && !env.isIXWebApp);
  env.isChrome = ua.indexOf(' Chrome/') >= 0; if (env.isChrome) { env.browser = 'chrome'; }
  env.isEdge = ( ua.match(/(Edge)/g) ? true : false ); if (env.isEdge) { env.browser = 'edge'; }
  env.isIE = (ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0) && !env.isChrome && !env.isFirefox && !env.isSafari && !env.isEdge;
  if (!env.browser) { env.browser = 'other'; }
};

envPrepare();

let verInfo = {};
let installFunc;
const installFunc0 = (e) => { if (installFunc) { installFunc(e); } };
let fetchFunc;
const fetchFunc0 = (e) => { if (fetchFunc) { fetchFunc(e); } };

const urlInfoCache = {};
const getUrlInfo = (url: string): UrlInfo => {
  if (urlInfoCache[url] && Date.now() - urlInfoCache[url].t < 86400000) {
    return urlInfoCache[url];
  }
  const info: UrlInfo = { t: Date.now() };
  const oriUrl = url;
  info.hashedVersion = '';
  info.isAPI = oriUrl.startsWith('/api/') || oriUrl.indexOf('?t=') >= 0 || oriUrl.endsWith('.json');
  if (url.indexOf('___') >= 0) {
    info.hashedVersion = url.split('___')[1];
    url = url.split('___')[0];
  }
  const urlSplit = url.split('/');
  const protocol = urlSplit[0].split(':')[0];
  urlSplit.shift(); urlSplit.shift();
  info.hostname = urlSplit[0].split(':')[0];
  let pathSplit = [];
  if (urlSplit.length > 1) {
    pathSplit = urlSplit;
    urlSplit.shift();
  }
  info.path = '/' + pathSplit.join('/');
  info.filename = pathSplit[pathSplit.length - 1];
  if (info.filename.indexOf('?') >= 0) { info.filename = info.filename.split('?')[0]; }
  if (info.filename.indexOf('#') >= 0) { info.filename = info.filename.split('#')[0]; }
  if (info.filename.indexOf('@') >= 0) { info.filename = info.filename.split('@')[0]; }
  let path = '/' + pathSplit.join('/');
  let hash = '';
  if (path.indexOf('#') >= 0) { hash = path.split('#')[1]; path = path.split('#')[0]; }
  let target = '';
  if (path.indexOf('@') >= 0) { target = path.split('@')[1]; path = path.split('@')[0]; }
  let params = '';
  if (path.indexOf('?') >= 0) { const lit = path.split('?'); path = lit[0]; params = lit[1]; }
  info.pathClean = path;
  info.basicStatic = (info.pathClean.startsWith('/assets/')
                      || info.pathClean.startsWith('/assets-root/')
                      || info.pathClean.indexOf('-static-') >= 0
                      || info.pathClean.indexOf('bstatic') >= 0);
  info.directory = info.pathClean.replace(info.filename, '');
  info.paramsBase64 = params ? btoa(params) : '';
  const psplit = (info.filename.indexOf('_v') >= 0) ? info.filename.split('_v') : [info.filename];
  const pEnd = (info.filename.indexOf('_v') >= 0) ? '_v'+psplit[psplit.length - 1] : info.filename;
  info.extension = (info.filename.split('.').length === 1) ? '' : info.filename.split('.')[info.filename.split('.').length - 1];
  info.version = (pEnd.indexOf('_v') === 0) ? pEnd.split('_v')[1].split('.')[0] : '';
  info.filekey = info.version ? info.filename.replace('_v' + info.version, '') : info.filename;
  const script_host_split = env.hostname.split('.').reverse();
  const script_rpath = script_host_split.join('.');
  const script_host_length = script_host_split.length;
  const domainLevel = info.hostname.split('.');
  const hostSplit = info.hostname.split('.').reverse();
  info.hostnamePathR = hostSplit.join('.');
  info.samehost = (env.hostname === info.hostname);
  info.subdomain = false;
  info.sibling = false;
  info.subname = '';
  if (info.samehost) {
    info.subdomain = info.sibling = false;
  } else {
    let mismatchCount = 0;
    const matchArr = [];
    for (let i = 0; i < script_host_length; ++i) {
      if (hostSplit[i] !== script_host_split[i]) {
        ++mismatchCount; matchArr.push(false);
      } else {
        matchArr.push(true);
      }
    }
    if (mismatchCount === 0) {
      info.subdomain = true;
    } else if (mismatchCount === 1 && matchArr[matchArr.length - 1] === false) {
      info.sibling = true;
    }
    if (info.subdomain) {
      for (let i = 0; i < script_host_length && hostSplit.length > 0; ++i) { hostSplit.shift(); }
      info.subname = hostSplit.join('.');
    }
  }
  const vInfo = info.paramsBase64 + info.version;
  info.pathkey = info.samehost ? (vInfo ? path + '___' + vInfo : path)
        : (vInfo ? '/~EXTERN~/' + info.hostname + info.directory + info.filekey + '___' + vInfo
                 : '/~EXTERN~/' + info.hostname + info.directory + info.filekey);
  info.pathkeyFront = info.pathkey.split('___')[0];
  // var info = {
  //   isAPI: is_api,
  // 	filekey:filekey, extension:ext, filename:filename, directory:directory,
  // 	version:version, hashed_version:hashed_version,
  // 	hostname:hostname, path:raw_path, params:params, hostname_rpath:host_rpath, path_clean:path_clean,
  // 	protocol:protocol, hash:hash, target:target,
  // 	script_hostname:location.hostname, script_hostname_rpath:script_rpath,
  // 	samehost:samehost, subname:subname, subdomain:subdomain, sibling:sibling,
  // 	params_b64:params_b64, url:ori_url,
  // 	pathkey:pathkey, pathkey_front:pathkey_front,
  // 	index_candidate:(samehost && ext === '' && raw_path === path_clean),
  // 	basic_static:basic_static,
  // 	alpha:domain_level[0]==='alpha',
  // 	beta:domain_level[0]==='beta',
  // 	dev:domain_level[0]==='dev',
  // 	t:Date.now(),
  // };
  urlInfoCache[oriUrl] = info;
  return info;
};


self.addEventListener('install', installFunc0);
self.addEventListener('fetch', fetchFunc0);
self.addEventListener('activate', (e: any) => { e.waitUntil(self.clients.claim()); });


const clientWindows = {};
let cacheMap = null;
let cacheName = 'ganymedeServiceWorker';
const basicFiles = false ? [] : [];


const clientslog = (msg) => {
  for (const cid of Object.keys(clientWindows)) {
    // tslint:disable-next-line: no-console
    try { clientWindows[cid].target.postMessage(msg); } catch (e) { console.log(e); }
  }
};

// tslint:disable-next-line: no-string-literal
self['newClientChecker'] = () => {
  skipWaiting();
  // tslint:disable-next-line: no-console
  // try { self.clients.claim(); } catch (e) { console.log(e); }
  self.clients.matchAll({includeUncontrolled: true, type: 'window'}).then(matchedClients => {
    if (matchedClients && matchedClients.length) {
      for (const cid of Object.keys(clientWindows)) {
        clientWindows[cid].checked = false;
      }
      const announce = (client, cid) => { client.postMessage('GanymedeSW::ACK ' + cid); };
      for (const client of matchedClients) {
        // if (!client.focused) { continue; }
        const cid = client.id;
        if (!clientWindows[cid]) {
          clientWindows[cid] = { mapped: false, target: client };
          try {
            announce(client, cid);
          } catch (e) {
            console.log(e);
          }
        }
        clientWindows[cid].checked = true;
      }
      for (const cid of Object.keys(clientWindows)) {
        if (!clientWindows[cid].checked) { delete clientWindows[cid]; }
      }
    }
  });
};

// tslint:disable-next-line: no-unused-expression
(async () => {

fetchFunc = e => {
  try {
    if (!env.domains || !env.hostname) { return false; }
    const url = e.request.url;
    const oriUrl = url;
    const info = getUrlInfo(url);
    if (info.extension === 'mp4') { // mp4 caching can only be supported on Chrome & FF
      if (info.basicStatic && (env.isChrome || env.isFirefox)) { } else {
        // tslint:disable-next-line: no-console
        console.log(e.request);
        return false;
      }
    }
    // tslint:disable-next-line: no-console
    // if(isDev) console.log(info);
    if (info.isAPI) { return false; } // don't cache API
    if (!info.extension) { return false; } // don't cache no extension path
    if (info.extension === 'js' && info.hostname.indexOf('localhost') >= 0) {
      // excuse Angular sources
      switch (info.filename) {
        case 'runtime.js':
        case 'polyfills.js':
        case 'styles.js':
        case 'scripts.js':
        case 'vendor.js':
        case 'main.js':
          return false;
      }
    }
    if (info.extension === 'cookie') { return false; } // don't cache .cookie acceess
    let targetUrl = oriUrl;
    const g = info.samehost || info.sibling;
    const statres = (info.samehost && info.directory.startsWith('/assets/') || info.directory.startsWith('/assets-root/'))
                    || info.basicStatic;
    const s3 = (info.hostname.indexOf('.amazonaws.com') >= 0 && info.hostname.indexOf('s3') >= 0);
    targetUrl = info.pathkey;
    // console.log(info.url, g, s3, statres);
    if (!g && !s3 && !statres) { return false; }
    const fetchParam: any = { cache: 'no-cache', mode: 'cors', redirect: 'manual' };
    // if (g) { fetchParam.credentials = 'include'; }
    e.respondWith(caches.match(targetUrl).then(r => {
      if (r) { return r; }
      return r || fetch(e.request.url, fetchParam).then(response => {
        if (response.type === 'opaqueredirect') { return response; }
        return (response.status !== 200) ? response : caches.open(cacheName).then(cache => {
          if (!info.samehost || info.basicStatic) {
            cache.keys().then(names => {
              for (const name of names) {
                const nameInfo = getUrlInfo(name.url);
                // tslint:disable-next-line: no-console
                if (nameInfo.version) { console.log(nameInfo); }
                if (nameInfo.pathkeyFront === info.pathkeyFront) { cache.delete(name); }
              }
            });
            cache.put(targetUrl, response.clone());
            // tslint:disable-next-line: no-console
            console.log('%c[Ganymede SW]', 'color:#de00ff;', 'New cached file: ' + info.path);
          }
          return response;
        });
      });
    }));
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.log(e);
    return false;
  }
};

installFunc = e => {
  // skipWaiting();
  e.waitUntil(caches.open(cacheName).then(cache => {
    // tslint:disable-next-line: no-console
    console.log('%c[Ganymede SW]', 'color:#de00ff;', 'caching all basic static files...');
    cache.addAll(basicFiles);
  }));
};

// setInterval(newClientChecker, 100);


})();

self.addEventListener('message', (e) => {
  if (env.domains) {
    let sourceDomain = e.origin.indexOf('https://') >= 0 ? e.origin.split('https://')[1] : e.origin.split('http://')[1];
    sourceDomain = sourceDomain.split(':')[0];
    if (env.domains.indexOf(sourceDomain) === -1) {
      // tslint:disable-next-line: no-console
      console.log('%c[Ganymede SW]', 'color:#de00ff;', 'blocked message from unregistered domain ' + sourceDomain);
      return;
    }
  }

  if (e.data && e.data.action) {
    if (e.data.action === 'set') {
      // tslint:disable-next-line: no-string-literal
      self['newClientChecker']();
      if (env.domains || !Array.isArray(e.data.domains) || !e.data.hostname) { return; }
      verInfo = e.data.versionInfo;
      env.domains = [];
      env.hostname = e.data.hostname;
      for (const domain of e.data.domains) {
        if (env.domains.indexOf(domain) === -1) { env.domains.push(domain); }
      }
      if (Array.isArray(e.data.defaultCache) && e.data.defaultCache.length > 0) {
        caches.open(cacheName).then(cache => {
          // tslint:disable-next-line: no-console
          console.log('%c[Ganymede SW]', 'color:#de00ff;', 'caching all default caches...');
          cache.addAll(e.data.defaultCache);
        });
      }
    }
  }
});
