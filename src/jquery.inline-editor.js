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
                selection: [ 'bold','italic','underline','strikethrough','|','h','p','|','align'],
                insert: ['image','video','embed','section'],
                image: ['normal','left','right','full']
            },
            imageUpload: {
                name: 'userfile',
                events: {}
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
                console.info('click on docment');
                // hide the selection toolbox if no selection
                if(document.getSelection().isCollapsed) {
                    that.hideToolbox(that);
                }
                
                that.processInsertToolboxClick(that, event.target);
                that.processImageClick(that,event.target);
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
                console.info('click.ied.clk');
                that.getInsertToolbox(that,event.target);
            });

            // SHOW SELECT TBX ON SELECT
            this.$e.on('selectstart', function() {
                $(document).one('mouseup', function() {
                    var selection = this.getSelection();

                    console.info('we have a selection');

                    if(selection.isCollapsed) {
                        console.info('selection collapsed, hiding toolbox');
                        that.hideToolbox(that);
                    } else {
                        console.info('selection is not collapsed');
                        that.currentSelection = selection;
                        that.setCurrents(that);
                        console.info('current parent node: ', that.currentSelection.parentNode);
                        var node = that.currentSelection.parentNode;
                        if(that._tagIs(node,'figcaption')) {
                            console.info('selection is inside a figcaption, we do not show...');
                        } else {
                            console.info('selection is legit, we show the toolbix');
                            that.getToolbox(that);
                        }
                    }
                });
            });
        },
        currentSelection:null,
        currentParentElement:null,
        currentSection:null,
        currentInsertTarget: null,
        currentImageTarget:null,
        tbxSelection:null,
        tbxInsert:null,
        tbxImage:null,
        processImageClick:function(that, target) {
            // on every click, we deselect all images
            // because the image select is on non-editable and
            // we need to style it in order to show selection

            var selImgs = document.getElementsByClassName('img-active');
            // this can be only one :)
            for(var i=0;i<selImgs.length;i++) {
                var img = selImgs[i];
                img.className = '';
            }

            if(that._tagIs(target,'img')) {
                console.info('clicked on image');
                target.className = 'img-active';

                that.getImageToolbox(that,target);
                that._selectNone(that);

            } else {
                that.hideImageToolbox(that);
            }

            return false;
        },
        processInsertToolboxClick: function(that, target) {

            var ipanel = document.getElementById('insert-panel');
            if(!ipanel) {
                return true;
            }

            if(ipanel.contains(target)) {
                if(target.parentNode === ipanel) {
                    // we clicked the insert panel PLUS button
                    that._toggleClass(target.parentNode,'active');    
                }
            } else {
                var pe = that.getSelectionParentElement();
                if(!pe || !pe.firstChild || !pe.firstChild.innerHTML) {
                    // we clicked outside the empty paragraph
                    that.hideInsertToolbox(that);
                }
            }
        },
        verifyEmptyElement:function(that) {
            // the pe is always the section
            var pe = that.getSelectionParentElement();
            // the node could be a paragraph or a figure
            var node = pe.children[0];
            if(that._tagIs(node,'figure')) {
                // we need to check the figcaption not the figure
                // maybe we have more than one image?
                // the figcaption is always the last child
                node = node.lastChild;
            }
            var htm = node.innerHTML.trim().toLowerCase();
            console.info('the node is ', node);
            console.info('the node html is',htm);
            if(htm === '<br>' || htm === '<br/>' || htm === '<br />' || htm === '&nbsp;') {
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
        hideImageToolbox: function(that) {
            if(that.tbxImage !== null) {
                that.tbxImage.className = 'hidden';
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

                        console.info('W is ', w);

                        w.onclick = function(event) {
                            that._stopPropagation(event);
                            console.info('event target is ', event.srcElement);
                            var el = ( event.srcElement || event.target );
                            var b = el.dataset.act;
                            console.info('Calling on ', b);
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

                    if(typeof that.toolboxInsertWidgets[act] === 'function') {
                        var e = that.toolboxInsertWidgets[act]();

                        // TODO: replace with icon
                        icon = document.createTextNode(e.text);
                        btn = document.createElement('button');
                        li = document.createElement('li');

                        // TODO: make widgets for these, also
                        btn.dataset.act = act;
                        btn.onclick = function(event) {
                            that._stopPropagation(event);   
                            var b = event.target.dataset.act;
                            that.toolboxInsertWidgets[b].call(that,true);
                        };

                        btn.appendChild(icon);
                        li.appendChild(btn);
                        ul.appendChild(li);
                    }
                }

                tbx.appendChild(ul);
                document.body.appendChild(tbx);
                that.tbxInsert = tbx;
            }

            that.tbxInsert.className = '';

            var rect = target.getBoundingClientRect();

            that.tbxInsert.style.left = (rect.left - 60) + 'px';
            that.tbxInsert.style.top = (rect.top - 10) + 'px';

            that.currentInsertTarget = target;

            return that.tbxInsert;
        },
        getImageToolbox: function(that, target) {
            if(that.tbxImage === null) {
                var tbx = document.createElement('div');
                tbx.id = 'image-panel';
                var ul = document.createElement('ul');
                tbx.appendChild(ul);

                for(var btnIndex in that.settings.toolbox.image) {
                    /*jshint loopfunc: true */
                    var btn = that.settings.toolbox.image[btnIndex];
                    if(btn === '|') {
                        var divider = document.createElement('li');
                        divider.className = 'divider';
                        ul.appendChild(divider);
                        continue;
                    }
                    if(typeof that.toolboxImageWidgets[btn] === 'function') {
                        var e = that.toolboxImageWidgets[btn]();
                        var li = document.createElement('li');
                        var w = document.createElement('button');
                        w.dataset.act = btn;

                        w.onclick = function(event) {
                            that._stopPropagation(event);
                            var el = ( event.srcElement || event.target );
                            var b = el.dataset.act;
                            that.toolboxImageWidgets[b].call(that,true);
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
                that.tbxImage = tbx;
            }

            that.currentImageTarget = target;

            that.tbxImage.className = '';

            var rect = that.currentImageTarget.getBoundingClientRect();

            var dims = {
                width: that.tbxImage.offsetWidth,
                height: that.tbxImage.offsetHeight
            };

            that.tbxImage.style.left = ( rect.left - Math.floor(dims.width / 2) + Math.floor(rect.width / 2)) + 'px';
            that.tbxImage.style.top = ( rect.top - 3 - dims.height) + 'px';
            
            return that.tbxSelection;

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
        _toggleClass: function(el, cls) {
            el.classList.toggle(cls);
        },
        _removeClasses:function(el, pattern) {
            if(!pattern) {
                return '';
            }
            var classes = el.className;
            var re = new RegExp(pattern,'g');
            classes = classes.replace(re,'');
            el.className = classes.replace(/ +(?= )/g,''); // str = str.replace(/ +(?= )/g,'');
            return classes;
        },
        _addClass:function(el, newClassName) {
            console.info('Adding class ' + newClassName + ' to ', el);
            el.classList.add(newClassName);
        },
        _tagIs: function(tag, match) {
            console.info('matching against ' + match + ' the tag ', tag);
            if(!tag || tag === null || tag === undefined) {
                return false;
            }
            if(match === tag.tagName.toLowerCase()) {
                return true;
            } else {
                return false;
            }
        },
        _selectNone: function(that, keepToolbox) {
            var sel = window.getSelection();
            sel.removeAllRanges();
            if(keepToolbox !== true) {
                that.hideToolbox(that);
            }
        },
        html5Upload: function(/*that, el*/) {
            /*
            $.fn.html5Uploader = function (options) {

                var crlf = '\r\n';
                var boundary = "jqhtml5ful";
                var dashes = "--";

                var settings = {
                    "name": "userfile",
                    "postUrl": "upload.php",
                    "onClientAbort": null,
                    "onClientError": null,
                    "onClientLoad": null,
                    "onClientLoadEnd": null,
                    "onClientLoadStart": null,
                    "onClientProgress": null,
                    "onServerAbort": null,
                    "onServerError": null,
                    "onServerLoad": null,
                    "onServerLoadStart": null,
                    "onServerProgress": null,
                    "onServerReadyStateChange": null,
                    "onSuccess": null,
                    "onError": null,
                    "onStartUpload": null,
                };

                if (options) {
                    $.extend(settings, options);
                }

                return this.each(function (options) {
                    var $this = $(this);
                    var mul = false;
                    if ($this.is("[type='file']")) {
                        if ($this.prop('multiple')) mul = true;
                        $this
                            .bind("change", function () {
                                if(settings.onStartUpload) settings.onStartUpload.apply($this);
                                var files = this.files;
                                for (var i = 0; i < files.length; i++) {
                                    fileHandler(files[i]);
                                    if (!mul) break;
                                }
                            });
                    } else {
                        if ($this.data('multiple')) mul = true;
                        $this
                            .bind("dragenter dragover", function () {
                                $(this).addClass("hover");
                                return false;
                            })
                            .bind("dragleave", function () {
                                $(this).removeClass("hover");
                                return false;
                            })
                            .bind("drop", function (e) {
                                $(this).removeClass("hover");
                                if(settings.onStartUpload) settings.onStartUpload.apply($this);
                                var files = e.originalEvent.dataTransfer.files;
                                for (var i = 0; i < files.length; i++) {
                                    fileHandler(files[i]);
                                    if (!mul) break;
                                }
                                return false;
                            });
                    }
                });

                function fileHandler(file) {
                    var fileReader = new FileReader();
                    fileReader.onabort = function (e) {
                        if (settings.onClientAbort) {
                            settings.onClientAbort(e, file);
                        }
                    };
                    fileReader.onerror = function (e) {
                        if (settings.onClientError) {
                            settings.onClientError(e, file);
                        }
                    };
                    fileReader.onload = function (e) {
                        if (settings.onClientLoad) {
                            settings.onClientLoad(e, file);
                        }
                    };
                    fileReader.onloadend = function (e) {
                        if (settings.onClientLoadEnd) {
                            settings.onClientLoadEnd(e, file);
                        }
                    };
                    fileReader.onloadstart = function (e) {
                        if (settings.onClientLoadStart) {
                            settings.onClientLoadStart(e, file);
                        }
                    };
                    fileReader.onprogress = function (e) {
                        if (settings.onClientProgress) {
                            settings.onClientProgress(e, file);
                        }
                    };
                    fileReader.readAsDataURL(file);

                    var xmlHttpRequest = new XMLHttpRequest();
                    if (!xmlHttpRequest.upload) {
                        console.log('Cannot upload');
                    } else {
                        xmlHttpRequest.upload.onabort = function (e) {
                            if (settings.onServerAbort) {
                                settings.onServerAbort(e, file);
                            }
                        };
                        xmlHttpRequest.upload.onerror = function (e) {
                            if (settings.onServerError) {
                                settings.onServerError(e, file);
                            }
                        };
                        xmlHttpRequest.upload.onload = function (e) {
                            if (settings.onServerLoad) {
                                settings.onServerLoad(e, file);
                            }
                        };
                        xmlHttpRequest.upload.onloadstart = function (e) {
                            if (settings.onServerLoadStart) {
                                settings.onServerLoadStart(e, file);
                            }
                        };
                        xmlHttpRequest.upload.onprogress = function (e) {
                            if (settings.onServerProgress) {
                                settings.onServerProgress(e, file);
                            }
                        };
                    }

                    xmlHttpRequest.onreadystatechange = function (e) {
                        if (settings.onServerReadyStateChange) {
                            settings.onServerReadyStateChange(e, file, xmlHttpRequest.readyState);
                        }
                        if (settings.onSuccess && xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
                            settings.onSuccess(e, file, xmlHttpRequest.responseText);
                        }
                        if(settings.onError && xmlHttpRequest.readyState == 4 && xmlHttpRequest.status != 200) {
                            settings.onError(e,file,xmlHttpRequest.responseText,xmlHttpRequest.status);
                        }
                    };

                    xmlHttpRequest.open("POST", settings.postUrl, true);

                    if (file.getAsBinary) { // Firefox

                        var data = dashes + boundary + crlf +
                            "Content-Disposition: form-data;" +
                            "name=\"" + settings.name + "\";" +
                            "filename=\"" + unescape(encodeURIComponent(file.name)) + "\"" + crlf +
                            "Content-Type: application/octet-stream" + crlf + crlf +
                            file.getAsBinary() + crlf +
                            dashes + boundary + dashes;

                        xmlHttpRequest.setRequestHeader("Content-Type", "multipart/form-data;boundary=" + boundary);
                        xmlHttpRequest.sendAsBinary(data);

                    } else if (window.FormData) { // Chrome

                        var formData = new FormData();
                        formData.append(settings.name, file);

                        xmlHttpRequest.send(formData);

                    }
                }

            };
            */
        },
        _fileHandler: function(that, el, file,fileIndex,fileCount) {
            var fileReader = new FileReader();

            fileReader.onloadend = function() {
                var fig = document.createElement('figure');
                fig.setAttribute('contenteditable','false');
                var img = document.createElement('img');
                img.src = fileReader.result;
                img.dataset.width = img.width;
                img.dataset.height = img.height;
                img.dataset.name = file.name;
                fig.appendChild(img);
                var cap = document.createElement('figcaption');
                cap.dataset.text = 'Write a caption...';
                cap.setAttribute('contenteditable', 'true');
                fig.appendChild(cap);
                
                // pe.appendChild(fig);

                el.parentNode.removeChild(el);
                pe.parentNode.insertBefore(fig, pe);
                pe.parentNode.removeChild(pe);
            };

            console.info('We got file ' + fileIndex + '/' + fileCount + ': ', file);
            console.info('File reader: ', fileReader);
            console.info('Current parent: ', that.currentInsertTarget);
            var pe = that.currentInsertTarget;
            pe.dataset.text = 'Please wait...';
            fileReader.readAsDataURL(file);

        },
        toolboxWidgets: {
            'bold': function(runContext) {
                if(!runContext) {
                    return {
                        icon:'bold'
                    };
                } else {
                    document.execCommand('bold',false,true);
                }
            },
            'italic': function(runContext) {
                if(!runContext) {
                    return {
                        icon:'italic'
                    };
                } else {
                    document.execCommand('italic',false,true);
                }  
            },
            'underline': function(runContext) {
                if(!runContext) {
                    return {
                        icon:'underline'
                    };
                } else {
                    document.execCommand('underline',false,true);
                }
            },
            'strikethrough': function(runContext) {
                if(!runContext) {
                    return {
                        icon:'strike'
                    };
                } else {
                    document.execCommand('strikeThrough',false,true);
                }
            },
            'align': function(runContext) {
                if(!runContext) {
                    return {
                        icon: 'align'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        console.info('The class list is ', pe.classList);
                    }
                }
            },
            /*
            'left':function(runContext) {
                if(!runContext) {
                    return {
                        text: 'L'
                    };
                } else {
                    var pe = this.currentParentElement;
                    if(pe) {
                        this._removeClasses(pe, '^text-');
                        this._addClass(pe, 'text-left');
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
                        this._removeClasses(pe, '^text-');
                        this._addClass(pe, 'text-right');
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
                        this._removeClasses(pe, '^text-');
                        this._addClass(pe, 'text-justify');
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
                        this._removeClasses(pe, '^text-');
                        this._addClass(pe, 'text-center');
                    } else {
                        console.info('pe is empty? ', this);
                    }
                }
            },
            */
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
        },
        toolboxInsertWidgets: {
            'image': function(runContext) {
                if(!runContext) {
                    console.info('no run context');
                    return {
                        text:'IMAGE'
                    };
                } else {

                    var that = this;
                    
                    var inp = document.createElement('input');
                    inp.type = 'file';
                    inp.name = 'userFile';
                    inp.multiple = "true";
                    inp.style.position = 'absolute';
                    inp.style.left = '-9999px';
                    inp.style.top = '-9999px';

                    inp.onchange = function(event) {
                        if(that.settings.imageUpload.events.start) {
                            that.settings.imageUpload.events.start.call(this,that,event);
                        }
                        var files = this.files;
                        for (var i = 0; i < files.length; i++) {
                            that._fileHandler(that, inp, files[i],i,files.length);
                        }
                    };

                    document.body.appendChild(inp);

                    inp.focus();
                    inp.click();
                }
            },
            'video': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'VIDEO'
                    };
                } else {
                    console.info('Clicked on video button');
                }
            },
            'embed': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'EMBED'
                    };
                } else {
                    console.info('Clicked on embed button');
                }
            },
            'section': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'S'
                    };
                } else {
                    console.info('Clicked on new section');
                }
            }
        },
        toolboxImageWidgets: {
            'normal': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'N'
                    };
                } else {
                    console.info('Normal image class');
                }
            },
            'left': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'L'
                    };
                } else {
                    console.info('Left align');
                }
            },
            'right': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'R'
                    };
                } else {
                    console.info('Right align');
                }
            },
            'full': function(runContext) {
                if(!runContext) {
                    return {
                        text: 'F'
                    };
                } else {
                    console.info('Full width');
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