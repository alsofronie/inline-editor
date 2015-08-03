/*! Inline Editor - v0.1.0 -  * 2015-08-03
 * * https://github.com/alsofronie/inline-editor
 * Copyright (c) 2015 Alex Sofronie; * Licensed MIT */ 
(function($) {

  // Collection method.
  $.fn.inline_editor = function() {
    return this.each(function(i) {
      // Do something awesome to each selected element.
      $(this).html('awesome' + i);
    });
  };

  // Static method.
  $.inline_editor = function(options) {
    // Override default options with passed-in options.
    options = $.extend({}, $.inline_editor.options, options);
    // Return something awesome.
    return 'awesome' + options.punctuation;
  };

  // Static method default options.
  $.inline_editor.options = {
    punctuation: '.'
  };

  // Custom selector.
  $.expr[':'].inline_editor = function(elem) {
    // Is this element awesome?
    return $(elem).text().indexOf('awesome') !== -1;
  };

}(jQuery));
