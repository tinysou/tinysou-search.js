(function($) {

  var current = null;

  $._ts_modal = function(el, options) {
    $._ts_modal.close(); // Close any open modals.
    var remove, target;
    this.$body = $('body');

    this.options = $.extend({}, $._ts_modal.defaults, options);
    this.options.doFade = !isNaN(parseInt(this.options.fadeDuration, 10));
    this.$elm = el;
    this.open();
  };

  $._ts_modal.prototype = {
    constructor: $._ts_modal,

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
        $(document).on('keydown.ts_modal', function(event) {
          if (event.which == 27) $._ts_modal.close();
        });
      }
      if (this.options.clickClose) this.blocker.click($._ts_modal.close);
    },

    close: function() {
      this.unblock();
      this.hide();
      $(document).off('keydown.ts_modal');
    },

    block: function() {
      var initialOpacity = this.options.doFade ? 0 : this.options.opacity;
      this.$elm.trigger($._ts_modal.BEFORE_BLOCK, [this._ctx()]);
      this.blocker = $('<div class="jquery-ts-modal blocker"></div>').css({
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
      this.$elm.trigger($._ts_modal.BLOCK, [this._ctx()]);
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
      this.$elm.trigger($._ts_modal.BEFORE_OPEN, [this._ctx()]);
      if (this.options.showClose) {
        this.closeButton = $('<a href="#close-ts-modal" rel="ts_modal:close" class="close-ts-modal ' + this.options.closeClass + '">' + this.options.closeText + '</a>');
        this.$elm.append(this.closeButton);
      }
      this.$elm.addClass(this.options.modalClass + ' current');
      if(this.options.doFade) {
        this.$elm.fadeIn(this.options.fadeDuration);
      } else {
        this.$elm.show();
      }
      this.center();
      this.$elm.trigger($._ts_modal.OPEN, [this._ctx()]);
    },

    hide: function() {
      this.$elm.trigger($._ts_modal.BEFORE_CLOSE, [this._ctx()]);
      if (this.closeButton) this.closeButton.remove();
      this.$elm.removeClass('current');

      if(this.options.doFade) {
        this.$elm.fadeOut(this.options.fadeDuration);
      } else {
        this.$elm.hide();
      }
      this.$elm.trigger($._ts_modal.CLOSE, [this._ctx()]);
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
        marginTop: - (this.$elm.height() / 2),
        marginLeft: - (this.$elm.width() / 2),
        zIndex: this.options.zIndex + 1
      });
    },

    //Return context for custom events
    _ctx: function() {
      return { elm: this.$elm, blocker: this.blocker, options: this.options };
    }
  };

  //resize is alias for center for now
  $._ts_modal.prototype.resize = $._ts_modal.prototype.center;

  $._ts_modal.close = function(event) {
    if (!current) return;
    if (event) event.preventDefault();
    current.close();
    var that = current.$elm;
    current = null;
    return that;
  };

  $._ts_modal.resize = function() {
    if (!current) return;
    current.resize();
  };

  // Returns if there currently is an active modal
  $._ts_modal.isActive = function () {
    return current ? true : false;
  };

  $._ts_modal.defaults = {
    overlay: "#000",
    opacity: 0.75,
    zIndex: 1,
    escapeClose: true,
    clickClose: true,
    closeText: 'Close',
    closeClass: '',
    modalClass: "ts-modal",
    spinnerHtml: null,
    showSpinner: true,
    showClose: true,
    fadeDuration: null,   // Number of milliseconds the fade animation takes.
    fadeDelay: 1.0        // Point during the overlay's fade-in that the modal begins to fade in (.5 = 50%, 1.5 = 150%, etc.)
  };

  // Event constants
  $._ts_modal.BEFORE_BLOCK = 'ts_modal:before-block';
  $._ts_modal.BLOCK = 'ts_modal:block';
  $._ts_modal.BEFORE_OPEN = 'ts_modal:before-open';
  $._ts_modal.OPEN = 'ts_modal:open';
  $._ts_modal.BEFORE_CLOSE = 'ts_modal:before-close';
  $._ts_modal.CLOSE = 'ts_modal:close';
  $._ts_modal.AJAX_SEND = 'ts_modal:ajax:send';
  $._ts_modal.AJAX_SUCCESS = 'ts_modal:ajax:success';
  $._ts_modal.AJAX_FAIL = 'ts_modal:ajax:fail';
  $._ts_modal.AJAX_COMPLETE = 'ts_modal:ajax:complete';

  $.ts_modal = function(el, options){
    if ($(el).length === 1) {
      current = new $._ts_modal($(el), options);
    }
    return $(el);
  };

  // add window resize event
  $(window).on('resize', $._ts_modal.resize)

  // Automatically bind links with rel="modal:close" to, well, close the modal.
  $(document).on('click.ts_modal', 'a[rel="ts_modal:close"]', $._ts_modal.close);
  $(document).on('click.ts_modal', 'a[rel="ts_modal:open"]', function(event) {
    event.preventDefault();
    $(this)._ts_modal();
  });
})(Zepto);
