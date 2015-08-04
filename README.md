# Inline Editor

A Medium like inline editor

## Getting Started
At a minimum, you must download the javascript file ([production version][minjs] or the [development version][maxjs])
and the css styles for preview ([production version][mincssp] or the [development version][maxcssp]) and the
editor css style ([production version][mincsse] or the [development version][maxcsse]).

[minjs]: https://raw.github.com/alsofronie/inline-editor/blob/master/dist/inline-editor.min.js
[maxjs]: https://raw.github.com/alsofronie/inline-editor/blob/master/dist/inline-editor.js
[mincssp]: https://raw.github.com/alsofronie/inline-editor/blob/master/dist/css/inline-frontend.min.css
[maxcssp]: https://raw.github.com/alsofronie/inline-editor/blob/master/dist/css/inline-frontend.css
[mincsse]: https://raw.github.com/alsofronie/inline-editor/blob/master/dist/css/inline-editor-frontend.min.css
[maxcsse]: https://raw.github.com/alsofronie/inline-editor/blob/master/dist/css/inline-editor-frontend.css

In your web page:

```html
<head>
	...
	<link rel="stylesheet" type="text/css" href="../dist/css/inline-editor-frontend.min.css" />
	...
</head>
<body>
	...
	<div class="ied-content">
		<div id="editor" class="ied-article">
			<section class="col">
				<h1>This is the title</h1>
			</section>
		</div>
	</div>
	...

	<script src="jquery.js"></script>
	<script src="../dist/inline-editor.min.js"></script>
	<script>
	jQuery(function($) {
		$('#editor').inline_editor();
	});
	</script>
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
