/**
 * Javascriptオブジェクトをダンプする。
 * Firebugs(FireFox)、開発者ツール(IE)等のコンソールでの利用を想定
 * @param v 対象オブジェクト
 * @param options オプション
 * @returns ダンプした文字列
 */
var dumpJson = function(v, options) {
	var _options = {
		ksort : false,
		indent : false,
		funcsrc : false,
		undefined2str : false,
		maxDepth : 10
	};
	for (var k in options) { _options[k] = options[k]; }
	var d = parseInt(_options.maxDepth);
	_options.maxDepth = (d > 0) ? (d < 100) ? d : 100 : 1;

	var f1 = (!!_options.indent) ? function(d) {
		for (var s = '\n', i = 0; i <= d; i++) { s += '  '; }
		return s
	} : function() {
		return '';
	};

	var f2ps = [ [ /\\/g, "\\\\" ], [ /\n/g, "\\n" ], [ /\r/g, "\\r" ],
			[ /\t/g, "\\t" ], [ /(")/g, "\\$1" ] ];
	var f2 = function(v) {
		for (var i = 0; i < f2ps.length; i++) { v = v.replace.apply(v, f2ps[i]); }
		return v;
	}

	var fn = function(v, d) {
		if (d >= _options.maxDepth)
			throw 'depth ' + _options.maxDepth + ' orver error.';
		if (null === v)
			return 'null';
		switch (typeof v) {
		case 'undefined':
			return (!!_options.undefined2str) ? '"undefined"' : 'null';
		case 'boolean':
			return v ? 'true' : 'false';
		case 'function':
			v = (!!_options.funcsrc) ? v.toSource() : 'function()';
		case 'string':
			return '"' + f2(v) + '"';
		case 'object':
			var s = [];
			if (v instanceof Array) {
				for (var i = 0; i < v.length; i++)
					s.push(fn(v[i], d + 1));
				return '[' + f1(d) + s.join(',' + f1(d)) + f1(d - 1) + ']';
			}
			var ks = [];
			for (var k in v)
				ks.push(k);
			if (!!_options.ksort)
				ks.sort();
			for (var i = 0; i < ks.length; i++)
				s.push(fn(ks[i], d + 1) + ':' + fn(v[ks[i]], d + 1));
			return '{' + f1(d) + s.join(',' + f1(d)) + f1(d - 1) + '}';
		}
		return v;
	}
	return fn(v, 0);
};

function errorCallback(XMLHttpRequest, textStatus, errorThrown) {
	var res = null;
	try {
		res = (new Function("return " + XMLHttpRequest.responseText))();
	} catch (e) {
	}
	var msg = scriptContext.locale.errOccurred;
	if (typeof res !== "undeined" && res != null) msg += "\n" + res.exceptionMessage;
	alert(msg);
}

function postAsync(webapi, params, func, async) {
	if (async == null) async = false;
	$.ajax({
		type: "POST",
		contentType: "application/json",
		url: contextPath + "/rest/command/" + webapi,
		dataType: "json",
		cache: false,
		async: async,
		data: params,
		success: function(response) {
			if (func && $.isFunction(func)) func.call(this, response.results);
		},
		error: errorCallback
	});
}

function search(webapi, searchType, formName, isCount, func) {
	$(":hidden[name='searchType']").val(searchType);
	$(":hidden[name='formName']").val(formName);
	var data = $("[name='" + formName + "']").serialize();
	data += "&defName=" + $(":hidden[name='defName']").val();
	data += "&searchType=" + searchType;
	data += "&limit=" + $(":hidden[name='limit']").val();
	data += "&offset=" + $(":hidden[name='offset']").val();
	data += "&sortKey=" + $(":hidden[name='sortKey']").val();
	data += "&sortType=" + $(":hidden[name='sortType']").val();
	data += "&isSearch=true";
	data += "&isCount=" + isCount;
	$.ajax({
		type: "POST",
		url: contextPath + "/rest/command/" + webapi,
		dataType: "json",
		data: data,
		success: function(response) {
			var count = response.results.count;
			var htmlData = response.results.htmlData;
			var queryString = response.results.queryString;
			if (func && $.isFunction(func)) func.call(this, htmlData, count, queryString);
		},
		error: errorCallback
	});
}

function count(webapi, searchType, formName, func) {
	$(":hidden[name='searchType']").val(searchType);
	$(":hidden[name='formName']").val(formName);
	var data = $("[name='" + formName + "']").serialize();
	data += "&defName=" + $(":hidden[name='defName']").val();
	data += "&searchType=" + searchType;
	data += "&isSearch=false";
	data += "&isCount=true";
	$.ajax({
		type: "POST",
		url: contextPath + "/rest/command/" + webapi,
		dataType: "json",
		data: data,
		success: function(response) {
			var count = response.results.count;
			if (func && $.isFunction(func)) func.call(this, count);
		},
		error: errorCallback
	});
}

function deleteAll(webapi, searchType, formName, func) {
	$(":hidden[name='searchType']").val(searchType);
	$(":hidden[name='formName']").val(formName);
	var data = $("[name='" + formName + "']").serialize();
	data += "&defName=" + $(":hidden[name='defName']").val();
	data += "&searchType=" + searchType;
	data += "&isSearch=false";
	data += "&isCount=true";
	$.ajax({
		type: "POST",
		url: contextPath + "/rest/command/" + webapi,
		dataType: "json",
		data: data,
		success: function(response) {
			var count = response.results.count;
			if (func && $.isFunction(func)) func.call(this, count);
		},
		error: errorCallback
	});
}

