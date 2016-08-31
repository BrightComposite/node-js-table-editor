
(($) => {
	const demoData = [
		{"name":"name1","value":"value1"},
		{"name":"name2","value":"value2"}
	];

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
		editor.toolbar.offset({
			left: (selector.offset().left - editor.toolbar.outerWidth(false) - 10),
			top: (selector.offset().top + (selector.outerHeight() - editor.toolbar.outerHeight()) / 2)
		});
	}

	function setContents(contents, data) {
		contents.empty();

		for(var i = 0; i < data.length; ++i) {
			contents.append($(rowHtml(data[i])));
		}
	}

	function getContents(contents) {
		var data = [];
		var rows = contents.children();

		rows.each(function(index) {
			var cells = $(this).children();
			data.push({name: cells.eq(1).find("input").val(), value: cells.eq(2).find("input").val()});
		});

		return data;
	}

	function cancelEdit() {
		if(editor.currentSelector != null) {
			editor.currentSelector = null;
			editor.toolbar.css("opacity", "0.0");
		}
	}

	function setTextareaVisibility(visible) {
		editor.textareaVisible = visible;
		var delay = 80;

		if(editor.textareaVisible) {
			editor.sidebar.animate({left: 0}, 500);
			editor.sidebarButton.delay(delay).animate({left: editor.sidebar.width() - 100}, 500 * (editor.sidebar.width() - 100) / editor.sidebar.width());
		} else {
			editor.sidebar.animate({left: -editor.sidebar.width()}, 500 * editor.sidebar.width() / (editor.sidebar.width() - 100));
			editor.sidebarButton.animate({left: 20}, 500);
		}
	}

	function selectRow(selector) {
		var element = $(selector);

		if(editor.currentSelector != selector) {
			if(editor.currentSelector == null) {
				editor.updateToolbar(element);
				editor.toolbar.css("opacity", "1.0");
			} else {
				editor.updateToolbar(element);
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
		this.data = demoData;
		this.textarea.val(JSON.stringify(demoData));
		this.textareaVisible = true;
		this.toolbar = $("#toolbar");
		this.currentSelector = null;

		this.sidebar.offset({left: -editor.sidebar.width(), top: 0});
		this.toolbar.css("transition", "opacity 0.2s linear");
		this.updateToolbar($(".selector").first());

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
					editor.updateToolbar(element);
				}
			}
		}).disableSelection();

		this.sidebarButton.click(function() {
			setTextareaVisibility(!editor.textareaVisible);
		});

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
				editor.updateToolbar(selector);
				e.stopPropagation();
			}
		});

		newRowBelow.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);
				selector.parent().after(rowHtml({name: "", value: ""}));
				editor.updateToolbar(selector);
				e.stopPropagation();
			}
		});

		dublicateRow.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);
				selector.parent().after(selector.parent().clone());
				editor.updateToolbar(selector);
				e.stopPropagation();
			}
		});

		deleteRow.on("click", function(e) {
			if(editor.currentSelector != null) {
				var selector = $(editor.currentSelector);
				var row = selector.parent();

				if(row.parent().children().length == 1) {
					row.before(rowHtml({name: "", value: ""}));
				}

				var next = row.next();

				if(next.length == 0)
					next = row.prev();

				row.remove();
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
			editor.data = getContents(editor.contents);
			editor.textarea.val(JSON.stringify(editor.data));
		});

		d.on("click", function() {
			cancelEdit();
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
