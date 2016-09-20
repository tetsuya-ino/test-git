//TODO design.jsからデザインに関係ない拡張functionをこっちに移す

/*
 * modalDialog
 * modalWindow
 * subModalWindow
 * switchCondition
 * massReferenceTable
 * pager
 * nameList
 * refCombo
 */

var $savedList = null;
$(function(){
	/* ダイアログ */
	$('.modal-btn, .modal-lnk').modalWindow();
	$("body.modal-body").modalDialog();
	scriptContext["createModalFunction"] = function(modal, name, callback) {
		var $dialogs = $(modal, document);
		$dialog = $("<div class='modal-dialog' />").attr({id: "modal-dialog-" + name}).appendTo($dialogs);
		$("<div class='modal-wrap' />").appendTo($dialog);
		var $under = $("<div class='modal-inner sub-modal-inner' />").appendTo($dialog);
		var $title = $("<h2 class='hgroup-01' />").appendTo($under);
		$("<span />").attr({id: "modal-title-" + name}).appendTo($title);
		$("<p class='modal-maximize sub-modal-maximize' />").text(scriptContext.locale.maximizeLink).appendTo($under);
		$("<p class='modal-restore sub-modal-restore' />").text(scriptContext.locale.restoreLink).appendTo($under);
		$("<p class='modal-close sub-modal-close' />").text(scriptContext.locale.closeLink).appendTo($under);
		var ifrm = "<iframe src=\"about:blank\" height=\"686\" width=\"100%\" frameborder=\"0\" name=\"" + name + "\"/>";
		var $frame = $(ifrm).appendTo($under);

		callback.call(this);
	};
	scriptContext["closeModalFunction"] = closeModalDialog;
	if ($("body.modal-body").length == 0) {
		var ie = isIE();
		scriptContext.getWindow = function() {return window;};
		scriptContext.overlayManager = {
			overlays:new Array(),
			zindex:52,
			addOverlay:function(overlay){
				if (!ie) {//IEだと固まる
					for (var i = 0; i < this.overlays.length; i++) {
						$(this.overlays[i]).removeClass("modal-overlay");
					}
				}
				$(overlay).css({zIndex:this.nextZindex()}).addClass("modal-overlay");
				this.overlays.push(overlay);
			},
			removeOverlay:function($overlay){
				for (var i = 0; i < this.overlays.length; i++) {
					if (this.overlays[i] == $overlay) {
						this.overlays.splice(i, 1);
						if (!ie) {//IEだと固まる
							$overlay.css({zIndex:0}).removeClass("modal-overlay");
						}
						if (i > 0) {
							$(this.overlays[i - 1]).addClass("modal-overlay");
						}
						this.zindex -= 2;
					}
				}
			},
			nextZindex:function() {return this.zindex++;}
		};
	}

	$(".commaField").commaField();
	$(".aggregation-rawdata").rawdata();
	$(".aggregation-rawdataDialog").rawdataDialog();
	$savedList = $(".savedList").savedList();
	$(".tab-wrap").switchCondition();
	$(".massReference").massReferenceTable();
	$(".refCombo").refCombo();
	$(".refComboController").refComboController();
});

/**
 * ページトップ
 */
(function($) {
	$.fn.pageTop = function(){
		var $this = this;
		$this.hide();
		$(window).scroll(function(){
			if($(this).scrollTop() > 10){
				$this.fadeIn();
			}else{
				$this.fadeOut();
			}
		});

		jQuery.easing.quart = function (x, t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		};

		$this.children().click(function(){
			$('body,html').animate({
				scrollTop : 0
			}, 300, 'quart');
			return false;
		});
		return this;
	};
})(jQuery);


/**
 * ロールオーバー
 */
(function($) {
	$.fn.rollOverSet = function(){
		this.hover(function(){
			var path = $(this).attr("src");
			path = path.replace(/(?:_o)?(\.gif|\.png|\.jpg)/,"_o$1");
			$(this).attr("src",path);
		},
		function(){
			var path = $(this).attr("src");
			path = path.replace(/(?:_o(\.gif|\.png|\.jpg))/,"$1");
			$(this).attr("src",path);
		});
		return this;
	};
})(jQuery);

/**
 * ヘッダーアカウント情報
 *
 * [オプション]
 * change:	メニュー変更クラス
 * w:	リストの幅
 *
 */
(function($) {
	$.fn.accountInfo = function(options){
		var defaults = {
			change : '.change-area',
			w : null
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function() {
			var $this = $(this),
				tw = $this.width();
			$this.click(function(event){
				event.stopPropagation();
				if($(this).hasClass("open")){
					$this.removeClass("open");
				}else{
					$(this).prev().removeClass("open");
					$(this).next().removeClass("open");
					$this.addClass("open");
				}
			});

			$this.find(options.change).hover(function(){
				$(this).addClass("hover");
			},
			function(){
				$(this).removeClass("hover");
			});

			$('body, .select').click(function(e){
				$('li.hed-pull').removeClass("open");		//アカウント情報非表示
			});

			if(options.w < tw){	 //optionsの幅より大きかったら
				$this.children().children("ul").css("width", tw + 2);
				$this.find(options.change).children("ul").css("left", tw);
			}
		});
	};
})(jQuery);

/**
 * タブ切り替え
 *
 * [オプション]
 * menu:	タブメニュークラス
 * panel:  切り替えコンテンツクラス
 * cunt:	初回表示panel
 *
 */
(function($){
	$.fn.tabContent = function(options){
		var defaults = {
			menu : '.tab-menu',
	 		panel : '.tab-panel',
			cunt : 0,
			clickFunc: null
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function() {
			var $this = $(this),
				$menu = $this.find(options.menu).children(),
				$panel = $this.find(options.panel);
			$menu.eq(options.cunt).addClass('current');
			$panel.not(':eq('+options.cunt+')').hide();
			$menu.click(function() {
				$(this).siblings().removeClass('current');
				$(this).addClass('current');
				var clickIndex = $menu.index(this);
				$panel.hide().eq(clickIndex).show();
				$(".fixHeight").fixHeight();
				if (options.clickFunc && $.isFunction(options.clickFunc))
					options.clickFunc.call(this, $(this));
				return false;
			});
		});
	};
})(jQuery);

/**
 * セクション開閉
 *
 * [オプション]
 * allOpen:	全て開くクラス
 * allClose:	全て閉じるクラス
 * closeClass:	閉じている時の判別クラス
 *
 */
(function($){
	$.fn.sectoinToggle = function(options){
		var defaults = {
			allOpen : '.all-open',
			allClose : '.all-close',
			closeClass : 'disclosure-close'
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function(){
			var $allOpen = $(options.allOpen),
				$allClose = $(options.allClose),
				$this = $(this);
			$this.click(function(){
				if($this.hasClass(options.closeClass)){
					$this.removeClass(options.closeClass).next().show();
					$(".fixHeight").fixHeight();
				}else{
					$this.addClass(options.closeClass).next().hide();
					$(".fixHeight").fixHeight();
				}
			});
			$allOpen.click(function(){
				if($this.hasClass(options.closeClass)){
					//$this.removeClass(options.closeClass).next().show();
					$this.click();
				}
				$(".fixHeight").fixHeight();
				return false;
			});
			$allClose.click(function(){
				//if($this.not('hasClass(options.closeClass)')){
				if(!$this.hasClass(options.closeClass)){
					//$this.addClass(options.closeClass).next().hide();
					$this.click();
				}
				$(".fixHeight").fixHeight();
				return false;
			});
		});
	};
})(jQuery);

/**
 * セクションスクロール
 */
(function($) {
	$.fn.pageSecton = function(){
		var $this = this,
			id,
			sectionId,
			idWrap,
			hash;
		jQuery.easing.quart = function (x, t, b, c, d) {
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		};

		$this.children().click(function(){
			id = $(this).attr('href');
			sectionId = $('#main-inner').find($(id));
			idWrap = sectionId.parent();
			hash = sectionId.offset();
			if(idWrap.hasClass('disclosure-close')){
				idWrap.click();
			}
			$("html,body").animate({
			  scrollTop: hash.top,
			  scrollLeft: hash.left
			}, 300, 'quart');
			return false;
		});
		return this;
	};
})(jQuery);


/**
 * チェックボックス全選択
 */
(function($) {
$.fn.allInputCheck = function(){
	return this.each(function(){
		var $this = $(this),
			checkInp = $('.selectCheck input'),
			$tr = $('.selectCheck tr');
		$this.click(function(){
			if(this.checked){
				checkInp.attr('checked', 'checked')
				.closest('tr').addClass('selected');
			}else{
				checkInp.removeAttr('checked')
				.closest('tr').removeClass('selected');
			}
		});
		$tr.click(function(){
			$this = $(this);
			if($this.hasClass('selected')){
				$this.removeClass('selected')
				.find('input').removeAttr('checked');
			}else{
				$this.addClass('selected')
				.find('input').attr('checked', 'checked');
			}
		});
	});
};
})(jQuery);


/**
 * ツールチップ
 *
 * [オプション]
 * offleft:   offsetの微調整
 * range:  下矢印の位置
 *
 */
(function($){
	$.fn.toolTip = function(options){
		var defaults = {
			offleft : 4,
			range : 6
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function() {
			var $toolwrap = $('.tooltip-wrap');
			var $tooltip = $('.tooltip');
			var $tooltxt = $('.tooltxt');
			var $toolicon = $('.tool-icon');
			var $this = $(this);
			var range = $(options.range);
			var $title = $this.attr("title");

			$this.hover(function() {
				$this.attr("title","");
				var offset = $this.offset();
				$toolwrap.show().css({
					top : offset.top - 39,
					left : offset.left - (options.offleft)
				});
				$toolicon.css({
					left :  (options.range)
				});
				$tooltxt.append($title);
			},
			function() {
				$toolwrap.hide();
				$tooltxt.text('');	//title属性が表示するのを防ぐ
				$this.attr("title",$title);
			});
 		});
	};
})(jQuery);

(function($){
	$.fn.auditLog = function(option){
		var defaults = {
			table:"table.log-table tbody",
			rows:"table.log-table tbody tr",
			before:"div.result-nav li.before",
			next:"div.result-nav li.next",
			close:"disclosure-close"
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function(){
			var $this = $(this);
			var $logBlock = $(this).next();
			var $table = $(options.table, $logBlock);
			var $before = $(options.before, $logBlock);
			var $next = $(options.next, $logBlock);
			var log_offset = 0;

			$this.unbind("click");
			$this.click(function() {
				if ($this.hasClass(options.close)){
					$this.removeClass(options.close);
					$logBlock.show(0, function() {
						if ($(options.rows).length > 0) return;
						getLogData();
					});
				} else {
					$(this).addClass(options.close);
					$logBlock.hide();
					$(".fixHeight").fixHeight();
				}
			});

			$before.click(function() {
				log_offset -= 100;
				getLogData();
			});

			$next.click(function() {
				log_offset += 100;
				getLogData();
			});

			function getLogData() {
				var webapi = $this.attr("webapi");
				var replaceReference = $this.attr("replaceReference");
				getLog(webapi, log_offset, 100, replaceReference, function(logs, hasNext) {
					var $r = $(options.rows);
					$r.remove();

					$(logs).each(function(index) {
						var rowClass = (index + 1) % 2 == 0 ? "even" : "odd";
						var length = this.detail.length;
						var $tr = $("<tr />").addClass(rowClass).appendTo($table);
						var $action = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.action);
						var $user = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.user);
						var $date = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.date);
						var $version = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.version);
						if (length > 1) {
							$action.attr("rowspan", length);
							$user.attr("rowspan", length);
							$date.attr("rowspan", length);
							$version.attr("rowspan", length);
						}
						for (var i = 0; i < length; i++) {
							if (i > 0) $tr = $("<tr />").addClass(rowClass).appendTo($table);
							var $propertyName = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.detail[i].propertyName);
							var $oldValue = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.detail[i].oldValue);
							var $newValue = $("<td />").addClass("br-bt-01").appendTo($tr).text(this.detail[i].newValue);
						}
					});

 					if (hasNext) {
 						$next.show();
 					} else {
 						$next.hide();
 					}
 					if (log_offset > 0) {
 						$before.show();
 					} else {
 						$before.hide();
 					}
				});
				$(".fixHeight").fixHeight();
			}
		});
	};
})(jQuery);

/**
 * モーダルダイアログ初期化
 */
(function($){
	$.fn.modalDialog = function(option){
		var defaults = {
			dialogs : '.modal-dialogs',
			controls : '.modal-body .modal-btn, .modal-body .modal-lnk'
		};
		var options = $.extend(defaults, option);
		if (!this) return false;
		return this.each(function() {
			var rootWindow = null;
			if (!parent.document.rootWindow) {
				rootWindow = parent.document;
			} else {
				rootWindow = parent.document.rootWindow
			}
			document.rootWindow = rootWindow;
			var name = uniqueId();
			document.targetName = name;
			var windowManager = null;
			if (!rootWindow.scriptContext["windowManager"]) {
				windowManager = {};
				rootWindow.scriptContext["windowManager"] = windowManager;
			} else {
				windowManager = rootWindow.scriptContext["windowManager"];
			}
			windowManager[name] = document;

			//↓IE7ではIFrame内から親にアクセスできないので、
			//　ロード時にscriptContextに登録し、親側の処理を呼び出すよう変更
			//ルートウィンドウにダイアログの素を作成
//			var $dialogs = $(options.dialogs, document.rootWindow);
//			$dialog = $("<div class='modal-dialog' />").attr({id: "modal-dialog-" + name}).appendTo($dialogs);
//			$("<div class='modal-wrap sub-modal-wrap' />").appendTo($dialog);
//			var $under = $("<div class='modal-inner sub-modal-inner' />").appendTo($dialog);
//			var $title = $("<h2 class='hgroup-01' />").appendTo($under);
//			$("<span />").attr({id: "modal-title-" + name}).appendTo($title);
//			$("<p class='modal-close sub-modal-close' />").text("閉じる").appendTo($under);
//			var $frame = $("<iframe />").attr({name:name, src:"about:blank", height:"686", width:"100%", frameborder:"0"}).appendTo($under);
//			$(options.btn).subModalWindow();	//モーダルウィンドウ
//			$(options.lnk).subModalWindow();

			rootWindow.scriptContext["createModalFunction"].call(this, options.dialogs, name, function(){
				$(options.controls).subModalWindow();	//モーダルウィンドウ
			});
		});
	};
})(jQuery);

/**
 * モーダルウィンドウ
 *
 * [オプション]
 * overlay:	バックグランドコンテンツ
 * under:  モーダルコンテンツ
 *
 */
(function($){
	$.fn.modalWindow = function(option){
		var defaults = {
			overlay : '#modal-dialog-root .modal-wrap',
			under : '#modal-dialog-root .modal-inner'
		};
		var options = $.extend(defaults, option);
		if (!this) return false;
		if ($("body.modal-body").length != 0) return false;
		return this.each(function(){
			var $document = $(document);
			var $window = $(window);
			var $overlay = $(options.overlay, document);
			var $under = $(options.under, document);
			var $frame = $("iframe", $under);
			var dialogHeight = 735;
			if (options.dialogHeight && !isNaN(options.dialogHeight)) {
				dialogHeight = options.dialogHeight;
			}
			$(this).attr("targetName", $frame.attr("name"));
			var fade = {
				show : function() {
					$under.height(dialogHeight);
					$overlay.fadeIn(options.speed);
					$under.fadeIn(options.speed);
					scriptContext.overlayManager.addOverlay($overlay);
					$under.css({zIndex:scriptContext.overlayManager.nextZindex()});
				},
				hide : function() {
					$overlay.fadeOut(options.speed);
					$under.fadeOut(options.speed);
					$("iframe", $under).attr("src", "about:blank");
					$("#modal-title").text("");
					$(".modal-restore", $under).click();
					scriptContext.overlayManager.removeOverlay($overlay);
				}
			};
			$(this).click(function(){
				fade.show();
				resizeHandler();
				$window.resize(resizeHandler);
			});

			//メインのレイアウトから呼ばれるダイアログは共通のため、初期化は1回だけ
			if (!$under.attr("initialized")) {
				$under.delegate('.modal-close', 'click', function(){
					fade.hide();
				});
				$under.delegate(".modal-maximize", "click", function() {
					$under.addClass("fullWindow");
					setModalWindowToCenter();
				});
				$under.delegate(".modal-restore", "click", function() {
					$under.removeClass("fullWindow");
					setModalWindowToCenter();
				});
				$overlay.click(function(){
					fade.hide();
				});
				$under.attr("initialized", true);
			}

			function resizeHandler(e){
				$overlay.css({
					height : $document.height(),
					width : $window.width(),
					top: 0,
					left: 0
				});
				setModalWindowToCenter()
			}

			var defaultHeight = dialogHeight;//$under.height();
			var defaultWidth = 750;//$under.width();
			function setModalWindowToCenter(){
				if ($under.hasClass("fullWindow")) {
					$under.css({
						height : $document.height() - 40,
						width : $window.width() - 30,
						top: 0,
						left: 0,
						marginLeft: 0
					});
					$frame.height("90%");
				} else {
					var scTop = $document.scrollTop(),
						wh = $window.height(),//$document.height(),
						ww = $window.width(),
						boxH,
						pos;

					boxH = defaultHeight;
					pos = (scTop+wh)-(wh+boxH)/2;

					if(pos<0)pos = 0;

					$under.css({
						height: defaultHeight,
						width: defaultWidth,
						top:pos - 20,
						left: "auto",
						marginLeft:(ww-defaultWidth - 30)/2
					});
					$frame.height(686);
				}
			}
		});
	};
})(jQuery);

/**
 * サブモーダルウィンドウ
 *
 * [オプション]
 * overlay:	バックグランドコンテンツ
 * under:  モーダルコンテンツ
 *
 */
(function($){
	$.fn.subModalWindow = function(option){
		var defaults = {
			overlay : 'body.modal-body .modal-wrap',
			under : 'body.modal-body .modal-inner'
		};

		var rootWindow = document.rootWindow;
		var options = $.extend(defaults, option);
		if (!this) return false;
		return this.each(function(){
			var targetName = document.targetName;
			var $document = $(document);
			var $window = $(window);
			var $frame = $("iframe[name='" + targetName + "']", rootWindow);
			var $under = $frame.parent();
			var $overlay = $under.prev();
			var $dialog = $under.parent();
			var dialogHeight = 735;
			if (options.dialogHeight && !isNaN(options.dialogHeight)) {
				dialogHeight = options.dialogHeight;
			}
			var fade = {
				show : function() {
					$under.height(dialogHeight);
					$overlay.fadeIn(options.speed);
					$under.fadeIn(options.speed);
					rootWindow.scriptContext.overlayManager.addOverlay($overlay);
					$under.css({zIndex:rootWindow.scriptContext.overlayManager.nextZindex()});
				},
				hide : function() {
					$overlay.fadeOut(options.speed);
					$under.fadeOut(options.speed);
					$(".modal-restore", $under).click();
					rootWindow.scriptContext.overlayManager.removeOverlay($overlay);
					$under.css({zIndex:0});
				}
			};
			$(this).click(function(){
				fade.show();
				resizeHandler();
				$window.resize(resizeHandler);
			});

			$under.delegate('.modal-close.sub-modal-close', 'click', function(){
				fade.hide();
			});
			$under.delegate('.modal-maximize.sub-modal-maximize', 'click', function(){
				var pw = $(rootWindow).width();
				$under.addClass("fullWindow");
				setModalWindowToCenter(pw);
			});
			$under.delegate('.modal-restore.sub-modal-restore', 'click', function(){
				$under.removeClass("fullWindow");
				setModalWindowToCenter();
			});
			$overlay.click(function(){
				fade.hide();
			});

			function resizeHandler(){
				$overlay.css({
					height : $(rootWindow).height(),//$document.height(),
					width : $(rootWindow).width(),//$window.width()
					top: 0,
					left: 0
				});
				setModalWindowToCenter()
			}

			var defaultHeight = dialogHeight;//$under.height();
			var defaultWidth = 750;//$under.width();
			function setModalWindowToCenter(pw){
				if ($under.hasClass("fullWindow")) {
					$under.css({
						height : $(rootWindow).height() - 40,
						width : $(rootWindow).width() - 30,
						top: 0,
						left: 0,
						marginLeft: 0
					});
					$frame.height("90%");
				} else {
					var pwd = rootWindow.scriptContext.getWindow();
					var scTop = $(pwd).scrollTop(),
						wh = $(pwd).height(),//$(rootWindow).height(),
						ww = pw != null ? pw : $(rootWindow).width(),
						boxH,
						pos;

					boxH = defaultHeight;
					pos = (scTop+wh)-(wh+boxH)/2;

					if(pos<0)pos = 0;

					$under.css({
						height: defaultHeight,
						width: defaultWidth,
						top:pos - 20,
						left:"auto",
						marginLeft:(ww-defaultWidth - 30)/2
					});
					$frame.height(686);
				}
			}
		});
	};
})(jQuery);

/**
 * 入力値(数値)に対してカンマ編集されたテキストをマスク表示する。
 * カンマ編集された値にフォーカスが当たったタイミングで元のテキストを表示する。
 */
(function($) {
	$.fn.commaField = function(){
		if (!this) return false;

		this.each(function(){
			var $this = $(this);

			//あらかじめ設定されてるイベント消しとく
			$this.removeAttr("onblur").unbind("blur");
			$this.blur(function () {
				var tb = this;
				var val = $(tb).val();
				if(isNaN(val)) {
					alert(scriptContext.locale.numcheckMsg);
					$(tb).val("");
					return true;
				}

				var result = insertComma(val);
				// スタイルをコピー
				var className = $(tb).attr("class");
				// 入力フォームを非表示に設定
				$(tb).hide();
				if ($(".dummyField", $(tb).parent()).length == 0) {
					//Chromeでブラウザの外にフォーカス当てると、戻ってきたときに挙動がおかしくなるので
					//表示用のフィールドがない場合だけ追加
					var $dummy = $("<input type='text' />").addClass(className).addClass("dummyField").val(result);
					$(tb).parent().prepend($dummy);

					$dummy.focus(function () {
						var df = this;
						//Chromeだとフォーカスイベントとキャレットが移動するタイミングが違うため
						//setTimeoutで0ミリ秒後に選択
						setTimeout(function() {
							$(tb).show();
							setPosition(tb, getPosition(df));
							$(df).remove();
							$(tb).focus();
						}, 0);
					});
				}
			});
		});
		return this.blur();
	};

	/**
	 * カンマ編集.
	 * @param str 対象数値
	 * @return カンマ編集後の数値
	 */
	function insertComma(str) {
		var num = new String(str).replace(/,/g, "");
		while (num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		return num;
	}

	/**
	 * キャレットの位置を取得
	 * @param item 表示用のテキスト
	 * @return 表示用のテキストのキャレットの位置
	 */
	function getPosition(item) {
		var currentPosition = 0;
		if (document.selection) {
			//IE
			var sel = document.selection.createRange();
			sel.moveStart("character", - item.value.length)
			currentPosition = sel.text.length;
		} else if (item.selectionStart || item.selectionStart == "0") {
			//FireFox、Chrome
			currentPosition = item.selectionStart;
		}
		if (item.value) {
			var str = item.value.substr(0, currentPosition);
			var startPosition = 0;
			var count = 0;
			while (str.indexOf(",") != -1) {
				startPosition = str.indexOf(",");
				str = str.substr(startPosition + 1);
				count++;
			}
			currentPosition -= count;//カンマの分だけマイナス
		}
		return currentPosition;
	}

	/**
	 * キャレットの位置を設定
	 * @param 編集用のテキスト
	 * @param キャレットの位置
	 */
	function setPosition(item, pos) {
		if (item.setSelectionRange) {
			//IE
			item.focus();
			item.setSelectionRange(pos, pos);
		} else if (item.createTextRange) {
			//FireFox、Chrome
			var range = item.createTextRange();
			range.collapse(true);
			range.moveEnd("character", pos);
			range.moveStart("character", pos);
			range.select();
		}
	}
})(jQuery);

/**
 * 検索条件開閉
 */
(function($){
	$.fn.switchCondition = function(option) {
		var defaults = {
				menu : '.tab-menu',
		 		panel : '.tab-panel',
				tabList : '.tabList-search-01',
				tabBox : '.box-search-01',
				cunt : 0
		};
		var options = $.extend(defaults, option);
		if (!this) return false;
		return this.each(function() {
			var $this = $(this);
			var $menu = $this.find(options.menu).children();
			var $panel = $this.find(options.panel);
			var $tabList = $this.find(options.tabList);
			var $tabBox = $this.find(options.tabBox);

			var _switch = {
				show: function() {
					$tabList.removeClass("contract");
					$tabBox.show();
				},
				hide: function() {
					$tabList.addClass("contract");
					$tabBox.hide();
				}
			};

			$menu.eq(options.cunt).addClass('current');
			$panel.not(':eq('+options.cunt+')').hide();
			$menu.click(function() {
				if ($(this).hasClass("current")) {
					if ($(this).hasClass("contractMenu")) {
						$(this).removeClass("contractMenu");
						_switch.show();
					} else {
						$(this).addClass("contractMenu");
						_switch.hide();
					}
				} else {
					$(this).siblings().removeClass('current').removeClass("contractMenu");
					_switch.show();
					$(this).addClass('current');
					var clickIndex = $menu.index(this);
					$panel.hide().eq(clickIndex).show();
				}
				$(".fixHeight").fixHeight();
				return false;
			});
			$tabList.click(function() {
				if ($(this).hasClass("contract")) {
					$menu.filter(".current").removeClass("contractMenu");
					_switch.show();
				} else {
					$menu.filter(".current").addClass("contractMenu");
					_switch.hide();
				}
				$(".fixHeight").fixHeight();
			});
		});
	};
})(jQuery);

/**
 * 大量データ用参照セクション
 */
(function($){
	$.fn.massReferenceTable = function(option){
		var defaults = {
				table: "table.massReferenceTable",
				pager: ".result-nav",
				btns: "div.mr-btn"
		};
		var options = $.extend(defaults, option);
		if (!this) return false;
		return this.each(function() {
			var $this = $(this);
			init($this, options);

			$this.getMassReference();
		});

		function init($v, options) {
			var $btns = $(options.btns, $v);
			var $pager = null;
			var isSubModal = $("body.modal-body").length != 0;
			$.extend($v, {
				oid: $v.attr("oid"),
				defName: $v.attr("defName"),
				propName: $v.attr("propName"),
				viewName: $v.attr("viewName"),
				offset: $v.attr("offset") - 0,
				limit: $v.attr("limit") - 0,
				sortKey: $v.attr("sortKey"),
				sortType: $v.attr("sortType"),
				editable: $v.attr("outputType") == "Edit",
				webapiName: $v.attr("webapiName"),
				removeWebapiName: $v.attr("removeWebapiName"),
				viewAction: $v.attr("viewAction"),
				detailAction: $v.attr("detailAction"),
				targetDefName: $v.attr("targetDefName"),
				mappedBy: $v.attr("mappedBy"),
				deletable: $v.attr("deletable") == "true",
				showPageJump: $v.attr("showPageJump") == "true",
				showPageLink: $v.attr("showPageLink") == "true",
				showCount: $v.attr("showCount") == "true",
				setTableId: function(table) {
					$(table).each(function() {
						var index = 0, prefix = "massReferenceTable_";
						while (true) {
							if ($("#" + prefix + es($v.propName) + index).length == 0) {
								$(this).attr("id", prefix + $v.propName + index);
								break;
							} else { index++; }
						}
					});
				},
				clear: function() {
					if ($v.grid) {
						$v.grid.clearGridData(true);
					}
				},
				getMassReference: function() {
					$v.clear();

					var $table = $(options.table, $v);

					if ($table.length == 0) return this;

					if (!$table.build) {
						$table.build = function(dispInfo, count, list) {
							var colNames = new Array();
							var colModel = new Array();
							colNames.push("oid");
							colModel.push({name:"orgOid", index:"orgOid", sortable:false, hidden:true});
							colNames.push("version");
							colModel.push({name:"orgVersion", index:"orgVersion", sortable:false, hidden:true});
							colNames.push("");
							colModel.push({name:'_mtpDetailLink', index:'_mtpDetailLink', sortable:false, align:'center', width:60});
							for (var i = 0; i < dispInfo.length; i++) {
								colNames.push(dispInfo[i].displayName);
								var cm = {name:dispInfo[i].name, index:dispInfo[i].name};
								if (dispInfo[i].width > 0) cm.width = dispInfo[i].width;
								colModel.push(cm);
							}

							$v.setTableId(this);

							var $self = $(this);
							var grid = $self.jqGrid({
								datatype: "local",
								height: "auto",
								colNames: colNames,
								colModel: colModel,
								multiselect: $v.editable && $v.deletable,
								caption: "MassReferenceTable",
								viewrecords: true,
								altRows: true,
								altclass:'myAltRowClass',
								onSortCol: function(index, iCol, sortorder) {
									$v.sortKey = index;
									$v.sortType = sortorder.toUpperCase();
									$v.getMassReference();
									$("tr.ui-jqgrid-labels th:eq(" + iCol + ") .ui-jqgrid-sortable", $v).removeClass('asc desc').addClass(sortorder.toLowerCase());
									return "stop";
								}
							});
							var $lh = $("tr.ui-jqgrid-labels th:last", grid.parents("div.ui-jqgrid-view")).addClass("last");
							$lh.width($lh.width() - 1);

							return grid;
						};
					}

					if ($table.length > 0) {

						//参照プロパティ取得
						getMassReference($v.webapiName, $v.oid, $v.defName, $v.propName, $v.viewName, $v.offset, $v.sortKey, $v.sortType, $v.showCount, function(dispInfo, count, list) {
							//テーブル作成
							if (!$v.grid) {
								$v.grid = $table.build(dispInfo, count, list);
							}

							//データセット
							$(list).each(function(index) {
								this["id"] = this.orgOid + "_" + this.orgVersion;
								if ($v.editable) {
									this["_mtpDetailLink"] = "<a href='javascript:void(0)' class='lnk-mr-01' oid='"+ this.orgOid + "' version='" + this.orgVersion + "'>" + scriptContext.locale.edit + "</a>";
								} else {
									this["_mtpDetailLink"] = "<a href='javascript:void(0)' class='lnk-mr-02' oid='"+ this.orgOid + "' version='" + this.orgVersion + "'>" + scriptContext.locale.detail + "</a>";
								}
								$v.grid.addRowData(index + 1, this);
							});

							//リンクのイベント設定
							if (isSubModal) {
								$(".lnk-mr-01", $v).click(function() {
									viewReference(this, $v.detailAction);
								}).subModalWindow();
								$(".lnk-mr-02", $v).click(function() {
									viewReference(this, $v.viewAction);
								}).subModalWindow();
							} else {
								$(".lnk-mr-01", $v).click(function() {
									viewReference(this, $v.detailAction);
								}).modalWindow();
								$(".lnk-mr-02", $v).click(function() {
									viewReference(this, $v.viewAction);
								}).modalWindow();
							}

							//ページング処理
							if ($pager) {
								$pager.setPage($v.offset, list.length, count);
							}
						});
					}
				}
			});

			//ページングリンクのイベント処理
			if ($v.limit != null && $v.limit != "") {
				var $pager = $(options.pager, $v).pager({
					limit: $v.limit,
					showPageLink: $v.showCount ? $v.showPageLink : false,
					showPageJump: $v.showCount ? $v.showPageJump : false,
					showItemCount: $v.showCount,
					previewFunc: function(){
						$v.offset -= $v.limit;
						$v.getMassReference();
					},
					nextFunc: function() {
						$v.offset += $v.limit;
						$v.getMassReference();
					},
					searchFunc: function(currentPage) {
						$v.offset = currentPage * $v.limit;
						$v.getMassReference();
					}
				});
			}

			if ($v.editable) {
				//追加ボタンのイベント処理
				$btns.show();
				var $add = $(".btn-mr-01", $btns).click(function() {
					document.scriptContext["editReferenceCallback"] = function(entity) {
						$v.getMassReference();
						closeModalDialog();
					}

					var target = getModalTarget(isSubModal);
					var $form = $("<form />").attr({method:"POST", action:$v.detailAction, target:target}).appendTo("body");
					$("<input />").attr({type:"hidden", name:"defName", value:$v.targetDefName}).appendTo($form);
					$("<input />").attr({type:"hidden", name:"updateByParam", value:true}).appendTo($form);
					$("<input />").attr({type:"hidden", name:$v.mappedBy, value:$v.oid}).appendTo($form);
					if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
					$form.submit();
					$form.remove();
				});
				if (isSubModal) {
					$add.subModalWindow();
				} else {
					$add.modalWindow();
				}

				//削除ボタンのイベント設定
				$(".btn-mr-02", $btns).click(function() {
					var ids = $v.grid.getGridParam("selarrrow");
					if(ids.length <= 0) {
						return;
					}
					var key = [];
					for (var i = 0; i < ids.length; ++i) {
						var id = ids[i];
						var row = $v.grid.getRowData(id);
						key.push(row.orgOid + "_" + row.orgVersion);
					}
					removeMappedByReference($v.removeWebapiName, $v.oid, $v.defName, $v.propName, key, function(errors) {
						if (errors == null || erros.length == 0) {
							$v.getMassReference();
						} else {
							alert(errors);
						}
					});
				});
			}

			//モーダルダイアログ表示
			function viewReference(src, action) {
				document.scriptContext["editReferenceCallback"] = function(entity) {
					$v.getMassReference();
					closeModalDialog();
				}

				var target = getModalTarget(isSubModal);
				var $form = $("<form />").attr({method:"POST", action:action, target:target}).appendTo("body");
				$("<input />").attr({type:"hidden", name:"defName", value:$v.targetDefName}).appendTo($form);
				$("<input />").attr({type:"hidden", name:"oid", value:$(src).attr("oid")}).appendTo($form);
				$("<input />").attr({type:"hidden", name:"version", value:$(src).attr("version")}).appendTo($form);
				$("<input />").attr({type:"hidden", name:"refEdit", value:true}).appendTo($form);
				if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
				$form.submit();
				$form.remove();
			}
		};
	};
})(jQuery);

/**
 * ページャー
 */
(function($) {
	$.fn.pager = function(option) {
		var defaults = {
				limit: 10,
				showPageLink: true,
				pageLinksNum: 10,
				showPageJump: true,
				showItemCount: true,
				showNoPage: true,
				previewFunc: null,
				nextFunc: null,
				searchFunc: null,
				previousLabel: scriptContext.locale.previous,
				nextLabel: scriptContext.locale.next
		};
		var options = $.extend(defaults, option);
		if (!this) return false;
		var ret = this.each(function() {
			var $this = $(this);
			init($this, options);

			//jQueryオブジェクトのメソッドをjavascriptオブジェクトで利用する為、内部メソッドをバインド
			var methods = ["setPage"];
			for (var i = 0; i < methods.length; i++) {
				_bindMethod($this, this, methods[i]);
			}
			function _bindMethod(obj,to,method){
				to[method]=function(){
					return obj[method].apply(obj,arguments);
				};
			}
		});

		ret.setPage = function(offset, length, count) {
			$(this).each(function() {
				this.setPage(offset, length, count);
			});
		};

		return ret;

		function init($v, options) {
			var limit = options.limit;
			if (limit == 0) limit = 10;
			var pageLinksNum = options.pageLinksNum;
			if (pageLinksNum == 0) pageLinksNum = 10;

			var $ul = $("<ul />").css("white-space", "nowrap").appendTo($v);

			//前へ
			var $preview = $("<li />").addClass("preview").appendTo($ul);
			createLink($preview, options.previousLabel);

			//次へ
			var $next = $("<li />").addClass("next").appendTo($ul);
			createLink($next, options.nextLabel);

			//入力エリアと検索ボタン
			if (options.showPageJump) {
				var $quickJump = $("<li />").addClass("quick-jump").appendTo($ul);
				var $current = $("<input />").attr({type:"text", maxlength:7, size:2}).appendTo($quickJump);
				$("<span />").text(" / ").appendTo($quickJump);
				var $max = $("<span />").css("margin-right", "5px").appendTo($quickJump);
				$("<span />").text(scriptContext.locale.page).appendTo($quickJump);

				var $btns = $("<li />").appendTo($ul);
				var $searchBtn = $("<span />").addClass("ui-icon ui-icon-search").appendTo($btns);
			}

			//ページリンク
			if (options.showPageLink) {
				var $pageLinks = $("<li />").addClass("page-links").appendTo($ul);
				var $linkList = $("<ul />").appendTo($pageLinks);
				$pageLinks.createLinks = function(current, max) {
					$linkList.children().remove();
					var precount, nextcount;
					if (pageLinksNum % 2 == 1) {
						//奇数
						precount = (pageLinksNum - 1) / 2;
						nextcount = (pageLinksNum - 1) / 2;
					} else {
						//偶数
						precount = pageLinksNum / 2;
						nextcount = pageLinksNum / 2 - 1;
					}

					//リンクの最初
					var start = current - precount < 0 ? 0 : current - precount;
					//リンクの最後
					var end = current + nextcount >= max ? max : current + nextcount + 1;
					if (max > pageLinksNum) {
						if (current + nextcount < pageLinksNum) {
							end = pageLinksNum;
						}
						if (current - precount > max - pageLinksNum) {
							start = max - pageLinksNum;
						}
					} else {
						start = 0;
						end = max;
					}

					for (var i = start; i < current; i++) {
						addPagenationLink(i);
					}
					$("<li />").addClass("current").text(current + 1).appendTo($linkList);

					var next = current + 1 >= max ? max : current + 1;
					for (var i = next; i < end; i++) {
						addPagenationLink(i);
					}

					if (start > 1) {
						$("<li />").text("...").prependTo($linkList);
					}
					if (start > 0) {
						var $link = $("<li />").prependTo($linkList);
						$("<a />").attr({href:"javascript:void(0)", offset:0}).text(1).appendTo($link);
					}

					if (end < max - 1) {
						$("<li />").text("...").appendTo($linkList);
					}
					if (end < max) {
						var $link = $("<li />").appendTo($linkList);
						$("<a />").attr({href:"javascript:void(0)", offset:max - 1}).text(max).appendTo($link);
					}

					$("a", $linkList).click(function() {
						var offset = $(this).attr("offset");
						if ($v.searchFunc && $.isFunction($v.searchFunc)) {
							$v.searchFunc.call(this, offset);
						}
					});

					function addPagenationLink(offset) {
						var $link = $("<li />").appendTo($linkList);
						$("<a />").attr({href:"javascript:void(0)", offset:offset}).text(offset + 1).appendTo($link);
					}
				}
			}

			//件数
			if (options.showItemCount) {
				var $resultNum = $("<li />").addClass("result-num").appendTo($ul);
				var $range = $("<span />").addClass("range").appendTo($resultNum);
				var $count = $("<span />").addClass("count").text(0).appendTo($resultNum);
				$("<span />").text(scriptContext.locale.item).appendTo($resultNum);
			}

			$.extend($v, {
				previewFunc: options.previewFunc,
				nextFunc: options.nextFunc,
				searchFunc: options.searchFunc,
				setPage: function(offset, length, count) {
					//件数
					var tail = offset + limit;
					var hasPreview = offset > 0;
					var hasNext;
					var notCount = typeof count === "undefined" || count == null;
					if (notCount) {
						hasNext = limit == length;
					} else {
						hasNext= limit < (count - offset);
						if (tail > count) { tail = count; }
					}

					if (!options.showNoPage && !hasPreview && !hasNext) {
						$v.hide();
						return;
					}

					if (hasPreview) {
						$(".clickable", $preview).show();
						$(".unclickable", $preview).hide();
					} else {
						$(".clickable", $preview).hide();
						$(".unclickable", $preview).show();
					}
					if (hasNext) {
						$(".clickable", $next).show();
						$(".unclickable", $next).hide();
					} else {
						$(".clickable", $next).hide();
						$(".unclickable", $next).show();
					}

					//ページ数
					if (!notCount) {
						var pages = count % limit;
						var maxPage = (count - pages) / limit;
						if (pages > 0) maxPage++;
						var currentPage = (offset / limit) + 1;

						if (options.showPageLink) {
							$pageLinks.createLinks(currentPage - 1, maxPage);
						}

						if (count > 0) {
							if (options.showItemCount) {
								$range.css("display","").text((offset + 1) + " - " + tail + scriptContext.locale.item + " / ");
							}
							if (options.showPageJump) {
								$quickJump.show();
								$searchBtn.show();
								$max.text(maxPage);
								$v.maxPage = maxPage;
								$current.attr("beforeValue", currentPage).val(currentPage);
							}
						} else {
							if (options.showItemCount) {
								$range.css("display","none").text("");
							}
							if (options.showPageJump) {
								$quickJump.hide();
								$searchBtn.hide();
							}
						}
						if (options.showItemCount) {
							$count.text(count);
						}
					}
				}
			});

			$("a", $preview).click(function() {
				if ($v.previewFunc && $.isFunction($v.previewFunc)) {
					$v.previewFunc.call(this, limit);
				}
			});
			$("a", $next).click(function() {
				if ($v.nextFunc && $.isFunction($v.nextFunc)) {
					$v.nextFunc.call(this, limit);
				}
			});

			if (options.showPageJump) {
				$current.css("ime-mode", "disabled").change(function() {
					var v = Number($(this).val());
					if (isNaN(v)) {
						alert(scriptContext.locale.numcheckMsg);
						if ($(this).attr("beforeValue")) {
							$(this).val($(this).attr("beforeValue"));
						} else {
							$(this).val("");
						}
					}
				}).keypress(function(event) {
					if( event.which === 13 ){
						$searchBtn.click();
					}
				});
				$searchBtn.hover(
					function() {$(this).addClass("hover");},
					function() {$(this).removeClass("hover");}
				).click(function() {
					var currentPage = $current.val();
					if ($v.maxPage && currentPage > 0 && currentPage <= $v.maxPage) {
						if ($v.searchFunc && $.isFunction($v.searchFunc)) {
							$v.searchFunc.call(this, currentPage - 1);
						}
					}
				});
			}

			function createLink($parent, label) {
				var $clickable = $("<span />").addClass("clickable").appendTo($parent);
				var $link = $("<a />").attr("href", "javascript:void(0)").text(label).appendTo($clickable);
				var $unclickable = $("<span />").addClass("unclickable").text(label).appendTo($parent);
			}
		}
	};
})(jQuery);

/**
 * 検索結果一覧ウィジェット
 */
(function($){
	$.fn.nameList = function(option){
		var defaults = {
			linkList:"ul.list-bullet-01",
			all:"li.list-all a"
		};
		var options = $.extend(defaults, options);
		if (!this) return false;
		return this.each(function(){
			var $this = $(this);
			var defName = $this.attr("defName");
			var viewName = $this.attr("viewName");
			var filterName = $this.attr("filterName");
			var prevLabel = $this.attr("prevLabel");
			var nextLabel = $this.attr("nextLabel");
			var limit = $this.attr("limit") - 0;
			var offset = 0;

			var $linkList = $(options.linkList, $this);
			var $all = $(options.all, $this);

			//ページング
			var _$pgr = $(".result-nav", $this);
			var $pager = $(".result-nav", $this).pager({
				limit: limit,
				showPageLink: false,
				showPageJump: false,
				showItemCount: false,
				previewFunc: function(){
					offset -= limit;
					search();
				},
				nextFunc: function() {
					offset += limit;
					search();
				},
				previousLabel: prevLabel,
				nextLabel: nextLabel
			});

			//一覧へのリンク
			$all.click(function() {
				var searchViewAction = $(this).attr("searchViewAction");
				var params = {defName:defName, searchCond:"&searchType=normal"};
				submitForm(contextPath + "/" + searchViewAction , params);
			});

			//検索
			var webapiName = $linkList.attr("webapiName");
			var viewAction = $linkList.attr("viewAction");

			search();

			function search() {
				searchNameList(webapiName, defName, viewName, filterName, offset, function(count, list) {
					$pager.setPage(offset, list.length, count);

					//一覧にリンク再作成
					$linkList.children().remove();
					$(list).each(function() {
						var name = this.properties.name;
						var oid = this.properties.oid;
						var version = this.properties.version;
						var $li = $("<li />").appendTo($linkList);
						$("<a>" + name +"</a>").appendTo($li).attr({"href":"javascript:void(0)"}).click(function() {
							showDetail(viewAction, oid, version, defName);
						});
					});
				});
			}
		});
	};
})(jQuery);

/**
 * 参照コンボ
 */
(function($){
	$.fn.refCombo = function(option) {
		var defaults = {
		};
		var options = $.extend(defaults, options);
		if (!this) return false;

		return this.each(function(){
			var $this = $(this);

			var props = new Array();
			init($this, options, props);
		});

		/*
		 * 初期化処理
		 */
		function init($v, options, props) {
			$.extend($v, {
				propName:$v.attr("propName"),
				defName:$v.attr("defName"),
				viewName:$v.attr("viewName"),
				webapiName:$v.attr("webapiName"),
				getEditorWebapiName:$v.attr("getEditorWebapiName"),
				searchParentWebapiName:$v.attr("searchParentWebapiName"),
				refComboType:$v.attr("refComboType"),
				oid:$v.attr("oid"),
				prefix:$v.attr("prefix"),
				searchType:$v.attr("searchType"),
				upperName:$v.attr("upperName"),
				upperOid:$v.attr("upperOid")
			});

			$("<option />").attr({value:""}).text(scriptContext.locale.pleaseSelect).appendTo($v);

			getPropertyEditor($v.getEditorWebapiName, $v.defName, $v.viewName, $v.propName, $v.refComboType, function(editor) {
				var setting = editor.referenceComboSetting;

				//連動コンボの設定がない場合は、連動できないので表示しない
				if (!setting || !setting.propertyName || setting.propertyName == "") return;

				//最後にコンボを選択するためのコールバック関数
				var func = null;
				if ($v.oid != "") {
					func = function() { $v.val($v.oid); }
				}
				//親コンボ生成
				initParent($v, $v.propName, $v.oid, setting, props, func);

				if ($v.oid == "") {
					if ($v.upperOid == "") {
						$v.siblings("select:first").change();
					} else {
						$v.siblings("select[name='" + $v.upperName + "']").change();
					}
				}
			});

			if ($v.searchType == "ALERT") {
				if (!scriptContext["normal_validation"]) {
					scriptContext["normal_validation"] = new Array();
				}
				scriptContext["normal_validation"].push(function() {
					if ($v.val() == "" && $v.siblings("select").children(":selected[value!='']").length > 0) {
						alert(scriptContext.locale.specifyConditoin);
						$v.focus();
						return false;
					}
					return true;
				});
			}
		}

		/*
		 * コンボ毎の初期化処理
		 * データの読み込み順(詳細編集や検索画面の復元時)
		 * ------------------------------------------------------------------------------------------
		 * 1.最下層の一個上のEntity取得(最下層のOIDが条件)
		 * 2.その上の階層のEntity取得(1のOIDが条件)
		 *   ・・・
		 * 3.一番上の階層のEntity取得(2のOIDが条件)
		 * ------------------------------------------------------------------------------------------
		 * 4.一番上の選択データ取得(条件なし)、3で取得した自身の階層を選択状態にする
		 * 5.その下の階層の選択データ取得(4のOIDが条件)、1～2で取得した自身の階層を選択状態にする
		 *   ・・・
		 * 6.最下層の選択データ取得(5のOIDが条件)、最下層を選択状態にする
		 * ------------------------------------------------------------------------------------------
		 */
		function initParent($v, name, childOid, setting, props, topCallback) {
			var parentName = name + "." + setting.propertyName;
			props.push(parentName);
			if (childOid == "") {
				var parentOid = "";
				var func = null;
				if (parentName == $v.upperName && $v.upperOid != "") {
					parentOid = $v.upperOid;
					func = function($parent) {
						$parent.val(parentOid);
					}
				}
				if (setting.parent && setting.parent.propertyName && setting.parent.propertyName != "") {
					//更に上位がいれば先に生成
					initParent($v, parentName, parentOid, setting.parent, props, null);
				}

				createNode($v, parentName, props, func);
			} else {
				//子から親を検索
				searchParent($v.searchParentWebapiName, $v.defName, $v.viewName, $v.propName, $v.refComboType, parentName, childOid, function(parent) {
					var parentOid = getOid(parent);
					if (setting.parent && setting.parent.propertyName && setting.parent.propertyName != "") {
						//更に上位がいれば先に生成
						initParent($v, parentName, parentOid, setting.parent, props, null);
					}

					var func = null;
					if (parentOid != "") {
						//階層を選択済みにする場合は階層データを読み込ませた後に選択対象指定
						func = function($parent) {
							$parent.val(parentOid);

							//最下層の一個上の場合は最下層を読み込んで選択状態を設定する
							if (topCallback && $.isFunction(topCallback)) {
								$parent.change();
								topCallback.call(this);
							}
						}
					}
					createNode($v, parentName, props, func);
				});
			}
		}

		/*
		 * OID取得
		 */
		function getOid(entity) {
			if (typeof entity === "undefined" || entity == null) return "";
			if (entity.properties == null || entity.properties.length == 0) return "";
			var oid = entity.properties.oid;
			if (typeof oid === "undefined" || oid == null) return "";
			return oid;
		}

		/*
		 * 親階層生成
		 */
		function createNode($v, name, props, func) {
			var $parent = $("<select />").attr({name:name, norewrite:true}).addClass("form-size-02 inpbr");
			$("<option />").attr({value:""}).text(scriptContext.locale.pleaseSelect).appendTo($parent);
			$parent.val("");
			$v.before($parent);
			$v.before(" &gt; ");

			$parent.change(function() {
				//自分の階層以下を初期化
				$parent.nextAll("select").each(function() {
					$(this).val("");
					$(this).children("option[value!='']").remove();
				});

				loadReferenceData($v, props);
			});

			if (func && $.isFunction(func)) {
				//親が先に読み込まれてるはず、この階層のデータを読み込む
				loadReferenceData($v, props, function(){func.call(this, $parent);});
			}
		}

		/*
		 * 参照データ読み込み
		 */
		function loadReferenceData($v, props, func) {
			var params = new Array();
			for (var i = 0; i < props.length; i++) {
				var val = $("select[name='" + props[i] + "']", $v.parent()).val();
				if (!val) val = "";
				params.push({key:props[i], value:val});
			}
			refComboChange($v.webapiName, $v.defName, $v.viewName, $v.propName, params, $v.refComboType, function(selName, entities) {
				if (entities == null || entities.length == 0) return;

				if ($v.propName == selName) {
					selName = $v.prefix + selName;
				}

				var $select = $("select[name='" + selName + "']", $v.parent());
				$select.children("option[value!='']").remove();

				for (var i = 0; i < entities.length; i++) {
					var entity = entities[i];
					$select.append("<option value='" + entity.oid + "'>" + entity.name + "</option>");
				}

				if (func && $.isFunction(func)) func.call(this);
			});
		}
	};
})(jQuery);

/**
 * 参照コンボのコントローラー
 * 多重度1以外の際のノードをコントロール
 */
(function($){
	$.fn.refComboController = function(option) {
		var defaults = {
		};
		var options = $.extend(defaults, options);
		if (!this) return false;

		return this.each(function(){
			var $this = $(this);
			init($this, options);
		});

		function init($v, options) {
			$.extend($v, {
				ulId:$v.attr("ulId"),
				dummyId:$v.attr("dummyId"),
				propName:$v.attr("propName"),
				multiplicity:$v.attr("multiplicity")
			});

			$v.click(function() {
				if (canAddItem($v.ulId, $v.multiplicity)) {
					var $src = $("#" + $v.dummyId)
					var $copy = clone($src, null);
					var $sel = $("select", $copy).attr("name", $v.propName);
					$sel.refCombo();
					$(":button", $copy).click(function() { $copy.remove()});
				}
			});
		}
	};
})(jQuery);

/**
 * ローデータ表示
 */
(function($){
	$.fn.rawdata = function(option) {
		var defaults = {
				grid: "#rawdata-grid",
				csvdownload: ".csvdownload",
				dataName: ".saved_list_name",
				updateDate: ".saved_list_updateDate",
				type: ".saved_list_type"
		};
		var options = $.extend(defaults, option);
		if (!this) return false;

		return this.each(function() {
			var $this = $(this);
			init($this, options);
		});

		function init($v, options) {
			$.extend($v, {
				oid: $v.attr("oid"),
				loadRawDataSavedListWebapiName: $v.attr("loadRawDataSavedListWebapiName"),
				rawDataCsvdownloadAction: $v.attr("rawDataCsvdownloadAction")
			});

			loadRawDataList($v.loadRawDataSavedListWebapiName, {oid:$v.oid, limit:100}, function(loadData) {
				setSavedListInfo(loadData)

				var data = loadData.data;
				var cols = loadData.cols;
				var colSize = loadData.colSize;
				var rowSize = loadData.rowSize;
				var dataType = loadData.dataType;

				var colNames = new Array();
				var colModel = new Array();
				for (var i = 0; i < cols.length; i++) {
					colNames.push(cols[i]);
					colModel.push({name:"col" + i, index: cols[i], width:130, sortable:false, hidden:false});
				}

				var gridData = new Array();
				for (var i = 0; i < data.length; i++) {
					var rowData = new Array();
					var row = data[i];
					if (row) {
						for (var j = 0; j < row.length; j++) {
							if (row[j] && row[j].displayName) {
								rowData["col" + j] = row[j].displayName;
							} else {
								rowData["col" + j] = row[j];
							}
						}
					}
					gridData.push(rowData);
				}

				var grid = $(options.grid, $v).jqGrid({
					data:gridData,
					datatype: "local",
					colNames: colNames,
					colModel: colModel,
					caption: "Aggregation RawData",
					rowNum: gridData.length,
					height: 260,
					viewrecords: true,
					altRows: true,
					shrinkToFit:true,
					altclass:"myAltRowClass"
				});
				var $lh = $("tr.ui-jqgrid-labels th:last", grid.parents("div.ui-jqgrid-view")).addClass("last");
				$lh.width($lh.width() - 1);
			});

			$(options.csvdownload, $v).click(function() {
				var $form = submitForm(contextPath + "/" + $v.rawDataCsvdownloadAction, {oid:$v.oid});
				$form.remove();
			});

			function setSavedListInfo(loadData) {
				$(options.dataName, $v).text(loadData.name);
				var $date = $.exDate();
				$date.setTime(loadData.updateDate);
				$(options.updateDate, $v).text($date.toChar("yyyy-mm-dd hh24:mi:ss"));
				var dataType = loadData.dataType;
				if (dataType == "snapshot") {
					$(options.type, $v).text("Snapshot");
				} else {
					$(options.type, $v).text("Condition");
				}
			}
		}
	};
})(jQuery);

/**
 * ローデータダイアログ表示
 */
(function($){
	$.fn.rawdataDialog = function(option) {
		var defaults = {
				grid: "#rawdata-grid",
				csvdownload: ".csvdownload",
				listing: ".listing",
				savedListDialog: "#savedListDialog",
				dataName: ".saved_list_name",
				updateDate: ".saved_list_updateDate",
				type: ".saved_list_type"
		};
		var options = $.extend(defaults, option);
		if (!this) return false;

		return this.each(function() {
			var $this = $(this);
			init($this, options);
		});

		function init($v, options) {
			$.extend($v, {
				modalTarget: $v.attr("modalTarget"),
				viewSavedListAction: $v.attr("viewSavedListAction"),
				loadData: $v.attr("loadData") == "true"
			});

			var modalTarget = $v.modalTarget != "" ? $v.modalTarget : null;
			var getRawDataCallback = null;
			var rawDataCsvDownloadCallback = null;
			var getLoadDataInfoCallback = null;
			var listingCallback = null;
			var $dialogTrigger = getDialogTrigger($v, {key:"saveAggregation", dialogHeight:500});
			var windowManager = document.rootWindow.scriptContext["windowManager"];
			if (modalTarget && windowManager && windowManager[document.targetName]) {
				var win = windowManager[modalTarget];
				$("#modal-title-" + modalTarget, parent.document).text(scriptContext.locale.rawData);
				getRawDataCallback = win.scriptContext["getRawDataCallback"];
				rawDataCsvDownloadCallback = win.scriptContext["rawDataCsvDownloadCallback"];
				listingCallback = win.scriptContext["listingCallback"];
				getLoadDataInfoCallback = win.scriptContext["getLoadDataInfoCallback"];
				//保存リストは親から下のコールバックをとるので、
				//ローデータ画面の親の集計画面で設定したコールバックを登録しなおし
				scriptContext["savedListCallback"] = win.scriptContext["savedListCallback"];
			} else {
				$("#modal-title", parent.document).text(scriptContext.locale.rawData);
				getRawDataCallback = parent.document.scriptContext["getRawDataCallback"];
				rawDataCsvDownloadCallback = parent.document.scriptContext["rawDataCsvDownloadCallback"];
				listingCallback = parent.document.scriptContext["listingCallback"];
				getLoadDataInfoCallback = parent.document.scriptContext["getLoadDataInfoCallback"];
				//同上
				scriptContext["savedListCallback"] = parent.document.scriptContext["savedListCallback"];
			}
			if (getRawDataCallback && $.isFunction(getRawDataCallback)) {
				getRawDataCallback.call(this, function(data, cols, rowSize) {

					var colNames = new Array();
					var colModel = new Array();
					for (var i = 0; i < cols.length; i++) {
						colNames.push(cols[i]);
						colModel.push({name:"col" + i, index: cols[i], width:130, sortable:false, hidden:false});
					}

					var gridData = new Array();
					for (var i = 0; i < data.length; i++) {
						var rowData = new Array();
						var row = data[i];
						if (row) {
							for (var j = 0; j < row.length; j++) {
								if (row[j] && row[j].displayName) {
									rowData["col" + j] = row[j].displayName;
								} else {
									rowData["col" + j] = row[j];
								}
							}
						}
						gridData.push(rowData);
					}

					var grid = $(options.grid, $v).jqGrid({
						data:gridData,
						datatype: "local",
						colNames: colNames,
						colModel: colModel,
						caption: "Aggregation RawData",
						rowNum: gridData.length,
						height: $v.loadData == true ? 340 : 500,
						viewrecords: true,
						altRows: true,
						shrinkToFit:true,
						altclass:"myAltRowClass"
					});
					var $lh = $("tr.ui-jqgrid-labels th:last", grid.parents("div.ui-jqgrid-view")).addClass("last");
					$lh.width($lh.width() - 1);
				});
			}
			if (rawDataCsvDownloadCallback && $.isFunction(rawDataCsvDownloadCallback)) {
				$(options.csvdownload, $v).click(function() {
					rawDataCsvDownloadCallback.call(this);
				});
			}
			if (listingCallback && $.isFunction(listingCallback)) {
				$(options.listing, $v).click(function() {
					viewSavedListDialog();
				});
			}
			if (getLoadDataInfoCallback && $.isFunction(getLoadDataInfoCallback)) {
				getLoadDataInfoCallback.call(this, function(loadData) {
					setSavedListInfo(loadData);
				});
			}

			function viewSavedListDialog() {
				listingCallback.call(this, function() {
					closeModalDialog();
				});

				$dialogTrigger.click();

				//ダイアログ
				var isSubModal = $("body.modal-body").length != 0;
				var target = getModalTarget(isSubModal);
				var $form = $("<form />").attr({method:"POST", action:contextPath + "/" + $v.viewSavedListAction, target:target}).appendTo("body");
				if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
				$form.submit();
				$form.remove();
			}

			function setSavedListInfo(loadData) {
				$(options.dataName, $v).text(loadData.name);
				var $date = $.exDate();
				$date.setTime(loadData.updateDate);
				$(options.updateDate, $v).text($date.toChar("yyyy-mm-dd hh24:mi:ss"));
				var dataType = loadData.dataType;
				if (dataType == "snapshot") {
					$(options.type, $v).text("Snapshot");
				} else {
					$(options.type, $v).text("Condition");
				}
			}
		}
	};
})(jQuery);

/**
 * 保存リスト
 */
(function($){
	$.fn.savedList =function(option) {
		var defaults = {
				create: "p.create",
				save: "tr.save",
				createFolderDialog: "#createFolderDialog",
				savedListPanel: "div.savedListPanel",
				ownerPanel: "div.ownerPanel",
				cookiePath: "savedListWidgetNode"
		};
		var options = $.extend(defaults, option);
		if (!this) return false;

		var ret = this.each(function() {
			var $this = $(this);
			init($this, options);

			//jQueryオブジェクトのメソッドをjavascriptオブジェクトで利用する為、内部メソッドをバインド
			var methods = ["loadSavedList", "updateShared"];
			for (var i = 0; i < methods.length; i++) {
				_bindMethod($this, this, methods[i]);
			}
			function _bindMethod(obj,to,method){
				to[method]=function(){
					return obj[method].apply(obj,arguments);
				};
			}
		});

		ret.loadSavedList = function(id) {
			$(this).filter("[treetype='grid']").each(function() {
				this.loadSavedList(id);
				return false;
			});
		};

		ret.updateShared = function(id, shared) {
			$(this).filter("[treetype='grid']").each(function() {
				this.updateShared(id, shared);
				return false;
			});
		};

		return ret;

		function init($v, options) {
			$.extend($v, {
				modalTarget: $v.attr("modalTarget"),//d,p
				createFolderWebapiName: $v.attr("createFolderWebapiName"),//d
				getFolderContentsAction: $v.attr("getFolderContentsAction"),//p
				getFolderContentsWebapiName: $v.attr("getFolderContentsWebapiName"),//w
				getMySavedListAction: $v.attr("getMySavedListAction"),//p
				getMySavedListWebapiName: $v.attr("getMySavedListWebapiName"),//w
				getSavedListDataTypeWebapiName: $v.attr("getSavedListDataTypeWebapiName"),//p
				deleteSavedListWebapiName: $v.attr("deleteSavedListWebapiName"),//p
				showRawDataAction: $v.attr("showRawDataAction"),//p
				rawDataCsvdownloadAction: $v.attr("rawDataCsvdownloadAction"),//p
				showEntityListingDataAction: $v.attr("showEntityListingDataAction"),//p
				loadRawDataSavedListWebapiName: $v.attr("loadRawDataSavedListWebapiName"),//p
				loadEntityListSavedListWebapiName: $v.attr("loadEntityListSavedListWebapiName"),//p
				updateSharedWebapiName: $v.attr("updateSharedWebapiName"),//p
				viewSavedListDataAction: $v.attr("viewSavedListDataAction"),//w
				treeType: $v.attr("treeType"),//p,w
				load: $v.attr("load"),//p
				selectedFolderId:$v.attr("selectedFolderId")//d
			});

			if ($v.treeType == "grid") {
				initGrid($v, options);
			} else if ($v.treeType == "tree") {
				initTree($v, options);
			}
		}

		function initGrid($v, opstions) {
			var $savedListGrid = null;
			var $mySavedListGrid = null;
			var $create = $(options.create, $v);
			var $save = $(options.save, $v);
			var $savedListPanel = $(options.savedListPanel, $v);
			var $ownerPanel = $(options.ownerPanel, $v);
			var $dialogTrigger = getDialogTrigger($v);
			var modalTarget = $v.modalTarget != "" ? $v.modalTarget : null;
			var load = $v.load == "true";
			var savedListCallback = null;
			var selectedFolderId = $v.selectedFolderId != "" ? $v.selectedFolderId : null;
			if (document.rootWindow) {
				var windowManager = document.rootWindow.scriptContext["windowManager"];
				if (modalTarget && windowManager && windowManager[document.targetName]) {
					var win = windowManager[modalTarget];
					$("#modal-title-" + modalTarget, parent.document).text(scriptContext.locale.savedList);
					savedListCallback = win.scriptContext["savedListCallback"];
				} else {
					$("#modal-title", parent.document).text(scriptContext.locale.savedList);
					savedListCallback = parent.document.scriptContext["savedListCallback"];
				}
			}

			$(options.createFolderDialog).dialog({
				resizable: false,
				autoOpen: false,
				height: 160,
				width: 260,
				modal: true,
				buttons: {
					"OK": function() {
						var $dialog = $(this);
						var name = $(":text[name='name']", $(this)).val();
						var code = $(":text[name='code']", $(this)).val();
						if (typeof name == "undefined" || name == null || name == "") {
							alert("name is null");
							return;
						}
						if (typeof code == "undefined" || code == null || code == "") {
							alert("code is null");//TODO そのうちnullを許可に
							return;
						}
						createNewFolder($v.createFolderWebapiName, name, code, selectedFolderId, function(folder, message) {
							if (message) {
								//なんかしらエラー
								alert(message);
								return;
							}

							var rowData = $savedListGrid.jqGrid("getRowData", selectedFolderId);
							var level = rowData.level ? rowData.level + 1 : 0;
							$savedListGrid.jqGrid("addChildNode", folder.id, selectedFolderId, {
								id:folder.id,
								name:folder.name,
								code:folder.code,
								dataType:null,
								owner:null,
								cDate:null,
								level:level,
								parent:selectedFolderId,
								isLeaf:false,
								expanded:true,
								loaded:false
							});

							//addChildNodeだと末端扱いになってしまうのでクラスを修正
							$(".tree-leaf", $("#" + folder.id)).removeClass("ui-icon-radio-off tree-leaf ").addClass("ui-icon-triangle-1-e tree-plus");

							$(":text[name='name']", $(this)).val("");
							$(":text[name='code']", $(this)).val("");
							$dialog.dialog("close");
						});
					},
					Cancel: function() {
						$(":text[name='name']", $(this)).val("");
						$(":text[name='code']", $(this)).val("");
						$(this).dialog("close");
					}
				},
				close: function() {
					$(":text[name='name']", $(this)).val("");
					$(":text[name='code']", $(this)).val("");
				}
			});

			$("a", $create).click(function() {
				//対象フォルダ、名前、コードを取得して作成する
				$(options.createFolderDialog).bind("dialogopen", function(e) {
					var $layer = $(".ui-widget-overlay");
					$layer.height(451);
					$layer.next().css({top:150});
				});
				$(options.createFolderDialog).dialog("open");
			});
			$(":button.createfolder", $savedListPanel).click(function() {
				//対象フォルダ、名前、コードを取得して作成する
				$(options.createFolderDialog).dialog("open");
			});

			//保存(ダイアログ)
			$(":button", $save).click(function() {
				if (savedListCallback && $.isFunction(savedListCallback)) {
					var $text = $(":text", $save);
					var name = $text.val();
					if (typeof name === "undefined" || name == null || name == "") {
						alert(scriptContext.locale.enterName);
						$text.focus();
						return;
					}
					var shared = $(":radio:checked[name='shared']", $save).val();
					var saveType = $(":radio:checked[name='saveType']", $save).val();

					savedListCallback.call(this, selectedFolderId, name, shared, saveType, function() {
						alert(scriptContext.locale.savedMessage);
					});
				}
			});

			$(":button.delete", $savedListPanel).click(function() {
				//フォルダorアイテム削除
				var rowid = $savedListGrid.getGridParam("selrow");
				if (rowid == null) return;

				var rowData = $savedListGrid.jqGrid("getRowData", rowid);
				var isFolder = !rowData["isLeaf"] || rowData["isLeaf"] == "false";
				var isShared = rowData["shared"] && rowData["shared"] == "true";

				//削除確認
				if (isFolder) {
					if (!confirm(scriptContext.locale.deleteFolderMsg)) return;
				} else {
					if (isShared) {
						if (!confirm(scriptContext.locale.deleteSharedSavedList)) return;
					} else {
						if (!confirm(scriptContext.locale.deleteSavedList)) return;
					}
				}

				var params = {oid: rowid};
				if (isFolder) {
					params.type = "folder";
				} else {
					params.type = "item";
				}
				deleteSavedList($v.deleteSavedListWebapiName, params, function(message) {
					alert(message);
					$savedListGrid.trigger("reloadGrid");
					if ($mySavedListGrid) $mySavedListGrid.trigger("reloadGrid");
				});
			});

			$(":button.delete", $ownerPanel).click(function() {
				//アイテム削除
				var rowid = $mySavedListGrid.getGridParam("selrow");
				if (rowid == null) return;

				var rowData = $mySavedListGrid.jqGrid("getRowData", rowid);
				var isShared = rowData["shared"] && rowData["shared"].indexOf("checked") > 0;

				//削除確認
				if (isShared) {
					if (!confirm(scriptContext.locale.deleteSharedSavedList)) return;
				} else {
					if (!confirm(scriptContext.locale.deleteSavedList)) return;
				}

				var params = {oid: rowid, type:"item"};
				deleteSavedList($v.deleteSavedListWebapiName, params, function(message) {
					alert(message);
					$savedListGrid.trigger("reloadGrid");
					if ($mySavedListGrid) $mySavedListGrid.trigger("reloadGrid");
				});
			});

			//タブ化
			$v.tabContent({clickFunc:function($menu) {
				if ($menu.hasClass("listTab")) {
					$create.show();
				} else {
					$create.hide();
					if ($menu.attr("loaded") != "true") {
						$menu.attr("loaded", "true");
						colNames = ["id", scriptContext.locale.name, scriptContext.locale.shared, scriptContext.locale.createDate];
						colModel = [
							{name:"id", index:"id", hidden: true, key:true },
							{name:"name", index:"name", width:320, formatter:function(cellvalue, opt, rowObject) {
								return "<a href='javascript:void(0)' onclick='loadSavedList(" + opt.rowId + ")'>" + cellvalue + "</a>";
							}},
							{name:"shared", index:"shared", width:190, align:"center", formatter:function(cellvalue, opt, rowObject) {
								var checked = cellvalue == "true" ? " checked" : "";
								var html = "<ul class='list-radio-01'>";
								html += "<li><label><input type='checkbox' name='shared" + opt.rowId + "' value='true' onchange='updateShared(" + opt.rowId + ", this)' " + checked + " />" + scriptContext.locale.share + "</label></li>";
								html += "</ul>";
								return html;
							}},
							{name:"cDate", index:"cDate", align:"center"}
						];
						$mySavedListTable = $("<table />").prependTo($ownerPanel);
						$mySavedListGrid = $mySavedListTable.jqGrid({
								url:contextPath + "/" + $v.getMySavedListAction,
								treeGrid:true,
								datatype: "xml",
								treeGridModel:"adjacency",
								ExpandColumn:"name",
								ExpandColClick:true,
								mtype: "POST",
								colNames: colNames,
								colModel: colModel,
								caption: "SavedList",
								height: 230,
								viewrecords: true,
								sortname:"name",
								sortorder: "asc",
								altclass:"myAltRowClass",
								treeReader: {
									level_field: "level",
									parent_id_field: "parent",
									leaf_field: "isLeaf",
									expanded_field: "expanded"
								}
						});
						var $mySavedListLastHeader = $("#_cDate", $ownerPanel).addClass("last");
						$mySavedListLastHeader.width($mySavedListLastHeader.width() - 1);
					}
				}
			}});

			//ツリーグリッド生成
			var colNames = ["id", scriptContext.locale.name, scriptContext.locale.code, scriptContext.locale.dataType, scriptContext.locale.owner, scriptContext.locale.shared, scriptContext.locale.createDate];
			var colModel = [
				{name:"id", index:"id", hidden: true, key:true },
				{name:"name", index:"name", width:260, formatter:function(cellvalue, opt, rowObject) {
					//行のデータのxmlを直接解析してフォルダか判断
					if (load) {
						if (rowObject.textContent) {
							if (rowObject.textContent.split("\n")[10].indexOf("true") > -1) {
								return "<a href='javascript:void(0)' onclick='loadSavedList(" + opt.rowId + ")'>" + cellvalue + "</a>";
							}
						} else if (rowObject.xml) {
							if (rowObject.xml.split("\n")[10].indexOf("true") > -1) {
								return "<a href='javascript:void(0)' onclick='loadSavedList(" + opt.rowId + ")'>" + cellvalue + "</a>";
							}
						}
					}
					return cellvalue;
				}},
				{name:"code", index:"code", align:"center", hidden: true},
				{name:"dataType", index:"dataType", align:"center"},
				{name:"owner", index:"owner", align:"center"},
				{name:"shared", index:"shared", align:"center", hidden: true},
				{name:"cDate", index:"cDate", align:"center"}
			];
			$savedListTable = $("<table />").prependTo($savedListPanel);
			$savedListGrid = $savedListTable.jqGrid({
					url:contextPath + "/" + $v.getFolderContentsAction,
					treeGrid:true,
					datatype: "xml",
					treeGridModel:"adjacency",
					ExpandColumn:"name",
					ExpandColClick:true,
					mtype: "POST",
					colNames: colNames,
					colModel: colModel,
					caption: "SavedList",
					height: 230,
					viewrecords: true,
					sortname:"name",
					sortorder: "asc",
					altclass:"myAltRowClass",
					treeReader: {
						level_field: "level",
						parent_id_field: "parent",
						leaf_field: "isLeaf",
						expanded_field: "expanded"
					},
					onSelectRow: function(rowid, e) {
						var rowData = $savedListGrid.jqGrid("getRowData", rowid);
						if (!rowData["isLeaf"] || rowData["isLeaf"] == "false") {
							selectedFolderId = rowid;

							$(".folderName", $v).text(getFolderName(rowData));
						}
					}
			});
			var $savedListLastHeader = $("#_cDate", $savedListPanel).addClass("last");
			$savedListLastHeader.width($savedListLastHeader.width() - 1);
			function getFolderName(rowData) {
				var parent = $savedListGrid.getNodeParent(rowData);
				if (parent == null) {
					return rowData.name;
				} else {
					return getFolderName(parent) + "/" + rowData.name;
				}
			};
			function getCurrentTab() {
				if ($(".tab-menu li.listTab", $v).hasClass("current")) {
					return "listTab";
				} else if ($(".tab-menu li.myListTab", $v).hasClass("current")) {
					return "myListTab";
				}
			};
			$v.loadSavedList = function(id) {
				getSavedListDataType($v.getSavedListDataTypeWebapiName, {oid:id}, function(dataType) {
					//保存内容に合わせて処理を変える
					if (dataType == "SimpleAggregationRawData"
						|| dataType == "CrosstabAggregationRawData"
						|| dataType == "CubeAggregationRawData") {

						loadRawDataList($v.loadRawDataSavedListWebapiName, {oid:id, limit:100}, function(loadData) {
							var data = loadData.data;
							var cols = loadData.cols;
							var colSize = loadData.colSize;
							var rowSize = loadData.rowSize;
							var dataType = loadData.dataType;

							//集計系、ローデータをダイアログで表示
							$dialogTrigger.click();

							scriptContext["getLoadDataInfoCallback"] = function(func) {
								func.call(this, loadData);
							}

							//ダイアログにローデータを渡して表示
							scriptContext["getRawDataCallback"] = function(func) {
								func.call(this, data, cols, rowSize);
							};

							scriptContext["rawDataCsvDownloadCallback"] = function() {
								var params = {oid: id};
								var $form = submitForm(contextPath + "/" + $v.rawDataCsvdownloadAction, params);
								$form.remove();
							};

							//ダイアログ
							var isSubModal = $("body.modal-body").length != 0;
							var target = getModalTarget(isSubModal);
							var $form = $("<form />").attr({method:"POST", action:contextPath + "/" + $v.showRawDataAction, target:target}).appendTo("body");
							$("<input />").attr({type:"hidden", name:"loadData", value:"true"}).appendTo($form);
							if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
							$form.submit();
							$form.remove();
						});
					} else if (dataType == "EntityListingRawData") {

						loadEntityDataList($v.loadEntityListSavedListWebapiName, {listedId:id, offset:0}, function(data) {
							//EntityListing用のダイアログを表示

							$dialogTrigger.click();

							//ダイアログ側からロードデータを取得する際のCallback設定
							scriptContext["getLoadSavedDataCallback"] = function(func) {
								//Loadデータを渡す
								func.call(this, data);
							};

							scriptContext["editActionCallback"] = function(viewEditAction) {
								var mode = "edit";
								submitForm(contextPath + "/" + viewEditAction, {"listedId":id, "mode":mode});
								closeModalDialog();
							}
							scriptContext["copyActionCallback"] = function(viewEditAction) {
								var mode = "copy";
								submitForm(contextPath + "/" + viewEditAction, {"listedId":id, "mode":mode});
								closeModalDialog();
							}


							//ダイアログ
							var isSubModal = $("body.modal-body").length != 0;
							var target = getModalTarget(isSubModal);
							var $form = $("<form />").attr({method:"POST", action:contextPath + "/" + $v.showEntityListingDataAction, target:target}).appendTo("body");
							//$("<input />").attr({type:"hidden", name:"hideListing", value:"true"}).appendTo($form);
							if (isSubModal) $("<input />").attr({type:"hidden", name:"modalTarget", value:target}).appendTo($form);
							$form.submit();
							$form.remove();

						});
					} else {

						//データ削除済み等、取れなかった場合
						alert(scriptContext.locale.deletedMsg);
						$savedListGrid.trigger("reloadGrid");
						if ($mySavedListGrid) $mySavedListGrid.trigger("reloadGrid");
					}
				});
			};
			$v.updateShared = function(id, shared) {
				updateSavedList($v.updateSharedWebapiName, {oid:id, shared:shared}, function(message) {
					alert(message);
				});
			};
		}
		function initTree($v, opstions) {
			var $dialogTrigger = getDialogTrigger($v);
			var $top = $(".savedListTree", $v);
			$top.tree({
				selectable:false,
				data:[
						{label:scriptContext.locale.savedList, id:"savedListNode", load_on_demand: true},
						{label:scriptContext.locale.ownerList, id:"ownerNode", load_on_demand: true}
					],
				dataUrl:function(node) {
					//ここで非同期で取得するurlInfoを返す
					var url_info, data;
					url_info = {
						method : "POST",
						contentType : "application/json"
					};
					if (node) {
						if (node.id == "ownerNode") {
							//所有リスト(ルート)
							url_info.url = contextPath + "/rest/command/" + $v.getMySavedListWebapiName;
							url_info.data = "{}";
						} else if (node.id == "savedListNode") {
							//保存リスト(ルート)
							url_info.url = contextPath + "/rest/command/" + $v.getFolderContentsWebapiName;
							url_info.data = "{}";
						} else {
							//保存リスト(フォルダ)
							url_info.url = contextPath + "/rest/command/" + $v.getFolderContentsWebapiName;
							url_info.data = "{\"nodeid\":\"" + node.id + "\"}";
						}
					}
					return url_info;
				},
				//responseカスタマイズ(jqTreeカスタマイズ機能)
				onArrivedResponse:function(response) {
					var childNode = response.results.childNode;

					var infos = new Array();
					$(childNode).each(function() {
						var child = this;
						infos.push({
							id: child.id,
							name: child.name,
							load_on_demand: child.expanded == true,
							leaf: child.leaf
						});
					});

					return infos;
				},
				onCreateLi:function(node, $li) {
					//前回選択したノードがあれば再現
					var path = getCookie(options.cookiePath);
					if (path && path.indexOf(node.id) == 0) {
						//1階層づつ頭から読み込んでいく
						var pathList = path.split("/");
						if (pathList.length > 1) {
							pathList.shift();
							setCookie(options.cookiePath, pathList.join("/"), 1);
						} else {
							setCookie(options.cookiePath, null, 0);
						}
						$top.tree('openNode', node, false);
					}
				}
			});

			//クリック処理
			$top.bind("tree.click", function(e) {
				var node = e.node;
				if (node.leaf == true) {
					//メインエリアに保存内容を表示する
					setCookie(options.cookiePath, getNodePath(node), 1);
					submitForm(contextPath + "/" + $v.viewSavedListDataAction, {oid:node.id});
				} else {
					if (node.is_open) {
						$top.tree('closeNode', node);
					} else {
						$top.tree('openNode', node);
					}
				}
			});

			//ツリー開閉時の高さ再調整
			$top.bind("tree.open", function(e) {
				$(".fixHeight").fixHeight();
			});
			$top.bind("tree.close", function(e) {
				$(".fixHeight").fixHeight();
			});

			function getNodePath(node) {
				if (node.parent && node.parent.id) {
					return getNodePath(node.parent) + "/" + node.id;
				} else {
					return node.id;
				}
			}
		}
	};
})(jQuery);

//jqGridのセル内のHTMLに直接イベントを記述してるため、関数内のfunctionを直接呼べない
//そのため呼び出す関数を外に定義して、そこからjQueryオブジェクトを経由して処理を呼び出す
function loadSavedList(id) {
	$savedList.loadSavedList(id);
}
function updateShared(id, shared) {
	if (!confirm(scriptContext.locale.changeSharedStatus)) {
		$(shared).attr("checked", !$(shared).is(":checked"));
		return false;
	}
	$savedList.updateShared(id, $(shared).is(":checked"));
}