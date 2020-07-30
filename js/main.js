"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.map");

require("core-js/modules/es.math.trunc");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

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
      _this.data = result; // check that we can play video, then render html video

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

      document.addEventListener('player.timeupdate', function () {
        _this2.toggleCaptions(_this2.player.element.currentTime);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOlsiQ01haW5QYWdlIiwicGxheWVySUQiLCJwbGF5ZXIiLCJkYXRhIiwiZGF0YVVSTCIsImNhcHRpb25zIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImNhcHRRdWV1ZSIsIk1hcCIsImNhcHRRdWV1ZVN0b3AiLCJjYXB0UXVldWVJbmRleCIsIkNIZWxwZXJzIiwic2hvd1NwaW5uZXIiLCJmZXRjaERhdGEiLCJ0aGVuIiwicmVzdWx0IiwiaW5pdFBsYXllciIsInZpZGVvIiwiY2hlY2tVc2VyQ29ubmVjdGlvbiIsImxvZ01lc3NhZ2UiLCJoaWRlU3Bpbm5lciIsImluaXRFdmVudHMiLCJzZXRTb3VyY2UiLCJpbml0Q2FwdGlvbnMiLCJlcnJvciIsImVyck1lc3NhZ2UiLCJlbGVtZW50IiwiQ1BsYXllciIsImluaXRlZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJ0b2dnbGVDYXB0aW9ucyIsImN1cnJlbnRUaW1lIiwiZm9yRWFjaCIsImNhcHRpb24iLCJzZXQiLCJzdGFydCIsInN0b3AiLCJyZW5kZXJDYXB0aW9uIiwibWFya3VwIiwiaWQiLCJ0b3AiLCJyaWdodCIsImJvdHRvbSIsImxlZnQiLCJocmVmIiwic2l6ZSIsInRpdGxlIiwiaW5zZXJ0QWRqYWNlbnRIVE1MIiwidGltZSIsIk1hdGgiLCJ0cnVuYyIsImN1ckNhcHRpb24iLCJnZXQiLCJkZWxDYXB0aW9uIiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImFkZCIsImRlbGV0ZSIsIm1haW5QYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFNQSxTO0FBRUYsdUJBQWM7QUFBQTs7QUFBQTs7QUFFVixTQUFLQyxRQUFMLEdBQWdCLFlBQWhCO0FBQ0EsU0FBS0MsTUFBTCxHQUFjLElBQWQ7QUFDQSxTQUFLQyxJQUFMLEdBQVksRUFBWjtBQUNBLFNBQUtDLE9BQUwsR0FBZSxzQkFBZjtBQUVBLFNBQUtDLFFBQUwsR0FBZ0JDLFFB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QUFRLENBQUNRLFVBQVQsK0NBQTJEa0MsVUFBVSxDQUFDZCxFQUF0RSxrQkFBZ0ZTLElBQWhGO0FBQ0EsYUFBS3ZDLGFBQUwsQ0FBbUJnRCxNQUFuQixDQUEwQlQsSUFBMUI7QUFDSDtBQUNKOzs7Ozs7QUFHTCxJQUFNVSxRQUFRLEdBQUcsSUFBSTNELFNBQUosRUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDTWFpblBhZ2Uge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXJJRCA9ICdtYWluLXZpZGVvJ1xuICAgICAgICB0aGlzLnBsYXllciA9IG51bGw7XG4gICAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgICAgICB0aGlzLmRhdGFVUkwgPSAnanNvbi9tYWluLXZpZGVvLmpzb24nO1xuXG4gICAgICAgIHRoaXMuY2FwdGlvbnMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmFja2dyb3VuZC1jYXB0aW9ucycpO1xuICAgICAgICB0aGlzLmNhcHRRdWV1ZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5jYXB0UXVldWVTdG9wID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLmNhcHRRdWV1ZUluZGV4ID0gZmFsc2U7XG5cbiAgICAgICAgLy8gZ2V0IEpTT04gZGF0YSAodmlkZW8gc291cmNlLCBzcGxhc2gsIGNhcHRpb25zKVxuICAgICAgICBDSGVscGVycy5zaG93U3Bpbm5lcigpO1xuICAgICAgICBDSGVscGVycy5mZXRjaERhdGEodGhpcy5kYXRhVVJMKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAvLyBjaGVjayB0aGF0IHdlIGNhbiBwbGF5IHZpZGVvLCB0aGVuIHJlbmRlciBodG1sIHZpZGVvXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmluaXRQbGF5ZXIodGhpcy5wbGF5ZXJJRCwgdGhpcy5kYXRhLnZpZGVvKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hlY2sgdXNlciBjb25uZWN0aW9uIHNwZWVkXG4gICAgICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5jaGVja1VzZXJDb25uZWN0aW9uKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoYHNsb3cgY29ubmVjdGlvbiwgc2hvdyBzdGF0aWMgYmFja2dyb3VuZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZhc3QgY29ubmVjdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXllci5pbml0RXZlbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnNldFNvdXJjZSh0aGlzLmRhdGEudmlkZW8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXRFdmVudHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FwdGlvbnModGhpcy5kYXRhLmNhcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoYGNhblxcYHQgcGxheSB2aWRlbywgc2hvdyBzdGF0aWMgYmFja2dyb3VuZGApO1xuICAgICAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMuaGlkZVNwaW5uZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKGBKU09OIGZldGNoaW5nIGVycm9yLCBcIiR7ZXJyb3J9XCJgKTtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMuaGlkZVNwaW5uZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgIH1cblxuICAgIGluaXRQbGF5ZXIoZWxlbWVudCwgZGF0YSkge1xuICAgICAgICB0aGlzLnBsYXllciA9IG5ldyBDUGxheWVyKGVsZW1lbnQsIGRhdGEpO1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXIuaW5pdGVkO1xuICAgIH1cblxuICAgIGluaXRFdmVudHMoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXllci50aW1ldXBkYXRlJywgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVDYXB0aW9ucyh0aGlzLnBsYXllci5lbGVtZW50LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGluaXRDYXB0aW9ucyhkYXRhKSB7XG4gICAgICAgIGlmKGRhdGEpIHtcbiAgICAgICAgICAgIGRhdGEuZm9yRWFjaCgoY2FwdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHF1ZXVlIHRvIHNob3cgY2FwdGlvbiBvbiBzdGFydCB0aW1lXG4gICAgICAgICAgICAgICAgdGhpcy5jYXB0UXVldWUuc2V0KGNhcHRpb24uc3RhcnQsIGNhcHRpb24pO1xuICAgICAgICAgICAgICAgIC8vIHF1ZXVlIHRvIHJlbW92ZSBjYXB0aW9uIG9uIHN0b3AgdGltZVxuICAgICAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlU3RvcC5zZXQoY2FwdGlvbi5zdG9wLCBjYXB0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckNhcHRpb24odGhpcy5jYXB0aW9ucywgY2FwdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlckNhcHRpb24oZWxlbWVudCwgY2FwdGlvbikge1xuICAgICAgICBsZXQgbWFya3VwID0gYFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcHRpb25cIiBkYXRhLWNhcHRpb24taWQ9XCIke2NhcHRpb24uaWR9XCIgZGF0YS1jYXB0aW9uLXN0YXJ0PVwiJHtjYXB0aW9uLnN0YXJ0fVwiIGRhdGEtY2FwdGlvbi1zdG9wPVwiJHtjYXB0aW9uLnN0b3B9XCIgXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJ0b3A6ICR7Y2FwdGlvbi50b3B9OyByaWdodDogJHtjYXB0aW9uLnJpZ2h0fTsgYm90dG9tOiAke2NhcHRpb24uYm90dG9tfTsgbGVmdDogJHtjYXB0aW9uLmxlZnR9OyBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FwdGlvbl9fdGl0bGVcIj48YSBocmVmPVwiJHtjYXB0aW9uLmhyZWZ9XCIgc3R5bGU9XCJmb250LXNpemU6ICR7Y2FwdGlvbi5zaXplfTtcIj4ke2NhcHRpb24udGl0bGV9PC9hPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgZWxlbWVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWVuZCcsIG1hcmt1cCk7XG4gICAgfVxuXG4gICAgdG9nZ2xlQ2FwdGlvbnMoKSB7XG4gICAgICAgIGxldCB0aW1lID0gTWF0aC50cnVuYyh0aGlzLnBsYXllci5lbGVtZW50LmN1cnJlbnRUaW1lKSxcbiAgICAgICAgICAgIGN1ckNhcHRpb24gPSB0aGlzLmNhcHRRdWV1ZS5nZXQodGltZSksXG4gICAgICAgICAgICBkZWxDYXB0aW9uID0gdGhpcy5jYXB0UXVldWVTdG9wLmdldCh0aW1lKTtcblxuICAgICAgICBpZiAoY3VyQ2FwdGlvbiAmJiBjdXJDYXB0aW9uLmlkICE9PSB0aGlzLmNhcHRRdWV1ZUluZGV4LmlkKSB7XG4gICAgICAgICAgICAvLyBzaG93IGNhcHRpb25cbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlSW5kZXggPSBjdXJDYXB0aW9uO1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9ucy5xdWVyeVNlbGVjdG9yKGBbZGF0YS1jYXB0aW9uLWlkPVwiJHtjdXJDYXB0aW9uLmlkfVwiXWApLmNsYXNzTGlzdC5hZGQoJ2NhcHRpb25fYWN0aXZlJyk7XG4gICAgICAgICAgICBDSGVscGVycy5sb2dNZXNzYWdlKGB0b2dnbGVDYXB0aW9ucywgc2hvdyBjYXB0aW9uIGlkID0gJHtjdXJDYXB0aW9uLmlkfSwgb24gJHt0aW1lfSBzZWNgKTtcbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlLmRlbGV0ZSh0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVsQ2FwdGlvbikge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGNhcHRpb25cbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlSW5kZXggPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2FwdGlvbnMucXVlcnlTZWxlY3RvcihgW2RhdGEtY2FwdGlvbi1pZD1cIiR7ZGVsQ2FwdGlvbi5pZH1cIl1gKS5jbGFzc0xpc3QuYWRkKCdjYXB0aW9uX291dCcpO1xuICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgdG9nZ2xlQ2FwdGlvbnMsIHJlbW92ZSBjYXB0aW9uIGlkID0gJHtkZWxDYXB0aW9uLmlkfSwgb24gJHt0aW1lfSBzZWNgKTtcbiAgICAgICAgICAgIHRoaXMuY2FwdFF1ZXVlU3RvcC5kZWxldGUodGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNvbnN0IG1haW5QYWdlID0gbmV3IENNYWluUGFnZSgpO1xuIl0sImZpbGUiOiJtYWluLmpzIn0=
