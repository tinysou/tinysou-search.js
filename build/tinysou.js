/*
    A simple jQuery modal (http://github.com/kylefox/jquery-modal)
    Version 0.5.5
*/
(function($) {

  var current = null;

  $.modal = function(el, options) {
    $.modal.close(); // Close any open modals.
    var remove, target;
    this.$body = $('body');
    this.options = $.extend({}, $.modal.defaults, options);
    this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10));
    if (el.is('a')) {
      target = el.attr('href');
      //Select element by id from href
      if (/^#/.test(target)) {
        this.$elm = $(target);
        if (this.$elm.length !== 1) return null;
        this.open();
      //AJAX
      } else {
        this.$elm = $('<div>');
        this.$body.append(this.$elm);
        remove = function(event, modal) { modal.elm.remove(); };
        this.showSpinner();
        el.trigger($.modal.AJAX_SEND);
        $.get(target).done(function(html) {
          if (!current) return;
          el.trigger($.modal.AJAX_SUCCESS);
          current.$elm.empty().append(html).on($.modal.CLOSE, remove);
          current.hideSpinner();
          current.open();
          el.trigger($.modal.AJAX_COMPLETE);
        }).fail(function() {
          el.trigger($.modal.AJAX_FAIL);
          current.hideSpinner();
          el.trigger($.modal.AJAX_COMPLETE);
        });
      }
    } else {
      this.$elm = el;
      this.open();
    }
  };

  $.modal.prototype = {
    constructor: $.modal,

    open: function() {
      var m = this;
      if(this.options.doFade) {
        this.block();
        setTimeout(function() {
          m.show();
        }, this.options.fadeDuration * this.options.fadeDelay);
      } else {
        this.block();
        this.show();
      }
      if (this.options.escapeClose) {
        $(document).on('keydown.modal', function(event) {
          if (event.which == 27) $.modal.close();
        });
      }
      if (this.options.clickClose) this.blocker.click($.modal.close);
    },

    close: function() {
      this.unblock();
      this.hide();
      $(document).off('keydown.modal');
    },

    block: function() {
      var initialOpacity = this.options.doFade ? 0 : this.options.opacity;
      this.$elm.trigger($.modal.BEFORE_BLOCK, [this._ctx()]);
      this.blocker = $('<div class="jquery-modal blocker"></div>').css({
        top: 0, right: 0, bottom: 0, left: 0,
        width: "100%", height: "100%",
        position: "fixed",
        zIndex: this.options.zIndex,
        background: this.options.overlay,
        opacity: initialOpacity
      });
      this.$body.append(this.blocker);
      if(this.options.doFade) {
        this.blocker.animate({opacity: this.options.opacity}, this.options.fadeDuration);
      }
      this.$elm.trigger($.modal.BLOCK, [this._ctx()]);
    },

    unblock: function() {
      if(this.options.doFade) {
        this.blocker.fadeOut(this.options.fadeDuration, function() {
          $(this).remove();
        });
      } else {
        this.blocker.remove();
      }
    },

    show: function() {
      this.$elm.trigger($.modal.BEFORE_OPEN, [this._ctx()]);
      if (this.options.showClose) {
        this.closeButton = $('<a href="#close-modal" rel="modal:close" class="close-modal ' + this.options.closeClass + '">' + this.options.closeText + '</a>');
        this.$elm.append(this.closeButton);
      }
      this.$elm.addClass(this.options.modalClass + ' current');
      this.center();
      if(this.options.doFade) {
        this.$elm.fadeIn(this.options.fadeDuration);
      } else {
        this.$elm.show();
      }
      this.$elm.trigger($.modal.OPEN, [this._ctx()]);
    },

    hide: function() {
      this.$elm.trigger($.modal.BEFORE_CLOSE, [this._ctx()]);
      if (this.closeButton) this.closeButton.remove();
      this.$elm.removeClass('current');

      if(this.options.doFade) {
        this.$elm.fadeOut(this.options.fadeDuration);
      } else {
        this.$elm.hide();
      }
      this.$elm.trigger($.modal.CLOSE, [this._ctx()]);
    },

    showSpinner: function() {
      if (!this.options.showSpinner) return;
      this.spinner = this.spinner || $('<div class="' + this.options.modalClass + '-spinner"></div>')
        .append(this.options.spinnerHtml);
      this.$body.append(this.spinner);
      this.spinner.show();
    },

    hideSpinner: function() {
      if (this.spinner) this.spinner.remove();
    },

    center: function() {
      this.$elm.css({
        position: 'fixed',
        top: "50%",
        left: "50%",
        marginTop: - (this.$elm.outerHeight() / 2),
        marginLeft: - (this.$elm.outerWidth() / 2),
        zIndex: this.options.zIndex + 1
      });
    },

    //Return context for custom events
    _ctx: function() {
      return { elm: this.$elm, blocker: this.blocker, options: this.options };
    }
  };

  //resize is alias for center for now
  $.modal.prototype.resize = $.modal.prototype.center;

  $.modal.close = function(event) {
    if (!current) return;
    if (event) event.preventDefault();
    current.close();
    var that = current.$elm;
    current = null;
    return that;
  };

  $.modal.resize = function() {
    if (!current) return;
    current.resize();
  };

  // Returns if there currently is an active modal
  $.modal.isActive = function () {
    return current ? true : false;
  }

  $.modal.defaults = {
    overlay: "#000",
    opacity: 0.75,
    zIndex: 1,
    escapeClose: true,
    clickClose: true,
    closeText: 'Close',
    closeClass: '',
    modalClass: "modal",
    spinnerHtml: null,
    showSpinner: true,
    showClose: true,
    fadeDuration: null,   // Number of milliseconds the fade animation takes.
    fadeDelay: 1.0        // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
  };

  // Event constants
  $.modal.BEFORE_BLOCK = 'modal:before-block';
  $.modal.BLOCK = 'modal:block';
  $.modal.BEFORE_OPEN = 'modal:before-open';
  $.modal.OPEN = 'modal:open';
  $.modal.BEFORE_CLOSE = 'modal:before-close';
  $.modal.CLOSE = 'modal:close';
  $.modal.AJAX_SEND = 'modal:ajax:send';
  $.modal.AJAX_SUCCESS = 'modal:ajax:success';
  $.modal.AJAX_FAIL = 'modal:ajax:fail';
  $.modal.AJAX_COMPLETE = 'modal:ajax:complete';

  $.fn.modal = function(options){
    if (this.length === 1) {
      current = new $.modal(this, options);
    }
    return this;
  };

  // Automatically bind links with rel="modal:close" to, well, close the modal.
  $(document).on('click.modal', 'a[rel="modal:close"]', $.modal.close);
  $(document).on('click.modal', 'a[rel="modal:open"]', function(event) {
    event.preventDefault();
    $(this).modal();
  });
})(jQuery);
;/*!
 *  Copyright 2011 Twitter, Inc.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */



var Hogan = {};

(function (Hogan) {
  Hogan.Template = function (codeObj, text, compiler, options) {
    codeObj = codeObj || {};
    this.r = codeObj.code || this.r;
    this.c = compiler;
    this.options = options || {};
    this.text = text || '';
    this.partials = codeObj.partials || {};
    this.subs = codeObj.subs || {};
    this.buf = '';
  }

  Hogan.Template.prototype = {
    // render: replaced by generated code.
    r: function (context, partials, indent) { return ''; },

    // variable escaping
    v: hoganEscape,

    // triple stache
    t: coerceToString,

    render: function render(context, partials, indent) {
      return this.ri([context], partials || {}, indent);
    },

    // render internal -- a hook for overrides that catches partials too
    ri: function (context, partials, indent) {
      return this.r(context, partials, indent);
    },

    // ensurePartial
    ep: function(symbol, partials) {
      var partial = this.partials[symbol];

      // check to see that if we've instantiated this partial before
      var template = partials[partial.name];
      if (partial.instance && partial.base == template) {
        return partial.instance;
      }

      if (typeof template == 'string') {
        if (!this.c) {
          throw new Error("No compiler available.");
        }
        template = this.c.compile(template, this.options);
      }

      if (!template) {
        return null;
      }

      // We use this to check whether the partials dictionary has changed
      this.partials[symbol].base = template;

      if (partial.subs) {
        // Make sure we consider parent template now
        if (!partials.stackText) partials.stackText = {};
        for (key in partial.subs) {
          if (!partials.stackText[key]) {
            partials.stackText[key] = (this.activeSub !== undefined && partials.stackText[this.activeSub]) ? partials.stackText[this.activeSub] : this.text;
          }
        }
        template = createSpecializedPartial(template, partial.subs, partial.partials,
          this.stackSubs, this.stackPartials, partials.stackText);
      }
      this.partials[symbol].instance = template;

      return template;
    },

    // tries to find a partial in the current scope and render it
    rp: function(symbol, context, partials, indent) {
      var partial = this.ep(symbol, partials);
      if (!partial) {
        return '';
      }

      return partial.ri(context, partials, indent);
    },

    // render a section
    rs: function(context, partials, section) {
      var tail = context[context.length - 1];

      if (!isArray(tail)) {
        section(context, partials, this);
        return;
      }

      for (var i = 0; i < tail.length; i++) {
        context.push(tail[i]);
        section(context, partials, this);
        context.pop();
      }
    },

    // maybe start a section
    s: function(val, ctx, partials, inverted, start, end, tags) {
      var pass;

      if (isArray(val) && val.length === 0) {
        return false;
      }

      if (typeof val == 'function') {
        val = this.ms(val, ctx, partials, inverted, start, end, tags);
      }

      pass = !!val;

      if (!inverted && pass && ctx) {
        ctx.push((typeof val == 'object') ? val : ctx[ctx.length - 1]);
      }

      return pass;
    },

    // find values with dotted names
    d: function(key, ctx, partials, returnFound) {
      var found,
          names = key.split('.'),
          val = this.f(names[0], ctx, partials, returnFound),
          doModelGet = this.options.modelGet,
          cx = null;

      if (key === '.' && isArray(ctx[ctx.length - 2])) {
        val = ctx[ctx.length - 1];
      } else {
        for (var i = 1; i < names.length; i++) {
          found = findInScope(names[i], val, doModelGet);
          if (found != null) {
            cx = val;
            val = found;
          } else {
            val = '';
          }
        }
      }

      if (returnFound && !val) {
        return false;
      }

      if (!returnFound && typeof val == 'function') {
        ctx.push(cx);
        val = this.mv(val, ctx, partials);
        ctx.pop();
      }

      return val;
    },

    // find values with normal names
    f: function(key, ctx, partials, returnFound) {
      var val = false,
          v = null,
          found = false,
          doModelGet = this.options.modelGet;

      for (var i = ctx.length - 1; i >= 0; i--) {
        v = ctx[i];
        val = findInScope(key, v, doModelGet);
        if (val != null) {
          found = true;
          break;
        }
      }

      if (!found) {
        return (returnFound) ? false : "";
      }

      if (!returnFound && typeof val == 'function') {
        val = this.mv(val, ctx, partials);
      }

      return val;
    },

    // higher order templates
    ls: function(func, cx, partials, text, tags) {
      var oldTags = this.options.delimiters;

      this.options.delimiters = tags;
      this.b(this.ct(coerceToString(func.call(cx, text)), cx, partials));
      this.options.delimiters = oldTags;

      return false;
    },

    // compile text
    ct: function(text, cx, partials) {
      if (this.options.disableLambda) {
        throw new Error('Lambda features disabled.');
      }
      return this.c.compile(text, this.options).render(cx, partials);
    },

    // template result buffering
    b: function(s) { this.buf += s; },

    fl: function() { var r = this.buf; this.buf = ''; return r; },

    // method replace section
    ms: function(func, ctx, partials, inverted, start, end, tags) {
      var textSource,
          cx = ctx[ctx.length - 1],
          result = func.call(cx);

      if (typeof result == 'function') {
        if (inverted) {
          return true;
        } else {
          textSource = (this.activeSub && this.subsText && this.subsText[this.activeSub]) ? this.subsText[this.activeSub] : this.text;
          return this.ls(result, cx, partials, textSource.substring(start, end), tags);
        }
      }

      return result;
    },

    // method replace variable
    mv: function(func, ctx, partials) {
      var cx = ctx[ctx.length - 1];
      var result = func.call(cx);

      if (typeof result == 'function') {
        return this.ct(coerceToString(result.call(cx)), cx, partials);
      }

      return result;
    },

    sub: function(name, context, partials, indent) {
      var f = this.subs[name];
      if (f) {
        this.activeSub = name;
        f(context, partials, this, indent);
        this.activeSub = false;
      }
    }

  };

  //Find a key in an object
  function findInScope(key, scope, doModelGet) {
    var val, checkVal;

    if (scope && typeof scope == 'object') {

      if (scope[key] != null) {
        val = scope[key];

      // try lookup with get for backbone or similar model data
      } else if (doModelGet && scope.get && typeof scope.get == 'function') {
        val = scope.get(key);
      }
    }

    return val;
  }

  function createSpecializedPartial(instance, subs, partials, stackSubs, stackPartials, stackText) {
    function PartialTemplate() {};
    PartialTemplate.prototype = instance;
    function Substitutions() {};
    Substitutions.prototype = instance.subs;
    var key;
    var partial = new PartialTemplate();
    partial.subs = new Substitutions();
    partial.subsText = {};  //hehe. substext.
    partial.buf = '';

    stackSubs = stackSubs || {};
    partial.stackSubs = stackSubs;
    partial.subsText = stackText;
    for (key in subs) {
      if (!stackSubs[key]) stackSubs[key] = subs[key];
    }
    for (key in stackSubs) {
      partial.subs[key] = stackSubs[key];
    }

    stackPartials = stackPartials || {};
    partial.stackPartials = stackPartials;
    for (key in partials) {
      if (!stackPartials[key]) stackPartials[key] = partials[key];
    }
    for (key in stackPartials) {
      partial.partials[key] = stackPartials[key];
    }

    return partial;
  }

  var rAmp = /&/g,
      rLt = /</g,
      rGt = />/g,
      rApos = /\'/g,
      rQuot = /\"/g,
      hChars = /[&<>\"\']/;

  function coerceToString(val) {
    return String((val === null || val === undefined) ? '' : val);
  }

  function hoganEscape(str) {
    str = coerceToString(str);
    return hChars.test(str) ?
      str
        .replace(rAmp, '&amp;')
        .replace(rLt, '&lt;')
        .replace(rGt, '&gt;')
        .replace(rApos, '&#39;')
        .replace(rQuot, '&quot;') :
      str;
  }

  var isArray = Array.isArray || function(a) {
    return Object.prototype.toString.call(a) === '[object Array]';
  };

})(typeof exports !== 'undefined' ? exports : Hogan);



(function (Hogan) {
  // Setup regex  assignments
  // remove whitespace according to Mustache spec
  var rIsWhitespace = /\S/,
      rQuot = /\"/g,
      rNewline =  /\n/g,
      rCr = /\r/g,
      rSlash = /\\/g;

  Hogan.tags = {
    '#': 1, '^': 2, '<': 3, '$': 4,
    '/': 5, '!': 6, '>': 7, '=': 8, '_v': 9,
    '{': 10, '&': 11, '_t': 12
  };

  Hogan.scan = function scan(text, delimiters) {
    var len = text.length,
        IN_TEXT = 0,
        IN_TAG_TYPE = 1,
        IN_TAG = 2,
        state = IN_TEXT,
        tagType = null,
        tag = null,
        buf = '',
        tokens = [],
        seenTag = false,
        i = 0,
        lineStart = 0,
        otag = '{{',
        ctag = '}}';

    function addBuf() {
      if (buf.length > 0) {
        tokens.push({tag: '_t', text: new String(buf)});
        buf = '';
      }
    }

    function lineIsWhitespace() {
      var isAllWhitespace = true;
      for (var j = lineStart; j < tokens.length; j++) {
        isAllWhitespace =
          (Hogan.tags[tokens[j].tag] < Hogan.tags['_v']) ||
          (tokens[j].tag == '_t' && tokens[j].text.match(rIsWhitespace) === null);
        if (!isAllWhitespace) {
          return false;
        }
      }

      return isAllWhitespace;
    }

    function filterLine(haveSeenTag, noNewLine) {
      addBuf();

      if (haveSeenTag && lineIsWhitespace()) {
        for (var j = lineStart, next; j < tokens.length; j++) {
          if (tokens[j].text) {
            if ((next = tokens[j+1]) && next.tag == '>') {
              // set indent to token value
              next.indent = tokens[j].text.toString()
            }
            tokens.splice(j, 1);
          }
        }
      } else if (!noNewLine) {
        tokens.push({tag:'\n'});
      }

      seenTag = false;
      lineStart = tokens.length;
    }

    function changeDelimiters(text, index) {
      var close = '=' + ctag,
          closeIndex = text.indexOf(close, index),
          delimiters = trim(
            text.substring(text.indexOf('=', index) + 1, closeIndex)
          ).split(' ');

      otag = delimiters[0];
      ctag = delimiters[delimiters.length - 1];

      return closeIndex + close.length - 1;
    }

    if (delimiters) {
      delimiters = delimiters.split(' ');
      otag = delimiters[0];
      ctag = delimiters[1];
    }

    for (i = 0; i < len; i++) {
      if (state == IN_TEXT) {
        if (tagChange(otag, text, i)) {
          --i;
          addBuf();
          state = IN_TAG_TYPE;
        } else {
          if (text.charAt(i) == '\n') {
            filterLine(seenTag);
          } else {
            buf += text.charAt(i);
          }
        }
      } else if (state == IN_TAG_TYPE) {
        i += otag.length - 1;
        tag = Hogan.tags[text.charAt(i + 1)];
        tagType = tag ? text.charAt(i + 1) : '_v';
        if (tagType == '=') {
          i = changeDelimiters(text, i);
          state = IN_TEXT;
        } else {
          if (tag) {
            i++;
          }
          state = IN_TAG;
        }
        seenTag = i;
      } else {
        if (tagChange(ctag, text, i)) {
          tokens.push({tag: tagType, n: trim(buf), otag: otag, ctag: ctag,
                       i: (tagType == '/') ? seenTag - otag.length : i + ctag.length});
          buf = '';
          i += ctag.length - 1;
          state = IN_TEXT;
          if (tagType == '{') {
            if (ctag == '}}') {
              i++;
            } else {
              cleanTripleStache(tokens[tokens.length - 1]);
            }
          }
        } else {
          buf += text.charAt(i);
        }
      }
    }

    filterLine(seenTag, true);

    return tokens;
  }

  function cleanTripleStache(token) {
    if (token.n.substr(token.n.length - 1) === '}') {
      token.n = token.n.substring(0, token.n.length - 1);
    }
  }

  function trim(s) {
    if (s.trim) {
      return s.trim();
    }

    return s.replace(/^\s*|\s*$/g, '');
  }

  function tagChange(tag, text, index) {
    if (text.charAt(index) != tag.charAt(0)) {
      return false;
    }

    for (var i = 1, l = tag.length; i < l; i++) {
      if (text.charAt(index + i) != tag.charAt(i)) {
        return false;
      }
    }

    return true;
  }

  // the tags allowed inside super templates
  var allowedInSuper = {'_t': true, '\n': true, '$': true, '/': true};

  function buildTree(tokens, kind, stack, customTags) {
    var instructions = [],
        opener = null,
        tail = null,
        token = null;

    tail = stack[stack.length - 1];

    while (tokens.length > 0) {
      token = tokens.shift();

      if (tail && tail.tag == '<' && !(token.tag in allowedInSuper)) {
        throw new Error('Illegal content in < super tag.');
      }

      if (Hogan.tags[token.tag] <= Hogan.tags['$'] || isOpener(token, customTags)) {
        stack.push(token);
        token.nodes = buildTree(tokens, token.tag, stack, customTags);
      } else if (token.tag == '/') {
        if (stack.length === 0) {
          throw new Error('Closing tag without opener: /' + token.n);
        }
        opener = stack.pop();
        if (token.n != opener.n && !isCloser(token.n, opener.n, customTags)) {
          throw new Error('Nesting error: ' + opener.n + ' vs. ' + token.n);
        }
        opener.end = token.i;
        return instructions;
      } else if (token.tag == '\n') {
        token.last = (tokens.length == 0) || (tokens[0].tag == '\n');
      }

      instructions.push(token);
    }

    if (stack.length > 0) {
      throw new Error('missing closing tag: ' + stack.pop().n);
    }

    return instructions;
  }

  function isOpener(token, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].o == token.n) {
        token.tag = '#';
        return true;
      }
    }
  }

  function isCloser(close, open, tags) {
    for (var i = 0, l = tags.length; i < l; i++) {
      if (tags[i].c == close && tags[i].o == open) {
        return true;
      }
    }
  }

  function stringifySubstitutions(obj) {
    var items = [];
    for (var key in obj) {
      items.push('"' + esc(key) + '": function(c,p,t,i) {' + obj[key] + '}');
    }
    return "{ " + items.join(",") + " }";
  }

  function stringifyPartials(codeObj) {
    var partials = [];
    for (var key in codeObj.partials) {
      partials.push('"' + esc(key) + '":{name:"' + esc(codeObj.partials[key].name) + '", ' + stringifyPartials(codeObj.partials[key]) + "}");
    }
    return "partials: {" + partials.join(",") + "}, subs: " + stringifySubstitutions(codeObj.subs);
  }

  Hogan.stringify = function(codeObj, text, options) {
    return "{code: function (c,p,i) { " + Hogan.wrapMain(codeObj.code) + " }," + stringifyPartials(codeObj) +  "}";
  }

  var serialNo = 0;
  Hogan.generate = function(tree, text, options) {
    serialNo = 0;
    var context = { code: '', subs: {}, partials: {} };
    Hogan.walk(tree, context);

    if (options.asString) {
      return this.stringify(context, text, options);
    }

    return this.makeTemplate(context, text, options);
  }

  Hogan.wrapMain = function(code) {
    return 'var t=this;t.b(i=i||"");' + code + 'return t.fl();';
  }

  Hogan.template = Hogan.Template;

  Hogan.makeTemplate = function(codeObj, text, options) {
    var template = this.makePartials(codeObj);
    template.code = new Function('c', 'p', 'i', this.wrapMain(codeObj.code));
    return new this.template(template, text, this, options);
  }

  Hogan.makePartials = function(codeObj) {
    var key, template = {subs: {}, partials: codeObj.partials, name: codeObj.name};
    for (key in template.partials) {
      template.partials[key] = this.makePartials(template.partials[key]);
    }
    for (key in codeObj.subs) {
      template.subs[key] = new Function('c', 'p', 't', 'i', codeObj.subs[key]);
    }
    return template;
  }

  function esc(s) {
    return s.replace(rSlash, '\\\\')
            .replace(rQuot, '\\\"')
            .replace(rNewline, '\\n')
            .replace(rCr, '\\r');
  }

  function chooseMethod(s) {
    return (~s.indexOf('.')) ? 'd' : 'f';
  }

  function createPartial(node, context) {
    var prefix = "<" + (context.prefix || "");
    var sym = prefix + node.n + serialNo++;
    context.partials[sym] = {name: node.n, partials: {}};
    context.code += 't.b(t.rp("' +  esc(sym) + '",c,p,"' + (node.indent || '') + '"));';
    return sym;
  }

  Hogan.codegen = {
    '#': function(node, context) {
      context.code += 'if(t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),' +
                      'c,p,0,' + node.i + ',' + node.end + ',"' + node.otag + " " + node.ctag + '")){' +
                      't.rs(c,p,' + 'function(c,p,t){';
      Hogan.walk(node.nodes, context);
      context.code += '});c.pop();}';
    },

    '^': function(node, context) {
      context.code += 'if(!t.s(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,1),c,p,1,0,0,"")){';
      Hogan.walk(node.nodes, context);
      context.code += '};';
    },

    '>': createPartial,
    '<': function(node, context) {
      var ctx = {partials: {}, code: '', subs: {}, inPartial: true};
      Hogan.walk(node.nodes, ctx);
      var template = context.partials[createPartial(node, context)];
      template.subs = ctx.subs;
      template.partials = ctx.partials;
    },

    '$': function(node, context) {
      var ctx = {subs: {}, code: '', partials: context.partials, prefix: node.n};
      Hogan.walk(node.nodes, ctx);
      context.subs[node.n] = ctx.code;
      if (!context.inPartial) {
        context.code += 't.sub("' + esc(node.n) + '",c,p,i);';
      }
    },

    '\n': function(node, context) {
      context.code += write('"\\n"' + (node.last ? '' : ' + i'));
    },

    '_v': function(node, context) {
      context.code += 't.b(t.v(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
    },

    '_t': function(node, context) {
      context.code += write('"' + esc(node.text) + '"');
    },

    '{': tripleStache,

    '&': tripleStache
  }

  function tripleStache(node, context) {
    context.code += 't.b(t.t(t.' + chooseMethod(node.n) + '("' + esc(node.n) + '",c,p,0)));';
  }

  function write(s) {
    return 't.b(' + s + ');';
  }

  Hogan.walk = function(nodelist, context) {
    var func;
    for (var i = 0, l = nodelist.length; i < l; i++) {
      func = Hogan.codegen[nodelist[i].tag];
      func && func(nodelist[i], context);
    }
    return context;
  }

  Hogan.parse = function(tokens, text, options) {
    options = options || {};
    return buildTree(tokens, '', [], options.sectionTags || []);
  }

  Hogan.cache = {};

  Hogan.cacheKey = function(text, options) {
    return [text, !!options.asString, !!options.disableLambda, options.delimiters, !!options.modelGet].join('||');
  }

  Hogan.compile = function(text, options) {
    options = options || {};
    var key = Hogan.cacheKey(text, options);
    var template = this.cache[key];

    if (template) {
      var partials = template.partials;
      for (var name in partials) {
        delete partials[name].instance;
      }
      return template;
    }

    template = this.generate(this.parse(this.scan(text, options.delimiters), text, options), text, options);
    return this.cache[key] = template;
  }
})(typeof exports !== 'undefined' ? exports : Hogan);

;/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,window,undefined){'$:nomunge';var str_hashchange='hashchange',doc=document,fake_onhashchange,special=$.event.special,doc_mode=doc.documentMode,supports_onhashchange='on'+str_hashchange in window&&(doc_mode===undefined||doc_mode>7);function get_fragment(url){url=url||location.href;var index=url.indexOf('#');return index===-1?'#':url.substr(index);};$.fn[str_hashchange]=function(fn){return fn?this.bind(str_hashchange,fn):this.trigger(str_hashchange);};$.fn[str_hashchange].delay=50;special[str_hashchange]=$.extend(special[str_hashchange],{setup:function(){if(supports_onhashchange){return false;}
$(fake_onhashchange.start);},teardown:function(){if(supports_onhashchange){return false;}
$(fake_onhashchange.stop);}});fake_onhashchange=(function(){var self={},timeout_id,last_hash=get_fragment(),fn_retval=function(val){return val;},history_set=fn_retval,history_get=fn_retval;self.start=function(){timeout_id||poll();};self.stop=function(){timeout_id&&clearTimeout(timeout_id);timeout_id=undefined;};function poll(){var hash=get_fragment(),history_hash=history_get(last_hash);if(hash!==last_hash){history_set(last_hash=hash,history_hash);$(window).trigger(str_hashchange);}else if(history_hash!==last_hash){location.href=location.href.replace(/#.*/,'')+history_hash;}
timeout_id=setTimeout(poll,$.fn[str_hashchange].delay);};window.attachEvent&&!window.addEventListener&&!supports_onhashchange&&(function(){var iframe,iframe_src;self.start=function(){if(!iframe){iframe_src=$.fn[str_hashchange].src;iframe_src=iframe_src&&iframe_src+get_fragment();iframe=$('<iframe tabindex="-1" title="empty"/>').hide().one('load',function(){iframe_src||history_set(get_fragment());poll();}).attr('src',iframe_src||'javascript:0').insertAfter('body')[0].contentWindow;doc.onpropertychange=function(){try{if(event.propertyName==='title'){iframe.document.title=doc.title;}}catch(e){}};}};self.stop=fn_retval;history_get=function(){return get_fragment(iframe.location.href);};history_set=function(hash,history_hash){var iframe_doc=iframe.document,domain=$.fn[str_hashchange].domain;if(hash!==history_hash){iframe_doc.title=doc.title;iframe_doc.open();domain&&iframe_doc.write('<script>document.domain="'+domain+'"</script>');iframe_doc.close();iframe.location.hash=hash;}};})();return self;})();})(jQuery,this);
;(function ($) {
  var queryParser = function (a) {
      var i, p, b = {};
      if (a === "") {
        return {};
      }
      for (i = 0; i < a.length; i += 1) {
        p = a[i].split('=');
        if (p.length === 2) {
          b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
      }
      return b;
    };
  $.queryParams = function () {
    return queryParser(window.location.search.substr(1).split('&'));
  };
  $.hashParams = function () {
    return queryParser(window.location.hash.substr(1).split('&'));
  };


  var ident = 0;

  window.TinySou = window.TinySou || {};
  TinySou.root_url = TinySou.root_url || 'https://api.swiftype.com';
  TinySou.pingUrl = function(endpoint, callback) {
    var to = setTimeout(callback, 350);
    var img = new Image();
    img.onload = img.onerror = function() {
      clearTimeout(to);
      callback();
    };
    img.src = endpoint;
    return false;
  };
  TinySou.pingSearchResultClick = function (engineKey, docId, callback) {
    var params = {
      t: new Date().getTime(),
      engine_key: engineKey,
      doc_id: docId,
      q: TinySou.currentQuery
    };
    var url = TinySou.root_url + '/api/v1/public/analytics/pc?' + $.param(params);
    TinySou.pingUrl(url, callback);
  };

  TinySou.pingAutoSelection = function(engineKey, docId, value, callback) {
    var params = {
      t: new Date().getTime(),
      engine_key: engineKey,
      doc_id: docId,
      prefix: value
    };
    var url = TinySou.root_url + '/api/v1/public/analytics/pas?' + $.param(params);
    TinySou.pingUrl(url, callback);
  };

  TinySou.findSelectedSection = function() {
    var sectionText = $.hashParams().sts;
    if (!sectionText) { return; }

    function normalizeText(str) {
      var out = str.replace(/\s+/g, '');
      out = out.toLowerCase();
      return out;
    }

    sectionText = normalizeText(sectionText);

    $('h1, h2, h3, h4, h5, h6').each(function(idx) {
      $this = $(this);
      if (normalizeText($this.text()).indexOf(sectionText) >= 0) {
        this.scrollIntoView(true);
        return false;
      }
    });
  };

  TinySou.htmlEscape = TinySou.htmlEscape || function htmlEscape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  $.fn.tinysouSearch = function (options) {
    var options = $.extend({}, $.fn.tinysouSearch.defaults, options);

    return this.each(function () {
      var $this = $(this);
      var config = $.meta ? $.extend({}, options, $this.data()) : options;

      $this.data('tinysou-config-search', config);
      $this.selectedCallback = function (data) {
        return function (e) {
          var $el = $(this);
          e.preventDefault();
          TinySou.pingSearchResultClick(config.engineKey, data['id'], function() {
            window.location = $el.attr('href');
          });
        };
      };

      $this.selectedAtcCallback = function(data) {
        return function() {
          var value = $this.val(),
            callback = function() {
              config.onComplete(data, value);
            };
          TinySou.pingAutoSelection(config.engineKey, data['id'], value, callback);
        };
      };

      $this.registerResult = function ($element, data) {
        $element.data('tinysou-item', data);
        $('a', $element).click($this.selectedCallback(data));
      };

      $this.registerActResult = function($element, data) {
        $element.data('tinysou-item', data);
        $element.click($this.selectedAtcCallback(data)).mouseover(function () {
          $this.listResults().removeClass(config.activeItemClass);
          $element.addClass(config.activeItemClass);
        });
      };

      $this.abortCurrent = function() {
        if ($this.currentRequest) {
          $this.currentRequest.abort();
        }
      };

      $this.showList = function() {
        if (handleFunctionParam(config.disableAutocomplete) === false) {
          $listContainer.show();
        }
      };

      $this.hideList = function(sync) {
        if (sync) {
          $listContainer.hide();
        } else {
          setTimeout(function() { $listContainer.hide(); }, 10);
        }
      };

      $this.focused = function() {
        return $this.is(':focus');
      };

      $this.submitting = function() {
        $this.submitted = true;
      };

      $this.listResults = function() {
        return $(config.resultListSelector, $list);
      };

      $this.activeResult = function() {
        return $this.listResults().filter('.' + config.activeItemClass).first();
      };

      $this.prevResult = function() {
        var list = $this.listResults(),
          currentIdx = list.index($this.activeResult()),
          nextIdx = currentIdx - 1,
          next = list.eq(nextIdx);
        $this.listResults().removeClass(config.activeItemClass);
        if (nextIdx >= 0) {
          next.addClass(config.activeItemClass);
        }
      };

      $this.nextResult = function() {
        var list = $this.listResults(),
          currentIdx = list.index($this.activeResult()),
          nextIdx = currentIdx + 1,
          next = list.eq(nextIdx);
        $this.listResults().removeClass(config.activeItemClass);
        if (nextIdx >= 0) {
          next.addClass(config.activeItemClass);
        }
      };
      $this.styleDropdown = function() {
        $listContainer.css(config.dropdownStylesFunction($this));
      };

      $(window).resize(function (event) {
        $this.styleDropdown();
      });
      $this.isEmpty = function(query) {
        return $.inArray(normalize(query), this.emptyQueries) >= 0;
      };

      $this.addEmpty = function(query) {
        $this.emptyQueries.unshift(normalize(query));
      };
      $this.getContentCache = function () {
        return $('#' + contentCacheId);
      };

      var $resultContainer;

      if (config.renderStyle == 'inline') {
        $resultContainer = $(config.resultContainingElement);
      } else if (config.renderStyle == 'new_page') {
        $resultContainer = $(config.resultContainingElement);
        var url = window.location.toString().split('#')[0];
        if (url == config.resultPageURL) {
          config.renderStyle = 'inline';
        }
      } else {
        $('body').append("<div id='st-results-container' style='display: none;'></div>");
        $resultContainer = $('#st-results-container');
      }
      var initialContentOfResultContainer = $resultContainer.html(),
        contentCacheId = 'st-content-cache',
        $contentCache = $this.getContentCache();

      var setSearchHash = function (query, page) {
          location.hash = "stq=" + encodeURIComponent(query) + "&stp=" + page;
        };

      var submitSearch = function (query, options) {
          options = $.extend({
            page: 1
          }, options);
          var params = {};

          if (!$contentCache.length) {
            $resultContainer.after("<div id='" + contentCacheId + "' style='display: none;'></div>");
            $contentCache.html(initialContentOfResultContainer).hide();
          }
          config.loadingFunction(query, $resultContainer);

          TinySou.currentQuery = query;
          params['q'] = query;
          params['engine_key'] = config.engineKey;
          params['page'] = options.page;
          params['per_page'] = config.perPage;

          function handleFunctionParam(field) {
            if (field !== undefined) {
              var evald = field;
              if (typeof evald === 'function') {
                evald = evald.call();
              }
              return evald;
            }
            return undefined;
          }

          params['search_fields'] = handleFunctionParam(config.searchFields);
          params['fetch_fields'] = handleFunctionParam(config.fetchFields);
          params['facets'] = handleFunctionParam(config.facets);
          params['filters'] = handleFunctionParam(config.filters);
          params['document_types'] = handleFunctionParam(config.documentTypes);
          params['functional_boosts'] = handleFunctionParam(config.functionalBoosts);
          params['sort_field'] = handleFunctionParam(config.sortField);
          params['sort_direction'] = handleFunctionParam(config.sortDirection);
          params['spelling'] = handleFunctionParam(config.spelling);

          $.getJSON(TinySou.root_url + "/api/v1/public/engines/search.json?callback=?", params).success(renderSearchResults);
        };

      $(window).hashchange(function () {
        var params = $.hashParams();
        if (params.stq) {
          submitSearch(params.stq, {
            page: params.stp
          });
        } else {
          var $contentCache = $this.getContentCache();
          if ($contentCache.length) {
            $resultContainer.html($contentCache.html());
            $contentCache.remove();
          }
        }
      });

      var $containingForm = $this.parents('form');
      if ($containingForm) {
        $containingForm.bind('submit', function (e) {
          e.preventDefault();
          var searchQuery = $this.val();
          setSearchHash(searchQuery, 1);
        });
      }

      $(document).on('click', '[data-hash][data-page]', function (e) {
        e.preventDefault();
        var $this = $(this);
        setSearchHash($.hashParams().stq, $this.data('page'));
      });

      $(document).on('click', '[data-hash][data-spelling-suggestion]', function (e) {
        e.preventDefault();
        var $this = $(this);
        setSearchHash($this.data('spelling-suggestion'), 1);
      });

      var renderSearchResults = function (data) {
        if (typeof config.preRenderFunction === 'function') {
          config.preRenderFunction.call($this, data);
        }

        config.renderResultsFunction($this.getContext(), data);

        if (typeof config.postRenderFunction === 'function') {
          config.postRenderFunction.call($this, data);
        }
      };

      $this.getContext = function () {
        return {
          config: config,
          resultContainer: $resultContainer,
          registerResult: $this.registerResult
        };
      };

      $this.getActContext = function() {
        return {
          config: config,
          list: $list,
          registerActResult: $this.registerActResult
        };
      };
      $this.attr('autocomplete', 'off');
      $this.data('tinysou-config-autocomplete', config);
      $this.submitted = false;
      $this.cache = new LRUCache(10);
      $this.emptyQueries = [];

      var styles = config.dropdownStylesFunction($this);
      var $tinysouWidget = $('<div class="tinysou-widget" />');
      var $listContainer = $('<div />').addClass(config.suggestionListClass).appendTo($tinysouWidget).css(styles).hide();
      $tinysouWidget.appendTo(config.autocompleteContainingElement);
      var $list = $('<' + config.suggestionListType + ' />').appendTo($listContainer);

      $this.data('tinysou-list', $list);
      var typingDelayPointer;
      var suppressKey = false;
      $this.lastValue = '';
      //bind event listener
      $this.keyup(function (event) {
        if (suppressKey) {
          suppressKey = false;
          return;
        }

        // ignore arrow keys, shift
        if (((event.which > 36) && (event.which < 41)) || (event.which == 16)) return;

        if (config.typingDelay > 0) {
          clearTimeout(typingDelayPointer);
          typingDelayPointer = setTimeout(function () {
            processInput($this);
          }, config.typingDelay);
        } else {
          processInput($this);
        }
      });
      $this.keydown(function (event) {
        $this.styleDropdown();
        // enter = 13; up = 38; down = 40; esc = 27
        var $active = $this.activeResult();
        switch (event.which) {
        case 13:
          if (($active.length !== 0) && ($list.is(':visible'))) {
            event.preventDefault();
            $this.selectedAtcCallback($active.data('tinysou-item'))();
          } else if ($this.currentRequest) {
            $this.submitting();
          }
          $this.hideList();
          suppressKey = true;
          break;
        case 38:
          event.preventDefault();
          if ($active.length === 0) {
            $this.listResults().last().addClass(config.activeItemClass);
          } else {
            $this.prevResult();
          }
          break;
        case 40:
          event.preventDefault();
          if ($active.length === 0) {
            $this.listResults().first().addClass(config.activeItemClass);
          } else if ($active != $this.listResults().last()) {
            $this.nextResult();
          }
          break;
        case 27:
          $this.hideList();
          suppressKey = true;
          break;
        default:
          $this.submitted = false;
          break;
        }
      });

      // opera wants keypress rather than keydown to prevent the form submit
      $this.keypress(function (event) {
        if ((event.which == 13) && ($this.activeResult().length > 0)) {
          event.preventDefault();
        }
      });
      // stupid hack to get around loss of focus on mousedown
      var mouseDown = false;
      var blurWait = false;
      $(document).bind('mousedown.tinysou' + ++ident, function () {
        mouseDown = true;
      });
      $(document).bind('mouseup.tinysou' + ident, function () {
        mouseDown = false;
        if (blurWait) {
          blurWait = false;
          $this.hideList();
        }
      });
      $this.blur(function () {
        if (mouseDown) {
          blurWait = true;
        } else {
          $this.hideList();
        }
      });
      $this.focus(function () {
        setTimeout(function() { $this.select(); }, 10);
        if ($this.listResults().filter(':not(.' + config.noResultsClass + ')').length > 0) {
          $this.showList();
        }
      });
      $(window).hashchange(); // if the tinysou query hash is present onload (maybe the user is pressing the back button), submit a query onload
    });
  };

  var renderPagination = function (ctx, resultInfo) {
    var maxPagesType, maxPages = -1,
      config = ctx.config;
    $.each(resultInfo, function(documentType, typeInfo) {
      if (typeInfo.num_pages > maxPages) {
        maxPagesType = documentType;
        maxPages = typeInfo.num_pages;
      }
    });
    var currentPage = resultInfo[maxPagesType].current_page,
      totalPages = resultInfo[maxPagesType].num_pages;

    $(config.renderPaginationForType(maxPagesType, currentPage, totalPages)).appendTo(ctx.resultContainer);
  };


  var normalize = function (str) {
      return $.trim(str).toLowerCase();
    };

  function htmlEscape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  var callRemote = function ($this, term) {
    $this.abortCurrent();

    var params = {},
      config = $this.data('tinysou-config-autocomplete');

    params['q'] = term;
    params['engine_key'] = config.engineKey;
    params['search_fields'] = handleFunctionParam(config.searchFields);
    params['fetch_fields'] = handleFunctionParam(config.fetchFields);
    params['filters'] = handleFunctionParam(config.filters);
    params['document_types'] = handleFunctionParam(config.documentTypes);
    params['functional_boosts'] = handleFunctionParam(config.functionalBoosts);
    params['sort_field'] = handleFunctionParam(config.sortField);
    params['sort_direction'] = handleFunctionParam(config.sortDirection);
    params['per_page'] = config.resultLimit;

    var endpoint = TinySou.root_url + '/api/v1/public/engines/suggest.json';
    $this.currentRequest = $.ajax({
      type: 'GET',
      dataType: 'jsonp',
      url: endpoint,
      data: params
    }).success(function(data) {
      var norm = normalize(term);
      if (data.record_count > 0) {
        $this.cache.put(norm, data.records);
      } else {
        $this.addEmpty(norm);
        $this.data('tinysou-list').empty();
        $this.hideList();
        return;
      }
      processData($this, data.records, term);
    });
  };

  var getResults = function($this, term) {
    var norm = normalize(term);
    if ($this.isEmpty(norm)) {
      $this.data('tinysou-list').empty();
      $this.hideList();
      return;
    }
    var cached = $this.cache.get(norm);
    if (cached) {
      processData($this, cached, term);
    } else {
      callRemote($this, term);
    }
  };
  // private helpers
  var processInput = function ($this) {
      var term = $this.val();
      if (term === $this.lastValue) {
        return;
      }
      $this.lastValue = term;
      if ($.trim(term) === '') {
        $this.data('tinysou-list').empty();
        $this.hideList();
        return;
      }
      if (typeof $this.data('tinysou-config-autocomplete').engineKey !== 'undefined') {
        getResults($this, term);
      }
    };

  var processData = function ($this, data, term) {
    var $list = $this.data('tinysou-list'),
      config = $this.data('tinysou-config-autocomplete');

    $list.empty();
    $this.hideList(true);

    config.renderActResultsFunction($this.getActContext(), data);

    var totalItems = $this.listResults().length;
    if ((totalItems > 0 && $this.focused()) || (config.noResultsMessage !== undefined)) {
      if ($this.submitted) {
        $this.submitted = false;
      } else {
        $this.showList();
      }
    }
  };

  var defaultRenderResultsFunction = function (ctx, data) {
    var $resultContainer = ctx.resultContainer,
      config = ctx.config;

    $resultContainer.html('');

    $.each(data.records, function (documentType, items) {
      $.each(items, function (idx, item) {
        ctx.registerResult($(config.renderFunction(documentType, item)).appendTo($resultContainer), item);
      });
    });

    renderPagination(ctx, data.info);
    if (!config.renderStyle) {
      $('#st-results-container').appendTo('body').modal();
    } else if (config.renderStyle == 'new_page') {
      var url = config.resultPageURL + window.location.hash;
      window.location.replace(url);
      config.renderStyle = 'inline';
      config.resultContainingElement = '#st-results-container';
    }
  };

  var defaultRenderFunction = function (document_type, item) {
      return '<div class="st-result"><h3 class="title"><a href="' + item['url'] + '" class="st-search-result-link">' + htmlEscape(item['title']) + '</a></h3></div>';
    };

  var defaultLoadingFunction = function(query, $resultContainer) {
      $resultContainer.html('<p class="st-loading-message">loading...</p>');
    };

  var defaultPostRenderFunction = function(data) {
    var totalResultCount = 0;
    var $resultContainer = this.getContext().resultContainer;
    var spellingSuggestion = null;

    if (data['info']) {
      $.each(data['info'], function(index, value) {
        totalResultCount += value['total_result_count'];
        if ( value['spelling_suggestion'] ) {
          spellingSuggestion = value['spelling_suggestion']['text'];
        }

      });
    }

    if (totalResultCount === 0) {
      $resultContainer.html("<div id='st-no-results' class='st-no-results'>No results found.</div>");
    }

    if (spellingSuggestion !== null) {
      $resultContainer.append('<div class="st-spelling-suggestion">Did you mean <a href="#" data-hash="true" data-spelling-suggestion="' + spellingSuggestion + '">' + spellingSuggestion + '</a>?</div>');
    }
  };

  var defaultRenderPaginationForType = function (type, currentPage, totalPages) {
      var pages = '<div class="st-page">',
        previousPage, nextPage;
      if (currentPage != 1) {
        previousPage = currentPage - 1;
        pages = pages + '<a href="#" class="st-prev" data-hash="true" data-page="' + previousPage + '">&laquo; previous</a>';
      }
      if (currentPage < totalPages) {
        nextPage = currentPage + 1;
        pages = pages + '<a href="#" class="st-next" data-hash="true" data-page="' + nextPage + '">next &raquo;</a>';
      }
      pages += '</div>';
      return pages;
    };

  var defaultRenderActResultsFunction = function(ctx, results) {
    var $list = ctx.list,
      config = ctx.config;

    $.each(results, function(document_type, items) {
      $.each(items, function(idx, item) {
        ctx.registerActResult($('<li>' + config.renderActFunction(document_type, item) + '</li>').appendTo($list), item);
      });
    });
  };

  var defaultRenderActFunction = function(document_type, item) {
    return '<p class="title">' + TinySou.htmlEscape(item['title']) + '</p>';
  };

  var defaultOnComplete = function(item, prefix) {
    window.location = item['url'];
  };

  var defaultDropdownStylesFunction = function($this) {
    var config = $this.data('tinysou-config-autocomplete');
    var $attachEl = config.attachTo ? $(config.attachTo) : $this;
    var offset = $attachEl.offset();
    var styles = {
      'position': 'absolute',
      'z-index': 9999,
      'top': offset.top + $attachEl.outerHeight() + 1,
      'left': offset.left
    };
    if (config.setWidth) {
      styles['width'] = $attachEl.outerWidth() - 2;
    }
    return styles;
  };
  var handleFunctionParam = function(field) {
    if (field !== undefined) {
      var evald = field;
      if (typeof evald === 'function') {
        evald = evald.call();
      }
      return evald;
    }
    return undefined;
  };
  // simple client-side LRU Cache, based on https://github.com/rsms/js-lru

  function LRUCache(limit) {
    this.size = 0;
    this.limit = limit;
    this._keymap = {};
  }

  LRUCache.prototype.put = function (key, value) {
    var entry = {
      key: key,
      value: value
    };
    this._keymap[key] = entry;
    if (this.tail) {
      this.tail.newer = entry;
      entry.older = this.tail;
    } else {
      this.head = entry;
    }
    this.tail = entry;
    if (this.size === this.limit) {
      return this.shift();
    } else {
      this.size++;
    }
  };

  LRUCache.prototype.shift = function () {
    var entry = this.head;
    if (entry) {
      if (this.head.newer) {
        this.head = this.head.newer;
        this.head.older = undefined;
      } else {
        this.head = undefined;
      }
      entry.newer = entry.older = undefined;
      delete this._keymap[entry.key];
    }
    return entry;
  };

  LRUCache.prototype.get = function (key, returnEntry) {
    var entry = this._keymap[key];
    if (entry === undefined) return;
    if (entry === this.tail) {
      return entry.value;
    }
    if (entry.newer) {
      if (entry === this.head) this.head = entry.newer;
      entry.newer.older = entry.older;
    }
    if (entry.older) entry.older.newer = entry.newer;
    entry.newer = undefined;
    entry.older = this.tail;
    if (this.tail) this.tail.newer = entry;
    this.tail = entry;
    return returnEntry ? entry : entry.value;
  };

  LRUCache.prototype.remove = function (key) {
    var entry = this._keymap[key];
    if (!entry) return;
    delete this._keymap[entry.key];
    if (entry.newer && entry.older) {
      entry.older.newer = entry.newer;
      entry.newer.older = entry.older;
    } else if (entry.newer) {
      entry.newer.older = undefined;
      this.head = entry.newer;
    } else if (entry.older) {
      entry.older.newer = undefined;
      this.tail = entry.older;
    } else {
      this.head = this.tail = undefined;
    }

    this.size--;
    return entry.value;
  };

  LRUCache.prototype.clear = function () {
    this.head = this.tail = undefined;
    this.size = 0;
    this._keymap = {};
  };

  if (typeof Object.keys === 'function') {
    LRUCache.prototype.keys = function () {
      return Object.keys(this._keymap);
    };
  } else {
    LRUCache.prototype.keys = function () {
      var keys = [];
      for (var k in this._keymap) keys.push(k);
      return keys;
    };
  }
  $.fn.tinysouSearch.defaults = {
    attachTo: undefined,
    documentTypes: undefined,
    facets: undefined,
    filters: undefined,
    engineKey: undefined,
    searchFields: undefined,
    functionalBoosts: undefined,
    sortField: undefined,
    sortDirection: undefined,
    fetchFields: undefined,
    renderStyle: undefined,
    resultPageURL: undefined,
    resultContainingElement: undefined,
    preRenderFunction: undefined,
    postRenderFunction: defaultPostRenderFunction,
    loadingFunction: defaultLoadingFunction,
    renderResultsFunction: defaultRenderResultsFunction,
    renderFunction: defaultRenderFunction,
    renderPaginationForType: defaultRenderPaginationForType,
    perPage: 10,
    spelling: 'strict',
    //autocomplete
    activeItemClass: 'active',
    noResultsClass: 'noResults',
    noResultsMessage: undefined,
    onComplete: defaultOnComplete,
    renderActResultsFunction: defaultRenderActResultsFunction,
    renderActFunction: defaultRenderActFunction,
    dropdownStylesFunction: defaultDropdownStylesFunction,
    resultLimit: undefined,
    suggestionListType: 'ul',
    suggestionListClass: 'autocomplete',
    resultListSelector: 'li',
    setWidth: true,
    typingDelay: 80,
    disableAutocomplete: false,
    autocompleteContainingElement: 'body'
  };
})(jQuery);
