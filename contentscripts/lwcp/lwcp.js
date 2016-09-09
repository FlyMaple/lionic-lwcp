(function () {
    'use strict';

    var _runtime = chrome.runtime;
    var _suggesting = false;

    $(document).ready(function () {
        _runtime.sendMessage({ action: 'getWCFMap' });

        $('body').on('click', BodyClicked);
        $('.suggest .text').on('click', viewSwitch);
        $('.btn-group .submit').on('click', SuggestSubmit);
        $('.btn-group .close').on('click', viewSwitch);
        $('.suggest img').on('click', HideLWCP);

        render();
        analysis();

        _runtime.onMessage.addListener(RtOnMessage)
    });

    /** Listener */
    function RtOnMessage(message, sender, sendResponse) {
        if (message.action === 'analysisComplete') {
            var cateStr = '';
            for (var i=0; i<message.cate.length; i++) {
                var cate = message.cate[i];
                if (i === 0) {
                    cateStr = cate.text;
                } else {
                    cateStr += ', ' + cate.text;
                }
            }
            $('.category').text(cateStr);
            $('.category-select').val(message.cate[0].number);
        } else if (message.action === 'getWCFMapComplete') {
            generateCategoryOptions(message.wcfMap);
        } else if (message.action === 'SuggestComplete') {
            $('.btn-group .submit').attr('disabled', true);
            $('.message').removeClass('invaild error').addClass('success');
        } else if (message.action === 'SuggestError') {
            $('.message').removeClass('success invaild').addClass('error');
        }
    }

    function SuggestSubmit() {
        var email = $('.email').val();
        if ( ! email || ! email.trim() || ! email.match(/.+@.+\..+/)) {
            $('.message').removeClass('success error').addClass('invaild');
        } else {
            _runtime.sendMessage({ action: 'suggest', cate: $('.category-select').val(), email: email });
        }
    }

    function HideLWCP() {
        _runtime.sendMessage({ action: 'HideIfr' });
    }

    function BodyClicked() {
        if (!_suggesting) {
            _runtime.sendMessage({ action: 'clearTimeout', reset: true });
        }
    }

    /** Function */
    function generateCategoryOptions(wcfMap) {
        var wcfsorts = []; 
        for (var k in wcfMap) {
            if (wcfMap.hasOwnProperty(k)) {
                wcfsorts.push(wcfMap[k] + '::' + k);
            }
        }
        wcfsorts.sort(function (item1, item2) {
            if ( item1 < item2 )
                return -1;
            if ( item1 > item2 )
                return 1;
            return 0;
        });

        for (var i = 0; i < wcfsorts.length; i++) {
            var text = wcfsorts[i].split('::')[0];
            var val = wcfsorts[i].split('::')[1];
            var $option = $('<option value="' + val + '">' + text + '</option>')
            $('.category-select').append($option);
        }
    }

    function analysis() {
        _runtime.sendMessage({ action: 'analysis' });
    }

    function viewSwitch(ev) {
        ev.stopPropagation();

        var $suggest = $('.LWCP-wrapper .suggest .text');
        var $readonly = $('.LWCP-wrapper .readonly');
        var $editable = $('.LWCP-wrapper .editable');

        if ($readonly.is(':visible')) {
            $suggest.hide();
            $readonly.fadeOut(function () {
                $editable.fadeIn().css({ display: 'inline-block' });
            });
            
            _suggesting = true
            _runtime.sendMessage({ action: 'clearTimeout', reset: false });
        } else {
            $suggest.show();
            $editable.fadeOut(function () {
                $readonly.fadeIn().css({ display: 'inline-block' });
            });
            _suggesting = false
            _runtime.sendMessage({ action: 'clearTimeout', reset: true });
        }
    }

    function render() {
        chrome.storage.local.get('LWCP', function (storage) {
            var LWCP = storage.LWCP;
            var options;
            if (LWCP === undefined) {
                options = {
                    auto_hide: true,
                    redisplay: true,
                    email: ''
                };
            } else {
                options = LWCP.options;
            }

            $('#email').val(options.email)
        });
    }
})();