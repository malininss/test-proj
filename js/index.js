"use strict";

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.function.name");

require("core-js/modules/es.number.to-fixed");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.promise.finally");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.for-each");

require("core-js/modules/web.dom-collections.iterator");

require("core-js/modules/web.url");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CHelpers = /*#__PURE__*/function () {
  function CHelpers() {
    _classCallCheck(this, CHelpers);
  }

  _createClass(CHelpers, null, [{
    key: "showSpinner",
    value: function showSpinner() {
      var loader = document.querySelector(".loader");
      loader.classList.add('active');
    }
  }, {
    key: "hideSpinner",
    value: function hideSpinner() {
      var loader = document.querySelector(".loader");
      loader.classList.remove('active');
    }
  }, {
    key: "logMessage",
    value: function logMessage(msg) {
      // need to remove this line from prod build or something else
      console.log("MESSG: ".concat(msg)); // --- DEBUG ---
    }
  }, {
    key: "errMessage",
    value: function errMessage(error) {
      console.log("ERROR: ".concat(error));
    }
  }, {
    key: "triggerEvent",
    value: function triggerEvent(type, data) {
      var element = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : document;
      var event = new Event(type, data);
      element.dispatchEvent(event);
    }
  }, {
    key: "fetchData",
    value: function fetchData(url) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'json';
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url);
        request.responseType = type;

        request.onload = function () {
          if (request.status === 200) {
            resolve(request.response);
          } else {
            reject(new Error(request.statusText));
          }
        };

        request.onerror = function () {
          reject(new Error("network error getting ".concat(url)));
        };

        request.send();
      });
    }
  }, {
    key: "checkConnectionSpeed",
    value: function checkConnectionSpeed() {
      return new Promise(function (resolve, reject) {
        var startTime,
            endTime,
            URL = "//static.1tv.ru/player/sanitar/new/misc/img5mb.jpg" + "?r=" + Math.random(),
            size = 4995374,
            // 5.36Mb
        download = new Image(),
            timeout = 30000; // 30 secs

        download.onload = function () {
          endTime = new Date().getTime();
          var speedBps = (size * 8 / (endTime - startTime) / 1000).toFixed(2);
          CHelpers.logMessage('checkUserConnection, speed ' + speedBps + ' mbits per sec');
          resolve(speedBps);
        };

        download.onerror = function () {
          return reject(new Error("checkUserConnection, error downloading ".concat(URL)));
        };

        startTime = new Date().getTime();
        download.src = URL; // abort downloading on timeout

        setTimeout(function () {
          if (!download.complete || !download.naturalWidth) {
            download.src = '';
            reject(new Error("checkUserConnection, timeout downloading ".concat(URL)));
          }
        }, timeout);
      });
    }
  }, {
    key: "checkUserConnection",
    value: function checkUserConnection(cb) {
      var minSpeed = 3; // 3 mbit per sec;

      cb = cb || function () {};

      CHelpers.checkConnectionSpeed(cb).then(function (result) {
        CHelpers.logMessage("connection fast, speed > ".concat(minSpeed, " mbit per sec"));
        cb(result >= minSpeed);
      }, function (error) {
        CHelpers.errMessage(error.message);
        CHelpers.hideSpinner();
        cb(false);
      });
    }
  }]);

  return CHelpers;
}();

var CPlayer = /*#__PURE__*/function () {
  function CPlayer(element, data) {
    _classCallCheck(this, CPlayer);

    this.element = null;
    this.parent = null;
    this.inited = false;
    this.videoSRC = '';
    if (this.initHTML(element, data)) this.inited = true;
  }

  _createClass(CPlayer, [{
    key: "initHTML",
    value: function initHTML(element, data) {
      this.parent = document.getElementById(element);

      if (!this.parent) {
        CHelpers.errMessage('empty parent for video element');
        return false;
      }

      this.element = document.createElement('video');
      this.parent.appendChild(this.element);
      if (data.poster) this.setPoster(data.poster);

      if (!this.element.canPlayType) {
        CHelpers.logMessage('player can not be inited, cant playing video');
        return false;
      }

      this.element.muted = true;
      this.element.autoplay = true;
      return true;
    }
  }, {
    key: "initEvents",
    value: function initEvents() {
      this.element.onloadeddata = function (event) {// this.play();
      };

      this.element.ontimeupdate = function (event) {
        CHelpers.triggerEvent('player.timeupdate', event);
      };
    }
  }, {
    key: "setSource",
    value: function setSource(data) {
      var _this = this;

      if (data.src.webm && this.element.canPlayType("video/webm")) {
        this.videoSRC = data.src.webm;
      }

      if (data.src.mp4 && this.element.canPlayType("video/mp4")) {
        this.videoSRC = data.src.mp4;
      } else if (data.src.ogg && this.element.canPlayType("video/ogg")) {
        this.videoSRC = data.src.ogg;
      }

      if (this.videoSRC) {
        this.fetchVideo(this.videoSRC + '?r=' + Math.random()).then(function (blob) {
          CHelpers.logMessage('video fetched');

          _this.element.setAttribute("src", URL.createObjectURL(blob));
        }).catch(function (error) {
          CHelpers.errMessage('unable to fetch video. ' + error);
        }).finally(function () {
          return CHelpers.hideSpinner();
        });
      }
    }
  }, {
    key: "setPoster",
    value: function setPoster(url) {
      if (url) this.element.setAttribute('poster', url);
    }
  }, {
    key: "fetchVideo",
    value: function fetchVideo(url) {
      if (url) return CHelpers.fetchData(url, 'blob');
    }
  }, {
    key: "play",
    value: function play() {
      if (this.element.paused) this.element.play();
    }
  }, {
    key: "pause",
    value: function pause() {
      if (!this.element.paused) this.element.pause();
    }
  }]);

  return CPlayer;
}();

var GetCoords = /*#__PURE__*/function () {
  function GetCoords() {
    _classCallCheck(this, GetCoords);
  }

  _createClass(GetCoords, null, [{
    key: "getCoords",
    value: function getCoords(element) {
      var box = element.getBoundingClientRect();
      return {
        top: box.top + pageYOffset,
        bottom: box.bottom + pageYOffset
      };
    }
  }]);

  return GetCoords;
}();

var AnchorAdder = /*#__PURE__*/function () {
  function AnchorAdder() {
    _classCallCheck(this, AnchorAdder);

    if (!history.pushState) {
      return;
    }
  }

  _createClass(AnchorAdder, [{
    key: "addAnchor",
    value: function addAnchor(name) {
      var baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      var newUrl = baseUrl + "#".concat(name);
      history.pushState(null, null, newUrl);
    }
  }, {
    key: "anchorsLink",
    get: function get() {
      return document.querySelectorAll('a.anchor');
    }
  }]);

  return AnchorAdder;
}();

var ScreenSlider = /*#__PURE__*/function () {
  function ScreenSlider(id) {
    _classCallCheck(this, ScreenSlider);

    this.mainContainer = document.querySelector("#".concat(id));

    if (!this.mainContainer) {
      throw new Error('Id не передан в конструктор элемента ScreenSlider, либо элемент не найден на странице');
    }

    this.sections = Array.from(this.mainContainer.querySelectorAll('.full-scroll__element'));
    this.fog = this.mainContainer.querySelector('.full-scroll__fog');
    this.smoke1 = this.mainContainer.querySelector('.full-scroll__smoke_bg1');
    this.smoke2 = this.mainContainer.querySelector('.full-scroll__smoke_bg2');
    this.smoke3 = this.mainContainer.querySelector('.full-scroll__smoke_bg3');
    this.smoke1Black = this.mainContainer.querySelector('.full-scroll__smoke_bg1-black');
    this.smoke2Black = this.mainContainer.querySelector('.full-scroll__smoke_bg2-black');
    this.smoke3Black = this.mainContainer.querySelector('.full-scroll__smoke_bg3-black');
    this.activeSmoke1;
    this.activeSmoke2;
    this.activeSmoke3;
    this.colorTheme = 'white';
    this.progressBar = this.mainContainer.querySelector('.full-scroll__progress-bar');
    this.currentSection = '';
    this.scrollDirection;

    if (this.mainContainer.classList.contains('full-scroll__to-standart-scroll')) {
      this.toStandartScroll();
      return;
    }

    this.changeElementVisible();
  }

  _createClass(ScreenSlider, [{
    key: "calcScrollPercent",
    value: function calcScrollPercent() {
      if (this.sections.indexOf(this.currentSection) === this.sections.length - 1) {
        return Math.floor((pageYOffset - GetCoords.getCoords(this.currentSection).top) / (this.currentSection.clientHeight - window.innerHeight) * 100);
      }

      if (this.currentSection) {
        return Math.floor((pageYOffset - GetCoords.getCoords(this.currentSection).top) / this.currentSection.clientHeight * 100);
      }
    }
  }, {
    key: "changeElementVisible",
    value: function changeElementVisible() {
      var _this2 = this;

      this.sections.forEach(function (item) {
        var fixedBlock = item.querySelector('.full-scroll__fixed-wrapper');
        var elemCoords = GetCoords.getCoords(item);

        if (pageYOffset >= elemCoords.top && elemCoords.bottom >= pageYOffset) {
          _this2.currentSection = item;
          fixedBlock.classList.add('full-scroll__fix-state');
        } else {
          fixedBlock.classList.remove('full-scroll__fix-state');
        }

        if (_this2.currentSection === _this2.sections[_this2.sections.length - 1]) {
          if (pageYOffset >= GetCoords.getCoords(_this2.currentSection).bottom - window.innerHeight) {
            fixedBlock.classList.remove('full-scroll__fix-state');
            fixedBlock.classList.add('full-scroll__last-elem');
          } else {
            fixedBlock.classList.remove('full-scroll__last-elem');
          }
        }
      });
    }
  }, {
    key: "setAboveBgOpacity",
    value: function setAboveBgOpacity() {
      if (this.colorTheme === 'white') {
        this.activeSmoke1 = this.smoke1;
        this.activeSmoke2 = this.smoke2;
        this.activeSmoke3 = this.smoke3;
        this.smoke1Black.style.opacity = 0;
        this.smoke2Black.style.opacity = 0;
        this.smoke3Black.style.opacity = 0;
      } else {
        this.activeSmoke1 = this.smoke1Black;
        this.activeSmoke2 = this.smoke2Black;
        this.activeSmoke3 = this.smoke3Black;
        this.smoke1.style.opacity = 0;
        this.smoke3.style.opacity = 0;
        this.smoke3.style.opacity = 0;
      } // Показываем скроллбар


      this.progressBar.style.width = this.calcScrollPercent() + '%'; // Если мы находимся не в области просмотра секции, все слоих сверху display = 'none',
      // Чтобы на других экранах они не перекрывали контент

      if (this.calcScrollPercent() === undefined || this.calcScrollPercent() < 0 || this.calcScrollPercent() > 100) {
        this.fog.style.display = "none";
        this.smoke1.style.display = "none";
        this.smoke2.style.display = "none";
        this.smoke3.style.display = "none";
        this.smoke1Black.style.display = "none";
        this.smoke2Black.style.display = "none";
        this.smoke3Black.style.display = "none";
        this.progressBar.style.width = 0;
        return;
      } else {
        this.fog.style.display = "block";
        this.activeSmoke1.style.display = "block";
        this.activeSmoke2.style.display = "block";
        this.activeSmoke3.style.display = "block";
      } // Обрабатываем скролл вниз


      if (this.direction === 'to-bottom') {
        // Для первого элемента не делаем анимаций "входа"
        if (this.sections.indexOf(this.currentSection) !== 0) {
          // Если скролл меньше 25%, то убираем прозрачность у "тумана".
          // и устанавливаем скорость транзишена, чтобы было плавно.
          if (this.calcScrollPercent() <= 25) {
            this.fog.style.transition = 'opacity 1s';
            this.fog.style.opacity = 0;
          } else {
            // Если нет, то возвращаем транзишн в стандартное положение
            this.fog.style.transition = 'opacity 0.2s';
          }
        } // Для последнего элемента не делаем анимаций "Выхода". 


        if (this.currentSection !== this.sections[this.sections.length - 1]) {
          //  Дым выход
          if (this.calcScrollPercent() >= 55) {
            this.activeSmoke1.style.opacity = 1;
          }

          if (this.calcScrollPercent() >= 65) {
            this.activeSmoke2.style.opacity = 1;
          }

          if (this.calcScrollPercent() >= 70) {
            this.activeSmoke3.style.opacity = 1;
          }

          if (this.calcScrollPercent() >= 75) {
            this.fog.style.opacity = (this.calcScrollPercent() - 75) * 5 + '%';
          }
        } // Дым вход


        if (this.calcScrollPercent() >= 5 && this.calcScrollPercent() < 40 && this.direction === 'to-bottom') {
          this.activeSmoke1.style.opacity = 0;
        }

        if (this.calcScrollPercent() >= 13 && this.calcScrollPercent() < 40 && this.direction === 'to-bottom') {
          this.activeSmoke2.style.opacity = 0;
        }

        if (this.calcScrollPercent() >= 10 && this.calcScrollPercent() < 40 && this.direction === 'to-bottom') {
          this.activeSmoke3.style.opacity = 0;
        }
      }

      if (this.direction === 'to-top') {
        // Для первого элемента не делаем анимаций "входа"
        if (this.sections.indexOf(this.currentSection) !== 0) {
          // Делаем "затенение", если идём вверх
          if (this.calcScrollPercent() <= 25) {
            // console.log(125 - this.calcScrollPercent() * 4 + '%');
            this.fog.style.opacity = 125 - this.calcScrollPercent() * 4 + '%';
          } // Дым при прокрутке вверх


          if (this.calcScrollPercent() <= 15) {
            this.activeSmoke1.style.opacity = 1;
          }

          if (this.calcScrollPercent() <= 23) {
            this.activeSmoke2.style.opacity = 1;
          }

          if (this.calcScrollPercent() <= 35) {
            this.activeSmoke3.style.opacity = 1;
          }
        }

        if (this.calcScrollPercent() >= 85) {
          this.fog.style.transition = 'opacity 1s';
          this.fog.style.opacity = 0;
        } else {
          // Если нет, то возвращаем транзишн в стандартное положение
          this.fog.style.transition = 'opacity 0.2s';
        } // Дым вверх затменение при переходе с предыдущего


        if (this.calcScrollPercent() <= 90 && this.calcScrollPercent() >= 50) {
          this.activeSmoke1.style.opacity = 0;
        }

        if (this.calcScrollPercent() <= 80 && this.calcScrollPercent() >= 50) {
          this.activeSmoke2.style.opacity = 0;
        }

        if (this.calcScrollPercent() <= 75 && this.calcScrollPercent() >= 50) {
          this.activeSmoke3.style.opacity = 0;
        }
      } // Меняем основной цвет


      if (this.calcScrollPercent() >= 40 && this.calcScrollPercent() <= 60) {
        if (window.colorState === 'black') {
          this.setActiveTheme('black');
        } else {
          this.setActiveTheme('white');
        }
      }
    }
  }, {
    key: "setActiveTheme",
    value: function setActiveTheme() {
      var theme = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'white';

      if (theme === 'white') {
        this.colorTheme = 'white';
        this.fog.style.backgroundColor = '#fdf5e6';
      } else {
        this.colorTheme = 'black';
        this.fog.style.backgroundColor = '#030c1a';
      }
    }
  }, {
    key: "toStandartScroll",
    value: function toStandartScroll() {
      this.sections.forEach(function (item) {
        item.classList.add('full-scroll__element-standard-height');
      });
    }
  }]);

  return ScreenSlider;
}();

var ColorSetter = /*#__PURE__*/function () {
  function ColorSetter() {
    _classCallCheck(this, ColorSetter);

    this.allSections = document.querySelectorAll('.black-section');
    this.blackSectionsCoord = this.getBlackSectionsCoords();
  }

  _createClass(ColorSetter, [{
    key: "getBlackSectionsCoords",
    value: function getBlackSectionsCoords() {
      var coords = [];
      this.allSections.forEach(function (item) {
        coords.push([GetCoords.getCoords(item).top, GetCoords.getCoords(item).bottom]);
      });
      return coords;
    }
  }, {
    key: "setColorState",
    value: function setColorState() {
      var colorState;
      this.blackSectionsCoord.forEach(function (item) {
        if (pageYOffset >= item[0] && pageYOffset <= item[1]) {
          colorState = 'black';
        }
      });
      colorState ? window.colorState = colorState : window.colorState = 'white';
    }
  }]);

  return ColorSetter;
}();

var ScrollHandler = /*#__PURE__*/function () {
  function ScrollHandler(sectionSlider, anchorAdder, colorSetter) {
    _classCallCheck(this, ScrollHandler);

    this.sectionSlider = sectionSlider;
    this.anchorAdder = anchorAdder;
    this.colorSetter = colorSetter;
    this.scrollHandler();
  }

  _createClass(ScrollHandler, [{
    key: "scrollHandler",
    value: function scrollHandler() {
      var _this3 = this;

      var offset = pageYOffset;
      document.addEventListener("scroll", function () {
        _this3.colorSetter.setColorState();

        _this3.sectionSlider.changeElementVisible();

        _this3.sectionSlider.setAboveBgOpacity();

        if (pageYOffset - offset < 0) {
          _this3.sectionSlider.direction = 'to-top';
        } else {
          _this3.sectionSlider.direction = 'to-bottom';
        }

        offset = pageYOffset;

        _this3.anchorAdder.anchorsLink.forEach(function (item) {
          var anchorTopCoord = GetCoords.getCoords(item).top;

          if (pageYOffset >= anchorTopCoord && pageYOffset <= anchorTopCoord + 500) {
            _this3.anchorAdder.addAnchor(item.name);
          }
        });
      });
    }
  }]);

  return ScrollHandler;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9zaGFyZWQvSGVscGVycy5qcyIsImNvbW1vbi9zaGFyZWQvVmlkZW8uanMiLCJjb21tb24vc2hhcmVkL0dldENvb3Jkcy5qcyIsImNvbW1vbi9BbmNob3JBZGRlci5qcyIsImNvbW1vbi9TY3JlZW5TbGlkZXIuanMiLCJjb21tb24vQ29sb3JTZXR0ZXIuanMiLCJjb21tb24vU2Nyb2xsSGFuZGxlci5qcyJdLCJuYW1lcyI6WyJDSGVscGVycyIsImxvYWRlciIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsIm1zZyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsInR5cGUiLCJkYXRhIiwiZWxlbWVudCIsImV2ZW50IiwiRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwib25sb2FkIiwic3RhdHVzIiwicmVzcG9uc2UiLCJFcnJvciIsInN0YXR1c1RleHQiLCJvbmVycm9yIiwic2VuZCIsInN0YXJ0VGltZSIsImVuZFRpbWUiLCJVUkwiLCJNYXRoIiwicmFuZG9tIiwic2l6ZSIsImRvd25sb2FkIiwiSW1hZ2UiLCJ0aW1lb3V0IiwiRGF0ZSIsImdldFRpbWUiLCJzcGVlZEJwcyIsInRvRml4ZWQiLCJsb2dNZXNzYWdlIiwic3JjIiwic2V0VGltZW91dCIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiY2IiLCJtaW5TcGVlZCIsImNoZWNrQ29ubmVjdGlvblNwZWVkIiwidGhlbiIsInJlc3VsdCIsImVyck1lc3NhZ2UiLCJtZXNzYWdlIiwiaGlkZVNwaW5uZXIiLCJDUGxheWVyIiwicGFyZW50IiwiaW5pdGVkIiwidmlkZW9TUkMiLCJpbml0SFRNTCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwicG9zdGVyIiwic2V0UG9zdGVyIiwiY2FuUGxheVR5cGUiLCJtdXRlZCIsImF1dG9wbGF5Iiwib25sb2FkZWRkYXRhIiwib250aW1ldXBkYXRlIiwidHJpZ2dlckV2ZW50Iiwid2VibSIsIm1wNCIsIm9nZyIsImZldGNoVmlkZW8iLCJibG9iIiwic2V0QXR0cmlidXRlIiwiY3JlYXRlT2JqZWN0VVJMIiwiY2F0Y2giLCJmaW5hbGx5IiwiZmV0Y2hEYXRhIiwicGF1c2VkIiwicGxheSIsInBhdXNlIiwiR2V0Q29vcmRzIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwicGFnZVlPZmZzZXQiLCJib3R0b20iLCJBbmNob3JBZGRlciIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJuYW1lIiwiYmFzZVVybCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0IiwicGF0aG5hbWUiLCJuZXdVcmwiLCJxdWVyeVNlbGVjdG9yQWxsIiwiU2NyZWVuU2xpZGVyIiwiaWQiLCJtYWluQ29udGFpbmVyIiwic2VjdGlvbnMiLCJBcnJheSIsImZyb20iLCJmb2ciLCJzbW9rZTEiLCJzbW9rZTIiLCJzbW9rZTMiLCJzbW9rZTFCbGFjayIsInNtb2tlMkJsYWNrIiwic21va2UzQmxhY2siLCJhY3RpdmVTbW9rZTEiLCJhY3RpdmVTbW9rZTIiLCJhY3RpdmVTbW9rZTMiLCJjb2xvclRoZW1lIiwicHJvZ3Jlc3NCYXIiLCJjdXJyZW50U2VjdGlvbiIsInNjcm9sbERpcmVjdGlvbiIsImNvbnRhaW5zIiwidG9TdGFuZGFydFNjcm9sbCIsImNoYW5nZUVsZW1lbnRWaXNpYmxlIiwiaW5kZXhPZiIsImxlbmd0aCIsImZsb29yIiwiZ2V0Q29vcmRzIiwiY2xpZW50SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJmb3JFYWNoIiwiaXRlbSIsImZpeGVkQmxvY2siLCJlbGVtQ29vcmRzIiwic3R5bGUiLCJvcGFjaXR5Iiwid2lkdGgiLCJjYWxjU2Nyb2xsUGVyY2VudCIsInVuZGVmaW5lZCIsImRpc3BsYXkiLCJkaXJlY3Rpb24iLCJ0cmFuc2l0aW9uIiwiY29sb3JTdGF0ZSIsInNldEFjdGl2ZVRoZW1lIiwidGhlbWUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJDb2xvclNldHRlciIsImFsbFNlY3Rpb25zIiwiYmxhY2tTZWN0aW9uc0Nvb3JkIiwiZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcyIsImNvb3JkcyIsInB1c2giLCJTY3JvbGxIYW5kbGVyIiwic2VjdGlvblNsaWRlciIsImFuY2hvckFkZGVyIiwiY29sb3JTZXR0ZXIiLCJzY3JvbGxIYW5kbGVyIiwib2Zmc2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldENvbG9yU3RhdGUiLCJzZXRBYm92ZUJnT3BhY2l0eSIsImFuY2hvcnNMaW5rIiwiYW5jaG9yVG9wQ29vcmQiLCJhZGRBbmNob3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQUEsUTs7Ozs7OztrQ0FFQTtBQUNBLFVBQUFDLE1BQUEsR0FBQUMsUUFBQSxDQUFBQyxhQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0FGLE1BQUFBLE1BQUEsQ0FBQUcsU0FBQSxDQUFBQyxHQUFBLENBQUEsUUFBQTtBQUNBOzs7a0NBRUE7QUFDQSxVQUFBSixNQUFBLEdBQUFDLFFBQUEsQ0FBQUMsYUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBRixNQUFBQSxNQUFBLENBQUFHLFNBQUEsQ0FBQUUsTUFBQSxDQUFBLFFBQUE7QUFDQTs7OytCQUVBQyxHLEVBQUE7QUFDQTtBQUNBQyxNQUFBQSxPQUFBLENBQUFDLEdBQUEsa0JBQUFGLEdBQUEsR0FGQSxDQUVBO0FBQ0E7OzsrQkFFQUcsSyxFQUFBO0FBQ0FGLE1BQUFBLE9BQUEsQ0FBQUMsR0FBQSxrQkFBQUMsS0FBQTtBQUNBOzs7aUNBRUFDLEksRUFBQUMsSSxFQUFBO0FBQUEsVUFBQUMsT0FBQSx1RUFBQVgsUUFBQTtBQUNBLFVBQUFZLEtBQUEsR0FBQSxJQUFBQyxLQUFBLENBQUFKLElBQUEsRUFBQUMsSUFBQSxDQUFBO0FBQ0FDLE1BQUFBLE9BQUEs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QUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUFKLGFBQUEsQ0FBQWIsU0FBQSxHQUFBLFFBQUE7QUFDQSxTQUZBLE1BRUE7QUFDQSxVQUFBLE1BQUEsQ0FBQWEsYUFBQSxDQUFBYixTQUFBLEdBQUEsV0FBQTtBQUNBOztBQUVBaUIsUUFBQUEsTUFBQSxHQUFBdEUsV0FBQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQW1FLFdBQUEsQ0FBQU8sV0FBQSxDQUFBL0IsT0FBQSxDQUFBLFVBQUFDLElBQUEsRUFBQTtBQUNBLGNBQUErQixjQUFBLEdBQUEvRSxTQUFBLENBQUE0QyxTQUFBLENBQUFJLElBQUEsRUFBQTdDLEdBQUE7O0FBRUEsY0FBQUMsV0FBQSxJQUFBMkUsY0FBQSxJQUFBM0UsV0FBQSxJQUFBMkUsY0FBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsTUFBQSxDQUFBUixXQUFBLENBQUFTLFNBQUEsQ0FBQWhDLElBQUEsQ0FBQXZDLElBQUE7QUFDQTtBQUNBLFNBTkE7QUFRQSxPQXJCQTtBQXNCQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENIZWxwZXJzIHtcblxuICAgIHN0YXRpYyBzaG93U3Bpbm5lcigpIHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkZXJcIik7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaGlkZVNwaW5uZXIoKSB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGVyXCIpO1xuICAgICAgICBsb2FkZXIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvZ01lc3NhZ2UobXNnKSB7XG4gICAgICAgIC8vIG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGluZSBmcm9tIHByb2QgYnVpbGQgb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2coYE1FU1NHOiAke21zZ31gKTsgLy8gLS0tIERFQlVHIC0tLVxuICAgIH1cblxuICAgIHN0YXRpYyBlcnJNZXNzYWdlKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBFUlJPUjogJHtlcnJvcn1gKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgdHJpZ2dlckV2ZW50KHR5cGUsIGRhdGEsIGVsZW1lbnQgPSBkb2N1bWVudCkge1xuICAgICAgICBsZXQgZXZlbnQgPSBuZXcgRXZlbnQodHlwZSwgZGF0YSk7XG4gICAgICAgIGVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIGZldGNoRGF0YSh1cmwsIHR5cGU9J2pzb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXF1ZXN0LnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKHJlcXVlc3Quc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3Qub25lcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBuZXR3b3JrIGVycm9yIGdldHRpbmcgJHt1cmx9YCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjaGVja0Nvbm5lY3Rpb25TcGVlZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBzdGFydFRpbWUsIGVuZFRpbWUsXG4gICAgICAgICAgICAgICAgVVJMID0gXCIvL3N0YXRpYy4xdHYucnUvcGxheWVyL3Nhbml0YXIvbmV3L21pc2MvaW1nNW1iLmpwZ1wiICsgXCI/cj1cIiArIE1hdGgucmFuZG9tKCksXG4gICAgICAgICAgICAgICAgc2l6ZSA9IDQ5OTUzNzQsIC8vIDUuMzZNYlxuICAgICAgICAgICAgICAgIGRvd25sb2FkID0gbmV3IEltYWdlKCksXG4gICAgICAgICAgICAgICAgdGltZW91dCA9IDMwMDAwOyAvLyAzMCBzZWNzXG5cbiAgICAgICAgICAgIGRvd25sb2FkLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBlbmRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICBsZXQgc3BlZWRCcHMgPSAoKHNpemUgKiA4KSAvIChlbmRUaW1lIC0gc3RhcnRUaW1lKSAvIDEwMDApLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZSgnY2hlY2tVc2VyQ29ubmVjdGlvbiwgc3BlZWQgJyArIHNwZWVkQnBzICsgJyBtYml0cyBwZXIgc2VjJyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShzcGVlZEJwcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb3dubG9hZC5vbmVycm9yID0gKCkgPT4gcmVqZWN0KG5ldyBFcnJvcihgY2hlY2tVc2VyQ29ubmVjdGlvbiwgZXJyb3IgZG93bmxvYWRpbmcgJHtVUkx9YCkpO1xuICAgICAgICAgICAgc3RhcnRUaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIGRvd25sb2FkLnNyYyA9IFVSTDtcbiAgICAgICAgICAgIC8vIGFib3J0IGRvd25sb2FkaW5nIG9uIHRpbWVvdXRcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRvd25sb2FkLmNvbXBsZXRlIHx8ICFkb3dubG9hZC5uYXR1cmFsV2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkLnNyYyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgY2hlY2tVc2VyQ29ubmVjdGlvbiwgdGltZW91dCBkb3dubG9hZGluZyAke1VSTH1gKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRpbWVvdXRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBjaGVja1VzZXJDb25uZWN0aW9uKGNiKSB7XG4gICAgICAgIGxldCBtaW5TcGVlZCA9IDM7IC8vIDMgbWJpdCBwZXIgc2VjO1xuICAgICAgICBjYiA9IGNiIHx8ICgoKSA9PiB7fSk7XG5cbiAgICAgICAgQ0hlbHBlcnMuY2hlY2tDb25uZWN0aW9uU3BlZWQoY2IpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgICByZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5sb2dNZXNzYWdlKGBjb25uZWN0aW9uIGZhc3QsIHNwZWVkID4gJHttaW5TcGVlZH0gbWJpdCBwZXIgc2VjYCk7XG4gICAgICAgICAgICAgICAgICAgIGNiKHJlc3VsdCA+PSBtaW5TcGVlZCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmVyck1lc3NhZ2UoZXJyb3IubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmhpZGVTcGlubmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGNiKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgIH1cblxufSIsImNsYXNzIENQbGF5ZXIge1xuXG4gICAgY29uc3RydWN0b3IoZWxlbWVudCwgZGF0YSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgICAgIHRoaXMuaW5pdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmlkZW9TUkMgPSAnJztcblxuICAgICAgICBpZiAodGhpcy5pbml0SFRNTChlbGVtZW50LCBkYXRhKSlcbiAgICAgICAgICAgIHRoaXMuaW5pdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbml0SFRNTChlbGVtZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZWxlbWVudCk7XG4gICAgICAgIGlmICghdGhpcy5wYXJlbnQpIHtcbiAgICAgICAgICAgIENIZWxwZXJzLmVyck1lc3NhZ2UoJ2VtcHR5IHBhcmVudCBmb3IgdmlkZW8gZWxlbWVudCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJylcbiAgICAgICAgdGhpcy5wYXJlbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgICAgICAgaWYgKGRhdGEucG9zdGVyKVxuICAgICAgICAgICAgdGhpcy5zZXRQb3N0ZXIoZGF0YS5wb3N0ZXIpO1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5jYW5QbGF5VHlwZSkge1xuICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZSgncGxheWVyIGNhbiBub3QgYmUgaW5pdGVkLCBjYW50IHBsYXlpbmcgdmlkZW8nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQubXV0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQub25sb2FkZWRkYXRhICA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9udGltZXVwZGF0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgQ0hlbHBlcnMudHJpZ2dlckV2ZW50KCdwbGF5ZXIudGltZXVwZGF0ZScsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFNvdXJjZShkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLnNyYy53ZWJtICYmIHRoaXMuZWxlbWVudC5jYW5QbGF5VHlwZShcInZpZGVvL3dlYm1cIikpIHtcbiAgICAgICAgICAgIHRoaXMudmlkZW9TUkMgPSBkYXRhLnNyYy53ZWJtO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLnNyYy5tcDQgJiYgdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKFwidmlkZW8vbXA0XCIpKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU1JDID0gZGF0YS5zcmMubXA0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRhdGEuc3JjLm9nZyAmJiB0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUoXCJ2aWRlby9vZ2dcIikpICB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU1JDID0gZGF0YS5zcmMub2dnO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZpZGVvU1JDKSB7XG4gICAgICAgICAgICB0aGlzLmZldGNoVmlkZW8odGhpcy52aWRlb1NSQyArICc/cj0nICsgTWF0aC5yYW5kb20oKSlcbiAgICAgICAgICAgICAgICAudGhlbigoYmxvYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5sb2dNZXNzYWdlKCd2aWRlbyBmZXRjaGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmVyck1lc3NhZ2UoJ3VuYWJsZSB0byBmZXRjaCB2aWRlby4gJyArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maW5hbGx5KCgpID0+XG4gICAgICAgICAgICAgICAgICAgIENIZWxwZXJzLmhpZGVTcGlubmVyKClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0UG9zdGVyKHVybCkge1xuICAgICAgICBpZiAodXJsKVxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSgncG9zdGVyJywgdXJsKTtcbiAgICB9XG5cbiAgICBmZXRjaFZpZGVvKHVybCkge1xuICAgICAgICBpZiAodXJsKVxuICAgICAgICAgICAgcmV0dXJuIENIZWxwZXJzLmZldGNoRGF0YSh1cmwsJ2Jsb2InKTtcbiAgICB9XG5cbiAgICBwbGF5KCkge1xuICAgICAgICBpZiAodGhpcy5lbGVtZW50LnBhdXNlZClcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5wbGF5KCk7XG4gICAgfVxuXG4gICAgcGF1c2UoKSB7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50LnBhdXNlZClcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5wYXVzZSgpO1xuICAgIH1cbn0iLCJjbGFzcyBHZXRDb29yZHMge1xuICBzdGF0aWMgZ2V0Q29vcmRzKGVsZW1lbnQpIHtcbiAgICBjb25zdCBib3ggPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICBcbiAgICByZXR1cm4ge1xuICAgICAgdG9wOiBib3gudG9wICsgcGFnZVlPZmZzZXQsIFxuICAgICAgYm90dG9tOiBib3guYm90dG9tICsgcGFnZVlPZmZzZXQgIFxuICAgIH07IFxuICB9IFxufSIsImNsYXNzIEFuY2hvckFkZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgaWYgKCFoaXN0b3J5LnB1c2hTdGF0ZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIGFkZEFuY2hvcihuYW1lKSB7XG4gICAgdmFyIGJhc2VVcmwgPSB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyBcIi8vXCIgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICB2YXIgbmV3VXJsID0gYmFzZVVybCArIGAjJHtuYW1lfWA7XG4gICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgbmV3VXJsKTtcbiAgfSBcblxuICBnZXQgYW5jaG9yc0xpbmsgKCkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhLmFuY2hvcicpO1xuICB9XG59IiwiY2xhc3MgU2NyZWVuU2xpZGVyIHtcbiAgY29uc3RydWN0b3IoaWQpIHtcbiAgICB0aGlzLm1haW5Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGAjJHtpZH1gKTtcblxuICAgIGlmICghdGhpcy5tYWluQ29udGFpbmVyKSB7XG4gICAgICB0aHJvdyhuZXcgRXJyb3IoJ0lkINC90LUg0L/QtdGA0LXQtNCw0L0g0LIg0LrQvtC90YHRgtGA0YPQutGC0L7RgCDRjdC70LXQvNC10L3RgtCwIFNjcmVlblNsaWRlciwg0LvQuNCx0L4g0Y3Qu9C10LzQtdC90YIg0L3QtSDQvdCw0LnQtNC10L0g0L3QsCDRgdGC0YDQsNC90LjRhtC1JykpO1xuICAgIH1cblxuICAgIHRoaXMuc2VjdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZnVsbC1zY3JvbGxfX2VsZW1lbnQnKSk7XG4gICAgdGhpcy5mb2cgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19mb2cnKTtcblxuICAgIHRoaXMuc21va2UxID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmcxJyk7XG4gICAgdGhpcy5zbW9rZTIgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzInKTtcbiAgICB0aGlzLnNtb2tlMyA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMycpO1xuXG4gICAgdGhpcy5zbW9rZTFCbGFjayA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMS1ibGFjaycpO1xuICAgIHRoaXMuc21va2UyQmxhY2sgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzItYmxhY2snKTtcbiAgICB0aGlzLnNtb2tlM0JsYWNrID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmczLWJsYWNrJyk7XG4gICAgXG4gICAgdGhpcy5hY3RpdmVTbW9rZTE7XG4gICAgdGhpcy5hY3RpdmVTbW9rZTI7XG4gICAgdGhpcy5hY3RpdmVTbW9rZTM7XG5cbiAgICB0aGlzLmNvbG9yVGhlbWUgPSAnd2hpdGUnO1xuXG4gICAgdGhpcy5wcm9ncmVzc0JhciA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Byb2dyZXNzLWJhcicpO1xuXG4gICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9ICcnO1xuICAgIHRoaXMuc2Nyb2xsRGlyZWN0aW9uO1xuXG4gICAgaWYgKHRoaXMubWFpbkNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ2Z1bGwtc2Nyb2xsX190by1zdGFuZGFydC1zY3JvbGwnKSkge1xuICAgICAgdGhpcy50b1N0YW5kYXJ0U2Nyb2xsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VFbGVtZW50VmlzaWJsZSgpO1xuICAgIFxuICB9XG4gIFxuICBjYWxjU2Nyb2xsUGVyY2VudCgpIHtcbiAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pID09PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChwYWdlWU9mZnNldCAtIEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikudG9wKSAvICh0aGlzLmN1cnJlbnRTZWN0aW9uLmNsaWVudEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCkgICogMTAwKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbikge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHBhZ2VZT2Zmc2V0IC0gR2V0Q29vcmRzLmdldENvb3Jkcyh0aGlzLmN1cnJlbnRTZWN0aW9uKS50b3ApIC8gdGhpcy5jdXJyZW50U2VjdGlvbi5jbGllbnRIZWlnaHQgKiAxMDApO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZUVsZW1lbnRWaXNpYmxlKCkge1xuICAgIHRoaXMuc2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IGZpeGVkQmxvY2sgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fZml4ZWQtd3JhcHBlcicpO1xuICAgICAgY29uc3QgZWxlbUNvb3JkcyA9IEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSk7XG4gICAgICBpZiAocGFnZVlPZmZzZXQgPj0gZWxlbUNvb3Jkcy50b3AgJiYgZWxlbUNvb3Jkcy5ib3R0b20gPj0gcGFnZVlPZmZzZXQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGl0ZW07XG4gICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fZml4LXN0YXRlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTZWN0aW9uID09PSB0aGlzLnNlY3Rpb25zW3RoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikuYm90dG9tIC0gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fZml4LXN0YXRlJyk7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QuYWRkKCdmdWxsLXNjcm9sbF9fbGFzdC1lbGVtJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fbGFzdC1lbGVtJyk7XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgfSk7XG4gIH1cbiAgXG4gIHNldEFib3ZlQmdPcGFjaXR5KCkge1xuXG4gICAgaWYgKHRoaXMuY29sb3JUaGVtZSA9PT0gJ3doaXRlJykge1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEgPSB0aGlzLnNtb2tlMTtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyID0gdGhpcy5zbW9rZTI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMyA9IHRoaXMuc21va2UzO1xuXG4gICAgICB0aGlzLnNtb2tlMUJsYWNrLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgdGhpcy5zbW9rZTJCbGFjay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzQmxhY2suc3R5bGUub3BhY2l0eSA9IDA7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEgPSB0aGlzLnNtb2tlMUJsYWNrO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTIgPSB0aGlzLnNtb2tlMkJsYWNrO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMgPSB0aGlzLnNtb2tlM0JsYWNrO1xuXG4gICAgICB0aGlzLnNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgdGhpcy5zbW9rZTMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfVxuXG4gICAgLy8g0J/QvtC60LDQt9GL0LLQsNC10Lwg0YHQutGA0L7Qu9C70LHQsNGAXG4gICAgdGhpcy5wcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSArICclJztcbiAgICBcbiAgICAvLyDQldGB0LvQuCDQvNGLINC90LDRhdC+0LTQuNC80YHRjyDQvdC1INCyINC+0LHQu9Cw0YHRgtC4INC/0YDQvtGB0LzQvtGC0YDQsCDRgdC10LrRhtC40LgsINCy0YHQtSDRgdC70L7QuNGFINGB0LLQtdGA0YXRgyBkaXNwbGF5ID0gJ25vbmUnLFxuICAgIC8vINCn0YLQvtCx0Ysg0L3QsCDQtNGA0YPQs9C40YUg0Y3QutGA0LDQvdCw0YUg0L7QvdC4INC90LUg0L/QtdGA0LXQutGA0YvQstCw0LvQuCDQutC+0L3RgtC10L3RglxuXG4gICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDAgfHwgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID4gMTAwKSB7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgIHRoaXMuc21va2UxLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgdGhpcy5zbW9rZTFCbGFjay5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMkJsYWNrLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UzQmxhY2suc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICB0aGlzLnByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gMDtcblxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH1cblxuICAgIC8vINCe0LHRgNCw0LHQsNGC0YvQstCw0LXQvCDRgdC60YDQvtC70Lsg0LLQvdC40LdcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG5cbiAgICAgIC8vINCU0LvRjyDQv9C10YDQstC+0LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQstGF0L7QtNCwXCJcbiAgICAgIGlmICh0aGlzLnNlY3Rpb25zLmluZGV4T2YodGhpcy5jdXJyZW50U2VjdGlvbikgIT09IDApIHtcblxuICAgICAgICAvLyDQldGB0LvQuCDRgdC60YDQvtC70Lsg0LzQtdC90YzRiNC1IDI1JSwg0YLQviDRg9Cx0LjRgNCw0LXQvCDQv9GA0L7Qt9GA0LDRh9C90L7RgdGC0Ywg0YMgXCLRgtGD0LzQsNC90LBcIi5cbiAgICAgICAgLy8g0Lgg0YPRgdGC0LDQvdCw0LLQu9C40LLQsNC10Lwg0YHQutC+0YDQvtGB0YLRjCDRgtGA0LDQvdC30LjRiNC10L3QsCwg0YfRgtC+0LHRiyDQsdGL0LvQviDQv9C70LDQstC90L4uXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjUpIHtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMXMnO1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vINCV0YHQu9C4INC90LXRgiwg0YLQviDQstC+0LfQstGA0LDRidCw0LXQvCDRgtGA0LDQvdC30LjRiNC9INCyINGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0L/QvtC70L7QttC10L3QuNC1XG4gICAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuMnMnO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8g0JTQu9GPINC/0L7RgdC70LXQtNC90LXQs9C+INGN0LvQtdC80LXQvdGC0LAg0L3QtSDQtNC10LvQsNC10Lwg0LDQvdC40LzQsNGG0LjQuSBcItCS0YvRhdC+0LTQsFwiLiBcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTZWN0aW9uICE9PSB0aGlzLnNlY3Rpb25zW3RoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMV0pIHtcblxuICAgICAgICAvLyAg0JTRi9C8INCy0YvRhdC+0LRcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1NSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNjUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDcwKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA3NSkge1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIC0gNzUpICogNSArICclJztcbiAgICAgICAgfSBcbiAgICAgIH1cblxuXG4gICAgICAvLyDQlNGL0Lwg0LLRhdC+0LRcbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNSAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCA0MCAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLWJvdHRvbScpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTEuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDEzICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDQwICYmIHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gMTAgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDwgNDAgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcblxuICAgIH1cblxuXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAndG8tdG9wJykge1xuICAgICAgLy8g0JTQu9GPINC/0LXRgNCy0L7Qs9C+INGN0LvQtdC80LXQvdGC0LAg0L3QtSDQtNC10LvQsNC10Lwg0LDQvdC40LzQsNGG0LjQuSBcItCy0YXQvtC00LBcIlxuICAgICAgXG4gICAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pICE9PSAwKSB7XG5cbiAgICAgICAgLy8g0JTQtdC70LDQtdC8IFwi0LfQsNGC0LXQvdC10L3QuNC1XCIsINC10YHQu9C4INC40LTRkdC8INCy0LLQtdGA0YVcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAyNSkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKDEyNSAtIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSAqIDQgKyAnJScpO1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAxMjUgLSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKiA0ICsgJyUnO1xuICAgICAgICB9IFxuXG4gICAgICAgIC8vINCU0YvQvCDQv9GA0Lgg0L/RgNC+0LrRgNGD0YLQutC1INCy0LLQtdGA0YVcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAxNSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjMpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDM1KSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gODUpIHtcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDQldGB0LvQuCDQvdC10YIsINGC0L4g0LLQvtC30LLRgNCw0YnQsNC10Lwg0YLRgNCw0L3Qt9C40YjQvSDQsiDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC/0L7Qu9C+0LbQtdC90LjQtVxuICAgICAgICB0aGlzLmZvZy5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC4ycyc7XG4gICAgICB9XG5cbiAgICAgIC8vINCU0YvQvCDQstCy0LXRgNGFINC30LDRgtC80LXQvdC10L3QuNC1INC/0YDQuCDQv9C10YDQtdGF0L7QtNC1INGBINC/0YDQtdC00YvQtNGD0YnQtdCz0L5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gOTAgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUwKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcbiAgXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDgwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1MCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG4gIFxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA3NSAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuICAgICAgXG4gICAgfVxuXG4gICAgLy8g0JzQtdC90Y/QtdC8INC+0YHQvdC+0LLQvdC+0Lkg0YbQstC10YJcbiAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDQwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA2MCkge1xuICAgICAgaWYgKHdpbmRvdy5jb2xvclN0YXRlID09PSAnYmxhY2snKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlVGhlbWUoJ2JsYWNrJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZVRoZW1lKCd3aGl0ZScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEFjdGl2ZVRoZW1lKHRoZW1lID0gJ3doaXRlJykge1xuICAgIGlmICh0aGVtZSA9PT0gJ3doaXRlJykge1xuICAgICAgdGhpcy5jb2xvclRoZW1lID0gJ3doaXRlJztcbiAgICAgIHRoaXMuZm9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZmRmNWU2JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2xvclRoZW1lID0gJ2JsYWNrJztcbiAgICAgIHRoaXMuZm9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMDMwYzFhJztcbiAgICB9XG4gIH1cblxuICB0b1N0YW5kYXJ0U2Nyb2xsKCkge1xuICAgIHRoaXMuc2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2VsZW1lbnQtc3RhbmRhcmQtaGVpZ2h0Jyk7XG4gICAgfSk7XG4gIH1cbiAgXG59IiwiY2xhc3MgQ29sb3JTZXR0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmFsbFNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJsYWNrLXNlY3Rpb24nKTtcbiAgICB0aGlzLmJsYWNrU2VjdGlvbnNDb29yZCA9IHRoaXMuZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcygpO1xuICB9XG5cbiAgZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcygpIHtcbiAgICBjb25zdCBjb29yZHMgPSBbXVxuICAgIFxuICAgIHRoaXMuYWxsU2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvb3Jkcy5wdXNoKFtHZXRDb29yZHMuZ2V0Q29vcmRzKGl0ZW0pLnRvcCwgR2V0Q29vcmRzLmdldENvb3JkcyhpdGVtKS5ib3R0b21dKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29vcmRzO1xuICB9XG5cbiAgc2V0Q29sb3JTdGF0ZSgpIHtcbiAgICBsZXQgY29sb3JTdGF0ZTtcblxuICAgIHRoaXMuYmxhY2tTZWN0aW9uc0Nvb3JkLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAocGFnZVlPZmZzZXQgPj0gaXRlbVswXSAmJiBwYWdlWU9mZnNldCA8PSBpdGVtWzFdKSB7XG4gICAgICAgIGNvbG9yU3RhdGUgPSAnYmxhY2snO1xuICAgICAgfVxuICAgIH0pXG4gICAgY29sb3JTdGF0ZSA/IHdpbmRvdy5jb2xvclN0YXRlID0gY29sb3JTdGF0ZSA6IHdpbmRvdy5jb2xvclN0YXRlID0gJ3doaXRlJ1xuICB9XG59IiwiY2xhc3MgU2Nyb2xsSGFuZGxlciB7XG4gIGNvbnN0cnVjdG9yKHNlY3Rpb25TbGlkZXIsIGFuY2hvckFkZGVyLCBjb2xvclNldHRlcikge1xuICAgIHRoaXMuc2VjdGlvblNsaWRlciA9IHNlY3Rpb25TbGlkZXI7XG4gICAgdGhpcy5hbmNob3JBZGRlciA9IGFuY2hvckFkZGVyO1xuICAgIHRoaXMuY29sb3JTZXR0ZXIgPSBjb2xvclNldHRlcjtcblxuICAgIHRoaXMuc2Nyb2xsSGFuZGxlcigpO1xuICB9XG5cbiAgc2Nyb2xsSGFuZGxlcigpIHtcbiAgICBsZXQgb2Zmc2V0ID0gcGFnZVlPZmZzZXQ7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgIHRoaXMuY29sb3JTZXR0ZXIuc2V0Q29sb3JTdGF0ZSgpO1xuICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLmNoYW5nZUVsZW1lbnRWaXNpYmxlKCk7XG4gICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuc2V0QWJvdmVCZ09wYWNpdHkoKTtcblxuICAgICAgaWYgKHBhZ2VZT2Zmc2V0IC0gb2Zmc2V0IDwgMCkge1xuICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuZGlyZWN0aW9uID0gJ3RvLXRvcCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuZGlyZWN0aW9uID0gJ3RvLWJvdHRvbSc7XG4gICAgICB9XG5cbiAgICAgIG9mZnNldCA9IHBhZ2VZT2Zmc2V0O1xuXG4gICAgICB0aGlzLmFuY2hvckFkZGVyLmFuY2hvcnNMaW5rLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGxldCBhbmNob3JUb3BDb29yZCA9IEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSkudG9wO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGFuY2hvclRvcENvb3JkICYmIHBhZ2VZT2Zmc2V0IDw9IGFuY2hvclRvcENvb3JkICsgNTAwKSB7XG4gICAgICAgICAgdGhpcy5hbmNob3JBZGRlci5hZGRBbmNob3IoaXRlbS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgIH0pO1xuICB9XG59XG4iXX0=
