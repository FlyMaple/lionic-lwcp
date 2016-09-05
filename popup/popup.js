(function (jQuery) {
    var _runtime = chrome.runtime;

    jQuery(document).ready(function () {
        jQuery('.nav .hide').on('click', hideToolbar);
        jQuery('.nav .show').on('click', showToolbar);
        jQuery('.nav .disable').on('click', disableToolbar);
        jQuery('.nav .enable').on('click', enableToolbar);
        jQuery('.nav .about').on('click', aboutLWCP);
        jQuery('.nav .help').on('click', help);

        _runtime.sendMessage({ action: 'checkToolbarStatus' }, checkToolbarStatusComplete);
    });

    function checkToolbarStatusComplete(status) {
        if (status && status.isDisable) {
            jQuery('.nav .enable').show();
        } else {
            if (status.isVisible) {
                jQuery('.nav .hide').show();
            } else {
                jQuery('.nav .show').show();
            }
            jQuery('.nav .disable').show();
        }
    }

    function hideToolbar() {
        jQuery(this).hide();
        _runtime.sendMessage({ action: 'hideToolbar' });
        jQuery('.nav .show').show();
    }

    function showToolbar() {
        jQuery(this).hide();
        _runtime.sendMessage({ action: 'showToolbar' });
        jQuery('.nav .hide').show();
    }

    function disableToolbar() {
        jQuery(this).hide();
        _runtime.sendMessage({ action: 'disableToolbar' });
        jQuery('.nav .hide').hide();
        jQuery('.nav .show').hide();
        jQuery('.nav .enable').show();
    }

    function enableToolbar() {
        jQuery(this).hide();
        _runtime.sendMessage({ action: 'enableToolbar' });
        _runtime.sendMessage({ action: 'showToolbar' });
        jQuery('.nav .hide').show();
        jQuery('.nav .disable').show();
    }

    function aboutLWCP() {
		open('https://github.com/FlyMaple/lionic-lwcp');
    }

    function help() {
        open('https://github.com/FlyMaple/lionic-lwcp/issues');
    }
})($);