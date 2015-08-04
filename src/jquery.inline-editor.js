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
                selection: [ 'bold','italic','underline','strikethrough','|','h','|','left','center','right','justify'],
                insert: ['image','video','embed','s1','s2','s3','s4','s5','s6']
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
            document.body.onclick = function(event) {
                if(document.getSelection().isCollapsed) {
                    that.hideToolbox(that);
                }

                if(event.target && event.target.parentNode && event.target.parentNode.id && event.target.parentNode.id === 'insert-panel') {
                    // we clicked the insert panel
                    var cls = event.target.parentNode.className;
                    if(!cls) {
                        cls = 'active';
                    } else if(cls.indexOf('active') >= 0) {
                        cls = cls.replace(/active/gi,'');
                        cls = cls.trim();
                    } else {
                        cls = that._addClass(cls, 'active');
                    }
                    event.target.parentNode.className = cls;

                } else {
                    var pe = that.getSelectionParentElement();
                    if(!pe || !pe.firstChild || !pe.firstChild.innerHTML) {
                        that.hideInsertToolbox(that);
                    }
                }
            };

            // ON KEY TO HIDE TOOLBOX
            document.body.onkeyup = function() {
                that.hideToolbox(that);
            };

            // CREATE NEW SECTION ON ENTER
            this.$e.on('keydown.ied.kup', function(event) {
                if(event.keyCode === 13) {
                    that.createNewSection(that);
                    return false;
                } else {
                    that.hideInsertToolbox(that);
                }
            });

            this.$e.on('keyup.ied.kup', function(event) {
                if(event.keyCode === 8 || event.keyCode === 46) {
                    that.verifyEmptyElement(that);
                }
            });

            this.$e.on('click.ied.clk', 'section > p:empty', function(event) {
                that._stopPropagation(event);
                that.getInsertToolbox(that,this);
            });

            // SHOW SELECT TBX ON SELECT
            this.$e.on('selectstart', function() {
                $(document).one('mouseup', function() {
                    var selection = this.getSelection();

                    if(selection.isCollapsed) {
                        that.hideToolbox(that);
                    } else {
                        that.currentSelection = selection;
                        that.setCurrents(that);
                        that.getToolbox(that);
                    }
                });
            });
        },
        currentSelection:null,
        currentParentElement:null,
        currentSection:null,
        tbxSelection:null,
        tbxInsert:null,
        verifyEmptyElement:function(that) {
            
            var pe = that.getSelectionParentElement();
            var node = pe.children[0];
            var htm = node.innerHTML.trim().toLowerCase();
            if(htm === '<br>' || htm === '<br/>' || htm === '<br />') {
                node.innerHTML = null;
                node.className = '';
            }
        },
        hideToolbox: function(that) {
            if(that.tbxSelection !== null) {
                that.tbxSelection.className = 'hidden';
            }
        },
        hideInsertToolbox: function(that) {
            if(that.tbxInsert !== null) {
                that.tbxInsert.className = 'hidden';
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

            var dims = {
                width: that.tbxSelection.offsetWidth,
                height: that.tbxSelection.offsetHeight
            };

            that.tbxSelection.style.left = ( rect.left - Math.floor(dims.width / 2) + Math.floor(rect.width / 2)) + 'px';
            that.tbxSelection.style.top = ( rect.top - 3 - dims.height) + 'px';
            
            return that.tbxSelection;

        },
        getInsertToolbox: function(that, target) {
            target = target || null;
            if(that.tbxInsert === null) {
                var tbx = document.createElement('div');
                var btn,icon,li;
                tbx.id = 'insert-panel';
                btn = document.createElement('button');
                btn.appendChild(document.createTextNode('+'));
                tbx.appendChild(btn);
                var ul = document.createElement('ul');

                for(var btnIndex in that.settings.toolbox.insert)
                {
                    /*jshint loopfunc: true */
                    var act = that.settings.toolbox.insert[btnIndex];

                    // TODO: replace with icon
                    icon = document.createTextNode(act.toUpperCase());
                    btn = document.createElement('button');
                    li = document.createElement('li');

                    // TODO: make widgets for these, also
                    btn.dataset.act = act;
                    btn.click = function(event) {
                        that._stopPropagation(event);
                        console.info('We have action on', this.dataset.act);
                    };

                    btn.appendChild(icon);
                    li.appendChild(btn);
                    ul.appendChild(li);
                }

                tbx.appendChild(ul);
                document.body.appendChild(tbx);
                that.tbxInsert = tbx;
            }

            that.tbxInsert.className = '';

            var rect = target.getBoundingClientRect();

            that.tbxInsert.style.left = (rect.left - 60) + 'px';
            that.tbxInsert.style.top = (rect.top + 10) + 'px';


            return that.tbxInsert;
        },
        createNewSection:function(that) {
            var settings = that.settings;

            var parentEl = that.getSelectionParentElement();
            var docFragment = document.createDocumentFragment();
            var section = document.createElement('section');
            section.className = 'col';
            var p = document.createElement('p');
            // p.className = 'p-nor';
            p.dataset.text = settings.textEmpty;
            section.appendChild(p);
            docFragment.appendChild(section);

            if(parentEl.nextSibling) {
                parentEl.parentNode.insertBefore(docFragment, parentEl.nextSibling);
            } else {
                parentEl.appendNode(docFragment);
            }

            var range,selection;


            range = document.createRange();             //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(p);                //Select the entire contents of the element with the range
            range.collapse(true);                       //collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();          //get the selection object (allows you to change selection)
            selection.removeAllRanges();                //remove any selections already made
            selection.addRange(range);                  //make the range you have just created the visible selection

            that.getInsertToolbox(that,p);

            return false;
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
            while(parentEl && parentEl.nodeName && parentEl.nodeName.toLowerCase() !== 'section') {
                parentEl = parentEl.parentNode;
            }
            
            return parentEl;
        },
        setCurrents: function(that) {
            var pe = that.getSelectionParentElement();
            that.currentSection = pe;
            if(pe != null && pe.children && pe.children.length > 0)  {
                that.currentParentElement = pe.children[0];
            } else {
                // this should never happen...
                that.currentParentElement = null;
                console.error('Cannot find parent element');
            }
        },
        _stopPropagation: function(event) {
            event = event || window.event;
            if(event.stopPropagation) {
                event.stopPropagation();
            }
            // retarded IE
            event.cancelBubble = true;
        },
        _clearTextAlign:function(cls) {
            if(!cls) {
                return '';
            }
            return cls.replace('/text-[a-z]+/gi','');
        },
        _addClass:function(cls, newClassName) {
            cls = cls.trim();
            cls = (cls.length > 0 ? ' ' : '') + newClassName;
            return cls;
        },
        _tagIs: function(tag, match) {
            if(match === tag.tagName.toLowerCase()) {
                return true;
            } else {
                return false;
            }
        },
        toolboxWidgets: {
            'bold': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'B',
                        wrap: 'b'
                    };
                } else {
                    document.execCommand('bold',false,true);
                }
            },
            'italic': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'I',
                        wrap: 'i'
                    };
                } else {
                    document.execCommand('italic',false,true);
                }  
            },
            'underline': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'U',
                        wrap: 'u'
                    };
                } else {
                    document.execCommand('underline',false,true);
                }
            },
            'strikethrough': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'S',
                        wrap:'s'
                    };
                } else {
                    document.execCommand('strikeThrough',false,true);
                }
            },
            'left':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'L'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        var cls = pe.className;
                        cls = this._clearTextAlign(cls);
                        cls = this._addClass(cls, 'text-left');
                        pe.className = cls;
                    } else {
                        console.info('pe is empty? ', this);
                    }
                }
            },
            'right':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'R'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        var cls = pe.className;
                        cls = this._clearTextAlign(cls);
                        cls = this._addClass(cls, 'text-right');
                        pe.className = cls;
                    } else {
                        console.info('pe is empty? ', this);
                    }
                }
            },
            'justify':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'J'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        var cls = pe.className;
                        cls = this._clearTextAlign(cls);
                        cls = this._addClass(cls, 'text-justify');
                        pe.className = cls;
                    } else {
                        console.info('pe is empty? ', this);
                    }
                }
            },
            'center':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'C'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        var cls = pe.className;
                        cls = this._clearTextAlign(cls);
                        cls = this._addClass(cls, 'text-center');
                        pe.className = cls;
                    } else {
                        console.info('pe is empty? ', this);
                    }
                }
            },
            'h': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'H1',
                        wrap: 'b'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        var newpe = 'h1';
                        if(this._tagIs(pe, 'h1')) {
                            newpe = 'h2';
                        } else if(this._tagIs(pe,'h2')) {
                            newpe = 'h3';
                        } else if(this._tagIs(pe,'h3')) {
                            newpe = 'h4';
                        } else if(this._tagIs(pe,'h4')) {
                            newpe = 'h5';
                        } else if(this._tagIs(pe,'h5')) {
                            newpe = 'h6';
                        } else if(this._tagIs(pe,'h6')) {
                            newpe = 'p';
                        }

                        // var sel = this.currentSelection;
                        // var range = sel.getRangeAt(0).cloneRange();

                        var newEl = document.createElement(newpe);
                        if(pe.className) {
                            newEl.className = pe.className;
                        }
                        while(pe.firstChild) {
                            newEl.appendChild(pe.firstChild);
                        }

                        pe.parentNode.insertBefore(newEl, pe);
                        pe.parentNode.removeChild(pe);

                        var newRange = document.createRange();
                        newRange.selectNodeContents(newEl);

                        var sel = window.getSelection();
                        sel.removeAllRanges();
                        sel.addRange(newRange);

                        this.currentSelection = sel;
                        this.currentParentElement = newEl;

                        // just to reposition the toolbox
                        this.getToolbox(this);

                        // pe.outerHtml = '<' + newpe + ' class="' + (pe.className ? pe.className : '') + '">' + pe.innerHtml + '</' + newpe + '>';

                        // var newElement = document.createElement(newpe);
                        // if(pe.className) newElement.className = pe.className;
                            

                    }
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