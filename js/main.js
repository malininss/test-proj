"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CMainPage = /*#__PURE__*/function () {
  function CMainPage() {
    var _this = this;

    _classCallCheck(this, CMainPage);

    this.playerID = 'main-video';
    this.player = null;
    this.data = {};
    this.dataURL = 'json/main-video.json';
    this.captions = document.getElementById('background-captions');
    this.captQueue = new Map();
    this.captQueueStop = new Map();
    this.captQueueIndex = false; // get JSON data (video source, splash, captions)

    CHelpers.showSpinner();
    CHelpers.fetchData(this.dataURL).then(function (result) {
      _this.data = _typeof(result) === 'object' ? result : JSON.parse(result); // check that we can play video, then render html video

      if (_this.initPlayer(_this.playerID, _this.data.video)) {
        // check user connection speed
        CHelpers.checkUserConnection(function (result) {
          if (result !== true) {
            CHelpers.logMessage("slow connection, show static background");
            CHelpers.hideSpinner();
          } else {
            // fast connection
            _this.player.initEvents();

            _this.player.setSource(_this.data.video);

            _this.initEvents();

            _this.initCaptions(_this.data.captions);
          }
        });
      } else {
        CHelpers.logMessage("can`t play video, show static background");
        CHelpers.hideSpinner();
      }
    }, function (error) {
      CHelpers.errMessage("JSON fetching error, \"".concat(error, "\""));
      CHelpers.hideSpinner();
    });
  }

  _createClass(CMainPage, [{
    key: "initPlayer",
    value: function initPlayer(element, data) {
      this.player = new CPlayer(element, data);
      return this.player.inited;
    }
  }, {
    key: "initEvents",
    value: function initEvents() {
      var _this2 = this;

      document.addEventListener('player.timeupdate', function (event) {
        if (event.detail.time) _this2.toggleCaptions(event.detail.time);
      }, false);
    }
  }, {
    key: "initCaptions",
    value: function initCaptions(data) {
      var _this3 = this;

      if (data) {
        data.forEach(function (caption) {
          // queue to show caption on start time
          _this3.captQueue.set(caption.start, caption); // queue to remove caption on stop time


          _this3.captQueueStop.set(caption.stop, caption);

          _this3.renderCaption(_this3.captions, caption);
        });
      }
    }
  }, {
    key: "renderCaption",
    value: function renderCaption(element, caption) {
      var markup = "\n            <div class=\"caption\" data-caption-id=\"".concat(caption.id, "\" data-caption-start=\"").concat(caption.start, "\" data-caption-stop=\"").concat(caption.stop, "\" \n                style=\"top: ").concat(caption.top, "; right: ").concat(caption.right, "; bottom: ").concat(caption.bottom, "; left: ").concat(caption.left, "; \">\n                <div class=\"caption__title\"><a href=\"").concat(caption.href, "\" style=\"font-size: ").concat(caption.size, ";\">").concat(caption.title, "</a></div>\n            </div>");
      element.insertAdjacentHTML('beforeend', markup);
    }
  }, {
    key: "toggleCaptions",
    value: function toggleCaptions() {
      var time = Math.trunc(this.player.element.currentTime),
          curCaption = this.captQueue.get(time),
          delCaption = this.captQueueStop.get(time);

      if (curCaption && curCaption.id !== this.captQueueIndex.id) {
        // show caption
        this.captQueueIndex = curCaption;
        this.captions.querySelector("[data-caption-id=\"".concat(curCaption.id, "\"]")).classList.add('caption_active');
        CHelpers.logMessage("toggleCaptions, show caption id = ".concat(curCaption.id, ", on ").concat(time, " sec"));
        this.captQueue.delete(time);
      }

      if (delCaption) {
        // remove caption
        this.captQueueIndex = false;
        this.captions.querySelector("[data-caption-id=\"".concat(delCaption.id, "\"]")).classList.add('caption_out');
        CHelpers.logMessage("toggleCaptions, remove caption id = ".concat(delCaption.id, ", on ").concat(time, " sec"));
        this.captQueueStop.delete(time);
      }
    }
  }]);

  return CMainPage;
}();

var mainPage = new CMainPage();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiQ01haW5QYWdlIiwicGxheWVySUQiLCJwbGF5ZXIiLCJkYXRhIiwiZGF0YVVSTCIsImNhcHRpb25zIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNhcHRRdWV1ZSIsIk1hcCIsImNhcHRRdWV1ZVN0b3AiLCJjYXB0UXVldWVJbmRleCIsIkNIZWxwZXJzIiwic2hvd1NwaW5uZXIiLCJmZXRjaERhdGEiLCJ0aGVuIiwicmVzdWx0IiwiSlNPTiIsInBhcnNlIiwiaW5pdFBsYXllciIsInZpZGVvIiwiY2hlY2tVc2VyQ29ubmVjdGlvbiIsImxvZ01lc3NhZ2UiLCJoaWRlU3Bpbm5lciIsImluaXRFdmVudHMiLCJzZXRTb3VyY2UiLCJpbml0Q2FwdGlvbnMiLCJlcnJvciIsImVyck1lc3NhZ2UiLCJlbGVtZW50IiwiQ1BsYXllciIsImluaXRlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsImRldGFpbCIsInRpbWUiLCJ0b2dnbGVDYXB0aW9ucyIsImZvckVhY2giLCJjYXB0aW9uIiwic2V0Iiwic3RhcnQiLCJzdG9wIiwicmVuZGVyQ2FwdGlvbiIsIm1hcmt1cCIsImlkIiwidG9wIiwicmlnaHQiLCJib3R0b20iLCJsZWZ0IiwiaHJlZiIsInNpemUiLCJ0aXRsZSIsImluc2VydEFkamFjZW50SFRNTCIsIk1hdGgiLCJ0cnVuYyIsImN1cnJlbnRUaW1lIiwiY3VyQ2FwdGlvbiIsImdldCIsImRlbENhcHRpb24iLCJxdWVyeVNlbGVjdG9yIiwiY2xhc3NMaXN0IiwiYWRkIiwiZGVsZXRlIiwibWFpblBhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFBTUEsUztBQUVGLHVCQUFjO0FBQUE7O0FBQUE7O0FBRVYsU0FBS0MsUUFBTCxHQUFnQixZQUFoQjtBQUNBLFNBQUtDLE1BQUwsR0FBYyxJQUFkO0FBQ0EsU0FBS0MsSUFBTCxHQUFZLEVBQVo7QUFDQSxTQUFLQyxPQUFMLEdBQWUsc0JBQWY7QUFFQSxTQUFL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QUsvQyxjQUFMLEdBQXNCLEtBQXRCO0FBQ0EsYUFBS04sUUFBTCxDQUFjc0QsYUFBZCw4QkFBaURELFVBQVUsQ0FBQ2QsRUFBNUQsVUFBb0VnQixTQUFwRSxDQUE4RUMsR0FBOUUsQ0FBa0YsYUFBbEY7QUFDQWpELFFBQUFBLFFBQVEsQ0FBQ1UsVUFBVCwrQ0FBMkRvQyxVQUFVLENBQUNkLEVBQXRFLGtCQUFnRlQsSUFBaEY7QUFDQSxhQUFLekIsYUFBTCxDQUFtQm9ELE1BQW5CLENBQTBCM0IsSUFBMUI7QUFDSDtBQUNKOzs7Ozs7QUFHTCxJQUFNNEIsUUFBUSxHQUFHLElBQUkvRCxTQUFKLEVBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ01haW5QYWdlIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMucGxheWVySUQgPSAnbWFpbi12aWRlbydcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICAgICAgdGhpcy5kYXRhVVJMID0gJ2pzb24vbWFpbi12aWRlby5qc29uJztcblxuICAgICAgICB0aGlzLmNhcHRpb25zID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JhY2tncm91bmQtY2FwdGlvbnMnKTtcbiAgICAgICAgdGhpcy5jYXB0UXVldWUgPSBuZXcgTWFwKCk7XG4gICAgICAgIHRoaXMuY2FwdFF1ZXVlU3RvcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5jYXB0UXVldWVJbmRleCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIGdldCBKU09OIGRhdGEgKHZpZGVvIHNvdXJjZSwgc3BsYXNoLCBjYXB0aW9ucylcbiAgICAgICAgQ0hlbHBlcnMuc2hvd1NwaW5uZXIoKTtcbiAgICAgICAgQ0hlbHBlcnMuZmV0Y2hEYXRhKHRoaXMuZGF0YVVSTClcbiAgICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgICAgIHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9ICh0eXBlb2YgcmVzdWx0ID09PSAnb2JqZWN0JykgPyByZXN1bHQgOiBKU09OLnBhcnNlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgd2UgY2FuIHBsYXkgdmlkZW8sIHRoZW4gcmVuZGVyIGh0bWwgdmlkZW9cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5pdFBsYXllcih0aGlzLnBsYXllcklELCB0aGlzLmRhdGEudmlkZW8pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB1c2VyIGNvbm5lY3Rpb24gc3BlZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmNoZWNrVXNlckNvbm5lY3Rpb24oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgc2xvdyBjb25uZWN0aW9uLCBzaG93IHN0YXRpYyBiYWNrZ3JvdW5kYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmhpZGVTcGlubmVyKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmFzdCBjb25uZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLmluaXRFdmVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIuc2V0U291cmNlKHRoaXMuZGF0YS52aWRlbyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdEV2ZW50cygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRDYXB0aW9ucyh0aGlzLmRhdGEuY2FwdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgY2FuXFxgdCBwbGF5IHZpZGVvLCBzaG93IHN0YXRpYyBiYWNrZ3JvdW5kYCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmVyck1lc3NhZ2UoYEpTT04gZmV0Y2hpbmcgZXJyb3IsIFwiJHtlcnJvcn1cImApO1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgfVxuXG4gICAgaW5pdFBsYXllcihlbGVtZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IENQbGF5ZXIoZWxlbWVudCwgZGF0YSk7XG4gICAgICAgIHJldHVybiB0aGlzLnBsYXllci5pbml0ZWQ7XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncGxheWVyLnRpbWV1cGRhdGUnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5kZXRhaWwudGltZSlcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNhcHRpb25zKGV2ZW50LmRldGFpbC50aW1lKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGluaXRDYXB0aW9ucyhkYXRhKSB7XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoY2FwdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHF1ZXVlIHRvIHNob3cgY2FwdGlvbiBvbiBzdGFydCB0aW1lXG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0UXVldWUuc2V0KGNhcHRpb24uc3RhcnQsIGNhcHRpb24pO1xuICAgICAgICAgICAgICAgIC8vIHF1ZXVlIHRvIHJlbW92ZSBjYXB0aW9uIG9uIHN0b3AgdGltZVxuICAgICAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlU3RvcC5zZXQoY2FwdGlvbi5zdG9wLCBjYXB0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckNhcHRpb24odGhpcy5jYXB0aW9ucywgY2FwdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlckNhcHRpb24oZWxlbWVudCwgY2FwdGlvbikge1xuICAgICAgICBsZXQgbWFya3VwID0gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcHRpb25cIiBkYXRhLWNhcHRpb24taWQ9XCIke2NhcHRpb24uaWR9XCIgZGF0YS1jYXB0aW9uLXN0YXJ0PVwiJHtjYXB0aW9uLnN0YXJ0fVwiIGRhdGEtY2FwdGlvbi1zdG9wPVwiJHtjYXB0aW9uLnN0b3B9XCIgXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJ0b3A6ICR7Y2FwdGlvbi50b3B9OyByaWdodDogJHtjYXB0aW9uLnJpZ2h0fTsgYm90dG9tOiAke2NhcHRpb24uYm90dG9tfTsgbGVmdDogJHtjYXB0aW9uLmxlZnR9OyBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FwdGlvbl9fdGl0bGVcIj48YSBocmVmPVwiJHtjYXB0aW9uLmhyZWZ9XCIgc3R5bGU9XCJmb250LXNpemU6ICR7Y2FwdGlvbi5zaXplfTtcIj4ke2NhcHRpb24udGl0bGV9PC9hPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG4gICAgfVxuXG4gICAgdG9nZ2xlQ2FwdGlvbnMoKSB7XG4gICAgICAgIGxldCB0aW1lID0gTWF0aC50cnVuYyh0aGlzLnBsYXllci5lbGVtZW50LmN1cnJlbnRUaW1lKSxcbiAgICAgICAgICAgIGN1ckNhcHRpb24gPSB0aGlzLmNhcHRRdWV1ZS5nZXQodGltZSksXG4gICAgICAgICAgICBkZWxDYXB0aW9uID0gdGhpcy5jYXB0UXVldWVTdG9wLmdldCh0aW1lKTtcblxuICAgICAgICBpZiAoY3VyQ2FwdGlvbiAmJiBjdXJDYXB0aW9uLmlkICE9PSB0aGlzLmNhcHRRdWV1ZUluZGV4LmlkKSB7XG4gICAgICAgICAgICAvLyBzaG93IGNhcHRpb25cbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlSW5kZXggPSBjdXJDYXB0aW9uO1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9ucy5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYXB0aW9uLWlkPVwiJHtjdXJDYXB0aW9uLmlkfVwiXWApLmNsYXNzTGlzdC5hZGQoJ2NhcHRpb25fYWN0aXZlJyk7XG4gICAgICAgICAgICBDSGVscGVycy5sb2dNZXNzYWdlKGB0b2dnbGVDYXB0aW9ucywgc2hvdyBjYXB0aW9uIGlkID0gJHtjdXJDYXB0aW9uLmlkfSwgb24gJHt0aW1lfSBzZWNgKTtcbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlLmRlbGV0ZSh0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsQ2FwdGlvbikge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGNhcHRpb25cbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlSW5kZXggPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2FwdGlvbnMucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FwdGlvbi1pZD1cIiR7ZGVsQ2FwdGlvbi5pZH1cIl1gKS5jbGFzc0xpc3QuYWRkKCdjYXB0aW9uX291dCcpO1xuICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgdG9nZ2xlQ2FwdGlvbnMsIHJlbW92ZSBjYXB0aW9uIGlkID0gJHtkZWxDYXB0aW9uLmlkfSwgb24gJHt0aW1lfSBzZWNgKTtcbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlU3RvcC5kZWxldGUodGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNvbnN0IG1haW5QYWdlID0gbmV3IENNYWluUGFnZSgpO1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
