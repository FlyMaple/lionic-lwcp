(function (jQuery) {
    window._options;

    jQuery(document).ready(function () {
        function LeftMenuClick(ev) {
            jQuery('.LWCP-Options-wrapper .body .left .menu li').removeClass('active');

            if (this.className.indexOf('common') !== -1) {
                jQuery('.LWCP-Options-wrapper .body .right .container .common').show();
                jQuery('.LWCP-Options-wrapper .body .right .container .advance').hide();
            } else if (this.className.indexOf('advance') !== -1) {
                jQuery('.LWCP-Options-wrapper .body .right .container .common').hide();
                jQuery('.LWCP-Options-wrapper .body .right .container .advance').show();
            }
            $(this).addClass('active');
        }

        function GroupClicked() {
            var $group = jQuery(this);
            var $checkbox = $group.find('.checkbox');
            if ($checkbox.length > 0) {
                if ($group.hasClass('checked')) {
                    $group.removeClass('checked');
                } else {
                    $group.addClass('checked');
                }
            }
        }

        function loadLocaleData() {
            chrome.storage.local.get('LWCP', function (sotrage) {
                var LWCP = sotrage.LWCP;
                if (LWCP === undefined) {
                    window._options = {
                        auto_hide: true,
                        redisplay: true,
                        email: '',
                        disableUrls: []
                    }
                } else {
                    window._options = sotrage.LWCP.options;
                }
                render();
            });
        }

        function render() {
            jQuery('#auto_hide').toggleClass('checked', window._options.auto_hide);
            jQuery('#redisplay').toggleClass('checked', window._options.redisplay);
            jQuery('#email').val(window._options.email);
        }

        function Save() {
            chrome.storage.local.set({'LWCP': {
                options: {
                    auto_hide: jQuery('#auto_hide').hasClass('checked'),
                    redisplay: jQuery('#redisplay').hasClass('checked'),
                    email: jQuery('#email').val(),
                    disableUrls: window._options.disableUrls || []
                }
            }}, function () {
                jQuery('#save_restore_message').addClass('success');
                setTimeout(function () {
                    jQuery('#save_restore_message').fadeOut(function () {
                        $(this).removeClass('success').show();
                    })
                }, 2000);
            });
        }

        jQuery('.LWCP-Options-wrapper .body .left .menu li').on('click', LeftMenuClick);
        jQuery('.LWCP-Options-wrapper .body .right .container .settings li .group').on('click', GroupClicked);
        jQuery('#save').on('click', Save);
        jQuery('#restore').on('click', loadLocaleData);

        loadLocaleData();
    });
})($);