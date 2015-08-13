module('jQuery#inline_editor', {
	// This will run before each test in this module.
	setup: function() {
		this.el = document.getElementById('editor');
		this.plugin = new InlineEditor(el);
	}
});

test('extend', function() {

	ie.setup({
		lang: {
			textEmpty: 'Awesome'
		}
	});

	expect(1);
	// Not a bad test to run on collection methods.
	strictEqual(this.elems.inline_editor(), this.elems, 'should be chainable');
});