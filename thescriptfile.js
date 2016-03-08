function getDottedDate(date, fullYear, separator) {
    if (date === void 0) { date = new Date(); }
    if (fullYear === void 0) { fullYear = false; }
    if (separator === void 0) { separator = '.'; }
    return (date.getFullYear() - (fullYear ? 0 : 2000)) + separator + (date.getMonth() + 1) + separator + date.getDate();
}
function addZero(i) {
    return (i < 10 ? '0' : '') + i;
}
;
function getColonTime(date, withSeconds) {
    if (date === void 0) { date = new Date(); }
    if (withSeconds === void 0) { withSeconds = true; }
    return addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + (withSeconds ? (':' + addZero(date.getSeconds())) : '');
}
var daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function getDayOfWeek(date) {
    if (date === void 0) { date = new Date(); }
    return daysOfWeek[date.getDay()];
}
function setClock() {
    document.getElementById('time').innerHTML = getColonTime();
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
    if (document.queryCommandSupported('copy') === true) {
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
var vm = new Vue({ el: 'body' });
function handleIssuesData(responseData, details) {
    if (details === void 0) { details = true; }
    if (responseData.length != 0 && responseData[0]['url'] != undefined) {
        var converter = new showdown.Converter();
        for (var i in responseData) {
            var issue = responseData[i];
            issue.bodyHtml = converter.makeHtml(issue.body);
            var suffix = issue.comments == 1 ? '' : 's';
            issue.commentCountText = issue.comments + " Comment" + suffix;
            var date = new Date(issue.created_at);
            var x = {
                dow: getDayOfWeek(date),
                date: getDottedDate(date, true, '-'),
                time: getColonTime(date, false)
            };
            issue.created = x.dow + " " + x.date + " " + x.time;
        }
        vm.$data = { posts: responseData };
    }
    else {
        vm.$data = { message: 'No posts at this URI' };
    }
    document.body.setAttribute('data-loaded', 'true');
}
var pattern = /\B@[a-z0-9_-]+/mgi;
function handleCommentsData(commentsData) {
    var converter = new showdown.Converter();
    for (var i in commentsData) {
        var comment = commentsData[i];
        var bodyHtml = converter.makeHtml(comment.body);
        bodyHtml = bodyHtml.replace(pattern, function (x) { return ("<a class=\"mention\" href=\"https://github.com/" + x.substring(1) + "\">" + x + "</a>"); });
        comment.bodyHtml = bodyHtml;
        var date = new Date(comment.created_at);
        var x = {
            dow: getDayOfWeek(date),
            date: getDottedDate(date, true, '-'),
            time: getColonTime(date, false)
        };
        comment.created = x.dow + " " + x.date + " " + x.time;
    }
    vm.$data = {
        posts: vm.$data.posts,
        comments: commentsData
    };
}
function jsonpRequest(uri, callback, callbackParam) {
    if (callbackParam === void 0) { callbackParam = 'callback'; }
    var scriptElement = document.createElement('script');
    var callbackName = callback['name'] + '_callback';
    window[callbackName] = function (response) {
        scriptElement.parentElement.removeChild(scriptElement);
        callback(response);
    };
    scriptElement.src = uri + (uri.indexOf('?') == -1 ? '?' : '&') + 'callback=' + callbackName;
    document.body.appendChild(scriptElement);
}
function getQueryStringParams(qs) {
    var params = {};
    var varPairs = qs.split('&');
    if (varPairs.length == 0)
        return params;
    for (var i = 0; i < varPairs.length; i++) {
        var pair = varPairs[i].split('=');
        if (pair.length == 1 && pair[0].length != 0)
            params[decodeURIComponent(pair[0])] = null;
        if (pair.length == 2)
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return params;
}
function processLocation() {
    var user = 'NickStrupat';
    var repo = 'NickStrupat.github.io';
    var queryStringParams = getQueryStringParams(location.search.substring(1));
    var hashParams = getQueryStringParams(location.hash.substring(1));
    for (var i in hashParams)
        queryStringParams[i] = hashParams[i];
    document.body.removeAttribute('data-loaded');
    var uri;
    var handler;
    if (queryStringParams.q) {
        uri = "https://api.github.com/search/issues?q=repo:" + user + "/" + repo + " label:post label:published " + queryStringParams.q;
        handler = function (r) { return handleIssuesData(r.data.items); };
    }
    else if (queryStringParams.post) {
        uri = "https://api.github.com/repos/" + user + "/" + repo + "/issues/" + queryStringParams.post;
        handler = function (r) {
            if (r.data.comments_url != undefined)
                jsonpRequest(r.data.comments_url, function (cr) { return handleCommentsData(cr.data); });
            handleIssuesData([r.data]);
        };
    }
    else {
        uri = "https://api.github.com/repos/" + user + "/" + repo + "/issues?labels=post,published";
        handler = function (r) { return handleIssuesData(r.data, !queryStringParams.archive); };
    }
    jsonpRequest(uri, handler);
}
function init() {
    document.getElementById('date').innerHTML = getDottedDate(new Date());
    window.onhashchange = processLocation;
    var searchBox = document.querySelector('input#search');
    searchBox.onkeypress = function (e) {
        if (e.keyCode == 13)
            location.hash = searchBox.value.length == 0 ? '' : 'q=' + encodeURIComponent(searchBox.value);
    };
    setClock();
    initEmailLink();
    document.getElementById('page-length').innerHTML = document.documentElement.innerHTML.length.toString();
    gimmeThatRainbowFam();
    processLocation();
}
document.addEventListener('DOMContentLoaded', init);
//# sourceMappingURL=thescriptfile.js.map