function getDottedDate(date = new Date(), fullYear = false, separator = '.') {
	return (date.getFullYear() - (fullYear ? 0 : 2000)) + separator + (date.getMonth() + 1) + separator + date.getDate();
}

function addZero(i : number) {
	return (i < 10 ? '0' : '') + i
};

function getColonTime(date = new Date(), withSeconds = true) : string {
	return addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + (withSeconds ? (':' + addZero(date.getSeconds())) : '');
}

const daysOfWeek : string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function getDayOfWeek(date = new Date()) {
	return daysOfWeek[date.getDay()];
}

function setClock() {
    document.getElementById('time').innerHTML = getColonTime();
    setTimeout(setClock, 1000);
}

function copyEmailToClipboard(text : string) {
    let textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    let success = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (success !== true)
        alert('Could not copy email to clipboard. Try selecting the text and copying like the old days.')
}

function initEmailLink() {
	let emailAnchor = <HTMLElement> document.querySelector('a.email');
    let buttonAnchor = <HTMLElement> document.querySelector('button.email');
    if (document.queryCommandSupported('copy') === true) {
        emailAnchor.parentElement.removeChild(emailAnchor);
        buttonAnchor.style.display = 'inline-block';
        buttonAnchor.addEventListener('click', function(event) {
            copyEmailToClipboard(emailAnchor.innerHTML);
        });
    }
}

function gimmeThatRainbowFam() {
    let titleHeaderTextElement = <HTMLElement> document.querySelector('.title h1');
    const text = titleHeaderTextElement.innerHTML;
    let technicolorHtml = '';
    const colors = ['tomato','orange','yellow','turquoise','springgreen','aqua','violet','magenta'];
    for (let i = 0; i != text.length; ++i) {
        technicolorHtml += `<span style="color: ${colors[i % colors.length]};">${text[i]}</span>`;
    }
    titleHeaderTextElement.innerHTML = technicolorHtml;
}

let vm = new Vue({el: 'body'});
function handleIssuesData(responseData : any[], details = true) {
	if (responseData.length != 0 && responseData[0]['url'] != undefined) {
		let converter = new showdown.Converter();
		for (let i in responseData) {
			let issue = responseData[i];
			issue.bodyHtml = converter.makeHtml(issue.body);
			const suffix = issue.comments == 1 ? '' : 's';
			issue.commentCountText = `${issue.comments} Comment${suffix}`;
			const date = new Date(issue.created_at);
			const x = {
				dow: getDayOfWeek(date),
				date: getDottedDate(date, true, '-'),
				time: getColonTime(date, false)
			};
			issue.created = `${x.dow} ${x.date} ${x.time}`;
		}
		vm.$data = { posts: responseData }; 
	}
	else {
		vm.$data =  { message: 'No posts at this URI' };
	}
	document.body.setAttribute('data-loaded', 'true');
}

const pattern = /\B@[a-z0-9_-]+/mgi;
function handleCommentsData(commentsData : any[]) {
	let converter = new showdown.Converter();
	for (let i in commentsData) {
		var comment = commentsData[i];
		let bodyHtml = converter.makeHtml(comment.body);
		bodyHtml = bodyHtml.replace(pattern, x => `<a class="mention" href="https://github.com/${x.substring(1)}">${x}</a>`);
		comment.bodyHtml = bodyHtml;
		const date = new Date(comment.created_at);
		const x = {
			dow: getDayOfWeek(date),
			date: getDottedDate(date, true, '-'),
			time: getColonTime(date, false)
		};
		comment.created = `${x.dow} ${x.date} ${x.time}`;
	}
	vm.$data = {
		posts: vm.$data.posts,
		comments: commentsData
	};
}

function jsonpRequest(uri : string, callback : (response) => void, callbackParam = 'callback') {
	let scriptElement = document.createElement('script');
	let callbackName = callback['name'] + '_callback'; 
    window[callbackName] = response => {
		scriptElement.parentElement.removeChild(scriptElement);
		callback(response);
	}
	scriptElement.src = uri + (uri.indexOf('?') == -1 ? '?' : '&') + 'callback=' + callbackName;
    document.body.appendChild(scriptElement);
}

function getQueryStringParams(qs : string) : any {
	let params = {};
	let varPairs = qs.split('&');
	if (varPairs.length == 0)
		return params;
    for (let i = 0; i < varPairs.length; i++) {
        let pair = varPairs[i].split('=');
		if (pair.length == 1 && pair[0].length != 0)
			params[decodeURIComponent(pair[0])] = null;
		if (pair.length == 2)
			params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
	return params;
}

function processLocation() : void {
	const user = 'NickStrupat';
	const repo = 'NickStrupat.github.io';
	let queryStringParams = getQueryStringParams(location.search.substring(1));
	let hashParams = getQueryStringParams(location.hash.substring(1));
	for (var i in hashParams)
		queryStringParams[i] = hashParams[i];

	document.body.removeAttribute('data-loaded');
	
	let uri : string;
	let handler : (response) => void;
	if (queryStringParams.q) {
		uri = `https://api.github.com/search/issues?q=repo:${user}/${repo} label:post label:published ${queryStringParams.q}`;
		handler = r => handleIssuesData(r.data.items);
	}
	else if (queryStringParams.post) {
		uri = `https://api.github.com/repos/${user}/${repo}/issues/${queryStringParams.post}`;
		handler = r => {
			if (r.data.comments_url != undefined)
				jsonpRequest(r.data.comments_url, cr => handleCommentsData(cr.data));
			handleIssuesData([r.data]);
		};
	}
	else {
		uri = `https://api.github.com/repos/${user}/${repo}/issues?labels=post,published`;
		handler = r => handleIssuesData(r.data, !queryStringParams.archive);
	}
	jsonpRequest(uri, handler);
}

function init() {
    document.getElementById('date').innerHTML = getDottedDate(new Date());
	
	window.onhashchange = processLocation;
	let searchBox = <HTMLInputElement> document.querySelector('input#search');
	searchBox.onkeypress = e => {
		if (e.keyCode == 13)
			location.hash = searchBox.value.length == 0 ? '' : 'q=' + encodeURIComponent(searchBox.value);
	}
	
    setClock();
    initEmailLink();
    document.getElementById('page-length').innerHTML = document.documentElement.innerHTML.length.toString();
    gimmeThatRainbowFam();

	processLocation();
}

document.addEventListener('DOMContentLoaded', init);