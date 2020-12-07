$(function () {
    $('[data-toggle="popover"]').popover();

    $('[data-toggle=iframe-popover]').each(function (e) {

        var src = $(this).data('iframe-link');

        $(this).popover({
            html: true,
            content: function () {
                return $('<iframe height="420" width="500" border="0"></iframe>' +
                    '').attr('src', src)

            },
            title: function () {
                return $('<span><i class="fas fa-binoculars mr-1"></i>Semantic link preview</span><a href="' + src + '" target="_blank" class="float-right text-primary"><i class="fas fa-external-link-alt mr-1"></i> Open in new tab</a>')

            },

            trigger: 'focus',
            placement: 'auto',
        });

        $(this).click(function (e) {
            e.preventDefault();
        });

    });

})
