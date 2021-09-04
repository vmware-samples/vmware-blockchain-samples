var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var env = {};
var envPrepare = function () {
    var nv = navigator;
    var ua = nv.userAgent;
    var ual = ua.toLowerCase();
    var nptu = nv.platform.toUpperCase();
    var hn = location.hostname;
    var uas = ua.split(' ');
    var uae = uas[uas.length - 1];
    function mobileCheck() {
        var check = false;
        // tslint:disable-next-line: max-line-length
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            check = true;
        } })(
        // tslint:disable-next-line: no-string-literal
        ua || nv.vendor || window['opera']);
        return check;
    }
    function getBrowser() {
        var tem;
        var M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
            return { name: 'IE', version: (tem[1] || '') };
        }
        if (M[1] === 'Chrome') {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem !== null) {
                return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        tem = ua.match(/version\/(\d+)/i);
        if (tem !== null) {
            M.splice(1, 1, tem[1]);
        }
        return { name: M[0], version: M[1] };
    }
    // OS Detect
    var browserInfo = getBrowser();
    browserInfo.version = parseInt(browserInfo.version, 10);
    env.isMac = nptu.indexOf('MAC') !== -1;
    if (env.isMac) {
        env.os = 'mac';
    }
    env.isWindows = nptu.indexOf('WIN') !== -1;
    if (env.isWindows) {
        env.os = 'win';
    }
    env.isLinux = nptu.indexOf('LINUX') !== -1;
    if (env.isLinux) {
        env.os = 'linux';
    }
    env.isAndroid = nptu.indexOf('ANDROID') !== -1;
    if (env.isAndroid) {
        env.os = 'andro';
    }
    env.isIX = (ua.match(/(iPad|iPhone|iPod)/g) ? true : false);
    if (env.isIX) {
        env.os = 'ios';
    }
    env.isIXWebApp = false; // (_nptu.standalone == true);
    env.isIPhone = (ua.match(/(iPhone|iPod)/g) ? true : false);
    env.isIPad = (ua.match(/(iPad)/g) ? true : false);
    env.isMobile = mobileCheck();
    if (!env.os) {
        env.os = 'other';
    }
    // Browser Detect
    env.isFirefox = uae.indexOf('Firefox/') >= 0;
    if (env.isFirefox) {
        env.browser = 'firefox';
    }
    env.isSafari = (nv.vendor === 'Apple Computer, Inc.');
    if (env.isSafari) {
        env.browser = 'safari';
    }
    env.isBadSafari = (env.isIX && env.isSafari && browserInfo.version < 10);
    env.isWeirdSafari = (env.isBadSafari && !env.isIXWebApp);
    env.isChrome = ua.indexOf(' Chrome/') >= 0;
    if (env.isChrome) {
        env.browser = 'chrome';
    }
    env.isEdge = (ua.match(/(Edge)/g) ? true : false);
    if (env.isEdge) {
        env.browser = 'edge';
    }
    env.isIE = (ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0) && !env.isChrome && !env.isFirefox && !env.isSafari && !env.isEdge;
    if (!env.browser) {
        env.browser = 'other';
    }
};
envPrepare();
var verInfo = {};
var installFunc;
var installFunc0 = function (e) { if (installFunc) {
    installFunc(e);
} };
var fetchFunc;
var fetchFunc0 = function (e) { if (fetchFunc) {
    fetchFunc(e);
} };
var urlInfoCache = {};
var getUrlInfo = function (url) {
    if (urlInfoCache[url] && Date.now() - urlInfoCache[url].t < 86400000) {
        return urlInfoCache[url];
    }
    var info = { t: Date.now() };
    var oriUrl = url;
    info.hashedVersion = '';
    info.isAPI = oriUrl.startsWith('/api/') || oriUrl.indexOf('?t=') >= 0 || oriUrl.endsWith('.json');
    if (url.indexOf('___') >= 0) {
        info.hashedVersion = url.split('___')[1];
        url = url.split('___')[0];
    }
    var urlSplit = url.split('/');
    var protocol = urlSplit[0].split(':')[0];
    urlSplit.shift();
    urlSplit.shift();
    info.hostname = urlSplit[0].split(':')[0];
    var pathSplit = [];
    if (urlSplit.length > 1) {
        pathSplit = urlSplit;
        urlSplit.shift();
    }
    info.path = '/' + pathSplit.join('/');
    info.filename = pathSplit[pathSplit.length - 1];
    if (info.filename.indexOf('?') >= 0) {
        info.filename = info.filename.split('?')[0];
    }
    if (info.filename.indexOf('#') >= 0) {
        info.filename = info.filename.split('#')[0];
    }
    if (info.filename.indexOf('@') >= 0) {
        info.filename = info.filename.split('@')[0];
    }
    var path = '/' + pathSplit.join('/');
    var hash = '';
    if (path.indexOf('#') >= 0) {
        hash = path.split('#')[1];
        path = path.split('#')[0];
    }
    var target = '';
    if (path.indexOf('@') >= 0) {
        target = path.split('@')[1];
        path = path.split('@')[0];
    }
    var params = '';
    if (path.indexOf('?') >= 0) {
        var lit = path.split('?');
        path = lit[0];
        params = lit[1];
    }
    info.pathClean = path;
    info.basicStatic = (info.pathClean.startsWith('/assets/')
        || info.pathClean.startsWith('/assets-root/')
        || info.pathClean.indexOf('-static-') >= 0
        || info.pathClean.indexOf('bstatic') >= 0);
    info.directory = info.pathClean.replace(info.filename, '');
    info.paramsBase64 = params ? btoa(params) : '';
    var psplit = (info.filename.indexOf('_v') >= 0) ? info.filename.split('_v') : [info.filename];
    var pEnd = (info.filename.indexOf('_v') >= 0) ? '_v' + psplit[psplit.length - 1] : info.filename;
    info.extension = (info.filename.split('.').length === 1) ? '' : info.filename.split('.')[info.filename.split('.').length - 1];
    info.version = (pEnd.indexOf('_v') === 0) ? pEnd.split('_v')[1].split('.')[0] : '';
    info.filekey = info.version ? info.filename.replace('_v' + info.version, '') : info.filename;
    var script_host_split = env.hostname.split('.').reverse();
    var script_rpath = script_host_split.join('.');
    var script_host_length = script_host_split.length;
    var domainLevel = info.hostname.split('.');
    var hostSplit = info.hostname.split('.').reverse();
    info.hostnamePathR = hostSplit.join('.');
    info.samehost = (env.hostname === info.hostname);
    info.subdomain = false;
    info.sibling = false;
    info.subname = '';
    if (info.samehost) {
        info.subdomain = info.sibling = false;
    }
    else {
        var mismatchCount = 0;
        var matchArr = [];
        for (var i = 0; i < script_host_length; ++i) {
            if (hostSplit[i] !== script_host_split[i]) {
                ++mismatchCount;
                matchArr.push(false);
            }
            else {
                matchArr.push(true);
            }
        }
        if (mismatchCount === 0) {
            info.subdomain = true;
        }
        else if (mismatchCount === 1 && matchArr[matchArr.length - 1] === false) {
            info.sibling = true;
        }
        if (info.subdomain) {
            for (var i = 0; i < script_host_length && hostSplit.length > 0; ++i) {
                hostSplit.shift();
            }
            info.subname = hostSplit.join('.');
        }
    }
    var vInfo = info.paramsBase64 + info.version;
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
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
var clientWindows = {};
var cacheMap = null;
var cacheName = 'ganymedeServiceWorker';
var basicFiles = false ? [] : [];
var clientslog = function (msg) {
    for (var _i = 0, _a = Object.keys(clientWindows); _i < _a.length; _i++) {
        var cid = _a[_i];
        // tslint:disable-next-line: no-console
        try {
            clientWindows[cid].target.postMessage(msg);
        }
        catch (e) {
            console.log(e);
        }
    }
};
// tslint:disable-next-line: no-string-literal
self['newClientChecker'] = function () {
    skipWaiting();
    // tslint:disable-next-line: no-console
    // try { self.clients.claim(); } catch (e) { console.log(e); }
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (matchedClients) {
        if (matchedClients && matchedClients.length) {
            for (var _i = 0, _a = Object.keys(clientWindows); _i < _a.length; _i++) {
                var cid = _a[_i];
                clientWindows[cid].checked = false;
            }
            var announce = function (client, cid) { client.postMessage('GanymedeSW::ACK ' + cid); };
            for (var _b = 0, matchedClients_1 = matchedClients; _b < matchedClients_1.length; _b++) {
                var client = matchedClients_1[_b];
                // if (!client.focused) { continue; }
                var cid = client.id;
                if (!clientWindows[cid]) {
                    clientWindows[cid] = { mapped: false, target: client };
                    try {
                        announce(client, cid);
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                clientWindows[cid].checked = true;
            }
            for (var _c = 0, _d = Object.keys(clientWindows); _c < _d.length; _c++) {
                var cid = _d[_c];
                if (!clientWindows[cid].checked) {
                    delete clientWindows[cid];
                }
            }
        }
    });
};
// tslint:disable-next-line: no-unused-expression
(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        fetchFunc = function (e) {
            try {
                if (!env.domains || !env.hostname) {
                    return false;
                }
                var url = e.request.url;
                var oriUrl = url;
                var info_1 = getUrlInfo(url);
                if (info_1.extension === 'mp4') { // mp4 caching can only be supported on Chrome & FF
                    if (info_1.basicStatic && (env.isChrome || env.isFirefox)) { }
                    else {
                        // tslint:disable-next-line: no-console
                        console.log(e.request);
                        return false;
                    }
                }
                // tslint:disable-next-line: no-console
                // if(isDev) console.log(info);
                if (info_1.isAPI) {
                    return false;
                } // don't cache API
                if (!info_1.extension) {
                    return false;
                } // don't cache no extension path
                if (info_1.extension === 'js' && info_1.hostname.indexOf('localhost') >= 0) {
                    // excuse Angular sources
                    switch (info_1.filename) {
                        case 'runtime.js':
                        case 'polyfills.js':
                        case 'styles.js':
                        case 'scripts.js':
                        case 'vendor.js':
                        case 'main.js':
                            return false;
                    }
                }
                if (info_1.extension === 'cookie') {
                    return false;
                } // don't cache .cookie acceess
                var targetUrl_1 = oriUrl;
                var g = info_1.samehost || info_1.sibling;
                var statres = (info_1.samehost && info_1.directory.startsWith('/assets/') || info_1.directory.startsWith('/assets-root/'))
                    || info_1.basicStatic;
                var s3 = (info_1.hostname.indexOf('.amazonaws.com') >= 0 && info_1.hostname.indexOf('s3') >= 0);
                targetUrl_1 = info_1.pathkey;
                // console.log(info.url, g, s3, statres);
                if (!g && !s3 && !statres) {
                    return false;
                }
                var fetchParam_1 = { cache: 'no-cache', mode: 'cors', redirect: 'manual' };
                // if (g) { fetchParam.credentials = 'include'; }
                e.respondWith(caches.match(targetUrl_1).then(function (r) {
                    if (r) {
                        return r;
                    }
                    return r || fetch(e.request.url, fetchParam_1).then(function (response) {
                        if (response.type === 'opaqueredirect') {
                            return response;
                        }
                        return (response.status !== 200) ? response : caches.open(cacheName).then(function (cache) {
                            if (!info_1.samehost || info_1.basicStatic) {
                                cache.keys().then(function (names) {
                                    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                                        var name_1 = names_1[_i];
                                        var nameInfo = getUrlInfo(name_1.url);
                                        // tslint:disable-next-line: no-console
                                        if (nameInfo.version) {
                                            console.log(nameInfo);
                                        }
                                        if (nameInfo.pathkeyFront === info_1.pathkeyFront) {
                                            cache["delete"](name_1);
                                        }
                                    }
                                });
                                cache.put(targetUrl_1, response.clone());
                                // tslint:disable-next-line: no-console
                                console.log('%c[Ganymede SW]', 'color:#de00ff;', 'New cached file: ' + info_1.path);
                            }
                            return response;
                        });
                    });
                }));
            }
            catch (e) {
                // tslint:disable-next-line: no-console
                console.log(e);
                return false;
            }
        };
        installFunc = function (e) {
            // skipWaiting();
            e.waitUntil(caches.open(cacheName).then(function (cache) {
                // tslint:disable-next-line: no-console
                console.log('%c[Ganymede SW]', 'color:#de00ff;', 'caching all basic static files...');
                cache.addAll(basicFiles);
            }));
        };
        return [2 /*return*/];
    });
}); })();
self.addEventListener('message', function (e) {
    if (env.domains) {
        var sourceDomain = e.origin.indexOf('https://') >= 0 ? e.origin.split('https://')[1] : e.origin.split('http://')[1];
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
            if (env.domains || !Array.isArray(e.data.domains) || !e.data.hostname) {
                return;
            }
            verInfo = e.data.versionInfo;
            env.domains = [];
            env.hostname = e.data.hostname;
            for (var _i = 0, _a = e.data.domains; _i < _a.length; _i++) {
                var domain = _a[_i];
                if (env.domains.indexOf(domain) === -1) {
                    env.domains.push(domain);
                }
            }
            if (Array.isArray(e.data.defaultCache) && e.data.defaultCache.length > 0) {
                caches.open(cacheName).then(function (cache) {
                    // tslint:disable-next-line: no-console
                    console.log('%c[Ganymede SW]', 'color:#de00ff;', 'caching all default caches...');
                    cache.addAll(e.data.defaultCache);
                });
            }
        }
    }
});
