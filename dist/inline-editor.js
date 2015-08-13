/*! Inline Editor - v0.1.0 -  * 2015-08-14
 * * https://github.com/alsofronie/inline-editor
 * Copyright (c) 2015 Alex Sofronie; * Licensed MIT */ 
;(function(w,d,undefined) {
	"use strict";

	// ================ INTERNAL VARIABLES =================

	// PRIVATE VAR: Default options
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

	// PRIVATE VAR: Default toolboxes definition
	// The widget functions will be called with runContext false to get the toolbox element
	// and with runContext = true (this will point to the plugin instance)
	
	var _toolboxes = {
		selection: {
			current: null,
			name: 'selection',
			id: 'seltbx-pane',
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
						return { icon: 'italic' };
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
						if(_node.hasClass(this.sel,'text-center')) {
							_node.removeClass(this.sel,'text-center');
							_node.addClass(this.sel,'text-right');
						} else if(_node.hasClass(this.sel,'text-right')) {
							_node.removeClass(this.sel,'text-right');
							_node.addClass(this.sel,'text-justify');
						} else if(_node.hasClass(this.sel,'text-justify')) {
							_node.removeClass(this.sel,'text-justify');
							// css defaults to text-left so no need to add that class here.
						} else {
							_node.addClass(this.sel,'text-center');
						}
					}
				},
				p: function(runContext) {
					if(!runContext) {
						return { icon: 'para' };
					} else {
						console.info('We need to change the current parent element to a paragraph');
						if(!_node.is(this.sel,'p')) {
							var newEl = _node.change(this.sel, 'p', false);
							_node.select(newEl);
						}
					}
				},
				h: function(runContext) {
					if(!runContext) {
						return { icon: 'heading' };
					} else {
						console.info('We need to change the current parent elment to a heading');
						var destName = 'h1';
						if(_node.is(this.sel,'h1')) {
							destName = 'h2';
						} else if(_node.is(this.sel,'h2')) {
							destName = 'h3';
						} else if(_node.is(this.sel,'h3')) {
							destName = 'h4';
						} else if(_node.is(this.sel,'h4')) {
							destName = 'h5';
						} else if(_node.is(this.sel,'h5')) {
							destName = 'h6';
						}

						var newEl = _node.change(this.sel, destName, true);
						_node.select(newEl);
					}
				}
			}
		}
	};

	// ============== END INTERNAL VARIABLES ===============


	// ============== INTERNAL FUNCTIONS ===================


	// ============== END INTERNAL FUNCTIONS ===============

	// ================ MAIN PLUGIN -- PUBLIC ==============

	// =============== END MAIN PLUGIN =====================
	

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

		// prepare the editor
		// add the class
		this.src.classList.add('ied-article');
		// put content editable
		_node.attr(this.src,'contenteditable','true');

		// private internal functions
		var plugin = this;	// all the following functions will use the plugin variable.
		// Events

		// event for the selection
		// this will fire only on document, not on the actual editor
		function eventSelectionChange(event) {
			event = event ? event : w.event;
			plugin.setSelection();
			var sel = plugin.getSelection();
			if(sel.isCollapsed) {
				plugin.hideToolbox(_toolboxes.selection);
			} else {
				plugin.showToolbox(_toolboxes.selection);
			}
		}

		document.addEventListener('selectionchange', eventSelectionChange);

		// event for the Enter/Return key (creating a new section)
		// keydown (verify for enter)
		function eventKeyDown(event) {
			event = event ? event : w.event;
			plugin.setSelection();
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
				            br = _node.create('br');
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
		this.src.addEventListener('keydown', eventKeyDown);
		

		// keyup event (verify for delete)
		// event for the Delete key (test if element is empty)
		function eventKeyUp(event) {
			event = event ? event : w.event;
			plugin.setSelection();
			if(event.keyCode === 8 || event.keyCode === 46) {
                plugin.verifyEmptyElement();
            }
		}
		this.src.addEventListener('keyup', eventKeyUp);


		// =============== PUBLIC FUNCIONS =====================
		this.setup = function(options) {
			if(typeof options === 'object') {
				this.settings = _extend(this.settings, options);
			}
		};

		this.getSelection = function() {
			if(window.getSelection) {
				return window.getSelection();
			} else {
				var sel = document.selection;
				if(sel && sel.type !== 'Control') {
					return sel;
				}
			}
			return null;
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

            this.setSelection();

            // that.getInsertToolbox(that,p);

            return false;
		};

		this.showToolbox = function(tbx) {
			if(tbx.current === null) {
	    		var pane = _node.create('div');
	    		pane.id = tbx.id;
	    		var ul = _node.create('ul');
	    		pane.appendChild(ul);
	    		var widgets = tbx.widgets;
	    		var settings = this.settings.toolboxes[tbx.name];
	    		
	    		for( var btnIndex in settings ) {
	        		// jshint loopfunc: true
	        		var bName = settings[btnIndex];
	        		if(bName === '|') {
	            		var divider = _node.create('li','divider');
                    	ul.appendChild(divider);
                    	continue;
                	}
                	
                	if(!widgets[bName]) {
                		// we do not know this one
                		console.error('We do not know how to handle ', bName);
                		continue;
                	}
                	
                	var appearance = widgets[bName](false);
                	var li = _node.create('li');
                	var btn = _node.create('button');
                	btn.dataset.act = bName;

                	if(appearance.icon !== undefined) {
	                	var icn = _node.create('i', 'icon icon-' + appearance.icon);
	                	btn.appendChild(icn);
	                } else if(appearance.text !== undefined) {
	                	btn.appendChild(document.createTextNode(appearance.text));
	                }

                	var p = this;
	                btn.addEventListener('click', function(event) {
	                    // _stop(event,true);
	                    console.info('event target is  now', event.srcElement);
	                    var el = ( event.srcElement || event.target );
	                    while(!_node.is(el,'button')) {
	                    	el = el.parentNode;
	                    } 
	                    var b = el.dataset.act;
	                    widgets[b].call(p,true);
	                });

	                

                	li.appendChild(btn);
                	ul.appendChild(li);
            	}

            	document.body.appendChild(pane);
            	tbx.current = pane;
        	}

        	tbx.current.className = '';	// just to be sure it's not 'hidden'

        	var sel,range,rect,dims;

        	sel = this.getSelection();
        	range = sel.getRangeAt(0).cloneRange();
        	rect = range.getClientRects()[0];

        	dims = {
            	width: tbx.current.offsetWidth,
            	height: tbx.current.offsetHeight
        	};

        	tbx.current.style.left = ( rect.left - Math.floor(dims.width / 2) + Math.floor(rect.width / 2)) + 'px';
        	tbx.current.style.top = ( rect.top - 3 - dims.height) + 'px';
        
        	return tbx.current;
		};

		this.hideToolbox = function(tbx) {
			if(tbx.current !== null) {
				tbx.current.className = 'hidden';
				return true;
			}
			return false;
		};

		this.setSelection = function() {

			var sel = this.getSelection();
			var parentEl = null, parentSe = null;

			parentEl = sel.getRangeAt(0).commonAncestorContainer;
            if (parentEl.nodeType !== 1) {
                parentEl = parentEl.parentNode;
            }

	        parentSe = parentEl;
	        while(parentSe && parentSe.nodeName && parentSe.nodeName.toLowerCase() !== 'section') {
	            parentSe = parentSe.parentNode;
	        }

	        this.sel = parentEl;
	        this.sec = parentSe;
		};

		this.verifyEmptyElement = function() {
			// the pe is always the section
        	var pe = this.sel;
        	console.info('Verify empty on parent', pe);
        	// the node could be a paragraph or a figure
        	var node = pe;
        	console.info('We need to check the node ', node);

        	if(_node.is(node,'figure')) {
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

	// stop the propagation of the event and 
	// optionally prevents the default
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

	// just some node operations (DOM)
	var _node = {
		create: function(name, className) {
			var node = document.createElement(name);
			if(className !== undefined) {
				node.className = className;
			}
			return node;
		},
		attr: function(node, name, value) {
			node.setAttribute(name, value);
		},
		is: function(node, name) {
			if(!node || node === null || node === undefined) {
	            return false;
	        }
	        name = name.toLowerCase();
	        return (name === node.tagName.toLowerCase());
		},
		change: function(src, destName, preserveClasses) {
			console.info('Changing to ' + destName + ' node ', src);
			var newClassName = '';
			if(preserveClasses) {
				newClassName = src.className;
			}

			var newEl = _node.create(destName);
			newEl.className = newClassName;
            while(src.firstChild) {
                newEl.appendChild(src.firstChild);
            }

            src.parentNode.insertBefore(newEl, src);
            src.parentNode.removeChild(src);
            return newEl;
		},
		select: function(node) {
			var newRange = document.createRange();
            newRange.selectNodeContents(node);
            // TODO: call a common function
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(newRange);
		},
		hasClass: function(node, className) {
			return node.classList.contains(className);
		},
		addClass: function(node, newClass) {
			node.classList.add(newClass);
		},
		removeClass: function(node, className) {
			node.classList.remove(className);
		},
		toggleClass: function(node, className) {
			node.classList.toggle(className);
		}
	};


	// this will determine if the element currently edited is empty and make it accordingly
	// (remove the br or empty text nodes)
	/*

	// this will create the appropriate toolbox and display it
	function _showToolbox(plugin, tbxObject, wrapperId) {
		
	}

	function _hideToolbox(plugin, wrapperId) {

	}
	*/
	// ================== END UTILITY PRIVATE FUNCTIONS =======================


}(window,document));