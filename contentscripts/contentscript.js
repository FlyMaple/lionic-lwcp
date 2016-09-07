(function () {
    'use strict';

    var _runtime = chrome.runtime;
    var _extension = chrome.extension;
    var _storage = chrome.storage;
    var _tabId;
    var _options;
    var _tId;

    function RtOnMessage(message, sender, sendResponse) {
        if (message.action === 'TabInit') {
            _tabId = message.tabId;
            _options = message.options
            appendLWCP();
        } else if (message.action === 'HideIfr') {
            $('#LWCP-ifr').fadeOut();
        } else if (message.action === 'TabActivated') {
            appendLWCP();
        } else if (message.action === 'getOptionsComplete') {
            _options = message.options
        } else if (message.action === 'clearTimeout') {
            clearTimeout(_tId);
            if (message.reset) {
                setIfrTimeout();
            }
        } else if (message.action === 'hideToolbar') {
            $('#LWCP-ifr').fadeOut();
        } else if (message.action === 'showToolbar') {
            $('#LWCP-ifr').fadeIn();
        } else if (message.action === 'checkToolbarStatus') {
            var isVisible = $('#LWCP-ifr').is(':visible');
            sendResponse({ isVisible: isVisible, isDisable: message.isDisable });
        } else if (message.action === 'disableToolbar') {
            $('#LWCP-ifr').fadeOut();
        } else if (message.action === 'enableToolbar') {
            $('#LWCP-ifr').hide().removeClass('disabled').fadeIn();
        }
    }

    function appendLWCP() {
        setTimeout(function () {
            $('#LWCP-ifr').remove();

            var $ifr = $('<iframe id="LWCP-ifr" src="' + _extension.getURL('contentscripts/lwcp/lwcp.html') + '"></iframe>').hide();
            if (_options.isDisable) {
                $ifr.addClass('disabled');
            }
            if($('#bcbar').length === 1) {
                if ($('#bcbar').hasClass('top')) {
                    $ifr.addClass('w-top');
                } else {
                    $ifr.addClass('w-bottom');
                }
            } else {
                if (_options.position === 'bottom') {
                    $ifr.addClass('bottom');
                } else {
                    $ifr.addClass('top');
                }
            }
            $('body').append($ifr);
            $ifr.fadeIn();

            setIfrTimeout();
        }, 0);
    }

    function setIfrTimeout() {
        if (_options.auto_hide) {
            _tId = setTimeout(function () {
                $('#LWCP-ifr').fadeOut();
            }, 5000);
        }
    }

    _runtime.sendMessage({ action: 'init' });
    _runtime.onMessage.addListener(RtOnMessage);
})();