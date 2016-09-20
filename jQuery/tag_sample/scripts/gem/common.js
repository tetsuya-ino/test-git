////////////////////////////////////////////////////////
// 共通処理用のJavascript
////////////////////////////////////////////////////////

/**
 * フォームを作成し、指定actionにサブミットする。
 */
function submitForm(action, params) {
	var $form = $("<form method='post' />").attr("action", action).appendTo("body");
	if (params) {
		for (var keyString in params) {
			if (keyString && params[keyString] != null) {
				if ($.isArray(params[keyString])) {
					for (var i = 0; i < params[keyString].length; i++) {
						var $input = $("<input type='hidden' />").attr({name:keyString}).val(params[keyString][i]);
						$input.appendTo($form);
					}
				} else {
					var $input = $("<input type='hidden' />").attr({name:keyString}).val(params[keyString]);
					$input.prependTo($form);
				}
			}
			//$form.prepend("<input type='hidden\' name='" + keyString + "' value='" + params[keyString] + "'/>");
		}
	}
	$form.submit();
	return $form;
}

////////////////////////////////////////////////////////
//メニュー用のJavascript
////////////////////////////////////////////////////////

/**
* ホーム押下処理
*/
function home(action) {
	submitForm(contextPath + "/" + action, null);
}

/**
* 検索画面表示処理
* @param action
* @param defName
*/
function searchView(action, defName, urlParam) {
	var params = {defName:defName};
	if (urlParam && urlParam.length > 0) {
		var kv = urlParam.split("&");
		if (kv.length > 0) {
			for (var i = 0; i < kv.length; i++) {
				var _kv = kv[i].split("=");
				if (_kv[0] == "viewName") {
					action = action + "/" + _kv[1];
				} else {
					if (params[_kv[0]]) {
						if ($.isArray(params[_kv[0]])) {
							params[_kv[0]].push(_kv[1]);
						} else {
							var ary = [params[_kv[0]], _kv[1]];
							params[_kv[0]] = ary;
						}
					} else {
						params[_kv[0]] = _kv[1];
					}
				}
			}
		}
	}
	submitForm(contextPath + "/" + action, params);
}

function menuClick(action, urlParam) {
	var params = {};
	if (urlParam && urlParam.length > 0) {
		var kv = urlParam.split("&");
		if (kv.length > 0) {
			for (var i = 0; i < kv.length; i++) {
				var _kv = kv[i].split("=");
				if (_kv[0] == "viewName") {
					action = action + "/" + _kv[1];
				} else {
					if (params[_kv[0]]) {
						if ($.isArray(params[_kv[0]])) {
							params[_kv[0]].push(_kv[1]);
						} else {
							var ary = [params[_kv[0]], _kv[1]];
							params[_kv[0]] = ary;
						}
					} else {
						params[_kv[0]] = _kv[1];
					}
				}
			}
		}
	}
	submitForm(contextPath + "/" + action, params);
}

////////////////////////////////////////////////////////
//検索画面用のJavascript
////////////////////////////////////////////////////////

/**
* CSVダウンロード実行
* @param searchType
* @param formName
* @param action
*/
function csvDownload(searchType, formName, action, isForUpload) {
	var $form = $("<form method='POST' />").attr({action:contextPath + action}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:$(":hidden[name='defName']").val()}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"searchType", value:searchType}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"isForUpload", value:isForUpload}).appendTo($form);
	//カスタムでDL処理を作ってる場合、古いバージョンのパラメータ使ってる可能性あるので念のため
	$("<input />").attr({type:"hidden", name:"isAllProperty", value:isForUpload}).appendTo($form);

	var _$form = $("[name='" + formName + "']");
	$("select[name]", _$form).each(function() {
		var name = $(this).attr("name");
		var val = $(this).val();
		$("<input />").attr({type:"hidden", name:name, value:val}).appendTo($form);
	});

	$("input[name]:not(:radio):not(:checkbox)", _$form).each(function() {
		var name = $(this).attr("name");
		var val = $(this).val();
		$("<input tyep='hidden' name='" + name + "' value='" + val + "' />").appendTo($form);
	});

	$(":radio:checked[name]", _$form).each(function() {
		var name = $(this).attr("name");
		var val = $(this).val();
		$("<input tyep='hidden' name='" + name + "' value='" + val + "' />").appendTo($form);
	});

	$(":checkbox:checked[name]", _$form).each(function() {
		var name = $(this).attr("name");
		var val = $(this).val();
		$("<input tyep='hidden' name='" + name + "' value='" + val + "' />").appendTo($form);
	});

	$form.submit();
	$form.remove();
}

function createNewData(action, defName) {
	submitForm(contextPath + "/" + action, {defName:defName});
}

function showDetail(action, oid, version, defName) {
	if (!defName) defName = $(":hidden[name='defName']").val();
	var searchCond = $(":hidden[name='searchCond']").val();
	submitForm(contextPath + "/" + action, {oid:oid, version:version, defName:defName, searchCond:searchCond});
}

/**
 * searchCond解析
 * @param query
 * @returns {Array}
 */
function parseSearchCond(query) {
	var ret = new Array();
	if (query != null && query.length > 0 && query.charAt(0) != "&") {
		query = "&" + query;
	}
	var sr = new StringReader(query);
	var c = -1;
	while (true) {
		c = sr.read();
		if (c == -1) {
			break;
		}
		if (c == "&") {
			var kv = parseKeyValue(sr);
			if (kv != null) ret.push(kv);
		}
	}
	return ret;
}

/**
 * queryを解析してkey:valueに分解
 * @param sr
 * @returns
 */
function parseKeyValue(sr) {
	var ret = {};
	var key = true;
	var val = false;
	var amp = false;
	var buf = new StringBuilder();
	while (true) {
		var c = sr.read();
		if (key) {
			if (c == -1) {
				//keyの途中で終わり(あるか?)
				return null;
			} else if (c == "=") {
				//key終わり、valの解析に
				ret.key = buf.toString();
				key = false;
				val = true;
				amp = false;
				buf = new StringBuilder();
			} else if (c == "&") {
				c = sr.read();
				if (c == "&") {
					//&&なら&で文字列扱いに
					buf.append("&");
				} else {
					//key(&～=)の間に&があったらキー作り直し
					buf = new StringBuilder();
				}
			} else {
				buf.append(c);
			}
		} else if (val) {
			if (c == -1) {
				ret.val = buf.toString();
				break;
			} else if (c == "&") {
				c = sr.read();
				if (c == "&") {
					//&&なら&で文字列扱いに
					buf.append("&");
				} else {
					//次のキーの開始位置
					sr.back();
					ret.val = buf.toString();
					break;
				}
			} else {
				buf.append(c);
			}
		}
	}
	return ret;
}

function StringReader(str) {
	var _str = str;
	var _length = str.length;
	var _next = 0;
	StringReader.prototype.read = function() {
		if (_next >= _length) return -1;
		return _str.charAt(_next++);
	}
	StringReader.prototype.back = function() {
		_next -= 2;
	}
	StringReader.prototype.pos = function() {
		return _next;
	}
}

function StringBuilder() {
	var _buf = new Array();
	StringBuilder.prototype.length = function() {
		return _buf.length;
	}
	StringBuilder.prototype.append = function(str) {
		_buf.push(str);
	}
	StringBuilder.prototype.toString = function() {
		return _buf.join("");
	}
}

/**
 * 配列タイプのプロパティから指定の入力欄を削除
 * @param id
 * @return
 */
function deleteItem(id) {
	$("#" + id).remove();
	$(".fixHeight").fixHeight();
}

/**
 * 配列タイプで要素の追加が可能かチェック
 * @param ulId
 * @param multiplicity
 * @return
 */
function canAddItem(ulId, multiplicity) {
	if (multiplicity == -1) return true;
	if ($("#" + ulId + " li").length < multiplicity) return true;
	return false;
}

function clone($src, id) {
	var $copy = $src.clone().attr("id", id).css("display", "block");
	$src.parent().append($copy);
	return $copy;
}

function countUp(countId, func) {
	var count = $("#" + countId).val() - 0;
	func.call(this, count);
	$("#" + countId).val(count + 1);
}

function setCookie(name, value, days) {
	var str = name + "=" + escape(value) + ";path=" + contextPath + ";";
	if (days != 0) {
		var dt = new Date();
		dt.setDate(dt.getDate() + days);
		str += "expires=" + dt.toGMTString() + ";";
	}
	document.cookie = str;
}

function getCookie(name) {
	split_len = name.length + 1;
	ary_cookie = document.cookie.split("; ");
	str = "";
	for(i=0; ary_cookie[i]; i++){
		if (ary_cookie[i].substr(0,split_len) == name + "="){
			str = ary_cookie[i].substr(split_len,ary_cookie[i].length);
			break;
		}
	}
	return unescape(str);
}

/**
 * 指定したidのセクションを展開する
 * @param id
 * @return
 */
function disclosure_open(id) {
	$(id).click();
}

////////////////////////////////////////////////////////
//String・数値用のJavascript
////////////////////////////////////////////////////////

/**
 * テキスト行追加
 * @param ulId
 * @param multiplicity
 * @param liId
 * @param propName
 * @param countId
 * @param selector
 * @return
 */
function addTextItem(ulId, multiplicity, liId, propName, countId, selector, func) {
	if (canAddItem(ulId, multiplicity)) {
		countUp(countId, function(count){
			var $copy = copyText(liId, propName, count, selector);
			if ($(":text", $copy).hasClass("commaFieldDummy")) {
				$(":text", $copy).removeClass("commaFieldDummy").addClass("commaField");
				$(":text", $copy).commaField();
			}
			if (func && $.isFunction(func)) func.call(this, $copy.children(selector));
		});
		$(".fixHeight").fixHeight();
	}
}

/**
 * Stringの配列型プロパティにテキストの入力欄追加
 * @param liId
 * @param propName
 * @param idx
 * @param selector
 * @return
 */
function copyText(liId, propName, idx, selector) {
	var $src = $("#" + liId);
	var copyId = "li_" + propName + idx;
	var $copy = clone($src, copyId);
	$("#" + copyId + " " + selector).attr("name", propName);
	$("#" + copyId + " :button").click(function() {deleteItem(copyId);});
	return $copy;
}

/**
 * 数値チェック
 */
function numcheck(element) {
	var v = Number(element.value);
	if (isNaN(v)) {
		alert(scriptContext.locale.numcheckMsg);
		element.value = "";
	}
}

////////////////////////////////////////////////////////
//日付・時間用のJavascript
////////////////////////////////////////////////////////

/**
 * 日付行追加
 * @param ulId
 * @param multiplicity
 * @param liId
 * @param propName
 * @param countId
 * @return
 */
function addDateItem(ulId, multiplicity, liId, propName, countId) {
	if (canAddItem(ulId, multiplicity)) {
		countUp(countId, function(count) {
			copyDate(liId, propName, count);
		});
		$(".fixHeight").fixHeight();
	}
}

/**
 * 日付の配列型プロパティにテキストの入力欄追加
 * @param liId
 * @param propName
 * @param idx
 * @return
 */
function copyDate(liId, propName, idx) {
	var $copy = copyText(liId, propName, idx, ":text");
	datepicker($("#" + $copy.attr("id") + " :text"));
}

/**
 * 時間入力行追加
 * @param ulId
 * @param multiplicity
 * @param liId
 * @param propName
 * @param countId
 * @return
 */
function addTimeItem(ulId, multiplicity, liId, propName, countId) {
	if (canAddItem(ulId, multiplicity)) {
		countUp(countId, function(count) {
			copyTime(liId, propName, count);
		});
		$(".fixHeight").fixHeight();
	}
}

/**
 * 時間の配列型プロパティにセレクトボックスの入力欄追加
 * @param liId
 * @param propName
 * @param idx
 * @return
 */
function copyTime(liId, propName, idx) {
	var id = propName + idx;
	var $src = $("#" + liId);
	var copyId = "li_" + id;
	var $copy = clone($src, copyId);

	var selId = new Array("h_" + id, "m_" + id, "s_" + id);

	// プルダウンの設定
	var i = 0;
	var $select = $("#" + copyId + " label select").change(function() {
		timeChange(id);
	});
	$select.each(function() {
		$(this).attr("id", selId[i]);
		i++;
	});

	// 非表示の場合の設定
	$("#" + copyId + " :hidden:not(:last)").each(function() {
		$(this).attr("id", selId[i]);
		i++;
	});

	$("#" + copyId + " :hidden:last").attr({
		name : propName,
		id : "i_" + id
	});
	$("#" + copyId + " :button").click(function() {
		deleteItem(copyId);
	});
}

/**
 * 日時入力行追加
 * @param ulId
 * @param multiplicity
 * @param liId
 * @param propName
 * @param countId
 * @return
 */
function addTimestampItem(ulId, multiplicity, liId, propName, countId) {
	if (canAddItem(ulId, multiplicity)) {
		countUp(countId, function(count) {
			copyTimestamp(liId, propName, count);
		});
		$(".fixHeight").fixHeight();
	}
}

/**
 * 日時の配列型プロパティにカレンダーとセレクトボックスの入力欄追加
 * @param liId
 * @param propName
 * @param idx
 * @return
 */
function copyTimestamp(liId, propName, idx) {
	var id = propName + idx;
	var $src = $("#" + liId);
	var copyId = "li_" + id;
	var $copy = clone($src, copyId);

	var selId = new Array("h_" + id, "m_" + id, "s_" + id, "ms_" + id);
	var change = function() {
		timestampChange(id);
	};

	var $text = $("#" + copyId + " :text").attr("id", "d_" + id).change(change);

	// プルダウンの設定
	var i = 0;
	var $select = $("#" + copyId + " label select").change(change);
	$select.each(function() {
		$(this).attr("id", selId[i]);
		i++;
	});

	// 非表示の場合の設定
	$("#" + copyId + " :hidden:not(:last)").each(function() {
		$(this).attr("id", selId[i]);
		i++;
	});

	$("#" + copyId + " :hidden:last").attr({
		name : propName,
		id : "i_" + id
	});
	$("#" + copyId + " :button").click(function() {
		deleteItem(copyId);
	});

	datepicker($text);
}


////////////////////////////////////////////////////////
//バイナリ型用のJavascript
////////////////////////////////////////////////////////

function uploadFile(file) {
	$(file).hide();
	var propName = $(file).attr("pname");
	var $span = $("#em_" + es(propName)).text("");
	$span.hide();
	var $img = $("#img_" + es(propName));
	$img.show();
	var uploadUrl = $(file).attr("uploadUrl");
	$(file).upload(uploadUrl,
		function(res) {
			$img.hide();
			if (res != null) {
				var result = $(res).find("Result").text();
				if (result == null || result == "") {
					$span.text(scriptContext.locale.failedToFileUpload).show();
					$(file).val("").show();
				} else {
					var error = $(res).find("error").text();
					if (error == null || error == "") {
						var fileId = $(file).attr("id");
						var displayType = $(file).attr("displayType");
						var lobId = $(res).find("lobId").text();
						var binaryName = $(res).find("name").text();
						var type = $(res).find("type").text();

						var count = $(file).attr("binCount") - 0;
						addBinaryGroup(propName, count, fileId, binaryName, type, lobId, displayType);
						$(file).attr("binCount", count);
					} else {
						$span.text(error).show();
						$(file).val("").show();
					}
				}
			} else {
				$span.show();
				$(file).val("").show();
			}

		},
		"xml");
}

/**
 * バイナリデータ追加
 *
 * @param propName
 * @param count
 * @param brName
 * @param brType
 * @param brLobId
 * @param displayType
 * @return
 */
function addBinaryGroup(propName, count, fileId, brName, brType, brLobId, displayType, param) {
	//参照で追加した行で、なぜかjQueryのセレクタでelementが取れない
	var $input = $("#" + es(fileId));
	var $ul = $("#ul_" + es(propName));
	var $li = $("<li id='li_" + propName + count + "'>").appendTo($ul);

	var download = $input.attr("downloadUrl") + "?id=" + brLobId;
	var ref = $input.attr("refUrl") + "?id=" + brLobId;
	if (param != null) {
		download = download + param;
		ref = ref + param;
	}

	//リンク作成
	if (displayType && (displayType == "Binary" || displayType == "Link")) {
		$li.append("<a href=" + download + ">" + brName + "</a> ");
	}

	if (displayType && displayType == "Preview") {
		$li.addClass("noimage");
	}

	$("<a href='javascript:void(0)' class='binaryDelete'> " + scriptContext.locale.deleteLink + "</a>").appendTo($li).click(function() {
		//liを削除
		$li.remove();

		//file表示
		$input.show();

		$(".fixHeight").fixHeight();
	});

	if (displayType && (displayType == "Binary" || displayType == "Preview")) {
		if (brType && brType.indexOf("image") > -1) {
			//imageファイルの場合は画像を表示
			var $p = $("<p id='p_" + propName + count + "' class='mb0' />").appendTo($li);
			var $img = $("<img src='" + download + "' alt='" + brLobId + "'>").appendTo($p);
			var width = $input.attr("binWidth") - 0;
			if (width > 0) $img.attr("width", width);
			var height = $input.attr("binHeight") - 0;
			if (height > 0) $img.attr("height", height);
		}
		if (brType && brType.indexOf("application/x-shockwave-flash") > -1) {
			// swfファイルの場合はアニメーションを表示
			var width = $input.attr("binWidth") - 0;
			var height = $input.attr("binHeight") - 0;
			var $p = $("<p id='p_" + propName + count + "' class='mb0' />").appendTo($li);
			var $img = $("<object data='" + ref + "' type='application/x-shockwave-flash' width='" + width + "' height='" + height + "' ><param name='movie' value='" + ref + "' /><param name='quality' value='high'>" + scriptContext.locale.notVewFlash + "</object>").appendTo($p);
		}
		if (brType && brType.indexOf("video/x-ms-wmv") > -1) {
			// wmvファイルの場合は動画を表示
			var width = $input.attr("binWidth") - 0;
			var height = $input.attr("binHeight") - 0;
			var $p = $("<p id='p_" + propName + count + "' class='mb0' />").appendTo($li);
			var $img = $("<object classid='clsid:6BF52A52-394A-11d3-B153-00C04F79FAA6' width='" + width + "' height='" + height + "'><param name='autoStart' value='false'><param name='URL' value='" + ref + "'><embed type='video/x-ms-wmv' pluginspage='http://www.microsoft.com/Windows/MediaPlayer/' src='" + ref + "' width='" + width + "' height='" + height + "' autostart='false' showcontrols='true'></embed></object>").appendTo($p);
		}
		if (brType && brType.indexOf("video/mpeg") > -1) {
			// mpegファイルの場合は動画を表示
			var width = $input.attr("binWidth") - 0;
			var height = $input.attr("binHeight") - 0;
			var $p = $("<p id='p_" + propName + count + "' class='mb0' />").appendTo($li);
			var $img = $("<object classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B' width='" + width + "' height='" + height + "'><param name='src' value='" + ref + "' /><param name='autostart' value='true' /><param name='type' value='video/mpeg'><param name='controller' value='true' /><embed src='" + ref + "' scale='ToFit' width='" + width + "' height='" + height + "'></embed></object>").appendTo($p);
		}
		if (brType && brType.indexOf("video/quicktime") > -1) {
			// movファイルの場合は動画を表示
			var width = $input.attr("binWidth") - 0;
			var height = $input.attr("binHeight") - 0;
			var $p = $("<p id='p_" + propName + count + "' class='mb0' />").appendTo($li);
			var $img = $("<object classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B' codebase='http://www.apple.com/qtactivex/qtplugin.cab' width='" + width + "' height='" + height + "'><param name='src' value='" + ref + "'><param name='autoplay' value='true'><param name='type' value='video/quicktime'><param name='scale' value='ToFit'><embed src='" + ref + "' autoplay='true' scale='ToFit' type='video/quicktime' pluginspage='http://www.apple.com/quicktime/download/' width='" + width + "' height='" + height + "'></object>").appendTo($p);
		}
	}

	// hiddenタグ追加
	$("<input type='hidden' />").appendTo($li).attr("name", propName).val(brLobId);

	var multiple = $input.attr("multiplicity") - 0;
	var length = $ul.children().length;
	if (length < multiple) {
		// file表示
		$input.show();
	}

	// fileの入力値を空に
	$input.val("");

	$(".fixHeight").fixHeight();
}

////////////////////////////////////////////////////////
// 参照型用のJavascript
////////////////////////////////////////////////////////

function showReference(viewAction, defName, oid, version, linkId, refEdit, editCallback) {
	document.scriptContext["editReferenceCallback"] = function(entity) {
		//callbackが指定されていたら呼び出し
		if (editCallback && $.isFunction(editCallback)) {
			editCallback.call(this, entity);
		}

		closeModalDialog();
		var _id = linkId.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");
		$("#" + _id).text(entity.name);
	}

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget(isSubModal);
	var $form = $("<form />").attr({method:"POST", action:viewAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"oid", value:oid}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"version", value:version}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"refEdit", value:refEdit}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	$form.submit();
	$form.remove();
}


/**
 * 参照型の検索
 * @param selectAction
 * @param viewAction
 * @param defName
 * @param ulId
 * @param multiplicity
 * @param multi
 * @param urlParam
 * @return
 */
function searchReference(selectAction, viewAction, defName, propName, multiplicity, multi, urlParam, refEdit, func) {
	var _propName = propName.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");
	document.scriptContext["searchReferenceCallback"] = function(selectArray) {
		var $ul = $("#ul_" + _propName);
		var refs = new Array();
		$ul.children("li").children(":hidden").each(function() {
			refs[$(this).val()] = this.parentNode;
		});

		var deleteList = new Array();
		for (var key in refs) {
			var exist = false;
			for (var i = 0; i < selectArray.length; i++) {
				if (key == selectArray[i]) {
					exist = true;
					break;
				}
			}
			if (!exist) {
				$(refs[key]).remove();
				var tmp = keySplit(key);
				var entity = {oid: tmp.oid, version: tmp.version};
				deleteList.push(entity);
			}
		}

		var entityList = new Array();
		for (var i = 0; i < selectArray.length; i++) {
			var key = selectArray[i];
			if (key in refs) continue;

			var tmp = keySplit(key);
			callGetValueApi(defName, "name", tmp.oid, tmp.version, false, function(label) {
				addReference("li_" + propName + key, viewAction, defName, key, label, propName, "ul_" + _propName, refEdit);

				var entity = {oid: tmp.oid, version: tmp.version, name: label};
				entityList.push(entity);
			});
		}

		if (func && $.isFunction(func)) {
			func.call(this, entityList, deleteList);
		}

		closeModalDialog();
	};

	var selType = "single";
	if (multi) selType = "multi";

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget(isSubModal);
	var $form = $("<form />").attr({method:"POST", action:selectAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);//定義名
	$("<input />").attr({type:"hidden", name:"multiplicity", value:multiplicity}).appendTo($form);//選択可能数
	$("<input />").attr({type:"hidden", name:"selectType", value:selType}).appendTo($form);//単一or複数
	$("<input />").attr({type:"hidden", name:"propName", value:propName}).appendTo($form);//プロパティ名
	$("<input />").attr({type:"hidden", name:"rootName", value:"ul_" + _propName}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	var kv = urlParam.split("&");
	if (urlParam.length > 0 && kv.length > 0) {
		for (var i = 0; i < kv.length; i++) {
			var _kv = kv[i].split("=");
			if (_kv.length > 0) {
				$("<input />").attr({type:"hidden", name:_kv[0], value:_kv[1]}).appendTo($form);
			}
		}
	}
	$form.submit();
	$form.remove();
}

function searchReferenceFromView(selectAction, updateAction, defName, id, propName, multiplicity, multi, urlParam, reloadUrl) {
	document.scriptContext["searchReferenceCallback"] = function(selectArray) {
		var _propName = propName.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");
		var refLink = new Array();
		var refList = document.getElementById(id);
		$(":hidden[name='" + propName + "']", refList).each(function() {
			refLink["idx_" + this.value] = this;
		});

		for (var key in refLink) {
			var exist = false;
			for (var i = 0; i < selectArray.length; i++) {
				if (key == selectArray[i]) {
					exist = true;
					break;
				}
			}
			if (!exist) {
				$(refLink[key]).remove();
			}
		}

		var $form = $("#detailForm");
		for (var i = 0; i < selectArray.length; i++) {
			var key = selectArray[i];
			if (key in refLink) continue;

			$("<input type='hidden' />").attr("name", propName).val(key).appendTo($form);
		}

		closeModalDialog();

		$("<input type='hidden' name='updatePropertyName' />").val(propName).appendTo($form);
		$("<input type='hidden' name='reloadUrl' />").val(reloadUrl).appendTo($form);
		$form.attr("action", updateAction).submit();

	};

	var selType = "single";
	if (multi) selType = "multi";

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget(isSubModal);
	var $form = $("<form />").attr({method:"POST", action:selectAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);//定義名
	$("<input />").attr({type:"hidden", name:"multiplicity", value:multiplicity}).appendTo($form);//選択可能数
	$("<input />").attr({type:"hidden", name:"selectType", value:selType}).appendTo($form);//単一or複数
	$("<input />").attr({type:"hidden", name:"propName", value:propName}).appendTo($form);//プロパティ名
	$("<input />").attr({type:"hidden", name:"rootName", value:id}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	var kv = urlParam.split("&");
	if (urlParam.length > 0 && kv.length > 0) {
		for (var i = 0; i < kv.length; i++) {
			var _kv = kv[i].split("=");
			if (_kv.length > 0) {
				$("<input />").attr({type:"hidden", name:_kv[0], value:_kv[1]}).appendTo($form);
			}
		}
	}
	$form.submit();
	$form.remove();
}

/**
 * 参照型の追加
 * @param defName
 * @param ulId
 * @param propName
 * @param multiplicity
 * @return
 */
function insertReference(addAction, viewAction, defName, propName, multiplicity, urlParam, refEdit, func) {
	var _propName = propName.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");
	if (canAddItem("ul_" + _propName, multiplicity)) {
		document.scriptContext["editReferenceCallback"] = function(entity) {
			var $ul = $("#ul_" + _propName);
			var key = entity.oid + "_" + entity.version;
			addReference("li_" + propName + key, viewAction, defName, key, entity.name, propName, "ul_" + _propName, refEdit);
			if (func && $.isFunction(func)) func.call(this, entity);

			closeModalDialog();
		};

		var isSubModal = $("body.modal-body").length != 0;
		var target = getModalTarget(isSubModal);
		var $form = $("<form />").attr({method:"POST", action:addAction, target:target}).appendTo("body");
		$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);//定義名
		if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
		var kv = urlParam.split("&");
		if (urlParam.length > 0 && kv.length > 0) {
			for (var i = 0; i < kv.length; i++) {
				var _kv = kv[i].split("=");
				if (_kv.length > 0) {
					$("<input />").attr({type:"hidden", name:_kv[0], value:_kv[1]}).appendTo($form);
				}
			}
		}
		$form.submit();
		$form.remove();
	} else {
		modalCancel();
	}
}

function insertReferenceFromView(addAction, defName, id, multiplicity, mappedBy, oid, updateAction, propName, reloadUrl) {
	var _propName = propName.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");

	var isMappedBy = mappedBy != null && mappedBy != "";
	var refList = document.getElementById(id);
	var count = $(":hidden[name='" + _propName + "']", refList).length;
	if (multiplicity == -1 || count < multiplicity) {
		document.scriptContext["editReferenceCallback"] = function(entity) {
			closeModalDialog();

			var $form = $("#detailForm");
			if (isMappedBy) {
				$form.attr("action", reloadUrl).submit()
			} else {
				var key = entity.oid + "_" + entity.version;
				$("<input type='hidden' name='" + propName + "' />").val(key).appendTo($form);
				$("<input type='hidden' name='updatePropertyName' />").val(propName).appendTo($form);
				$("<input type='hidden' name='reloadUrl' />").val(reloadUrl).appendTo($form);
				$form.attr("action", updateAction).submit();
			}
		};

		var isSubModal = $("body.modal-body").length != 0;
		var target = getModalTarget(isSubModal);
		var $form = $("<form />").attr({method:"POST", action:addAction, target:target}).appendTo("body");
		$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);//定義名
		if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
		if (isMappedBy) {
			$("<input />").attr({type:"hidden", name:"updateByParam", value:true}).appendTo($form);
			$("<input />").attr({type:"hidden", name:mappedBy, value:oid}).appendTo($form);
		}
		$form.submit();
		$form.remove();
	} else {
		modalCancel();
	}
}

function addReference(id, viewAction, defName, key, label, propName, ulId, refEdit) {
	var tmp = keySplit(key);
	var oid = tmp.oid;
	var ver = tmp.version;

	var $ul = $("#" + ulId);

	var $li = $("<li />").attr("id", id);

	//リンク追加
	var linkId = propName + "_" + tmp.oid;
	var $link = $("<a href='javascript:void(0)' />").attr("id", linkId).click(function() {
		showReference(viewAction, defName, oid, ver, linkId, refEdit);
	}).appendTo($li);
	$link.text(label);
	if ($("body.modal-body").length != 0) {
		$link.subModalWindow();
	} else {
		$link.modalWindow();
	}

	//削除ボタン追加
	var deletable = $ul.attr("deletable");
	if (deletable != null && deletable == "true") {
		var $btn = $(" <input type='button' />").val(scriptContext.locale.deleteBtn).addClass("gr-btn-02 ml05").appendTo($li);
		$btn.click(function() {
			$(this).parent().remove();
		});
	}

	//hidden追加
	$("<input type='hidden' />").attr({name:propName, value:key}).appendTo($li);

	$ul.append($li);

	$(".fixHeight").fixHeight();
}

function keySplit(key) {
	var index = key.lastIndexOf("_");
	var oid = key.substr(0, index);
	var version = key.substr(index + 1);
	return {oid: oid, version: version};
}

function getModalTarget(isSubModal) {
	var target = null;
	if (isSubModal) {
		target = $(document).attr("targetName");
	} else {
		target = $(".modal-inner iframe", document).attr("name");
	}
	return target;
}

function closeModalDialog() {
	var target = null;
	var isSubModal = $("body.modal-body").length != 0;
	if (isSubModal) {
		target = "#modal-dialog-" + $(document).attr("targetName") + " p.modal-close";
	} else {
		target = "#modal-close-root";
	}
	$(target, parent.document).click();
}

function modalCancel() {
	var isSubModal = $("body.modal-body").length != 0;
	if (isSubModal) {
		var target = getModalTarget(isSubModal);
		$("#modal-dialog-" + target + " .modal-wrap", parent.document).stop(true,true).fadeOut(0);
		$("#modal-dialog-" + target + " .modal-inner", parent.document).stop(true,true).fadeOut(0);
		$("#modal-dialog-" + target + " p.modal-close", parent.document).click();
	} else {
		$("#modal-dialog-root .modal-wrap", parent.document).stop(true,true).fadeOut(0);
		$("#modal-dialog-root  .modal-inner", parent.document).stop(true,true).fadeOut(0);
		$("#modal-close-root", parent.document).click();
	}
}

function getDialogTrigger($v, option) {
	var $dialogTrigger = null;
	var key = null;
	if (option && option.key) {
		//カスタム用ダイアログとして起動するためのトリガー
		$dialogTrigger = $(".dialogTrigger[key='" + option.key + "']", $v);
		key = option.key;
	} else {
		//通常のダイアログとして起動するためのトリガー
		$dialogTrigger = $(".dialogTrigger[key='defaultDialog']", $v);
		key = "defaultDialog";
	}
	if ($dialogTrigger.length == 0) {
		//ローデータ出力用のダイアログを表示するノード追加
		$dialogTrigger = $("<div />").attr({key:key}).addClass("dialogTrigger").prependTo($v);
		if ($("body.modal-body").length != 0) {
			$dialogTrigger.subModalWindow(option);
		} else {
			$dialogTrigger.modalWindow(option);
		}
	}
	return $dialogTrigger;
}

function viewEditableReference(viewAction, defName, oid, reloadUrl, refEdit) {
	document.scriptContext["editReferenceCallback"] = function() {
		submitForm(reloadUrl, {
			"defName":$(":hidden[name='defName']").val(),
			"oid":$(":hidden[name='oid']").val()
			});
	};

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget(isSubModal);
	var $form = $("<form />").attr({method:"POST", action:viewAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"oid", value:oid}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"refEdit", value:refEdit}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	$form.submit();
	$form.remove();
}

function editReference(detailAction, defName, oid, trId, propName, index) {
	document.scriptContext["editReferenceCallback"] = function(e) {
		loadEntity(defName, e.oid, function(entity) {
			var $tr = $("#" + trId);
//			if (oid == null || oid == "") {
//				//新規
//				var $td = $tr.children("td:first");
//				$("<input type='hidden' />").attr({name:propName + ".oid", value:entity.properties.oid}).appendTo($td);
//				$("<input type='hidden' />").attr({name:propName + ".version", value:entity.properties.version}).appendTo($td);
//			}

			var $headerRow = $tr.parent().prev("thead").children("tr:first");
			$headerRow.children("th").each(function(num) {
				var type = getType(this);
				var $td = $tr.children(":nth-child(" + (num + 1) + ")");
				var name = $td.attr("propName");
				if (type[0] == "String" || type[0] == "LongText") {
					//文字列
					updateNestValue_String(type[1], $td, propName, name, entity);
				} else if (type[0] == "Integer" || type[0] == "Float" || type[0] == "Decimal") {
					//数値
					updateNestValue_Number(type[1], $td, propName, name, entity);
				} else if (type[0] == "AutoNumber" || type[0] == "Expression") {
					//文字列
				} else if (type[0] == "Date") {
					//日付
					updateNestValue_Date(type[1], $td, propName, name, entity);
				} else if (type[0] == "Time") {
					//時間
					updateNestValue_Time(type[1], $td, propName, name, entity);
				} else if (type[0] == "Timestamp") {
					//日時
					updateNestValue_Timestamp(type[1], $td, propName, name, entity);
				} else if (type[0] == "Boolean") {
					//真偽
					updateNestValue_Boolean(type[1], $td, propName, name, entity);
				} else if (type[0] == "Select") {
					//選択
					updateNestValue_Select(type[1], $td, propName, name, entity);
				} else if (type[0] == "Binary") {
					//バイナリ
					updateNestValue_Binary(type[1], $td, propName, name, entity);
				} else if (type[0] == "Reference") {
					//参照
					updateNestValue_Reference(type[1], $td, propName, name, entity);
				} else if (type[0] == "Join") {
					//連結
					updateNestValue_Join(this, $td, propName, name, entity);
				} else if (type[0] == "refLink") {
					//編集リンク
					var $link = $($td).children("a");
					$link.removeAttr("onclick");
					$link.unbind("click");
					$link.click(function() {
						editReference(detailAction, defName, entity.properties.oid, trId, propName, index);
					});
					$link.modalWindow();
				}
			});

			//各プロパティでラベル表示だと、テキスト更新で消えるため最後に設定
			if ($(":hidden[name='" + es(propName + ".oid") + "']", $tr).length == 0) {
				var $td = $tr.children("td:first");
				$("<input type='hidden' />").attr({name:propName + ".oid", value:entity.properties.oid}).appendTo($td);
				$("<input type='hidden' />").attr({name:propName + ".version", value:entity.properties.version}).appendTo($td);
			}

			closeModalDialog();
		});
	};

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget();
	var $form = $("<form />").attr({method:"POST", action:detailAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"oid", value:oid}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"refEdit", value:true}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"updateByParam", value:true}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	//テーブル上の項目を取り出してダイアログに反映
	$("#" + trId + " [name]").each(function() {
		var name = replaceAll($(this).attr("name"), propName + ".", "");
		if ($(this).is(":checkbox")) {
			//チェックボックス、選択されてる場合のみ
			if ($(this).is(":checked")) {
				$("<input />").attr({type:"hidden", name:name, value:$(this).val()}).appendTo($form);
			}
		} else if ($(this).is(":radio")) {
			//ラジオ、選択されてる場合のみ
			if ($(this).is(":checked")) {
				$("<input />").attr({type:"hidden", name:name, value:$(this).val()}).appendTo($form);
			}
		} else {
			$("<input />").attr({type:"hidden", name:name, value:$(this).val()}).appendTo($form);
		}
	});
	$form.submit();
	$form.remove();
}

function updateNestValue_String(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	if (val == null) val = "";
	if (type == "Text") {
		$node.children(":text").val(val);
	} else if (type == "TextArea" || type == "RichText") {
		$node.children("textarea").val(val);
	} else if (type == "Password") {
		$node.children(":password").val(val);
	} else if (type == "Select") {
		$node.children("select").val(val);
	} else if (type == "Label") {
		$node.text(val);
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:val}).appendTo($node);
	}
}
function updateNestValue_Number(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	if (val == null) val = "";
	if (type == "Text") {
		$node.children(":text").val(val);
	} else if (type == "Label") {
		$node.text(val);
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:val}).appendTo($node);
	}
}
function updateNestValue_Date(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	var date = "";
	var label = "";
	if (val != null) {
		var $date = $.exDate(val, "yyyy-mm-dd");
		date = $date.toChar("yyyymmdd");
		label = $date.toChar("yyyy/mm/dd");
	}
	if (type == "DateTime") {
		$node.children(":text").val(date);
	} else if (type == "Label") {
		$node.text(label);
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:date}).appendTo($node);
	}
}
function updateNestValue_Time(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	var $date = null;
	if (val == null) val = "";
	else $date = $.exDate(val, "hh:mi:ss");
	if (type == "DateTime") {
		var sLength = $node.children("label").children("select").length;
		var hLength = $node.children(":hidden").length;

		var hour = $date != null ? $date.toChar("hh24") : "";
		var min = $date != null ? $date.toChar("mi") : "";
		var sec = $date != null ? $date.toChar("ss") : "";
		var hidden = $date != null ? $date.toChar("hh24miss") + ("000" + $date.getMilliseconds()).slice(-3) : "";

		$node.children("label").children("select:eq(0)").val(hour);//時
		if (sLength == 2) {
			$node.children("label").children("select:eq(1)").val(min);//分
		} else if (sLength == 3) {
			$node.children("label").children("select:eq(1)").val(min);//分
			$node.children("label").children("select:eq(2)").val(sec);//秒
		}
		if (hLength == 2) {
			//秒は非表示
			$node.children(":hidden:eq(0)").val(sec);
		} else if (hLength ==3) {
			//分、秒が非表示
			$node.children(":hidden:eq(0)").val(min);
			$node.children(":hidden:eq(1)").val(sec);
		}

		$node.children(":hidden:last").val(hidden);
	} else if (type == "Label") {
		$node.text(val);
		var hidden = $date != null ? $date.toChar("hh24miss") + $date.getMilliseconds() : "";
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:hidden}).appendTo($node);
	}
}
function updateNestValue_Timestamp(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	var $date = null;
	if (val == null) val = "";
	else {
		$date = $.exDate();
		$date.setTime(val);
	}
	if (type == "DateTime") {
		var sLength = $node.children("label").children("select").length;
		var hLength = $node.children(":hidden").length;

		var date = $date != null ? $date.toChar("yyyymmdd") : "";
		var hour = $date != null ? $date.toChar("hh24") : "";
		var min = $date != null ? $date.toChar("mi") : "";
		var sec = $date != null ? $date.toChar("ss") : "";
		var hidden = $date != null ? $date.toChar("yyyymmddhh24miss") + ("000" + $date.getMilliseconds()).slice(-3) : "";

		$node.children(":text").val(date);//日
		$node.children("label").children("select:eq(0)").val(hour);//時
		if (sLength == 2) {
			$node.children("label").children("select:eq(1)").val(min);//分
		} else if (sLength == 3) {
			$node.children("label").children("select:eq(1)").val(min);//分
			$node.children("label").children("select:eq(2)").val(sec);//秒
		}
		if (hLength == 2) {
			//秒は非表示
			$node.children(":hidden:eq(0)").val(sec);
		} else if (hLength ==3) {
			//分、秒が非表示
			$node.children(":hidden:eq(0)").val(min);
			$node.children(":hidden:eq(1)").val(sec);
		}

		$node.children(":hidden:last").val(hidden);
	} else if (type == "Label") {
		$node.text(val);
		var hidden = $date != null ? $date.toChar("yyyymmddhh24miss") + $date.getMilliseconds() : "";
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:hidden}).appendTo($node);
	}
}
function updateNestValue_Boolean(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	var displayName = "";
	var selectValue = "";
	if (val != null) {
		selectValue = val;
	}
	if (type == "Radio") {
//		$node.children("ul").children("li").children("label").children(":radio").val([selectValue]);
		$(":radio", $node).val([selectValue]);
	} else if (type == "Checkbox") {
		var checked = selectValue == true ? true : false;
		$(":checkbox", $node).attr("checked", checked);
	} else if (type == "Label") {
		var $ul = $node.children("ul");
		$ul.children("li").remove();
		var $li = $("<li />").appendTo($ul);
		$li.text(displayName);
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:selectValue}).appendTo($li);
	}
}
function updateNestValue_Select(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	var displayName = "";
	var selectValue = "";
	if (val != null) {
		displayName = val.displayName;
		selectValue = val.value;
	}
	if (type == "Radio") {
//		$node.children("ul").children("li").children("label").children(":radio").val([selectValue]);
		$(":radio", $node).val([selectValue]);
	} else if (type == "Checkbox") {
		var checked = selectValue == true ? true : false;
		$(":checkbox", $node).attr("checked", checked);
	} else if (type == "Select") {
		$node.children("select").val(selectValue);
	} else if (type == "Label") {
		var $ul = $node.children("ul");
		$ul.children("li").remove();
		var $li = $("<li />").appendTo($ul);
		$li.text(displayName);
		$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:selectValue}).appendTo($li);
	}
}
function updateNestValue_Binary(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	var $ul = $node.children("ul");
	$ul.children("li").remove();
	var $file = $node.children(":file");
	if (val == null) {
		$file.show();
	} else {
		$file.hide();
		var fileId = $file.attr("id");
		var propName = parentPropName + "." + name;
		var count = $file.attr("binCount") - 0;
		var param = "&defName=" + entity.definitionName + "&propName=" + name;
		addBinaryGroup(propName, count, fileId, val.name, val.type, val.lobId, type, param);
	}
}
function updateNestValue_Reference(type, $node, parentPropName, name, entity) {
	var val = entity.properties[name];
	if (type == "Link") {
		var $button = $node.children(":button");
		$node.children("ul").children("li").remove();
		if (val != null) {
			var viewAction = $button.attr("viewAction");
			var propName = $button.attr("propName");
			var _propName = propName.replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/\./g, "\\.");
			var defName = $button.attr("defName");
			var refEdit = $button.attr("refEdit");
			var key = val.properties.oid + "_" + val.properties.version;
			var label = val.properties.name;
			addReference("li_" + propName, viewAction, defName, key, label, propName, "ul_" + _propName, refEdit);
		}
	} else if (type == "Select") {
		var oid = "";
		if (val != null) oid = val.properties.oid + "_" + val.properties.version;
		$node.children("select").val(oid);
	} else if (type == "Checkbox") {
		if (val == null) {
			$node.children(":radio:checked").attr("checked",false);
		} else {
			$node.children(":radio").val(entity.properties.oid);
		}
	} else if (type == "RefCombo") {
		//TODO 参照コンボ
	} else if (type == "Label") {
		var $ul = $node.children("ul");
		$ul.children("li").remove();
		if (val != null) {
			var $li = $("<li />").text(val.properties.name).appendTo($ul);
			$("<input />").attr({type:"hidden", name:parentPropName + "." + name, value:val.properties.oid}).appendTo($li);
		}
	}
}
function updateNestValue_Join(head, $node, parentPropName, name, entity) {
	var propCount = $(head).children(":hidden[name='joinPropCount']").val() - 0;
	for (var i = 0; i < propCount; i++) {
		var joinPropName = $(head).children(":hidden[name='joinPropName" + i + "']").val();
		var propType = $(head).children(":hidden[name='joinPropType" + i + "']").val();
		var dispType = $(head).children(":hidden[name='joinDispType" + i + "']").val();

		//.と[]はjQueryのセレクタに使われてるので\\つける
		var propNameIdx = parentPropName.replace("[", "\\[").replace("]", "\\]") + "_" + name;
		var selector = "#join_" + propNameIdx + "_" + joinPropName + "_" + i;
		var $span = $node.children(selector);

		if (propType == "String" || propType == "LongText") {
			//文字列
			updateNestValue_String(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Integer" || propType == "Float" || propType == "Decimal") {
			//数値
			updateNestValue_Number(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Date") {
			//日付
			updateNestValue_Date(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Time") {
			//時間
			updateNestValue_Time(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Timestamp") {
			//日時
			updateNestValue_Timestamp(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Select") {
			//選択
			updateNestValue_Select(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Binary") {
			//バイナリ
			updateNestValue_Binary(dispType, $span, parentPropName, joinPropName, entity);
		} else if (propType == "Reference") {
			//参照
			updateNestValue_Reference(dispType, $span, parentPropName, joinPropName, entity);
		}
	}

}


////////////////////////////////////////////////////////
// テーブル行追加用のJavascript
////////////////////////////////////////////////////////
/*
 * テーブル行で追加したノードは何故かjQueryのセレクタがうまく機能しない。
 * document.getElementById等で代用する。
 * →アップロードや選択ダイアログ等のFunction呼出し先でも対応必要。
 */

/**
 * ネストされた参照型の入力テーブルに行を追加
 * @param rowId
 * @param countId
 * @param multiplicy
 * @return
 */
function addNestRow(rowId, countId, multiplicy, insertTop) {
	var $srcRow = $("#" + rowId);
	$srcRow.parents("table").show();
	var $tbody = $srcRow.parent();
	var rowCount = $tbody.children("tr").length;
	if (multiplicy != 0 && rowCount >= multiplicy) return;

	var $copyRow = $srcRow.clone().removeAttr("style");
	var $headerRow = $tbody.prev("thead").children("tr:first");
	if (insertTop && rowCount.length > 1) {
		$headerRow.after($copyRow);
	} else {
		$tbody.append($copyRow);
	}

	countUp(countId, function(idx) {
		var rowId = replaceDummyAttr($copyRow, "id", idx);
		$("[id]", $copyRow).each(function() {
			replaceDummyAttr(this, "id", idx);
		});
		$("[name]", $copyRow).each(function() {
			replaceDummyAttr(this, "name", idx);
		});
		if ((idx % 2) == 0) $copyRow.addClass("odd");
		else $copyRow.removeClass("odd");

		//形式による置換以外の処理
		$headerRow.children("th").each(function(num) {
			var type = getType(this);
			var $td = $copyRow.children(":nth-child(" + (num + 1) + ")");
			if (type[0] == "String" || type[0] == "LongText") {
				//文字列
				addNestRow_String(type[1], $td, idx);
			} else if (type[0] == "Decimal" || type[0] == "Float" || type[0] == "Integer") {
				//数値
				addNestRow_Number(type[1], $td, idx);
			} else if (type[0] == "Date") {
				//日付
				$td.children(":text").each(function() {datepicker(this);});
			} else if (type[0] == "Time") {
				//時間
				addNestRow_Time(type[1], $td, idx);
			} else if (type[0] == "Timestamp") {
				//日時
				addNestRow_Timestamp(type[1], $td, idx);
			} else if (type[0] == "Binary") {
				//バイナリ
				replaceDummyAttr($td.children(":file").change(function(){
					uploadFile(this);
				}), "pname", idx);
			} else if (type[0] == "Reference") {
				//参照
				addNestRow_Reference(type[1], $td, idx);
			} else if (type[0] == "Join") {
				//連結
				addNestRow_Join(this, $td, idx);
			} else if (type[0] == "refLink") {
				//編集リンク
				var $link = $($td).children("a");
				var propName = $link.attr("name");
				var defName = $link.attr("defName");
				var action = $link.attr("action");
				$link.click(function() {
					editReference(action, defName, "", rowId, propName, idx);
				});
				$link.modalWindow();
			} else if (type[0] == "last") {
				//削除ボタン
				$($td).children(":button").click(function() {deleteRefTableRow(rowId);});
			}
		});
	});
	$(".fixHeight").fixHeight();
}

/**
 * ネストされた参照型の入力テーブルに文字列型の入力欄追加
 * @param cell
 * @param idx
 * @return
 */
function addNestRow_String(type, cell, idx) {
	if (type == "RichText") {
		var $text = $(cell).children("textarea");
		$text.attr("id", "id_" + $text.attr("name"));
		$text.ckeditor();
	}
}

/**
 * ネストされた参照型の入力テーブルに数値型の入力欄追加
 * @param cell
 * @param idx
 * @return
 */
function addNestRow_Number(type, cell, idx) {
	var $text = $(cell).children(":text");
	if ($text.hasClass("commaFieldDummy")) {
		$text.removeClass("commaFieldDummy").addClass("commaField");
		$text.commaField();
	}
}

/**
 * ネストされた参照型の入力テーブルに時間型の入力欄追加
 * @param cell
 * @param idx
 * @return
 */
function addNestRow_Time(type, cell, idx) {
	if (type == "DateTime") {
		var id = $(cell).children(":hidden:last").attr("id").substring(2);
		$(cell).children("label").children("select").each(function() {
			this.removeAttribute("onchange");
			$(this).change(function() {timeChange(id);});
		});
	}
}

/**
 * ネストされた参照型の入力テーブルに日時型の入力欄追加
 * @param cell
 * @param idx
 * @return
 */
function addNestRow_Timestamp(type, cell, idx) {
	if (type == "DateTime") {
		var id = $(cell).children(":hidden:last").attr("id").substring(2);
		$(cell).children("label").children("select").each(function() {
			this.removeAttribute("onchange");
			$(this).change(function() {timestampChange(id);});
		});

		$(cell).children(":text").each(function() {
			this.removeAttribute("onchange");
			$(this).change(function() {timestampChange(id);});
			datepicker(this);
		});
	}
}

/**
 * ネストされた参照型の入力テーブルに参照型の入力欄追加
 * @param type
 * @param cell
 * @param idx
 * @return
 */
function addNestRow_Reference(type, cell, idx) {
	if (type == "Link") {
		var selButton = $(":button", $(cell));
		var selectAction = $(selButton).attr("selectAction");
		var viewAction = $(selButton).attr("viewAction");
		var defName = $(selButton).attr("defName");
		var propName = replaceDummyAttr(selButton, "propName", idx);
		var multiplicity = $(selButton).attr("multiplicity");
		var urlParam = $(selButton).attr("urlParam");
		var refEdit = $(selButton).attr("refEdit");
		var callbackKey = $(selButton).attr("callbackKey");
		var callback = scriptContext[callbackKey];
		$(selButton).unbind("click");
		$(selButton).click(function() {
			searchReference(selectAction, viewAction, defName, propName, multiplicity, false, urlParam, refEdit, callback);
		});
		if ($("body.modal-body").length != 0) {
			$(selButton).subModalWindow();
		} else {
			$(selButton).modalWindow();
		}
	} else if (type == "RefCombo") {
		//TODO 連動コンボ時の初期ロードで実行されるjavascriptをどうにかする
		$(cell).children("select").each(function() {
		});
	}
}

/**
 * ネストされた参照型の入力テーブルに組み合わせたプロパティの入力欄追加
 * @param head
 * @param cell
 * @param idx
 */
function addNestRow_Join(head, cell, idx) {
	var propName = $(head).children(":hidden[name='joinPropName']").val();
	var propCount = $(head).children(":hidden[name='joinPropCount']").val() - 0;
	for (var i = 0; i < propCount; i++) {
		var joinPropName = $(head).children(":hidden[name='joinPropName" + i + "']").val();
		var propType = $(head).children(":hidden[name='joinPropType" + i + "']").val();
		var dispType = $(head).children(":hidden[name='joinDispType" + i + "']").val();

		//.と[]はjQueryのセレクタに使われてるので\\つける
		var propNameIdx = propName.replace("idx", idx).replace("[", "\\[").replace("]", "\\]");
		var selector = "#join_" + propNameIdx + "_" + joinPropName + "_" + i;
		var $span = $(cell).children(selector);

		if (propType == "String" || propType == "LongText") {
			//文字列
			addNestRow_String(dispType, $span, idx);
		} else if (propType == "Date") {
			//日付
			$span.children(":text").each(function() {datepicker(this);});
		} else if (propType == "Time") {
			//時間
			addNestRow_Time(dispType, $span, idx);
		} else if (propType == "Timestamp") {
			//日時
			addNestRow_Timestamp(dispType, $span, idx);
		} else if (propType == "Binary") {
			//バイナリ
			replaceDummyAttr($span.children(":file").change(function(){
				uploadFile(this);
			}), "pname", idx);
		} else if (propType == "Reference") {
			//参照
			addNestRow_Reference(dispType, $span, idx);
//		} else if (propType == "Join") {
//			//連結→Join>Join>Stringとかは許容しないのでJoin>Stringとかで設定してもらう
//			addNestRow_Join(this, $td, idx);
		}
	}
}

/**
 * 参照型の入力テーブルのセルの種類を取得
 * @param cell
 * @return
 */
function getType(cell) {
	var ret = new Array();
	$(cell).children(":hidden").each(function(index, elem) {
		ret[index] = $(this).val();
	});
	return ret;
}

function deleteRefTableRow(id) {
	var $tbody = $("#" + id).parent();
	deleteItem(id);
	if ($("tr:not(:hidden)", $tbody).length == 0) {
		$tbody.parent("table").hide();
	};
}


/**
 * 時間型の変更イベント
 * @param id
 * @return
 */
function timeChange(id) {
	var $hour = $("#h_" + es(id));
	var $min = $("#m_" + es(id));
	var $sec = $("#s_" + es(id));
	var $hidden = $("#i_" + es(id));

	var bHour = $hour.val() == "  ";
	var bMin = $min.is(":hidden") || $min.val() == "  ";
	var bSec = $sec.is(":hidden") || $sec.val() == "  ";

	if (bHour && bMin && bSec) {
		//全て未入力もしくは非表示なら空で
		$hidden.val("");
	} else {
		//一つでも表示されてる項目に値があれば連結
		$hidden.val($hour.val() + $min.val() + $sec.val() + "000");
	}
}

/**
 * 日時型の変更イベント
 * @param id
 * @return
 */
function timestampChange(id) {
	var $date = $("#d_" + es(id));
	var $hour = $("#h_" + es(id));
	var $min = $("#m_" + es(id));
	var $sec = $("#s_" + es(id));
	var $msec = $("#ms_" + es(id));
	var $hidden = $("#i_" + es(id));

	var bDate = $date.val() == "";
	var bHour = $hour.is(":hidden") || $hour.val() == "  ";
	var bMin = $min.is(":hidden") || $min.val() == "  ";
	var bSec = $sec.is(":hidden") || $sec.val() == "  ";

	if (bDate && bHour && bMin && bSec) {
		//全て未入力もしくは非表示なら空で
		$hidden.val("");
	} else {
		//一つでも表示されてる項目に値があれば連結
		var date = $date.val() == "" ? "        " : $date.val();
		$hidden.val(date + $hour.val() + $min.val() + $sec.val() + $msec.val());
	}
}

function replaceDummyAttr(elem, key, dst) {
	$(elem).attr(key, replaceDummy($(elem).attr(key), dst));
	return $(elem).attr(key);
}

/**
 * src内の文字列(Dummy)をdstに置換
 * @param src
 * @param dst
 * @return
 */
function replaceDummy(src, dst) {
	if (src != null && src != "") {
		return src.replace("Dummy", dst);
	}
	return src;
}

/**
 * src内の文字列(Dummy)をdstに全置換
 * @param src
 * @param dst
 * @return
 */
function replaceAllDummy(src, dst) {
	return replaceAll(src, "Dummy", dst);
}
function replaceAll(src, reg, dst) {
	if (src != null && src != "") {
		return src.split(reg).join(dst);
	}
}

/**
 * 数値の十の桁を0埋め
 * @param num
 * @return
 */
function fill(num, size) {
	var fillStr = "";
	for (var i = 0; i < size; i++) {
		fillStr = fillStr + "0";
	}
	return (fillStr + num).slice(-size);
}


/**
 * バイナリデータのURL生成
 * @param br
 * @param downloadUrl
 * @returns {String}
 */
function url(br, downloadUrl) {
	var url = downloadUrl + "?id=" + br.lobId;
	if (br.definitionName != null) {
		url = url + "&defName=" + br.definitionName + "&propName=" + br.propertyName;
	}
	return url;
}

function cloneDetailConditionRow($src, id) {
	var $copy = $src.clone().attr("id", id).css("display", "block");
	$('.data-deep-search tbody tr:last').after($copy);
	return $copy;
}

/**
 * 検索項目追加
 *
 */
function addDetailCondition() {
	countUp("id_detailConditionCount", function(count) {
		var $table = $(".data-deep-search tbody");
		var $srcRow = $table.children("tr:first");
		var $copyRow = cloneDetailConditionRow($srcRow, "detailCond_" + count).removeAttr("style");

		$copyRow.children("td:nth-child(1)").text(count + ".");
		$copyRow.children("td:nth-child(2)").children("select")
			.attr("name","dtlCndPropNm_" + count).each(function() {
			    this.selectedIndex  = 0;
			});
		$copyRow.children("td:nth-child(3)").children("select")
			.attr("name", "dtlCndPrdct_" + count).each(function() {
				this.selectedIndex  = 0;
			});
		$copyRow.children("td:nth-child(4)").children(":text")
			.attr("name", "dtlCndVl_" + count).val("");
	});
}
function deleteDetailCondition(img) {
	if ($(".data-deep-search tbody tr").length == 1) {
		$(".data-deep-search select").each(function() {
			$(this).children("option:first").attr("selected", "selected");
		});
		$("#id_detailConditionTable :text").val("");
	} else {
		$(img).parents("tr").remove();
	}
}


////////////////////////////////////////////////////////
// ツリーメニュー用のJavascript
////////////////////////////////////////////////////////

/**
 * ツリーメニューの初期化
 */
function initTreeMenu(webapi, id) {
	var $top = $("#" + id);
	var params = "{\"treeName\":\"" + $top.attr("treeName") + "\", \"path\":\"init\"}";
	postAsync(webapi, params, function(results){
		var ed = results.defaultResult;
		if (ed == null || ed.length == 0) {
			return;
		}

		if (ed) {
			$(ed).each(function() {
				convEntityDefinition(this, $top);
			});
		}
		$top.treeview({
			toggle: toggleNode
		});
	});
}

/**
 * ノードのトグルイベント処理
 * @return
 */
function toggleNode() {
	var oid = $(this).attr("oid");
	if (typeof oid === "undefined") oid = "";
	var path = $(this).attr("path");
	var offset = $(this).attr("offset");
	if (typeof offset === "undefined") offset = "";
	var loaded = $(this).attr("loaded");
	if (path && !loaded) {
		var $ul = $(this).children("ul:first");
		var $root = $(this).parents("ul.treemenutop");
		var treeName = $root.attr("treeName");
		var params = "{"
		params += "\"treeName\":\"" + treeName + "\"";
		params += ", \"path\":\"" + path + "\"";
		params += ", \"oid\":\"" + oid + "\"";
		params += ", \"offset\":\"" + offset + "\"";
		params += "}";
		postAsync("gem/tree/treeMenu", params, function(results){
			var data = results.defaultResult;
			if (data == null || data.length == 0) {
				return;
			}

			if (offset == "") {
				convReference(data, $ul);
				$root.treeview({
					add: $ul,
					toggle: toggleNode
				});
			} else {
				$(data).each(function() {
					convEntity(this, $ul);
				});
				$root.treeview({
					add: $ul,
					toggle: toggleNode
				});
			}
		});
		$(this).attr("loaded", true);
	}
}

/**
 * Entity定義階層変換
 * @param ed
 * @param parent
 * @return
 */
function convEntityDefinition(ed, parent) {
	var _parent = null;
	var hide = false;
	if (ed.displayNode) {
		_parent = $("<li />").appendTo(parent).prepend("<div class=\"hitarea \"/>");
		if (ed.cssStyle) $(_parent).addClass(ed.cssStyle);
		if (ed.icon) $(_parent).css('background-image', 'url(' + contentPath + ed.icon + ')');
		var span = $("<span />").text(ed.displayName).appendTo(_parent);
		hide = true;
	} else {
		_parent = parent;
	}
	var $ul = null;
	$(ed.list).each(function() {
		if ($ul == null) $ul = $("<ul />").appendTo(_parent);
		if (hide) $ul.hide();
		if (this.type == "index") {
			convIdx(this, $ul);
		} else if (this.type == "entity") {
			convEntity(this, $ul);
		}
	});
	var $root = $(this).parents("ul.treemenutop");
}

/**
 * Index階層変換
 * @param idx
 * @param parent
 * @return
 */
function convIdx(idx, parent) {
	var $li = $("<li />").attr({path:idx.path, oid:idx.oid, offset:idx.offset}).appendTo(parent).prepend("<div class=\"hitarea \"/>");
	if (idx.cssStyle) $li.addClass(idx.cssStyle);
	if (idx.icon) $li.css('background-image', 'url(' + contentPath + idx.icon + ')');
	$("<span />").text(idx.name).appendTo($li);
	var $ul = $("<ul />").appendTo($li);
	$ul.hide();
}

/**
 * Entity階層変換
 * @param e
 * @param parent
 * @return
 */
function convEntity(e, parent) {
	var $li = $("<li />").attr({path:e.path, oid:e.oid}).appendTo(parent);
	if (e.cssStyle) $li.addClass(e.cssStyle);
	if (e.icon) $li.css('background-image', 'url(' + contentPath + e.icon + ')');
	var spanName = $("<span />").addClass("name").text(e.name).appendTo($li);
	var span = $("<span />").addClass("link").appendTo(spanName);
	$(span).append(" [<a href='javascript:void(0);'>" + scriptContext.locale.detailLink + "</a>]");
	var action = e.action != null ? e.action : "gem/generic/detail/view";
	$(span).children("a").click(function() {
		submitForm(contextPath + "/" + action, {defName: e.defName, oid: e.oid});
	});
	if (e.hasReference) {
		$li.prepend("<div class=\"hitarea \"/>");
		$("<ul />").appendTo($li);
	}
}

/**
 * 参照階層変換
 * @param data
 * @param parent
 * @return
 */
function convReference(data, parent) {
	if (data) {
		$(parent).children("li").remove();
		$(data).each(function() {
			convEntityDefinition(this, parent);
		});
		$(parent).toggle();
	}
}

function uniqueId() {
	var randam = Math.floor(Math.random() * 1000).toFixed(0);
	var date = new Date();
	var time = date.getTime();
	return randam + '_' + time.toString();
}

function isIE() {
	if(!$.support.noCloneEvent){
		return true;
	}
	return false;
}

////////////////////////////////////////////////////////
//カレンダー用のJavascript
////////////////////////////////////////////////////////

function loadCalendar(calendarName, calendarType) {
	var fromDate = null;
	var toDate = null;
	var tmpDate = $.exDate(sysdate, "yyyymmddhhmiss");
	var calendarDate = getCalendarDate(calendarName);
	tmpDate.setFullYear(calendarDate.getFullYear());
	tmpDate.setMonth(calendarDate.getMonth());
	tmpDate.setDate(calendarDate.getDate());
	var func = null;
	if (calendarType == 1) {
		tmpDate.addDays(- tmpDate.getDay());
		fromDate = tmpDate.toChar("yyyymmdd");
		tmpDate.addDays(6);
		toDate = tmpDate.toChar("yyyymmdd");
		func = applyWeekData;
	} else if (calendarType == 2) {
		tmpDate.setDate(1);
		fromDate = tmpDate.toChar("yyyymmdd");
		tmpDate.setFullYear(calendarDate.getFullYear());
		tmpDate.setMonth(calendarDate.getMonth());
		tmpDate.setDate(tmpDate.lastDay().getDate());
		tmpDate.addDays(6 - tmpDate.getDay());
		toDate = tmpDate.toChar("yyyymmdd");
		func = applyMonthData;
	}

	getCalendarData("gem/calendar/getCalendar", calendarName, fromDate, toDate, func);
}


function buildTable(inc, calendarName, calendarType) {
	var calendarDate = getCalendarDate(calendarName);
	if (inc == 0) {
		calendarDate = $.exDate(sysdate, "yyyymmddhhmiss");
	}

	if (calendarType == 1) {
		//週を加算
		calendarDate.addDays(7*inc);
		var year = calendarDate.getFullYear();
		var month = calendarDate.getMonth();
		$("#calendar_" + es(calendarName) + " ul.schedule li").remove();
		buildWeek($("#calendar_" + es(calendarName)), year, month, calendarDate.weekOfMonth() - 1, calendarName);
	} else if (calendarType == 2) {
		//月を加算
		calendarDate = calendarDate.addMonths(inc);
		var year = calendarDate.getFullYear();
		var month = calendarDate.getMonth();
		$("#calendar_" + es(calendarName) + " tr.week").remove();
		buildMonth($("#calendar_" + es(calendarName)), year, month, calendarName);
	}
	setCalendarDate(calendarName, calendarDate);
	$("#calendar_" + es(calendarName) + " div.target span").text(calendarDate.toChar("yyyy年mm月"));
	loadCalendar(calendarName, calendarType);
}

function buildWeek(table, year, month, week, calendarName) {
	//現在の曜日を取得して週の頭から再構築
	var date = $.exDate(sysdate, "yyyymmddhhmiss")
	var currentYear = date.getFullYear();
	var currentMonth = date.getMonth();
	var currentDate = date.getDate();

	date.setYear(year);
	date.setMonth(month, 1);
	var $date = $.exDate(date);
	if (week > 0) $date.addDays(7*week);
	$date.addDays(- $date.getDay());

	var calDefs = getCalendarDefinitions(calendarName);

	var from = date.toChar("yyyy年mm月dd日") + "（" + getDayOfTheWeekShort($date.getDay()) + "）";
	$(table).children("tbody").each(function(){
		var $trHead = $("#calendar_" + es(calendarName) + "_head");
		var $trAll = $("#calendar_" + es(calendarName) + "_all");
		var $trAm = $("#calendar_" + es(calendarName) + "_am");
		var $trPm = $("#calendar_" + es(calendarName) + "_pm");
		for (var i = 0; i < 7; i++) {
			var _month = $date.getMonth() + 1;
			var day = $date.getDate();
			var ymd = $date.toChar("yyyymmdd");
			var id = calendarName + "_" + ymd;

			var $tdHead = $("#dayOfWeek" + i, $trHead);
			var $tdAll = $("td:eq(" + i + ")", $trAll);
			var $tdAm = $("td:eq(" + i + ")", $trAm);
			var $tdPm = $("td:eq(" + i + ")", $trPm);

			//ID振り直す
			$tdAll.attr("id", id + "_all");
			$tdAm.attr("id", id + "_am");
			$tdPm.attr("id", id + "_pm");

			if (year == currentYear
					&& month == currentMonth
					&& day == currentDate) {
				$tdHead.parent().addClass("today");
				$tdAll.addClass("today");
				$tdAm.addClass("today");
				$tdPm.addClass("today");
			} else {
				$tdHead.parent().removeClass("today");
				$tdAll.removeClass("today");
				$tdAm.removeClass("today");
				$tdPm.removeClass("today");
			}
			$tdHead.text(_month + "/" + day);

			if (calDefs.length > 0) {
				var $innerList = $tdHead.parent().children("div.addList").children("ul");
				$innerList.children("li").remove();
				createAddList($innerList, ymd, calendarName, 1, calDefs)
			}

			if (i < 6) $date.addDays(1);
		}
	});
	var to = $date.toChar("mm月dd日") + "（" + getDayOfTheWeekShort($date.getDay()) + "）";
	$("#" + es(calendarName) + "_from").text(from);
	$("#" + es(calendarName) + "_to").text(to);
}

function buildMonth(table, year, month, calendarName) {
	//最終週を算出して月初から構築
	var d = new Date();
	d.setYear(year);
	d.setMonth(month, 1);
	var lastDay = $.exDate(d).lastDay();
	d.setDate(lastDay.getDate());
	var lastDate = $.exDate(d);
	var lastWeek = lastDate.weekOfMonth();
	for (var weekOfMonth = 0; weekOfMonth < lastWeek; weekOfMonth++) {
		buildWeekOfMonth(table, year, month, weekOfMonth, calendarName);
	}
	$(".daymore", table).calendar();
	var month = d.toChar("yyyy年mm月");
	$("#" + es(calendarName) + "_month").text(month);
}

function buildWeekOfMonth(table, year, month, week, calendarName) {
	//現在の曜日を取得して日曜から構築
	var date = $.exDate(sysdate, "yyyymmddhhmiss")
	var currentYear = date.getFullYear();
	var currentMonth = date.getMonth();
	var currentDate = date.getDate();
	date.setYear(year);
	date.setMonth(month, 1);
	var $date = $.exDate(date);
	if (week > 0) $date.addDays(7*week);
	$date.addDays(- $date.getDay());
	var calDefs = getCalendarDefinitions(calendarName);
	$(table).children("tbody").each(function(){
		var tr = $("<tr />").appendTo(this).addClass("week");
		for (var i = 0; i < 7; i++) {
			var day = $date.getDate();
			var _month = $date.getMonth();
			var _year = $date.getFullYear();
			var ymd = $date.toChar("yyyymmdd");
			var id = calendarName + "_" + ymd;
			var $td = $("<td />").appendTo(tr);
			$td.attr("id", id);
			if (_year == currentYear
					&& _month == currentMonth
					&& day == currentDate) {
				$td.addClass("today");
			}
			var outOfMonth = month != $date.getMonth();
			if (outOfMonth) {
				$td.addClass("other");
			}
			var $daybox = $("<div />").appendTo($td).addClass("daybox");
			var $schedulebox = $("<div />").appendTo($daybox).addClass("schedulebox");
			var $head = $("<div />").appendTo($schedulebox).addClass("head");
			var $sDate = $("<span />").appendTo($head).addClass("date").text(day);
			if (!outOfMonth) {
				var $close = $("<span />").appendTo($head).addClass("close").text("×");

				if (calDefs.length > 0) {
					var $add = $("<span />").appendTo($head).addClass("add");
					var $link = $("<a />").appendTo($add).attr("href", "javascript:void(0)");
					$("<img />").addClass("rollover").attr("src", imagePath + "/btn-add-01.png").appendTo($link);
					var $addList = $("<div />").appendTo($head).addClass("addList");
					var $innerList = $("<ul />").appendTo($addList);
					createAddList($innerList, ymd, calendarName, 2, calDefs)
					$add.calendarAddList();
				}
				var $dayDetail = $("<div />").addClass("daydetail").appendTo($schedulebox);
				$("<ul />").appendTo($dayDetail).addClass("schedule");
				$("<p />").appendTo($dayDetail).addClass("daymore");
				$("<ul />").appendTo($dayDetail).addClass("moreschedule");

			}

			$date.addDays(1);
		}
	});
}

function getCalendarDefinitions(calendarName) {
	var calDefs = null;
	if (scriptContext.calendarDefs && scriptContext.calendarDefs[calendarName]) {
		calDefs = scriptContext.calendarDefs[calendarName];
	} else {
		calDefs = new Array();
	}
	return calDefs;
}
function createAddList($addList, date, calendarName, calendarType, calDefs) {
	for (var i = 0; i < calDefs.length; i++) {
		var def = calDefs[i];
		var $li = $("<li>").appendTo($addList);
		$("<a />").appendTo($li).attr({"href":"javascript:void(0)","index":i}).text(def.dispName).click(function() {
			var _def = calDefs[$(this).attr("index")];
			addCalendar(_def.defName, _def.addAction, _def.viewName, date, calendarName, calendarType);
		}).modalWindow();
	}
}

function applyWeekData(calendarDataList, calendarName) {
	$("#calendar_" + es(calendarName) + " ul.schedule").children().remove();
	$(calendarDataList).each(function() {
		convWeekDataList(this, calendarName);
	});
}

function convWeekDataList(calendarData, calendarName) {
	var id = calendarName + "_" + calendarData.date;
	$(calendarData.list).each(function() {
		convWeekData(this, id, calendarName)
	});
}

function convWeekData(data, id, calendarName) {
	var time = data.time;
	var suffix = "_all";
	var hasTime = time != null && time != "" && time.indexOf(":") != -1;
	if (hasTime) {
		if (time.indexOf("-") == 0) time = time.substring(1);
		var hour = time.split(":")[0] - 0;
		if (hour < 12) suffix = "_am";
		else suffix = "_pm";
	}
	var $ul = $("#" + es(id) + suffix + " ul.schedule");
	var $li = $("<li />").appendTo($ul);
	var html = null;
	if (hasTime) {
		html = "<span class='time'>" + data.time + "</span>" + data.name;
	} else {
		html = data.name;
	}
	var $link = $("<a href='javascript:void(0);' />").appendTo($li).append(html).click(function() {
		clickCalendarLink(calendarName, 1, data);
	}).modalWindow();
//	$link.append(html);
}

function applyMonthData(calendarDataList, calendarName) {
	$("#calendar_" + es(calendarName) + " p.daymore").hide();
	$("#calendar_" + es(calendarName) + " ul.schedule").children().remove();
	$("#calendar_" + es(calendarName) + " ul.moreschedule").children().remove();
	$(calendarDataList).each(function() {
		convMonthDataList(this, calendarName);
	});
}

function convMonthDataList(calendarData, calendarName) {
	var id = calendarName + "_" + calendarData.date;
	$(calendarData.list).each(function() {
		convMonthData(this, id, calendarName)
	});
}

function convMonthData(data, id, calendarName) {
	var $ul = $("#" + es(id) + " ul.schedule");
	var $targetUl = null;
	if ($ul.children().length < 2) {
		//そのまま表示
		$targetUl = $ul;
	} else {
		//他へ
		$targetUl = $("#" + es(id) + " ul.moreschedule");
		var $more = $("p.daymore", $("#" + es(id)));
		var count = $targetUl.children().length + 1;
		var text = "［他{0}件］".replace("{0}", count);
		if ($("a", $more).length == 0) {
			$("<a href='#' />").text(text).appendTo($more);
		} else {
			$("a", $more).text(text);
		}
		$more.attr("style", "");
	}

	var $li = $("<li />").appendTo($targetUl);
	var text = null;
	var $link = $("<a href='javascript:void(0);' />").appendTo($li).text(data.name).click(function() {
		clickCalendarLink(calendarName, 2, data);
	}).modalWindow();
}

function clickCalendarLink(calendarName, calendarType, data) {
	document.scriptContext["editReferenceCallback"] = function(entity) {
		closeModalDialog();
		loadCalendar(calendarName, calendarType);
	};

	var viewAction = "gem/generic/detail/ref/view";
	if (data.viewAction && data.viewAction != "") viewAction = data.viewAction;
	if (data.viewName && data.viewName != "") viewAction = viewAction + "/" + data.viewName;
	var viewAction = contextPath + "/" + viewAction;

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget(isSubModal);
	var $form = $("<form />").attr({method:"POST", action:viewAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:data.defName}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"oid", value:data.oid}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"version", value:data.version}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"refEdit", value:true}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	$form.submit();
	$form.remove();
}

function getDayOfTheWeekShort(dayOfWeek) {
	var w = ["日","月","火","水","木","金","土"]
	return w[dayOfWeek];
}
function setCalendarDate(calendarName, $date) {
	$("#calendar_" + es(calendarName)).attr("calendarDate", $date.toChar("yyyymmddhhmiss"));
}
function getCalendarDate(calendarName) {
	var date = $("#calendar_" + es(calendarName)).attr("calendarDate");
	return $.exDate(date, "yyyymmddhhmiss");
}
function addCalendar(defName, action, viewName, date, calendarName, calendarType) {
	document.scriptContext["editReferenceCallback"] = function(entity) {
		closeModalDialog();
		loadCalendar(calendarName, calendarType);
	};

	var addAction = "gem/calendar/add";
	if (action && action != "") addAction = action;
	if (viewName && viewName != "") addAction = addAction + "/" + viewName;
	addAction = contextPath + "/" + addAction;

	var isSubModal = $("body.modal-body").length != 0;
	var target = getModalTarget(isSubModal);
	var $form = $("<form />").attr({method:"POST", action:addAction, target:target}).appendTo("body");
	$("<input />").attr({type:"hidden", name:"defName", value:defName}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"calendarName", value:calendarName}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"date", value:date}).appendTo($form);
	$("<input />").attr({type:"hidden", name:"refEdit", value:true}).appendTo($form);
	if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
	$form.submit();
	$form.remove();
}

/**
 * jQueryのselector用文字列をエスケープ
 * @param str
 * @returns
 */
function es(str) {
	return str.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g, '\\$&');
}
/**
 * jQueryのselector用文字列をリプレイス
 * 内部でセレクタのエスケープをしていないplugin用
 * @param str
 * @returns
 */
function rs(str) {
	return str.replace(/[#;&,\.\+\*~':"!\^\$\[\]\(\)=>|\/\\]/g, '_');
}
