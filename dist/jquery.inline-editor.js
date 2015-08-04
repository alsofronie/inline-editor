/*! Inline Editor - v0.1.0 -  * 2015-08-04
 * * https://github.com/alsofronie/inline-editor
 * Copyright (c) 2015 Alex Sofronie; * Licensed MIT */ 
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

  "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variable rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "inline_editor",
        defaults = {
            textEmpty: 'Add your text here',
            titleEmpty: 'Add your title here',
            toolbox: {
                selection: [ 'bold','italic','underline','strikethrough','|','h','|','left','center','right','justify']
            }
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.$e = $(element);
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like so: this.yourOtherFunction(this.element, this.settings).
            this.prepare();
            this.listenToEvents();
        },
        prepare: function() {
            this.$e.prop('contentEditable',true);
        },
        listenToEvents: function() {
            var that = this;

            // ON CLICK TO HIDE TOOLBOX
            document.body.onclick = function() {
                if(document.getSelection().isCollapsed) {
                    that.hideToolbox(that);
                } 
            };

            // ON KEY TO HIDE TOOLBOX
            document.body.onkeyup = function() {
                that.hideToolbox(that);
            };

            // ON ENTER
            this.$e.on('keypress', function(event) {
                if(event.keyCode !== 13) {
                    return true;
                }

                var parentEl = that.getSelectionParentElement();
                var newSection = that.createNewSection(that.settings);

                if(parentEl.nextSibling) {
                    parentEl.parentNode.insertBefore(newSection.fragment, parentEl.nextSibling);
                } else {
                    parentEl.appendNode(newSection.fragment);
                }

                var range,selection;

                range = document.createRange();             //Create a range (a range is a like the selection but invisible)
                range.selectNodeContents(newSection.para);  //Select the entire contents of the element with the range
                range.collapse(true);                      //collapse the range to the end point. false means collapse to end rather than the start
                selection = window.getSelection();          //get the selection object (allows you to change selection)
                selection.removeAllRanges();                //remove any selections already made
                selection.addRange(range);                  //make the range you have just created the visible selection

                return false;
            });

            // ON SELECT
            this.$e.off('selectstart').on('selectstart', 'section > *', function() {
                $(document).one('mouseup', function() {
                    var selection = this.getSelection();

                    if(selection.isCollapsed) {
                        that.hideToolbox(that);
                    } else {
                        that.currentSelection = selection;
                        that.setCurrents(selection);
                        that.getToolbox(that);
                    }
                });
            });

        },
        currentSelection:null,
        currentParentElement:null,
        currentSection:null,
        tbxSelection:null,
        hideToolbox: function(that) {
            if(that.tbxSelection !== null) {
                that.tbxSelection.className = 'hidden';
            }
        },
        getToolbox:function(that) {
            if(that.tbxSelection === null) {
                var tbx = document.createElement('div');
                tbx.id = 'toolbox-panel';
                var ul = document.createElement('ul');
                tbx.appendChild(ul);

                for(var btnIndex in that.settings.toolbox.selection) {
                    /*jshint loopfunc: true */
                    var btn = that.settings.toolbox.selection[btnIndex];
                    if(btn === '|') {
                        var divider = document.createElement('li');
                        divider.className = 'divider';
                        ul.appendChild(divider);
                        continue;
                    }
                    if(typeof that.toolboxWidgets[btn] === 'function') {
                        var e = that.toolboxWidgets[btn]();
                        var li = document.createElement('li');
                        var w = document.createElement('button');
                        w.dataset.act = btn;

                        w.onclick = function(event) {
                            that._stopPropagation(event);
                            var el = ( event.srcElement || event.target );
                            var b = el.dataset.act;
                            that.toolboxWidgets[b].call(that,true);
                        };

                        if(e.wrap !== undefined) {
                            w.className = 'tbx tbx-' + e.wrap;
                        }
                        if(e.text !== undefined) {
                            w.appendChild(document.createTextNode(e.text));
                        }
                        if(e.icon !== undefined) {
                            var icn = document.createElement('i');
                            icn.className = 'icon icon-' + e.icon;
                            w.appendChild(icn);
                        }
                        li.appendChild(w);
                        ul.appendChild(li);
                    }
                }
                document.body.appendChild(tbx);
                that.tbxSelection = tbx;
            }

            that.tbxSelection.className = '';

            var range = that.currentSelection.getRangeAt(0).cloneRange();
            // range.collapse(true);
            var rect = range.getClientRects()[0];
            console.info('Rectangle is now: ', rect);

            var dims = {
                width: that.tbxSelection.offsetWidth,
                height: that.tbxSelection.offsetHeight
            };

            that.tbxSelection.style.left = ( rect.left - Math.floor(dims.width / 2) + Math.floor(rect.width / 2)) + 'px';
            that.tbxSelection.style.top = ( rect.top - 3 - dims.height) + 'px';
            

            return that.tbxSelection;

        },
        createNewSection:function(settings) {
            var docFragment = document.createDocumentFragment();
            var section = document.createElement('section');
            section.className = 'col';
            var p = document.createElement('p');
            p.className = 'p-nor';
            p.dataset.text = settings.textEmpty;
            section.appendChild(p);
            docFragment.appendChild(section);
            return {
                fragment: docFragment,
                para: p
            };
        },
        getSelectionParentElement: function() {
            var parentEl = null, sel;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    parentEl = sel.getRangeAt(0).commonAncestorContainer;
                    if (parentEl.nodeType !== 1) {
                        parentEl = parentEl.parentNode;
                    }
                }
            } else if ( (sel = document.selection) && sel.type !== "Control") {
                parentEl = sel.createRange().parentElement();
            }
            if(parentEl !== null) {
                while(parentEl.nodeName.toLowerCase() !== 'section') {
                    parentEl = parentEl.parentNode;
                }
            }
            
            return parentEl;
        },
        setCurrents: function() {

        },
        _stopPropagation: function(event) {
            event = event || window.event;
            if(event.stopPropagation) {
                event.stopPropagation();
            }
            // retarded IE
            event.cancelBubble = true;
        },
        toolboxWidgets: {
            'bold': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'B',
                        wrap: 'b'
                    };
                } else {
                    console.info('Run BOLD on ', runContext);
                }
            },
            'italic': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'I',
                        wrap: 'i'
                    };
                } else {
                    console.info('Run ITALIC on ', runContext);
                }  
            },
            'underline': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'U',
                        wrap: 'u'
                    };
                } else {
                    console.info('Run UNDERLINE on ', runContext);
                }
            },
            'strikethrough': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'S',
                        wrap:'s'
                    };
                } else {
                    console.info('Run STRIKE on ', runContext);
                }
            },
            'left':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'L'
                    };
                } else {
                    console.info('Run LEFT on ', runContext);
                }
            },
            'right':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'R'
                    };
                } else {
                    console.info('Run RIGHT on ', runContext);
                }
            },
            'justify':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'J'
                    };
                } else {
                    console.info('Run justify on ', runContext);
                }
            },
            'center':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'C'
                    };
                } else {
                    console.info('Run CENTER on ', runContext);
                }
            },
            'h': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'H1',
                        wrap: 'b'
                    };
                } else {
                    console.info('Cycle through Headlines');
                }
            }

        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
    };

})( jQuery, window, document );