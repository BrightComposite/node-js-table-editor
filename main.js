(($) => {
	const demoData = '[\n    {"name":"name1","value":"value1"},\n    {"name":"name2","value":"value2"}\n]';
	const selectorHtml = '<td class="selector"></td>';

	const d = $(document);
	const w = $(window);

	var editor = null;
	var dynamicTextarea = true;

	function cellHtml(value) {
		return '<td><div class="cell">' + value + '</div></td>';
	}

	function rowHtml(record) {
		return '<tr>' + selectorHtml + cellHtml(record.name) + cellHtml(record.value) + '</tr>';
	}

	function updateSidebar() {
		if(w.width() < 1280) {
			dynamicTextarea = false;
		} else {
			dynamicTextarea = true;
		}
	}

	function resizeWindow() {
		var contents = $(".contents");

		if(w.width() < 1280) {
			dynamicTextarea = false;
		} else {
			dynamicTextarea = true;
		}
	}

	Editor.prototype.refreshRows = () => {
		editor = this;
		this.rows = this.contents.children();
	}

	function setContents(contents, data) {
		contents.empty();

		for(var i = 0; i < data.length; ++i) {
			contents.append($(rowHtml(data[i])));
		}
	}

	function Editor() {
		this.contents = $(".table tbody");
		this.textarea = $(".textarea textarea");
		this.sidebar = $(".sidebar");
		this.data = JSON.parse(demoData);
		this.textarea.text(demoData);

		setContents(this.contents, this.data);
		resizeWindow();

		this.contents.on("click", ".selector", () => {

		});

		this.textarea.resize(() => {

		});
	}

	d.ready(() => {
		new Editor();
	});

	w.resize(resizeWindow);
})(jQuery);
