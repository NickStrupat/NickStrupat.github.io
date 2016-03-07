function getDottedDate(date, fullYear, separator) {
    if (fullYear === void 0) { fullYear = false; }
    if (separator === void 0) { separator = "."; }
    return (date.getFullYear() - (fullYear ? 0 : 2000)) + separator + (date.getMonth() + 1) + separator + date.getDate();
}
var addZero = function (i) { return (i < 10 ? "0" : "") + i; };
function getColonTime(date, withSeconds) {
    if (withSeconds === void 0) { withSeconds = true; }
    return addZero(date.getHours()) + ":" + addZero(date.getMinutes()) + (withSeconds ? (":" + addZero(date.getSeconds())) : "");
}
var daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var getDayOfWeek = function (date) { return daysOfWeek[date.getDate()]; };
function setClock() {
    document.getElementById('time').innerHTML = getColonTime(new Date());
    setTimeout(setClock, 1000);
}
function copyEmailToClipboard(text) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    var success = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (success !== true)
        alert('Could not copy email to clipboard. Try selecting the text and copying like the old days.');
}
function initEmailLink() {
    var emailAnchor = document.querySelector('a.email');
    var buttonAnchor = document.querySelector('button.email');
    if (document.queryCommandSupported("copy") === true) {
        emailAnchor.parentElement.removeChild(emailAnchor);
        buttonAnchor.style.display = 'inline-block';
        buttonAnchor.addEventListener('click', function (event) {
            copyEmailToClipboard(emailAnchor.innerHTML);
        });
    }
}
function gimmeThatRainbowFam() {
    var titleHeaderTextElement = document.querySelector('.title h1');
    var text = titleHeaderTextElement.innerHTML;
    var technicolorHtml = '';
    var colors = ['tomato', 'orange', 'yellow', 'turquoise', 'springgreen', 'aqua', 'violet', 'magenta'];
    for (var i = 0; i != text.length; ++i) {
        technicolorHtml += "<span style=\"color: " + colors[i % colors.length] + ";\">" + text[i] + "</span>";
    }
    titleHeaderTextElement.innerHTML = technicolorHtml;
}
function renderIssues(response) {
    var converter = new showdown.Converter();
    for (var i in response.data) {
        var issue = response.data[i];
        issue.bodyHtml = converter.makeHtml(issue.body);
        issue.commentCountText = issue.comments + " Comment" + (issue.comments == 1 ? "" : "s");
        var date = new Date(issue.created_at);
        issue.created = getDayOfWeek(date) + " " + getDottedDate(date, true, "-") + " " + getColonTime(date, false);
    }
    new Vue({
        el: 'body',
        data: {
            posts: response.data
        }
    });
    document.body.className += " loaded";
}
function init() {
    document.getElementById('date').innerHTML = getDottedDate(new Date());
    setClock();
    initEmailLink();
    document.getElementById('page-length').innerHTML = document.documentElement.innerHTML.length.toString();
    gimmeThatRainbowFam();
    // get "comments" (issues)
    var script = document.createElement("script");
    var url = "https://api.github.com/repos/NickStrupat/NickStrupat.github.io/issues?labels=post,published&callback=" + renderIssues.name;
    window[renderIssues.name] = renderIssues;
    script.src = url;
    document.body.appendChild(script);
}
document.addEventListener("DOMContentLoaded", init);
//# sourceMappingURL=thescriptfile.js.map