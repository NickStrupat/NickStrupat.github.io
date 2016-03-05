document.addEventListener("DOMContentLoaded", init);
function updateTime() {
    var date = new Date();
    document.getElementById('time').innerHTML = addZero(date.getHours()) + ":" + addZero(date.getMinutes()) + ":" + addZero(date.getSeconds());
    setTimeout(updateTime, 1000);
}
function addZero(i) { return i < 10 ? "0" + i : i; }
function init() {
    updateTime();
    var date = new Date();
    document.getElementById('date').innerHTML = (date.getFullYear() - 2000) + "." + (date.getMonth() + 1) + "." + date.getDate();
    document.getElementById('page-length').innerHTML = document.documentElement.innerHTML.length.toString();
    var emailAnchor = document.querySelector('a.email');
    var buttonAnchor = document.querySelector('button.email');
    if (document.queryCommandSupported("copy") === true) {
        var $parent = emailAnchor.parentElement;
        $parent.removeChild(emailAnchor);
        buttonAnchor.style.display = 'inline-block';
        buttonAnchor.addEventListener('click', function (event) {
            copyEmailToClipboard(emailAnchor.innerHTML);
        });
    }
    var titleHeaderTextElement = document.querySelector('.title h1');
    var text = titleHeaderTextElement.innerHTML;
    var technicolorText = '';
    var colors = ['tomato', 'orange', 'yellow', 'turquoise', 'springgreen', 'aqua', 'violet', 'magenta'];
    for (var i = 0; i != text.length; ++i) {
        technicolorText += '<span style="color:' + colors[i % colors.length] + ';">' + text[i] + '</span>';
    }
    titleHeaderTextElement.innerHTML = technicolorText;
}
function copyEmailToClipboard(text) {
    var $textArea = document.createElement('textarea');
    $textArea.value = text;
    document.body.appendChild($textArea);
    $textArea.select();
    var success = document.execCommand('copy');
    document.body.removeChild($textArea);
    if (success !== true)
        alert('Could not copy email to clipboard. Try selecting the text and copying like the old days.');
}
