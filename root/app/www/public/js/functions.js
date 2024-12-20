function toast(title, message, type)
{
    const uniqueId = Date.now() + Math.floor(Math.random() * 1000);

    let toast  = '';
    let border = 'info';

    if (type == 'error') {
        border = 'danger';
    }
    if (type == 'success') {
        border = 'success';
    }

    toast += '<div id="toast-' + uniqueId + '" class="toast text-white bg-' + border + '" data-autohide="false">';
    toast += '  <div class="toast-header text-white bg-' + border + '">';
    toast += '      <i class="far fa-bell text-white me-2"></i>';
    toast += '      <strong class="me-auto">' + title + '</strong>';
    toast += '      <small>' + type + '</small>';
    toast += '      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>';
    toast += '  </div>';
    toast += '  <div class="toast-body">' + message + '</div>';
    toast += '</div>';

    $('.toast-container').append(toast);
    $('#toast-' + uniqueId).toast('show');

    setTimeout(function () {
        $('#toast-' + uniqueId).remove();
    }, 10000);

}
// -------------------------------------------------------------------------------------------
function dialogOpen(p)
{
    const id        = p.id;
    const title     = p.title ? p.title : '&nbsp;';
    const body      = p.body ? p.body : '&nbsp;';
    const footer    = p.footer ? p.footer : '&nbsp;';
    const close     = typeof p.close === 'undefined' ? true : p.close;
    const size      = p.size ? p.size : ''; //-- sm, lg, xl, xxl
    const escape    = typeof p.escape === 'undefined' ? false : p.escape;
    const minimize  = typeof p.minimize === 'undefined' ? false : p.minimize;

    if (typeof id === 'undefined') {
        console.log('Error: Called dialogOpen with no id parameter');
        return;
    }

    if ($('#' + id).length) {
        $('#' + id).remove();
    }

    //-- CLONE IT
    $('#dialog-modal').clone().appendTo('#dialog-modal-container').prop('id', id);

    //-- USE THE CLONE
    $('#' + id).modal({
        keyboard: false,
        backdrop: 'static'
    });

    if (escape) {
        $('#' + id).attr('data-escape-close', 'true');
    }

    $('#' + id + ' .modal-title').html(title);
    $('#' + id + ' .modal-body').html(body);
    $('#' + id + ' .modal-footer').html(footer);

    if (!close) {
        $('#' + id + ' .btn-close').hide();

        $('#' + id + ' .modal-header').dblclick(function () {
            $('#' + id + ' .btn-close').show();
        });
    }

    if (minimize) {
        const closeBtn = $('#' + id + ' .btn-close').clone();

        $('#' + id + ' .btn-close').remove();
        $('#' + id + ' .modal-header').append('<div style="float: right;" class="dialog-btn-container"></div>');
        $('#' + id + ' .modal-header .dialog-btn-container').append('<i onclick="$(\'#' + id + '\').modal(\'hide\'); $(\'#' + id + '-minimized\').show();" class="fa-solid fa-window-minimize" style="cursor: pointer;"></i>').append(closeBtn);

        let minimizeDiv = '<div id="' + id + '-minimized" style="position: fixed; bottom: 0; right: 0; z-index: 10001; display: none; margin-right: 6em;">';
        minimizeDiv    += '    <div class="card bg-theme border-theme bg-opacity-75 mb-3">';
        minimizeDiv    += '        <div class="card-header border-theme fw-bold small text-inverse">' + $('#' + id + ' .modal-header .modal-title').text() + ' <i style="cursor: pointer;" onclick="$(\'#' + id + '\').modal(\'show\'); $(\'#' + id + '-minimized\').hide();" class="fa-regular fa-window-restore"></i></div>';
        minimizeDiv    += '        <div>';
        minimizeDiv    += '            <div class="card-arrow-bottom-left"></div>';
        minimizeDiv    += '            <div class="card-arrow-bottom-right"></div>';
        minimizeDiv    += '        </div>';
        minimizeDiv    += '    </div>';
        minimizeDiv    += '</div>';

        $('body').append(minimizeDiv);
    }

    $('#' + id + ' .modal-dialog').draggable({
        handle: '.modal-header'
    });

    $('#' + id + ' .modal-header').css('cursor', 'grab');

    $('#' + id).modal('show');

    if (size) {
        $('#' + id + ' .modal-dialog').addClass('modal-' + size);
    }

    if (typeof p.onOpen !== 'undefined') {
        const onOpenFunction = p.onOpen;
        function onOpenCallback(callback)
        {
            callback();
        }
        onOpenCallback(onOpenFunction);
    }

    if (typeof p.onClose !== 'undefined') {
        const onCloseFunction = p.onClose;
        function onCloseCallback(callback)
        {
            callback();
        }

        $('#' + id + ' .btn-close').attr('onclick', '');
        $('#' + id + ' .btn-close').bind('click', function () {
            onCloseCallback(onCloseFunction);
            dialogClose(id);
        });
    }

}
// -------------------------------------------------------------------------------------------
function dialogClose(elm)
{
    if (!elm) {
        console.error('Error: Called dialogClose on no elm');
        return;
    }

    if (!$('#' + elm).length) {
        console.error('Error: Could not locate dialog with id \'' + elm + '\'');
        return;
    }

    $('#' + elm).modal('hide');

}
// -------------------------------------------------------------------------------------------
function clipboard(elm, elmType)
{
    let txt = '';

    switch (elmType) {
        case 'html':
            txt = $('#' + elm).html();
            break;
        case 'raw':
            txt = elm;
            break;
        case 'val':
            txt = $('#' + elm).val();
            break;
    }

    if (!txt) {
        toast('Copy Failed', 'Nothing found to copy with element "' + elm + '"', 'error');
        return;
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(function () {
            toast('Copied', 'Contents copied to clipboard', 'success');
        }, function () {
            toast('Copy Failed', 'Contents failed to copy to clipboard', 'error');
        });
    } else {
        try {
            clipboardText = document.createElement('textarea');
            clipboardText.id = 'copyText';
            clipboardText.value = txt;
            document.body.appendChild(clipboardText);
            clipboardText.select();

            document.execCommand('copy');
            document.body.removeChild(clipboardText);
            toast('Copied', 'Contents copied to clipboard', 'success');
        } catch (err) {
            toast('Copy Failed', 'Contents failed to copy to clipboard', 'error');
        }
    }
}
// ---------------------------------------------------------------------------------------------
function reload()
{
    window.location.href = window.location.href;
}
// ---------------------------------------------------------------------------------------------
function loadingStart()
{
    if ($('#loading-modal .btn-close').is(':visible')) {
        loadingStop();
    }

    $('#loading-modal .btn-close').hide();
    $('#loading-modal').modal('show');

    $('#loading-modal .modal-header').dblclick(function () {
        $('#loading-modal .btn-close').show();
    });

}
// -------------------------------------------------------------------------------------------
function loadingStop()
{
    setTimeout(function () {
        $('#loading-modal').modal('hide');
    }, 500);

}
// -------------------------------------------------------------------------------------------
