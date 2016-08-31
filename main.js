
(($) => {
	const demoData = '[\n    {"name":"name1","value":"value1"},\n    {"name":"name2","value":"value2"}\n]';
	const selectorHtml = '<td class="selector" title="Редактировать строки"><div></div></td>';

	const d = $(document);
	const w = $(window);

	var editor = null;

	function cellHtml(value) {
		return '<td><input class="cell" type="text" title="Изменить" value="' + value + '"/></td>';
	}

	function rowHtml(record) {
		return '<tr>' + selectorHtml + cellHtml(record.name) + cellHtml(record.value) + '</tr>';
	}

	Editor.prototype.updateToolbar = function(selector) {
		editor.toolbar.css({
			left: (editor.contents.offset().left - editor.toolbar.outerWidth(true)) + 'px',
			top: (selector.offset().top + (selector.outerHeight() - editor.toolbar.outerHeight()) / 2) + 'px'
		});
	}

	Editor.prototype.refreshRows = function() {
		this.rows = this.contents.children();
	}

	function setContents(contents, data) {
		contents.empty();

		for(var i = 0; i < data.length; ++i) {
			contents.append($(rowHtml(data[i])));
		}
	}

	function getContents(contents, data) {
		var data = [];
		var rows = contents.children();

		rows.each(function(index) {
			var cells = $(this).children();
			data.push({name: cells.eq(1).text(), value: cells.eq(2).text()});
		});
	}

	function cancelEdit() {
		if(editor.currentSelector != null) {
			editor.currentSelector = null;
			editor.toolbar.hide("fade");
		}
	}

	function setTextareaVisibility(visible) {
		editor.textareaVisible = visible;
		var delay = 800 * (editor.sidebarButton.width() / editor.sidebar.width());

		if(editor.textareaVisible) {
			editor.sidebar.animate({left: 0}, 500);
			editor.sidebarButton.delay(delay).animate({left: editor.sidebar.width() - 84}, 500 * (editor.sidebar.width() - 84) / editor.sidebar.width());
		} else {
			editor.sidebar.animate({left: -editor.sidebar.width()}, 500 * editor.sidebar.width() / (editor.sidebar.width() - 84));
			editor.sidebarButton.animate({left: 20}, 500);
		}
	}

	function selectRow(selector) {
		var element = $(selector);
		var top = element.offset().top + (element.outerHeight() - editor.toolbar.outerHeight()) / 2;

		if(editor.currentSelector != selector) {
			if(editor.currentSelector == null) {
				cancelEdit();
				editor.toolbar.css({top: top + 'px'});
				editor.toolbar.show("fade");
			} else {
				editor.currentSelector = null;
				cancelEdit();
				editor.toolbar.animate({top: top});
			}

			editor.currentSelector = selector;
			return true;
		}

		return false;
	}

	function Editor() {
		editor = this;
		this.tableContainer = $(".table");
		this.contents = this.tableContainer.find("tbody");
		this.sidebar = $(".sidebar");
		this.sidebarButton = $("#sidebar-button");
		this.textareaContainer = this.sidebar.find(".textarea");
		this.textarea = this.textareaContainer.find("textarea");
		this.description = this.sidebar.find(".description");
		this.data = JSON.parse(demoData);
		this.textarea.val(demoData);
		this.textareaVisible = true;
		this.toolbar = $("#toolbar");
		this.help = $("#help");
		this.helpButton = $("#help-button");
		this.helpShown = false;
		this.toolbar.hide();
		this.currentSelector = null;

		this.sidebar.offset({left: -editor.sidebar.width(), top: 0});

		var selector = $(".selector").first();
		editor.updateToolbar(selector);

		setContents(this.contents, this.data);
		setTextareaVisibility(this.textareaVisible);

		this.contents.sortable({
			items: "> tr",
			appendTo: "parent",
			axis: "y",
			handle: "> .selector",
  			containment: "parent",
			tolerance: "pointer",
			placeholder: "sortable-placeholder",
			distance: 2,
			stop: function(e, ui) {
				if(editor.currentSelector != null) {
					var element = $(editor.currentSelector);
					var top = element.offset().top + (element.outerHeight() - editor.toolbar.outerHeight()) / 2;
					editor.toolbar.css({top: top + 'px'});
				}
			}
		}).disableSelection();

		this.sidebarButton.click(function() {
			setTextareaVisibility(!editor.textareaVisible);
		});

		this.refreshRows();

		var newRowAbove = this.toolbar.find(".new-row-above");
		var newRowBelow = this.toolbar.find(".new-row-below");
		var dublicateRow = this.toolbar.find(".dublicate-row");
		var deleteRow = this.toolbar.find(".delete-row");

		this.toolbar.disableSelection();

		this.contents.on("click", ".selector", function(e) {
			if(selectRow(this))
				e.stopPropagation();;
		});

		newRowAbove.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);

				selector.parent().before(rowHtml({name: "", value: ""}));
				editor.refreshRows();
				editor.toolbar.animate({top: selector.offset().top + (selector.outerHeight() - editor.toolbar.outerHeight()) / 2});

				e.stopPropagation();
			}
		});

		newRowBelow.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);

				selector.parent().after(rowHtml({name: "", value: ""}));
				editor.refreshRows();

				e.stopPropagation();
			}
		});

		dublicateRow.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);

				selector.parent().after(selector.parent().clone());
				editor.refreshRows();

				e.stopPropagation();
			}
		});

		deleteRow.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);
				var row = selector.parent();

				if(editor.rows.length == 1) {
					row.before(rowHtml({name: "", value: ""}));
				}

				var next = row.next();

				if(next.length == 0)
					next = row.prev();

				row.remove();
				editor.refreshRows();
				selectRow(next.children()[0]);

				e.stopPropagation();
			}
		});

		var status = $("#export-status");

		$("#tools .export").on("click", function() {
			status.text("");

			try {
				editor.data = JSON.parse(editor.textarea.val());
				setContents(editor.contents, editor.data);
			} catch(e) {
				status.text("Данные некорректны");
			}
		});

		$("#tools .import").on("click", function() {
			status.text("");
			getContents(editor.contents, editor.data);
			editor.textarea.val(JSON.stringify(editor.data));
		});

		this.helpButton.on("click", function(e) {
			if(!editor.helpShown) {
				editor.help.show("drop");
				editor.helpShown = true;
				e.stopPropagation();
			}
		});

		d.on("click", function() {
			cancelEdit();

			if(editor.helpShown) {
				editor.help.hide("drop");
				editor.helpShown = false;
			}
		});

		w.resize(function() {
			if(editor.currentSelector != null) {
				editor.updateToolbar($(editor.currentSelector));
			} else {
				editor.toolbar.css({
					left: (editor.contents.offset().left - editor.toolbar.outerWidth(true)) + 'px'
				});
			}
		});
	}

	d.ready(() => {
		new Editor();
	});
})(jQuery);
