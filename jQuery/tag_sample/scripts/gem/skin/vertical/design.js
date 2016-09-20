////////////////////////////////////////////////////////
// 垂直メニューデザイン用のJavascript
////////////////////////////////////////////////////////

/**
 * イベント実行
 */
$(function(){
	/**共通イベント**/
	$('#content').addClass('fixHeight');	//高さ揃えのクラス追加
	$('#snav, #content-inner, #split-block').addClass('fixHeightChild');	//高さ揃えのクラス追加
	$(".fixHeight").fixHeight();	//高さ揃え実行
	$('.selectbox').jQselectable();	//ヘッダーセレクトプルダウン
	$('li#account-01').accountInfo({w:135});	//アカウント情報プルダウン
	$('li#setting').accountInfo({w:62});	//アカウント情報プルダウン
	$("#split-block").navSplit();	//サイドエリア開閉
	$("#nav .nav-wrap > li").children(".nav-detail").navToggle();	//サイドナビ開閉
	$('#snav').tabContent({
		clickFunc:function($menu) {
			//メニュー/ウィジェットの状態保持
			if ($menu.hasClass("menu-shortcut")) {
				setCookie("currentMenuTab", "menu-shortcut", 0);
			} else {
				setCookie("currentMenuTab", "menu-shortcut", -1);
			}
		}
	});	//サイドナビタブ切り替え
	$('#pagetop').pageTop();	//ページトップ
	$('.rollover').rollOverSet();	//ロールオーバー
	datepicker(".datepicker");
	$('.tp').toolTip();	//ツールチップ
	$('.sechead').sectoinToggle();	//セクション開閉
	$("div.audit-log").auditLog();
	$('.nav-section li').pageSecton();	//ページ内スクロール

	/**トップカレンダー**/
	$('#top-cal .daymore').calendar({
		calwrap : '.cal-wrap-03',
		w : 10
	});

	$("div.entity-list-widget").nameList();

	$('input.upload-button, input.upload-button-02').change(function() {　//画像アップロード
		uploadFile(this);
	});
	$("a.binaryDelete").click(function() {　//画像アップロード削除
		var fileId = $(this).attr("fileId");
		$(this).parent().remove();
		$("#" + es(fileId)).show();
	});

	/**カレンダー**/
	$('.cal-wrap .daymore').calendar();	//カレンダー詳細
	$('.weekly-area .cal-close').calToggle();	//テーブルヘッダー開閉
	$('.day-area .cal-close').calToggle();	//テーブルヘッダー開閉
	$(".tbl-calendar-03 span.add").calendarAddList();
	$(".addList a").modalWindow();

	/**検索**/
	$('.tp02').toolTip({	//ツールチップ
		offleft : 75,
		range : 77
	});
	$('.data-deep-search .add').click(function(){　//検索項目追加
		addDetailCondition();
		$('.fixHeight').fixHeight();
	});
	$('.data-deep-search').delegate('.delete', 'click', function(){	//検索項目削除
		deleteDetailCondition(this);
		$('.fixHeight').fixHeight();
	});

	/**ゴミ箱**/
	$('.allInput').allInputCheck();

	//cookieから展開状態復元
	$("#nav .nav-wrap > li:has('.nav-detail')").each(function() {
		var id = $(this).attr("id");
		if (getCookie(id)) {
			$("p>a", this).click();
		}
	});
	if (getCookie("currentMenuTab")) {
		$("." + getCookie("currentMenuTab")).click();
	}
	if (getCookie("navSplit")) {
		$("#split-btn").click();
	}

	$("#content").show();

	//以下は画面表示後でないと動かない処理
	$('.tableStripe tr:not(:hidden):odd').addClass("odd");	//テーブルストライプ
});

/**
 * ナビトグル
 */
(function($) {
	$.fn.navToggle = function(){
		return $(this).each(function(){
			var $this = $(this);
			$this.prev().toggle(function(){
				$this.parent().addClass("hover");
				$(".fixHeight").fixHeight();

				var id = $this.parent().attr("id");
				setCookie(id, true, 0);
			},
			function () {
				$this.parent().removeClass("hover");
				$(".fixHeight").fixHeight();

				var id = $this.parent().attr("id");
				setCookie(id, false, -1);
			});
		});
	};
})(jQuery);

/**
 * サイドエリア開閉
 *
 * [オプション]
 * content:	ホバーのクラス追加する属性
 *
 */
(function($){
	$.fn.navSplit = function(options){
		var defaults = {
			content : '#content',
			footer : '#footer'
		};
		var options = $.extend(defaults, options);
		return $(this).each(function(){
			var $this = $(this),
				$splitbtn = $this.children(),
				$footer = $(options.footer),
				//$offtop = $splitbtn.offset().top,
				$offtop = $footer.offset().top,
				$content = $(options.content),
				$contenth;

			$this.hover(function(e){
				$content.addClass("hover");
				$contenth = $this.height();
				if($contenth - 25 < e.pageY - $offtop){
					$splitbtn.css({'bottom': 0, 'top': 'auto'});
				}else if(e.pageY - $offtop < 40){
					$splitbtn.css({top: 0});
				}else{
					$splitbtn.css({top: e.pageY - $offtop - 40});
				}

			},function(){
				$content.removeClass("hover");
			}).toggle(function(){
				$content.addClass("cotent-col-01");
				$(".fixHeight").fixHeight();

				setCookie("navSplit", true, 0);
			},
			function () {
				$content.removeClass("cotent-col-01");
				$(".fixHeight").fixHeight();

				setCookie("navSplit", false, -1);
			});
		});
	};
})(jQuery);

/**
 * ヘッダーセレクトプルダウン
 *
 * [オプション]
 * pulldown:	プルダウンクラス
 * select:	セレクトクラス
 * selected:	プルダウン内の選択している箇所
 * f:  クリック時のクラス
 *
 */
(function($){
	$.fn.jQselectable = function(options){
		var defaults = {
			pulldown : '.pulldown',
			select : 'a.select',
			selected : 'a.selected',
			f : 'a.select_focus'
		};
		var options = $.extend(defaults, options);
		return this.each(function(){
			var $self = $(this),
			$select = $(options.select, $self),
			pulldown = $(options.pulldown, $self),
			data = $('input:hidden', $self),
			select_value = $('span', $select),
			text;

			$select.click(function(e){
				if($(this).hasClass('select_focus')){
					$(this).removeClass('select_focus');
					$(options.pulldown).hide();
				}else{
					pulldown.show().css('z-index', 50);
					$(this).addClass('select_focus');
				}

				e.stopPropagation();
				return false;
			});

			$('a', pulldown).click(function(){
				text = $(this).text();
				select_value.text(text);

				$(options.selected, pulldown).removeClass('selected');
				$(options.f).removeClass('select_focus');
				$(this).addClass('selected');

				pulldown.hide();

				$('.select').show();

				return false;
			});

			$('body, .hed-pull, a').not('a.select').click(function(){
				$(options.f).removeClass('select_focus');
				$(options.pulldown).hide();
				$('.select').show();
			});
		});
	};
})(jQuery);

/**
 * カレンダー
 *
 * [オプション]
 * daybox:	基準のボックス
 * closebtn:  クローズボタン
 * more:  詳細ボタン
 * schedulebox:  詳細拡大ボックス
 * cal-wrap:  テーブルwrapクラス
 *
 */
(function($) {
	$.fn.calendar = function(options) {
		var defaults = {
			daybox : '.daybox',
			closebtn : '.close',
			more : '.daymore',
			schedulebox : '.schedulebox',
			calwrap : '.cal-wrap',
			w : 200
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function(){
			var $this = $(this);
			var $daybox = $(options.daybox);
			var $closebtn = $(options.closebtn);
			var $sbox = $(options.schedulebox);
			var dw;
			var dh;
			var offset = $this.closest('td').offset();

			$this.click(function(){
				$daybox.removeClass("current");
				$sbox.removeAttr('style');
				dw = $(options.calwrap).width();
				dh = $(options.calwrap).height();
				dayDetail(dw, dh);
				$this.closest($daybox).addClass('current');
				return false;
			});
			$closebtn.click(function() {
				$daybox.removeClass('current');
				$this.closest($sbox).removeAttr('style');

				$(".add", $closebtn.parent()).removeClass("open");
				$(".addList", $closebtn.parent()).removeClass("open");
				return false;
			});

			function dayDetail(dw, dh){
				//alert(dh);
				if(dw - offset.left < options.w){
					$this.closest($sbox).css({
						left : 'auto',
						right : -1
					});
				}
				if(dh < offset.top - 10){
					$this.closest($sbox).css({
						top : 'auto',
						bottom : -1
					});
				}
			}
		});
	};
})(jQuery);

(function($) {
	$.fn.calendarAddList = function(options) {
		var defaults = {};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function() {
			var $this = $(this);
			$this.click(function(event){
				if ($this.next().children("ul").children().length == 1) {
					$this.next().children("ul").children("li").children("a").click();
				} else {
					event.stopPropagation();
					var hasClass = $this.hasClass("open");
					$(".add.open").each(function() {
						$(this).removeClass("open");
						$(this).next().removeClass("open");
					});
					if(hasClass){
						$this.removeClass("open");
						$this.next().removeClass("open");
					}else{
						$this.addClass("open");
						$this.next().addClass("open");
					}
				}
			});

			$('body').click(function(e){
				$this.removeClass("open");
				$this.next().removeClass("open");
			});
		});
	};
})(jQuery);

/**
 * カレンダー開閉
 *
 */
(function($){
	$.fn.calToggle = function(){
		return $(this).each(function(){
			var $this = $(this);
			$this.toggle(function(){
				$this.parent().parent().addClass("hover");
				$(".fixHeight").fixHeight();
			},
			function () {
				$this.parent().parent().removeClass("hover");
				$(".fixHeight").fixHeight();
			});
		});
	};
})(jQuery);

/**
 * DatePicker適用
 * @param text
 * @returns
 */
function datepicker(text) {
	var locale = scriptContext.locale.defaultLocale;
	if ("en" == locale) {
		locale = "en-GB";
	}
	$.datepicker.setDefaults($.datepicker.regional[locale]);
	$(text).datepicker({	//uiカレンダー
		showOn: 'both',
		buttonImage: contentPath + '/images/gem/skin/vertical/icon-calender-01.png',
		buttonText: scriptContext.locale.buttonText,
		buttonImageOnly: true,
		dateFormat: 'yymmdd',
		showMonthAfterYear: true,
		onSelect: function() {fillTime(this);}
	}).blur(function() {
		var val = $(this).val();
		if (val != null && val != "") {
			if (val.length != 8) {
				alert(scriptContext.locale.formatErrMsg);
				$(this).val("");
			} else {
				var year = Number(val.substring(0, 4));
				var month = Number(val.substring(4, 6));
				var day = Number(val.substring(6, 8));
				var dt = new Date(year, month - 1, day);
				if (dt == null
						|| dt.getFullYear() != year
						|| dt.getMonth() + 1 != month
						|| dt.getDate() != day) {
					alert(scriptContext.locale.validErrMsg);
					$(this).val("");
					fireOnChange(this);
				} else {
					fillTime(this);
				}
			}
		} else {
			fireOnChange(this);
		}
	});
	function fillTime(dp) {
		$(dp).siblings("label").children("select").each(function() {
			var val = $(this).val();
			if (val == null || val =="  ") {
				var defaultValue = $(this).attr("defaultValue");
				$(this).val(defaultValue);
			}
		});
		fireOnChange(dp);
	}
	function fireOnChange(dp) {
		dp.changeInFillTime = true;
		$(dp).change();
		dp.changeInFillTime = false;
	}
}
