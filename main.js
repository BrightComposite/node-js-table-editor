(($) => {
	const demoData = '[\n    {"name":"name1","value":"value1"},\n    {"name":"name2","value":"value2"}\n]';
	const selectorHtml = '<td class="selector"></td>';

	const d = $(document);
	const w = $(window);

	var editor = null;

	function cellHtml(value) {
		return '<td><div class="cell">' + value + '</div></td>';
	}

	function rowHtml(record) {
		return '<tr>' + selectorHtml + cellHtml(record.name) + cellHtml(record.value) + '</tr>';
	}

	Editor.prototype.refreshRows = () => {
		this.rows = this.contents.children();
	}

	function setContents(contents, data) {
		contents.empty();

		for(var i = 0; i < data.length; ++i) {
			contents.append($(rowHtml(data[i])));
		}
	}

	function changeSelector() {

	}

	function Editor() {
		editor = this;
		this.contents = $(".table tbody");
		this.textareaContainer = $(".textarea");
		this.textarea = $(".textarea textarea");
		this.description = $(".description");
		this.sidebar = $(".sidebar");
		this.sidebarButton = $(".sidebar-button");
		this.data = JSON.parse(demoData);
		this.textarea.text(demoData);
		this.textareaHidden = false;

		setContents(this.contents, this.data);

		this.contents.sortable({
			items: "> tr",
			appendTo: "parent",
			axis: "y",
			handle: "> .selector",
  			containment: "parent",
			tolerance: "pointer",
			placeholder: "sortable-placeholder"
		}).disableSelection();

		this.sidebarButton.click(() => {
			editor.textareaHidden = !editor.textareaHidden;

			if(editor.textareaHidden) {
				editor.sidebar.offset({left: editor.sidebarButton.outerWidth(true) - editor.sidebar.width(), top: 0});
			} else {
				editor.sidebar.offset({left: 0, top: 0});
			}
		});
	}

	d.ready(() => {
		new Editor();
	});
})(jQuery);
