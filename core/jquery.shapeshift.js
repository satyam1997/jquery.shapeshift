// Generated by CoffeeScript 1.4.0
(function() {

  (function($, window, document) {
    var Plugin, defaults, pluginName;
    pluginName = "shapeshift";
    defaults = {
      enableResize: true,
      animated: true,
      animateOnInit: false,
      animationSpeed: 120,
      align: "center",
      autoHeight: true,
      columns: null,
      height: 200,
      gutterX: 10,
      gutterY: 10,
      maxHeight: null,
      minHeight: 100,
      paddingX: 10,
      paddingY: 10,
      selector: ""
    };
    Plugin = (function() {

      function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.globals = {};
        this.$container = $(element);
        this.errorDetection();
        this.init();
      }

      Plugin.prototype.errorDetection = function() {
        var options;
        options = this.options;
        if (!options.autoHeight && !options.height) {
          return console.error("Shapeshift ERROR: You must specify a height if autoHeight is turned off.");
        }
      };

      Plugin.prototype.init = function() {
        this.createEvents();
        this.enableFeatures();
        this.setGlobals();
        this.render(true);
        return this.afterInit();
      };

      Plugin.prototype.createEvents = function() {
        var $container, options,
          _this = this;
        options = this.options;
        $container = this.$container;
        $container.off("ss-arrange").on("ss-arrange", function() {
          return _this.render(true);
        });
        $container.off("ss-destroy").on("ss-destroy", function() {
          return _this.destroy();
        });
        return $container.off("ss-destroyAll").on("ss-destroyAll", function() {
          return _this.destroy(true);
        });
      };

      Plugin.prototype.enableFeatures = function() {
        if (this.options.enableResize) {
          return this.resize();
        }
      };

      Plugin.prototype.setGlobals = function() {
        return this.globals.animated = this.options.animateOnInit;
      };

      Plugin.prototype.parseChildren = function() {
        var $child, $children, child, i, parsedChildren, _i, _ref;
        $children = this.$container.children(this.options.selector).filter(":visible");
        parsedChildren = [];
        for (i = _i = 0, _ref = $children.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          $child = $children.eq(i);
          child = {
            i: i,
            el: $child,
            colspan: $child.data("ss-colspan")
          };
          parsedChildren.push(child);
        }
        return this.parsedChildren = parsedChildren;
      };

      Plugin.prototype.afterInit = function() {
        return this.globals.animated = this.options.animated;
      };

      Plugin.prototype.render = function(full_render) {
        if (full_render) {
          this.parseChildren();
        }
        this.setGrid();
        return this.arrange();
      };

      Plugin.prototype.setGrid = function() {
        var children_count, col_width, columns, fc_colspan, fc_width, first_child, grid_width, gutterX, inner_width, paddingX, single_width;
        gutterX = this.options.gutterX;
        paddingX = this.options.paddingX;
        inner_width = this.$container.width() - (paddingX * 2);
        first_child = this.parsedChildren[0];
        fc_width = first_child.el.outerWidth();
        fc_colspan = first_child.colspan;
        single_width = (fc_width - ((fc_colspan - 1) * gutterX)) / fc_colspan;
        this.globals.col_width = col_width = single_width + gutterX;
        this.globals.columns = columns = this.options.columns || Math.floor((inner_width + gutterX) / col_width);
        children_count = this.parsedChildren.length;
        if (columns > children_count) {
          columns = children_count;
        }
        this.globals.child_offset = paddingX;
        switch (this.options.align) {
          case "center":
            grid_width = (columns * col_width) - gutterX;
            return this.globals.child_offset += (inner_width - grid_width) / 2;
          case "right":
            grid_width = (columns * col_width) - gutterX;
            return this.globals.child_offset += inner_width - grid_width;
        }
      };

      Plugin.prototype.arrange = function() {
        var $child, container_height, i, maxHeight, minHeight, positions, _i, _ref;
        positions = this.getPositions();
        for (i = _i = 0, _ref = this.parsedChildren.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          $child = this.parsedChildren[i].el;
          if (this.globals.animated) {
            $child.stop(true, false).animate(positions[i], this.options.animationSpeed);
          } else {
            $child.css(positions[i]);
          }
        }
        if (this.options.autoHeight) {
          container_height = this.globals.container_height;
          maxHeight = this.options.maxHeight;
          minHeight = this.options.minHeight;
          if (minHeight && container_height < minHeight) {
            container_height = minHeight;
          } else if (maxHeight && container_height > maxHeight) {
            container_height = maxHeight;
          }
          return this.$container.height(container_height);
        } else {
          return this.$container.height(this.options.height);
        }
      };

      Plugin.prototype.getPositions = function() {
        var $child, col, col_heights, grid_height, gutterY, i, offsetX, offsetY, paddingY, positions, _i, _j, _ref, _ref1;
        gutterY = this.options.gutterY;
        paddingY = this.options.paddingY;
        col_heights = [];
        for (i = _i = 0, _ref = this.globals.columns; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          col_heights.push(paddingY);
        }
        positions = [];
        for (i = _j = 0, _ref1 = this.parsedChildren.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          $child = this.parsedChildren[i].el;
          col = this.lowestCol(col_heights);
          offsetX = (col * this.globals.col_width) + this.globals.child_offset;
          offsetY = col_heights[col];
          positions.push({
            left: offsetX,
            top: offsetY
          });
          col_heights[col] += $child.outerHeight() + gutterY;
        }
        if (this.options.autoHeight) {
          grid_height = col_heights[this.highestCol(col_heights)] - gutterY;
          this.globals.container_height = grid_height + paddingY;
        }
        return positions;
      };

      Plugin.prototype.resize = function() {
        var animation_speed, resizing,
          _this = this;
        animation_speed = this.options.animationSpeed;
        resizing = false;
        return $(window).on("resize.shapeshift", function() {
          if (!resizing) {
            resizing = true;
            setTimeout((function() {
              return _this.render();
            }), animation_speed / 2);
            setTimeout((function() {
              return _this.render();
            }), animation_speed);
            return setTimeout(function() {
              resizing = false;
              return _this.render();
            }, animation_speed * 1.5);
          }
        });
      };

      Plugin.prototype.lowestCol = function(array) {
        return $.inArray(Math.min.apply(window, array), array);
      };

      Plugin.prototype.highestCol = function(array) {
        return $.inArray(Math.max.apply(window, array), array);
      };

      Plugin.prototype.destroy = function(revertChildren) {
        this.$container.off("ss-arrange");
        this.$container.off("ss-destroy");
        this.$container.off("ss-destroyAll");
        $(window).off("resize.shapeshift");
        if (revertChildren) {
          this.$container.children().each(function() {
            return $(this).css({
              left: 0,
              top: 0
            });
          });
        }
        return console.info("Shapeshift has been successfully destroyed on container:", this.$container);
      };

      return Plugin;

    })();
    return $.fn[pluginName] = function(options) {
      return this.each(function() {
        if (!$.data(this, "plugin_" + pluginName)) {
          return $.data(this, "plugin_" + pluginName, new Plugin(this, options));
        }
      });
    };
  })(jQuery, window, document);

}).call(this);
