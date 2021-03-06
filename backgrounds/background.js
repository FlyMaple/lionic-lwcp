(function () {
    'use strict';

    var wcfMap = {"10000":"Pornography","11000":"Nudity and Potentially Adult Content","12000":"Gambling and Lottery","13000":"Alcohol and Tobacco","14000":"Abused Drug","15000":"Ultraism","16000":"Abortion","17000":"Criminal Actions","18000":"Violence and Bloody","19000":"Gross","20000":"Games","21000":"Instant Messaging","22000":"Dating","23000":"Social Network","24000":"Web Chat Room","25000":"Shopping and Auction","26000":"Music","27000":"Comics and Anime","28000":"Entertainment and Arts","29000":"Streaming and VoIP","30000":"Peer to Peer","31000":"Multimedia Download","32000":"Online Sharing and Storage","33000":"Shareware and Freeware","34000":"Web Mail","35000":"System and Antivirus Update","36000":"Content Delivery Network","37000":"Web Service API","38000":"Network Service","39000":"Remote Control","40000":"Proxy and Anonymizers","41000":"Phishing and Fraud","42000":"Malware","43000":"BlackHat SEO Sites","44000":"Malicious APPs","45000":"Advertisments and Pop-Ups","46000":"Portals and Search Engines","47000":"Transportation","48000":"Real Estate","49000":"Finance and Insurance","50000":"Computers and Information Technology","51000":"Business and Service","52000":"Reference and Research","53000":"Education","54000":"Military and Weapons","55000":"Politics and Government","56000":"Associations and Charitable Organizations","57000":"Travel","58000":"Food and Drink","59000":"Home and Garden","60000":"Health and Medicine","61000":"Religion and Numerology","62000":"Sports","63000":"Automobile and Vehicles","64000":"Job Search","65000":"News and Media","66000":"Forums and Newsgroups","67000":"Blogs and Personal Sites","68000":"Unrated","69000":"Parking Domains","70000":"Dead Sites","71000":"Private IP Addresses"};

    var _options, _lastSuggestCate, _suggestDomains;

    var _tabs = chrome.tabs;
    var _runtime = chrome.runtime;
    var _extension = chrome.extension;

    /** Listener */
    function RtOnMessage(message, sender, sendResponse) {
        if (message.action === 'init') {
            if (sender.tab.url.indexOf('http') === 0) {
                _tabs.sendMessage(sender.tab.id, { 
                    action: 'TabInit',
                    tabId: sender.tab.id,
                    options: _options,
                    isDisable: checkIsDisabled(sender.tab.url)
                }, function (resp) {
                    
                });
            }
        } else if (message.action === 'HideIfr') {
            _tabs.sendMessage(sender.tab.id, { action: 'HideIfr', tabId: sender.tab.id });
        } else if (message.action === 'analysis') {
            analysis(sender.tab);
        } else if (message.action === 'suggest') {
            suggest(sender.tab, message.cate, message.email);
        } else if (message.action === 'getWCFMap') {
            //  2016-10-18
            _tabs.sendMessage(sender.tab.id, { action: 'getWCFMapComplete', wcfMap: wcfMap });
        } else if (message.action === 'getOptions') {
            _tabs.sendMessage(sender.tab.id, { action: 'getOptionsComplete', options: _options });
        } else if (message.action === 'clearTimeout') {
            _tabs.sendMessage(sender.tab.id, { action: 'clearTimeout', reset: message.reset });
        } else if (message.action === 'hideToolbar') {
            _tabs.query({active: true, currentWindow: true}, function (tab) {
                _tabs.sendMessage(tab[0].id, { action: 'hideToolbar' });
            });
        } else if (message.action === 'showToolbar') {
            _tabs.query({active: true, currentWindow: true}, function (tab) {
                _tabs.sendMessage(tab[0].id, { action: 'showToolbar' });
            });
        } else if (message.action === 'checkToolbarStatus') {
            _tabs.query({active: true, currentWindow: true}, function (tab) {
                if (tab[0].url.indexOf('http') === 0) {
                    var isDisable = checkIsDisabled(tab[0].url);
                    _tabs.sendMessage(tab[0].id, { action: 'checkToolbarStatus', isDisable: isDisable }, sendResponse);
                } else {
                    return false;
                }
            });
            return true;
        } else if (message.action === 'disableToolbar') {
            _tabs.query({active: true, currentWindow: true}, function (tab) {
                setDisableToolbarUrl(tab[0].url);
                _tabs.sendMessage(tab[0].id, { action: 'disableToolbar' });
            });
        } else if (message.action === 'enableToolbar') {
            _tabs.query({active: true, currentWindow: true}, function (tab) {
                setEnableToolbarUrl(tab[0].url);
                _tabs.sendMessage(tab[0].id, { action: 'enableToolbar' });
            });
        }
    }

    function RtOnUpdate(details) {
        chrome.storage.local.set({'LWCP': {
            options: _options,
            lastSuggestCate: _lastSuggestCate,
            suggestDomains: _suggestDomains,
            details: details
        }});
    }

    function TabActivated(activeInfo) {
        _tabs.get(activeInfo.tabId, function (tab) {
            if (tab.url.indexOf('http') === 0) {
                if (_options.redisplay) {
                    _tabs.sendMessage(tab.id, { action: 'TabActivated', isDisable: checkIsDisabled(tab.url) });
                }
            }
        });
    }

    /** Function */
    function analysis(tab) {
        if (tab.url.indexOf('http') === 0) {
            chrome.identity.getProfileUserInfo(function (info) {
                var ts = Math.floor(Date.now()/1000);
                var uid = info.id || 'guest';

                $.ajax({
                    url: 'https://ufs.lionic.com:8084/api/v1/toolbar_user/' + uid + '/query',
                    type: 'post',
                    dataType: 'json',
                    data: JSON.stringify({
                        "ts": ts,
                        "cid": "ChromeToolbar",
                        "url": decodeURI(tab.url.split('#')[0]),
                        "sig": getSig(ts + ':' + uid + ':' + decodeURI(tab.url.split('#')[0]))
                    }),
                    success: function (r) {
                        _tabs.sendMessage(tab.id, {
                            action: 'analysisComplete', 
                            cate: transformText(r.data.cat),
                            lastSuggestCate: _lastSuggestCate,
                            isSuggested: checkSuggested(tab.url)
                        });
                    }, 
                    error: function (r) {
                        console.log('AnalysisError:');
                        console.log(r);
                    }
                });
            });
        }
    }

    function suggest(tab, cate, email) {
        chrome.identity.getProfileUserInfo(function (info) {
            var ts = Math.floor(Date.now()/1000);
            var uid = info.id || 'guest';

            $.ajax({
                url: 'https://ufs.lionic.com:8084/api/v1/toolbar_user/' + uid + '/suggest',
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    "ts": ts,
                    "cid": "ChromeToolbar",
                    "url": decodeURI(tab.url),
                    "sig": getSig(ts + ':' + uid + ':' + decodeURI(tab.url)),
                    "sug_cat": parseInt(cate),
                    "email": email
                }),
                success: function (r) {
                    addSuggestDomainList(tab.url); //  2016-10-18
                    setLastTimeSuggestCate(parseInt(cate)); //  2016-10-18
                    _tabs.sendMessage(tab.id, { action: 'SuggestComplete' });
                }, 
                error: function (r) {
                    console.log('SuggestError:');
                    console.log(r);
                    _tabs.sendMessage(tab.id, { action: 'SuggestError' });
                }
            });
        });
    }

    function transformText(cates) {
        var new_cates = [];
        if (cates.length === 1) {
            if (cates[0] === 0) {
                new_cates.push({ number: cates[0], text: 'unknown' });
            } else {
                new_cates.push({ number: cates[0], text: wcfMap[cates[0]] });
            }
            return new_cates;
        } else {
            for (var i=0; i<cates.length; i++) {
                new_cates.push({
                    number: cates[i],
                    text: wcfMap[cates[i]]
                });
            }
        }
        return new_cates;
    }

    function getSig(hmacText) {
        var shaObj = new jsSHA('SHA-1', "TEXT");
        shaObj.setHMACKey("62131fc9d12cd6173a18", "TEXT");
        shaObj.update(hmacText);

        return shaObj.getHMAC("B64");
    }

    function setOptions() {
        chrome.storage.local.get('LWCP', function (storage) {
            var LWCP = storage.LWCP;
            if (LWCP === undefined) {
                _options = {
                    auto_hide: true,
                    redisplay: true,
                    email: '',
                    disableUrls: [],
                    position: 'top',
                    lastSuggestCate: -1
                };
                _suggestDomains = [];
            } else {
                _options = LWCP.options;
                _lastSuggestCate = LWCP.lastSuggestCate; 
                _suggestDomains = LWCP.suggestDomains || [];
            }
        });
    }

    //  2016-10-18
    function setLastTimeSuggestCate(cate) {
        chrome.storage.local.set({'LWCP': {
            options: _options,
            lastSuggestCate: cate,
            suggestDomains: _suggestDomains
        }});
    }

    //  2016-10-18
    function addSuggestDomainList(url) {
        var domain = (new URL(url)).hostname;

        _suggestDomains.push(domain);
        chrome.storage.local.set({'LWCP': {
            options: _options,
            lastSuggestCate: _lastSuggestCate,
            suggestDomains: _suggestDomains
        }});
    }

    //  2016-10-18
    function checkSuggested(url) {
        var domain = (new URL(url)).hostname;
        var finded = _suggestDomains.find(function (e, i) {
             return (e === domain);
        });

        if (finded) {
            return true;
        }

        return false;
    }

    function setDisableToolbarUrl(url) {
        _options.disableUrls.push(url.split('#')[0]);
        chrome.storage.local.set({'LWCP': {
            options: {
                auto_hide: _options.auto_hide,
                redisplay: _options.redisplay,
                email: _options.email,
                disableUrls: _options.disableUrls,
                position: _options.position
            },
            lastSuggestCate: _lastSuggestCate,
            suggestDomains: _suggestDomains
        }});
    }

    function setEnableToolbarUrl(url) {
        var idx;
        if ((idx = _options.disableUrls.indexOf(url.split('#')[0])) !== -1) {
            _options.disableUrls.splice(idx, 1);
            chrome.storage.local.set({'LWCP': {
                options: {
                    auto_hide: _options.auto_hide,
                    redisplay: _options.redisplay,
                    email: _options.email,
                    disableUrls: _options.disableUrls,
                    position: _options.position
                },
                lastSuggestCate: _lastSuggestCate,
                suggestDomains: _suggestDomains
            }});
        }
    }

    function checkIsDisabled(url) {
        if (_options.disableUrls.indexOf(url.split('#')[0]) !== -1) {
            return true;
        }
        return false;
    }
    
    setOptions();
    _tabs.onActivated.addListener(TabActivated);
    _runtime.onMessage.addListener(RtOnMessage);
    _runtime.onUpdateAvailable.addListener(RtOnUpdate);
    chrome.storage.onChanged.addListener(setOptions);
})();