(function () {
    'use strict';

    var _runtime = chrome.runtime;
    var _extension = chrome.extension;
    var _storage = chrome.storage;
    var _tabId;
    var _options;
    var _tId;

    function RtOnMessage(message, sender, sendResponse) {
        if (message.action === 'TabComplete') {
            _tabId = message.tabId;
            _options = message.options
            appendLWCP(message.isDisable);
        } else if (message.action === 'HideIfr') {
            $('#LWCP-ifr').fadeOut();
        } else if (message.action === 'TabActivated') {
            appendLWCP(message.isDisable);
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

    function appendLWCP(isDisable) {
        $('#LWCP-ifr').remove();

        var disableClassName = '';
        if (isDisable) {
            disableClassName = 'disabled';
        }

        var $ifr = $('<iframe id="LWCP-ifr" class="' + disableClassName + '" src="' + _extension.getURL('contentscripts/lwcp/lwcp.html') + '"></iframe>').hide();
        $('body').append($ifr);
        $ifr.fadeIn();

        setIfrTimeout();
    }

    function setIfrTimeout() {
        if (_options.auto_hide) {
            _tId = setTimeout(function () {
                $('#LWCP-ifr').fadeOut();
            }, 3000);
        }
    }

    _runtime.onMessage.addListener(RtOnMessage);
})();