/**
 * No jquery here *
 */

;(function(w,d,undefined) {
	"use strict";

	// Default options
	var _defaults = {
		lang: {
			text: 'Add your text here',
			title: 'Add your title here',
		},
		toolboxes: {
			selection: [ 'bold','italic','underline','strikethrough','|','h','p','|','align'],
			insert: ['image','video','embed','section'],
        	image: ['normal','left','right','full']
		}
	};

	// The toolboxes
	var _toolboxes = {
		selection: {
			current: null,
			widgets: {
				bold: function(runContext) {
					if(!runContext) {
						return { icon: 'bold' };
					} else {
						document.execCommand('bold',false,true);
					}
				},
				italic: function(runContext) {
					if(!runContext) {
						return { icon: 'bold' };
					} else {
						document.execCommand('italic',false,true);
					}	
				},
				underline: function(runContext) {
					if(!runContext) {
						return { icon: 'underline' };
					} else {
						document.execCommand('underline', false, true);
					}
				},
				strikethrough: function(runContext) {
					if(!runContext) {
	                    return {
	                        icon:'strike'
	                    };
	                } else {
	                    document.execCommand('strikeThrough',false,true);
	                }
				},
				align: function(runContext) {
					if(!runContext) {
						return { icon: 'align' };
					} else {
						console.info('We run align in context ', runContext);
					}
				},
				p: function(runContext) {
					if(!runContext) {
						return { icon: 'para' };
					} else {
						console.info('We need to change the current parent element to a paragraph');
					}
				},
				h: function(runContext) {
					if(!runContext) {
						return { icon: 'heading' };
					} else {
						console.info('We need to change the current parent elment to a heading');
					}
				}
			}
		}
	};

	w.InlineEditor = function() {

		// global element references
		this.src = null;				// the source element editor
		
		this.sel = null;				// the active selection element (paragraph, h1, ... ,h6, figure etc)
		this.sec = null;				// the active section (the parent)

		this.settings = null;			// the settings

		// ============= INIT VARIABLES ================
		
		// Create options by extending defaults with the passed in arugments
		if(arguments.length === 0) {
			throw 'Init error: we need the editor element!';
		} else if(arguments.length === 1) {
			// this is only the editor
			this.src = arguments[0];
			this.settings = _defaults;
		} else if(arguments.length === 2 && typeof arguments[1] === 'object') {
			this.src = arguments[0];
			this.settings = _extend(_defaults, arguments[1]);
		}

		// =============== END INIT VARIABLES ==================

		var plugin = this;

		// add the class
		this.src.classList.add('ied-article');
		// put content editable
		_attr(this.src,'contenteditable','true');

		// ============ EVENT FUNCTIONS ====================
		// selection change event
		function eventSelectionChange(event) {
			event = event ? event : w.event;
			// we cannot cancel or sop bubbling this, it's on document
			// _stop(event);
			// because we stop the event, we need to call
			// _setselection to update the sel and the sec
			_setSelection(plugin);
			console.info('Parent element: ', plugin.sel);
			console.info('Section element: ', plugin.sec);
		}
		// keydown (verify for enter)
		function eventKeyDown(event) {
			event = event ? event : w.event;
			_setSelection(plugin);
			if(event.keyCode === 13) {
				_stop(event, true);
				if(event.shiftKey === true) {
					// insert element at cursor
					var sel, range, br;
					if(window.getSelection) {
						sel = window.getSelection();
				        if (sel.getRangeAt && sel.rangeCount) {
				            range = sel.getRangeAt(0);
				            range.deleteContents();
				            range.collapse(false);
				            br = document.createElement('br');
				            range.insertNode( br );
				            range = range.cloneRange();
				            range.selectNode(br);
				            range.collapse(false);
				            sel.removeAllRanges();
				            sel.addRange(range);

				        }
					} else if(document.selection && document.selection.createRange) {
						document.selection.createRange().text = '<br>';
					}
				} else {
					console.info('creating new section: ', event);
					plugin.createNewSection();	
				}
				
			} else {
				console.info('need to hide the toolboxes');
			}
		}
		// keyup event (verify for delete)
		function eventKeyUp(event) {
			event = event ? event : w.event;
			_setSelection(plugin);
			if(event.keyCode === 8 || event.keyCode === 46) {
                _verifyEmptyElement(plugin);
            }
		}

		// event for the selection
		// this will fire only on document, not on the actual editor
		document.addEventListener('selectionchange', eventSelectionChange);

		// event for the Enter/Return key (creating a new section)
		this.src.addEventListener('keydown', eventKeyDown);

		// event for the Delete key (test if element is empty)
		this.src.addEventListener('keyup', eventKeyUp);


		// =============== PUBLIC FUNCIONS =====================
		this.setup = function(options) {
			if(typeof options === 'object') {
				this.settings = _extend(this.settings, options);
			}
		};

		this.createNewSection = function() {

            var section = document.createElement('section');
            section.className = 'col';
            var p = document.createElement('p');
            // p.className = 'p-nor';
            p.dataset.text = this.settings.lang.text;
            section.appendChild(p);


            if(this.sec.nextSibling) {
                this.sec.parentNode.insertBefore(section, this.sec.nextSibling);
            } else {
            	this.sec.appendNode(section);
            }

            var range,selection;

            range = document.createRange();             //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(p);                //Select the entire contents of the element with the range
            range.collapse(true);                       //collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();          //get the selection object (allows you to change selection)
            selection.removeAllRanges();                //remove any selections already made
            selection.addRange(range);                  //make the range you have just created the visible selection

            _setSelection(this);

            // that.getInsertToolbox(that,p);

            return false;
		};

		this.showToolboxSelection = function() {
			return _createToolbox(_toolboxes.selection);
		};

		this.hideToolboxSelection = function() {
			if(_toolboxes.selection.current !== null) {
				_toolboxes.selection.current.className = 'hidden';
				return true;
			}
			return false;
		};
	};

	// ================ UTILITY PRIVATE FUNCTIONS =======================

	// Extends the source with properties of addition.
	// Will goo deep :)
	function _extend(source, addition) {
		var prop;
		for(prop in addition) {
			if(source.hasOwnProperty(prop)) {
				if(typeof addition[prop] === 'object') {
					source[prop] = _extend(source[prop],addition[prop]);
				} else {
					source[prop] = addition[prop];	
				}
			}
		}
		return source;
	}

	// add element attribute
	function _attr(element, attribute, value) {
		element.setAttribute(attribute, value);
	}

	function _tagIs(tag, tagName) {

		if(!tag || tag === null || tag === undefined) {
            return false;
        }
        tagName = tagName.toLowerCase();
        if(tagName === tag.tagName.toLowerCase()) {
            return true;
        } else {
            return false;
        }
	}

	// stop event propagation
	function _stop(event, preventDefault) {
		event = event || w.event;
		if(event.stopPropagation) {
            event.stopPropagation();
        }
        // retarded IE
        event.cancelBubble = true;

        if(preventDefault === true) {
        	event.preventDefault();
        }
	}

	// This will determine the section and the element being edited at that moment
	function _setSelection(plugin) {
		var parentEl = null, parentSe = null, sel;
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

        parentSe = parentEl;
        while(parentSe && parentSe.nodeName && parentSe.nodeName.toLowerCase() !== 'section') {
            parentSe = parentSe.parentNode;
        }

        plugin.sel = parentEl;
        plugin.sec = parentSe;
        
	}

	// this will determine if the element currently edited is empty and make it accordingly
	// (remove the br or empty text nodes)
	function _verifyEmptyElement(plugin) {
		// the pe is always the section
        var pe = plugin.sel;
        console.info('Verify empty on parent', pe);
        // the node could be a paragraph or a figure
        var node = pe;
        console.info('We need to check the node ', node);
        
        if(_tagIs(node,'figure')) {
            // we need to check the figcaption not the figure
            // maybe we have more than one image?
            // the figcaption is always the last child
            node = node.lastChild;
        }
        var htm = node.innerHTML.trim().toLowerCase();
        console.info('html is ', htm);
        if(htm === '<br>' || htm === '<br/>' || htm === '<br />' || htm === '&nbsp;' || htm === '') {
            node.innerHTML = null;
            node.className = '';
        }
	}

	// this will create the appropriate toolbox and display it
	function _createToolbox(plugin, tbxObject, wrapperId, settings) {
		if(tbxObject.current === null) {
            var tbx = document.createElement('div');
            tbx.id = wrapperId;
            var ul = document.createElement('ul');
            tbx.appendChild(ul);

            var widgets = tbxObject.widgets;

            for(var btnIndex in settings) {
                /* jshint loopfunc: true */
                var btn = settings[btnIndex];
                if(btn === '|') {
                    var divider = document.createElement('li');
                    divider.className = 'divider';
                    ul.appendChild(divider);
                    continue;
                }
                if(!widgets[btn]) {
                	// we do not know this one
                	console.error('We do not know how to handle ', btn);
                	continue;
                }
                var e = widgets[btn](false);
                var li = document.createElement('li');
                var w = document.createElement('button');
                w.dataset.act = btn;
                console.info('W is ', w);

                w.onclick = function(event) {
                    _stop(event);
                    console.info('event target is ', event.srcElement);
                    var el = ( event.srcElement || event.target );
                    var b = el.dataset.act;
                    console.info('Calling on ', b);
                    widgets[btn].call(plugin,true);
                };

                if(e.icon !== undefined) {
                	var icn = document.createElement('i');
                	icn.className = 'icon icon-' + e.icon;
                	w.appendChild(w);
                } else if(e.text !== undefined) {
                	w.appendChild(document.createTextNode(e.text));
                }

                li.appendChild(w);
                ul.appendChild(li);


            }

            document.body.appendChild(tbx);
            tbxObject.current = tbx;
        }

        tbxObject.current.className = '';

        var sel = window.getSelection();

        var range = sel.getRangeAt(0).cloneRange();
        var rect = range.getClientRects()[0];

        var dims = {
            width: sel.offsetWidth,
            height: sel.offsetHeight
        };

        tbxObject.current.style.left = ( rect.left - Math.floor(dims.width / 2) + Math.floor(rect.width / 2)) + 'px';
        tbxObject.current.style.top = ( rect.top - 3 - dims.height) + 'px';
        
        return tbxObject.current;
	}
	// ================== END UTILITY PRIVATE FUNCTIONS =======================


}(window,document));