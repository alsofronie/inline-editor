/**
 * No jquery here *
 */

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
			insert: ['plus', 'image','video','embed','section'],
        	image: ['pos','|','sec','|', 'del']
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
			position: 'top',
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
						_node.normalize(this.sel);
						_node.select(this.sel);

					}
				},
				p: function(runContext) {
					if(!runContext) {
						return { icon: 'para' };
					} else {
						if(!_node.is(this.sel,'p')) {
							var newEl = _node.change(this.sel, 'p', false);
							_node.normalize(newEl);
							_node.select(newEl);
						}
					}
				},
				h: function(runContext) {
					if(!runContext) {
						return { icon: 'heading' };
					} else {
						console.info('We need to change the current parent elment to a heading', this.sel);
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
						_node.normalize(newEl);
						_node.select(newEl);
					}
				}
			}
		},
		insert: {
			current: null,
			name: 'insert',
			id: 'instbx-pane',
			position: 'left',
			widgets: {
				plus: function(runContext) {
					if(!runContext) {
						return { icon: 'close' };
					} else {
						var t = document.getElementById('instbx-pane');
						_node.toggleClass(t, 'expanded');
					}
				},
				image: function(runContext) {
					if(!runContext) {
						return { icon: 'image' };
					} else {

						if(!w.FileReader) {
							alert('Your browser does not support FileReader so you cannot upload files this way. Please use a modern browser such as Google Chrome or Mozilla Firefox, updated to their latest versions!');
							return false;
						}

						// this.hideToolbox()

						var that = this;
	                    var inp = document.createElement('input');
	                    
	                    inp.type = 'file';
	                    inp.name = 'userFile';
	                    inp.multiple = "true";
	                    inp.style.position = 'absolute';
	                    inp.style.left = '-9999px';
	                    inp.style.top = '-9999px';

	                    inp.onchange = function() {
	                    	var files,imgs,fr,i,filesToLoad,filesLoaded;
	                        files = this.files;
	                        imgs = [];
	                        console.info('Uploading files ', this.files);

	                        filesToLoad = files.length;
	                        filesLoaded = 0;
	                        
	                        for (i = 0; i < filesToLoad; i++) {
	                        	// jshint loopfunc: true
	                        	console.info('File index is', i);
	                        	fr = new FileReader();
		                    	fr.token = i;
		                    	fr.fname = files[i].name;
		                    	fr.onloadend = function() {
		                    		var img = document.createElement('img');
		                    		img.src = this.result;
		                    		img.dataset.width = img.width;
		                    		img.dataset.height = img.height;
		                    		img.dataset.name = this.fname;
		                    		img.setAttribute('style','max-width: ' + img.width + 'px;max-height: ' + img.height + 'px');
		                    		imgs[this.token] = img;
		                    		filesLoaded += 1;
		                    	};
		                    	fr.readAsDataURL(files[i]);
                        	}

                        	var f = function() {
                        		if(filesToLoad === filesLoaded) {
                        			that.insertFigure(imgs);
                        		} else {
                        			setTimeout(f,1);
                        		}
                        	};

                        	f();
                        };

                        document.body.appendChild(inp);

	                    inp.focus();
	                    inp.click();
                    }
                },
				video: function(runContext) {
					if(!runContext) {
						return { icon: 'video' };
					} else {
						console.info('Clicked on INSERT VIDEO');
					}
				},
				embed: function(runContext) {
					if(!runContext) {
						return { icon: 'embed' };
					} else {
						console.info('Clicked on INSERT EMBED');
					}
				},
				section: function(runContext) {
					if(!runContext) {
						return { icon: 'hr' };
					} else {
						// var oldSel = this.sel;
						_node.change(this.sel,'hr');
						this.createNewSection();
						this.showToolbox(runContext);
					}
				}
			}
		},
		image: {
			current: null,
			name: 'image',
			id: 'imgtbx-pane',
			position: 'top',
			widgets: {
				pos: function(runContext) {
					var p;
					if(!runContext) {
						return { icon: 'image-size' };
					} else {
						var s = this.sec;
						console.info('Running through image sizes with section', s);
						if(_node.hasClass(s,'wide')) {
							_node.removeClass(s,'wide');
							_node.addClass(s,'full');
						} else if(_node.hasClass(s,'full')) {
							_node.removeClass(s,'full');
							_node.addClass(s,'inline-text');
							// add an empty text besides the image

							p = _node.create('p');
							p.dataset.text = 'Add your text here';
							_node.attr(p,'contenteditable','true');
							var oldp = this.getData(s,'oldp');
							if(oldp) {
								p.innerHTML = oldp;
							}
							s.appendChild(p);

						} else if(_node.hasClass(s,'inline-text')) {
							_node.removeClass(s,'inline-text');
							_node.addClass(s,'inline-text-expand');

							// this should always have the paragraph there, because it will only come from inline-text
							// which has the paragraph

						} else if(_node.hasClass(s, 'inline-text-expand')) {
							_node.removeClass(s, 'inline-text-expand');
							// undo the paragraph thing
							p = s.getElementsByTagName('p');
							if(p.length > 0) {
								p = p[0];
								_node.normalize(p);
								this.setData(s, 'oldp', p.innerHTML);	
							}
							
							_node.removeAllChildren(s,'p');

						} else {
							_node.addClass(s, 'wide');
						}
					}
				},
				sec: function(runContext) {
					if(!runContext) {
						return { icon: 'image-big' };
					} else {
						console.info('Must make the image very big');
					}
				},
				del: function(runContext) {
					if(!runContext) {
						return { icon: 'close' };
					} else {
						var selImg = document.getElementsByClassName('img-active');
						var imgsel;
						if(selImg.length === 1 && selImg[0] === this.img) {
							// test if the image is the only pretty thing in the section
							imgsel = selImg[0];
							var fig = imgsel.parentElement;
							var childCount = fig.children.length;
							// remember, we have the fig caption also
							_node.destroy(imgsel);
							if(childCount === 2) {
								// === DELETE ===
								var secToDel = this.sec;
								this.createNewSection();
								_node.destroy(secToDel);
							}


							this.updateFigureAppearance(); 

							this.hideToolbox(_toolboxes.image);
						} else {
							console.info('No image to delete...');
						}
						
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
		this.img = null;				// the active image

		this.settings = null;			// the settings

		this.objData = {};				// the object data, to store things in it related to a node

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
			plugin.normalize();

			var sel = plugin.getSelection();
			if(sel.rangeCount === 0) {
				return false;
			}
			var pe = sel.getRangeAt(0).commonAncestorContainer;
			while(pe !== plugin.src) {
				if(_node.is(pe,'body') || _node.is(pe,'html')) {
					plugin.hideToolbox();
					return true;
				}
				pe = pe.parentElement;
			}

			if(sel.isCollapsed) {
				plugin.hideToolbox(_toolboxes.selection);
				if(_node.is(plugin.sel,'p') && !plugin.sel.hasChildNodes()) {
					plugin.showToolbox(_toolboxes.insert);
				} else {
					plugin.hideToolbox(_toolboxes.insert);
				}

			} else {
				// There is some selection
				// show the selection toolbox
				plugin.showToolbox(_toolboxes.selection);
				
				// hide the insert toolbox
				plugin.hideToolbox(_toolboxes.insert);

				// hide the image toolbox
				plugin.hideToolbox(_toolboxes.image);
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
					var sel, range, br, spc;
					if(window.getSelection) {
						sel = window.getSelection();
				        if (sel.getRangeAt && sel.rangeCount) {
				            range = sel.getRangeAt(0);
				            range.deleteContents();
				            range.collapse(false);
				            br = _node.create('br');
				            range.insertNode(br);
				            range = range.cloneRange();
				            range.setStartAfter(br);
				            range.setEndAfter(br);
				            spc = _node.createText('...');
				            range.insertNode(spc);
				            range.selectNode(spc);
				            sel.removeAllRanges();
				            sel.addRange(range);

				            if(spc.nextSibling.nodeValue !== '') {
				            	sel.deleteFromDocument();
				            }
				        }
					} else if(document.selection && document.selection.createRange) {
						document.selection.createRange().text = '<br>';
					}
				} else {
					console.info('creating new section: ', event);
					plugin.createNewSection();
					
				}
			} else if(event.keyCode === 8 || event.keyCode === 46) {
				var selimgs = document.getElementsByClassName('img-active');
				if(selimgs.length > 0 && selimgs[0] === plugin.img) {
					_stop(event, true);	
					_toolboxes.image.widgets.del.apply(plugin,[true]);
					return false;
				}				
			} else {

				console.info('need to hide toolboxes');
				plugin.hideToolbox(_toolboxes.insert);
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
		

		// click event (used to select non-editable elements)
		function eventClick(event) {
			event = event ? event: w.event;

			var el = event.target;

			// plugin.unselectImages();

			if(_node.is(el,'img') && _node.is(el.parentElement, 'figure')) {
				plugin.selectNone();
				plugin.hideToolbox(_toolboxes.insert);
				plugin.hideToolbox(_toolboxes.selection);
				plugin.img = el;
				plugin.sec = _node.hasParent(el,'section');
				_node.addClass(el,'img-active');
				plugin.showToolbox(_toolboxes.image);
			} else {
				plugin.hideToolbox(_toolboxes.image);
			}
		}
		this.src.addEventListener('click', eventClick);

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
	                    var el = ( event.srcElement || event.target );
	                    while(!_node.is(el,'button')) {
	                    	el = el.parentNode;
	                    } 
	                    console.info('event target is  now', el);
	                    var b = el.dataset.act;
	                    widgets[b].call(p,tbx);
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

        	if(sel.rangeCount > 0) {
	        	range = sel.getRangeAt(0).cloneRange();
	        	rect = range.getClientRects()[0];

	        	rect = _node.adjustRect(rect);

	        } else if(this.img !== null) {
	        	// there is an image selected
	        	rect = this.img.getBoundingClientRect();

	        	rect = _node.adjustRect(rect);
	        }

	        if(tbx.position === 'top') {
        		dims = {
	            	width: tbx.current.offsetWidth,
	            	height: tbx.current.offsetHeight
	        	};

	        	tbx.current.style.left = ( rect.left - Math.floor(dims.width / 2) + Math.floor(rect.width / 2)) + 'px';
	        	tbx.current.style.top = ( rect.top - 3 - dims.height) + 'px';	
        	} else if(tbx.position === 'left') {
        		tbx.current.style.left = ( rect.left - 80 ) + 'px';
        		tbx.current.style.top = ( rect.top ) + 'px';
        	}
        
        	return tbx.current;
		};

		this.hideToolbox = function(tbx) {
			if(tbx === null || tbx === undefined) {
				this.hideToolbox(_toolboxes.image);
				this.hideToolbox(_toolboxes.selection);
				this.hideToolbox(_toolboxes.insert);
				this.unselectImages();
			} else {
				if(tbx && tbx.current && tbx.current !== null && tbx.current !== undefined) {
					tbx.current.className = 'hidden';
					if(tbx.name === 'image') {
						this.unselectImages();
					}
					return true;
				}
				return false;
			}
		};

		this.unselectImages = function() {
			var a = document.getElementsByClassName('img-active');
			for(var b in a) {
				if(a[b] && a[b].classList && _node.is(a[b],'img')) {
					_node.removeClass(a[b],'img-active');
				}
			}
		};


		this.setSelection = function() {

			var sel = this.getSelection();

			if(sel.rangeCount === 0) {
				return false;
			}

			var pe = sel.getRangeAt(0).commonAncestorContainer;

			while(pe) {
				if(_node.is(pe,'body') || _node.is(pe,'html')) {
					// we've gone too far, the user clicked outside the editor
					// this.sec = null;
					// this.sel = null;
					return false;
				}
				if(pe.nodeType === 1 && _node.is(pe,'section')) {
					break;
				}
				pe = pe.parentNode;
			}

			if(pe) {

		        this.sec = pe;
		        pe = pe.firstChild;
		        while(pe && pe.nodeType !== 1 || _node.is(pe,'figure')) {
		        	pe = pe.nextSibling;
		        }
		        this.sel = pe;
		        return true;

		    } else {
		    	// this.sel = null;
		    	// this.sec = null;

		    	return false;
		    }
		};

		this.normalize = function() {

			if(this.sel !== null) {
				_node.normalize(this.sel);
			}
		};

		this.verifyEmptyElement = function() {
			// the pe is always the section
        	var pe = this.sel;
        	console.info('Verify empty on parent', pe);
        	// the node could be a paragraph or a figure
        	var node = pe;
        	console.info('We need to check the node ', node);

        	if(!node) {
        		return true;
        	}

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
	            // this.showToolbox(_toolboxes.insert);
	        }
		};

		this.insertFigure = function(images) {
			var fig,img,i,cap;
			fig = document.createElement('figure');
			fig.setAttribute('contenteditable', false);
			for(i=0;i<images.length;i++) {
				img = images[i];
				if(img !== undefined && img) {
					fig.appendChild(img);
				} else {
					console.info('received undefined in image array');
				}
			}
			cap = document.createElement('figcaption');
            cap.dataset.text = 'Write a caption...';
            cap.setAttribute('contenteditable', 'true');
            fig.appendChild(cap);
            _node.replaceWith(this.sel, fig);
            this.hideToolbox(_toolboxes.insert);
            this.updateFigureAppearance();
		};

		this.updateFigureAppearance = function() {
			if(this.sec.childNodes.length === 0) {
				console.info('We have a childless sec ???');
				return false;
			}
			var fig = this.sec.childNodes[0];
			if(!_node.is(fig,'figure')) {
				console.info('We are not with figure');
				return false;
			}
			var imgs = fig.getElementsByTagName('img');
			_node.removeClass(this.sec,'multiple-odd');
			_node.removeClass(this.sec,'multiple-even');
			if(imgs.length > 1) {
				if(imgs.length % 2 === 0) {
					_node.addClass(this.sec,'multiple-even');
				} else {
					_node.addClass(this.sec,'multiple-odd');
				}
				_node.addClass(this.sec, 'wide');

				/*
				 We must make images two by two like in medium
				 Step 0: group the images by two with regard of the last one (eliminate if odd).
				 		 All the following steps are applied for each pair of two images in a row
				 Step 1: Determine the lowest height and make the highest image the same height as the other
				 Step 2: Measure the width of the two images together with separator: 10px
				 Step 3: What is the ratio we need to apply to the block in order to make the block
				 		 the same width as the width of the container
				 Step 4: Calculate the width of each of the two images so they will fill the container
				 		 with height:auto.
				 */
				var i,img1,img2;
				var sectionWidth = _node.getWidth(this.sec);
				var imageGroups = Math.floor(imgs.length / 2);

				var SEPARATOR = 10;

				for(i=0;i<imageGroups;i++) {
					img1 = imgs[2*i];
					img2 = imgs[2*i+1];

					var w1 = img1.dataset.width;
					var h1 = img1.dataset.height;
					var w2 = img2.dataset.width;
					var h2 = img2.dataset.height;



					console.info('1. Images: (' + w1 + 'x' + h1 + '), (' + w2 + 'x' + h2 + ')');

					// calculate the width and the height of each image in order to make them equal height
					var minHeight = Math.min(h1,h2);
					
					console.info('2. Minimum height: ' + minHeight);
					
					// one of these is 1
					var ratioImg1 = img1.dataset.height / minHeight;
					var ratioImg2 = img2.dataset.height / minHeight;
					
					console.info('3. Ratios: ' + ratioImg1 + ', ' + ratioImg2);
					
					// resize big
					var resizedBigImg1Width = img1.dataset.width / ratioImg1;
					var resizedBigImg1Height = img1.dataset.height / ratioImg1;
					var resizedBigImg2Width = img2.dataset.width / ratioImg2;
					var resizedBigImg2Height = img2.dataset.height / ratioImg2;
					
					console.info('4. Resized big: (' + resizedBigImg1Width + 'x' + resizedBigImg1Height + '), (' + resizedBigImg2Width + 'x' + resizedBigImg2Height + ')');
					
					// the sum of the resizedWidth must be equal to the sectionWidth
					// he have to make it bigger in order to accomodate the big pictures
					var rSeparator = SEPARATOR * (resizedBigImg1Width + resizedBigImg2Width) / sectionWidth;
					var ratioWidth = (resizedBigImg1Width + resizedBigImg2Width + rSeparator) / sectionWidth;
					var finalImg1Width = resizedBigImg1Width / ratioWidth;
					var finalImg2Width = resizedBigImg2Width / ratioWidth; //  + SEPARATOR;
					
					var finalImg1Height = resizedBigImg1Height / ratioWidth;
					var finalImg2Height = resizedBigImg2Height / ratioWidth;

					var nSeparator = sectionWidth - (finalImg1Width + finalImg2Width);

					console.info('4. Resized small: (' + finalImg1Width + 'x' + finalImg1Height + '), (' + finalImg2Width + 'x' + finalImg2Height + ')');

					var finalPercentImg1Width = (100 * finalImg1Width / sectionWidth);
					var finalPercentImg2WidthDiff = 100 - finalPercentImg1Width;
					var finalPercentImg2WidthCalc = (100 * finalImg2Width / sectionWidth);
					console.info('5. Percent calculated: ' + finalPercentImg2WidthCalc + ', Percent by diff: ', finalPercentImg2WidthDiff);
					// var finalPercentImg1Width = (100 * finalImg1Width / sectionWidth) - percentSeparator;
					// var finalPercentImg2Width = (100 * finalImg2Width / sectionWidth);

					_node.attr(img1, 'style','width: ' + finalPercentImg1Width + '%');
					_node.attr(img2, 'style','margin-left:' + nSeparator + 'px; width: ' + finalPercentImg2WidthCalc + '%');
				}
			}

			if(!_node.hasClass(this.sec,'multiple-even') && imgs.length > 0) {
				var lastImg = imgs[imgs.length-1];
				console.info('We have an odd image: ', lastImg);
				_node.attr(lastImg, 'style','max-width:'+lastImg.dataset.width+'px;max-height:'+lastImg.dataset.height+'px');
			}
		};

		this.selectNone = function() {
			var sel = window.getSelection();
			sel.removeAllRanges();
			this.unselectImages();
		};

		this.getData = function(node, name) {
			var ref = node.dataset.iedoc;

			if(ref && this.objData[ref] && this.objData[ref][name]) {
				return this.objData[ref][name];
			} else {
				return null;
			}
		};

		this.setData = function(node, name, anything) {
			var ref = node.dataset.iedoc;
			if(!ref) {
				ref = 'ied' + Math.floor(100000 * Math.random());
				node.dataset.iedoc = ref;
			}
			
			if(!this.objData[ref]) {
				this.objData[ref] = {};
			}
			this.objData[ref][name] = anything;
			return true;
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

        return false;
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
		createText: function(txt) {
			var node = document.createTextNode(txt);
			return node;
		},
		destroy: function(el) {
			el.parentElement.removeChild(el);
		},
		attr: function(node, name, value) {
			node.setAttribute(name, value);
		},
		is: function(node, name) {
			// console.info('Match ' + name + ' against node ', node);
			if(!node || node === null || node === undefined) {
	            return false;
	        }
	        // test only tag elements
	        if(node.nodeType && node.nodeType !== 1) {
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
		},
		normalize: function(node) {
			node.normalize();
		},
		hasParent: function(node, match) {
			while(true) {
				// console.info('walking on parent of ', node); 
				if(_node.is(node,match)) {
					return node;
				}
				if(!node) {
					break;
				} else if(_node.is(node,'html')) {
					break;
				}
				node = node.parentElement;
			}
			return false;
		},
		removeAllChildren: function(node, tag) {
			while(node.getElementsByTagName(tag).length > 0) {
				var e = node.getElementsByTagName(tag)[0];
				_node.destroy(e);
			}
		},
		replaceWith:function(oldElement, newElement) {
			oldElement.parentNode.insertBefore(newElement,oldElement);
			_node.destroy(oldElement);
		},
		adjustRect: function(rect) {
			return {
				top: rect.top + window.pageYOffset - document.documentElement.clientTop,
				left: rect.left + window.pageXOffset - document.documentElement.clientLeft,
				width: rect.width,
				height: rect.height
			};
		},
		getWidth: function(el) {
			return el.offsetWidth;
		},
		getHeight: function(el) {
			return el.offsetHeight;
		},
		lastChildOf: function(el,nodeType) {
			if(el.children.length > 0) {
				var ret = el.children[0];
				for(var i=0;i<el.children.length;i++) {
					if(_node.is(el.children[i],nodeType)) {
						ret = el.children[i];
					}
				}
				return ret;
			} else {
				return null;
			}
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