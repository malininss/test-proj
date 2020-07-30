"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

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

    this.sections = _toConsumableArray(this.mainContainer.querySelectorAll('.full-scroll__element'));
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9zaGFyZWQvSGVscGVycy5qcyIsImNvbW1vbi9zaGFyZWQvVmlkZW8uanMiLCJjb21tb24vc2hhcmVkL0dldENvb3Jkcy5qcyIsImNvbW1vbi9BbmNob3JBZGRlci5qcyIsImNvbW1vbi9TY3JlZW5TbGlkZXIuanMiLCJjb21tb24vQ29sb3JTZXR0ZXIuanMiLCJjb21tb24vU2Nyb2xsSGFuZGxlci5qcyJdLCJuYW1lcyI6WyJDSGVscGVycyIsImxvYWRlciIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsIm1zZyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsInR5cGUiLCJkYXRhIiwiZWxlbWVudCIsImV2ZW50IiwiRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwib25sb2FkIiwic3RhdHVzIiwicmVzcG9uc2UiLCJFcnJvciIsInN0YXR1c1RleHQiLCJvbmVycm9yIiwic2VuZCIsInN0YXJ0VGltZSIsImVuZFRpbWUiLCJVUkwiLCJNYXRoIiwicmFuZG9tIiwic2l6ZSIsImRvd25sb2FkIiwiSW1hZ2UiLCJ0aW1lb3V0IiwiRGF0ZSIsImdldFRpbWUiLCJzcGVlZEJwcyIsInRvRml4ZWQiLCJsb2dNZXNzYWdlIiwic3JjIiwic2V0VGltZW91dCIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiY2IiLCJtaW5TcGVlZCIsImNoZWNrQ29ubmVjdGlvblNwZWVkIiwidGhlbiIsInJlc3VsdCIsImVyck1lc3NhZ2UiLCJtZXNzYWdlIiwiaGlkZVNwaW5uZXIiLCJDUGxheWVyIiwicGFyZW50IiwiaW5pdGVkIiwidmlkZW9TUkMiLCJpbml0SFRNTCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwicG9zdGVyIiwic2V0UG9zdGVyIiwiY2FuUGxheVR5cGUiLCJtdXRlZCIsImF1dG9wbGF5Iiwib25sb2FkZWRkYXRhIiwib250aW1ldXBkYXRlIiwidHJpZ2dlckV2ZW50Iiwid2VibSIsIm1wNCIsIm9nZyIsImZldGNoVmlkZW8iLCJibG9iIiwic2V0QXR0cmlidXRlIiwiY3JlYXRlT2JqZWN0VVJMIiwiY2F0Y2giLCJmaW5hbGx5IiwiZmV0Y2hEYXRhIiwicGF1c2VkIiwicGxheSIsInBhdXNlIiwiR2V0Q29vcmRzIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwicGFnZVlPZmZzZXQiLCJib3R0b20iLCJBbmNob3JBZGRlciIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJuYW1lIiwiYmFzZVVybCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0IiwicGF0aG5hbWUiLCJuZXdVcmwiLCJxdWVyeVNlbGVjdG9yQWxsIiwiU2NyZWVuU2xpZGVyIiwiaWQiLCJtYWluQ29udGFpbmVyIiwic2VjdGlvbnMiLCJmb2ciLCJzbW9rZTEiLCJzbW9rZTIiLCJzbW9rZTMiLCJzbW9rZTFCbGFjayIsInNtb2tlMkJsYWNrIiwic21va2UzQmxhY2siLCJhY3RpdmVTbW9rZTEiLCJhY3RpdmVTbW9rZTIiLCJhY3RpdmVTbW9rZTMiLCJjb2xvclRoZW1lIiwicHJvZ3Jlc3NCYXIiLCJjdXJyZW50U2VjdGlvbiIsInNjcm9sbERpcmVjdGlvbiIsImNvbnRhaW5zIiwidG9TdGFuZGFydFNjcm9sbCIsImNoYW5nZUVsZW1lbnRWaXNpYmxlIiwiaW5kZXhPZiIsImxlbmd0aCIsImZsb29yIiwiZ2V0Q29vcmRzIiwiY2xpZW50SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJmb3JFYWNoIiwiaXRlbSIsImZpeGVkQmxvY2siLCJlbGVtQ29vcmRzIiwic3R5bGUiLCJvcGFjaXR5Iiwid2lkdGgiLCJjYWxjU2Nyb2xsUGVyY2VudCIsInVuZGVmaW5lZCIsImRpc3BsYXkiLCJkaXJlY3Rpb24iLCJ0cmFuc2l0aW9uIiwiY29sb3JTdGF0ZSIsInNldEFjdGl2ZVRoZW1lIiwidGhlbWUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJDb2xvclNldHRlciIsImFsbFNlY3Rpb25zIiwiYmxhY2tTZWN0aW9uc0Nvb3JkIiwiZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcyIsImNvb3JkcyIsInB1c2giLCJTY3JvbGxIYW5kbGVyIiwic2VjdGlvblNsaWRlciIsImFuY2hvckFkZGVyIiwiY29sb3JTZXR0ZXIiLCJzY3JvbGxIYW5kbGVyIiwib2Zmc2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldENvbG9yU3RhdGUiLCJzZXRBYm92ZUJnT3BhY2l0eSIsImFuY2hvcnNMaW5rIiwiYW5jaG9yVG9wQ29vcmQiLCJhZGRBbmNob3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUFBLFE7Ozs7Ozs7a0NBRUE7QUFDQSxVQUFBQyxNQUFBLEdBQUFDLFFBQUEsQ0FBQUMsYUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBRixNQUFBQSxNQUFBLENBQUFHLFNBQUEsQ0FBQUMsR0FBQSxDQUFBLFFBQUE7QUFDQTs7O2tDQUVBO0FBQ0EsVUFBQUosTUFBQSxHQUFBQyxRQUFBLENBQUFDLGFBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQUYsTUFBQUEsTUFBQSxDQUFBRyxTQUFBLENBQUFFLE1BQUEsQ0FBQSxRQUFBO0FBQ0E7OzsrQkFFQUMsRyxFQUFBO0FBQ0E7QUFDQUMsTUFBQUEsT0FBQSxDQUFBQyxHQUFBLGtCQUFBRixHQUFBLEdBRkEsQ0FFQTtBQUNBOzs7K0JBRUFHLEssRUFBQTtBQUNBRixNQUFBQSxPQUFBLENBQUFDLEdBQUEsa0JBQUFDLEtBQUE7QUFDQTs7O2lDQUVBQyxJLEVBQUFDLEksRUFBQTtBQUFBLFVBQUFDLE9BQUEsdUVBQUFYLFFBQUE7QUFDQSxVQUFBWSxLQUFBLEdBQUEsSUFBQUMsS0FBQSxDQUFBSixJQUFBLEVBQUFDLElBQUEsQ0FBQTtBQUNBQyxNQUFBQSxPQUFBLENBQUFHLGFBQUEsQ0FBQUYsS0FBQTtBQUNBOzs7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R0FBQSxRQUFBO0FBQ0EsU0FGQSxNQUVBO0FBQ0EsVUFBQSxNQUFBLENBQUFhLGFBQUEsQ0FBQWIsU0FBQSxHQUFBLFdBQUE7QUFDQTs7QUFFQWlCLFFBQUFBLE1BQUEsR0FBQXBFLFdBQUE7O0FBRUEsUUFBQSxNQUFBLENBQUFpRSxXQUFBLENBQUFPLFdBQUEsQ0FBQS9CLE9BQUEsQ0FBQSxVQUFBQyxJQUFBLEVBQUE7QUFDQSxjQUFBK0IsY0FBQSxHQUFBN0UsU0FBQSxDQUFBMEMsU0FBQSxDQUFBSSxJQUFBLEVBQUEzQyxHQUFBOztBQUVBLGNBQUFDLFdBQUEsSUFBQXlFLGNBQUEsSUFBQXpFLFdBQUEsSUFBQXlFLGNBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLE1BQUEsQ0FBQVIsV0FBQSxDQUFBUyxTQUFBLENBQUFoQyxJQUFBLENBQUFyQyxJQUFBO0FBQ0E7QUFDQSxTQU5BO0FBUUEsT0FyQkE7QUFzQkEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDSGVscGVycyB7XG5cbiAgICBzdGF0aWMgc2hvd1NwaW5uZXIoKSB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGVyXCIpO1xuICAgICAgICBsb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGhpZGVTcGlubmVyKCkge1xuICAgICAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRlclwiKTtcbiAgICAgICAgbG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2dNZXNzYWdlKG1zZykge1xuICAgICAgICAvLyBuZWVkIHRvIHJlbW92ZSB0aGlzIGxpbmUgZnJvbSBwcm9kIGJ1aWxkIG9yIHNvbWV0aGluZyBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBNRVNTRzogJHttc2d9YCk7IC8vIC0tLSBERUJVRyAtLS1cbiAgICB9XG5cbiAgICBzdGF0aWMgZXJyTWVzc2FnZShlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgRVJST1I6ICR7ZXJyb3J9YCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHRyaWdnZXJFdmVudCh0eXBlLCBkYXRhLCBlbGVtZW50ID0gZG9jdW1lbnQpIHtcbiAgICAgICAgbGV0IGV2ZW50ID0gbmV3IEV2ZW50KHR5cGUsIGRhdGEpO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmZXRjaERhdGEodXJsLCB0eXBlPSdqc29uJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgbmV0d29yayBlcnJvciBnZXR0aW5nICR7dXJsfWApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tDb25uZWN0aW9uU3BlZWQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RhcnRUaW1lLCBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIFVSTCA9IFwiLy9zdGF0aWMuMXR2LnJ1L3BsYXllci9zYW5pdGFyL25ldy9taXNjL2ltZzVtYi5qcGdcIiArIFwiP3I9XCIgKyBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgICAgIHNpemUgPSA0OTk1Mzc0LCAvLyA1LjM2TWJcbiAgICAgICAgICAgICAgICBkb3dubG9hZCA9IG5ldyBJbWFnZSgpLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSAzMDAwMDsgLy8gMzAgc2Vjc1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNwZWVkQnBzID0gKChzaXplICogOCkgLyAoZW5kVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoJ2NoZWNrVXNlckNvbm5lY3Rpb24sIHNwZWVkICcgKyBzcGVlZEJwcyArICcgbWJpdHMgcGVyIHNlYycpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc3BlZWRCcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG93bmxvYWQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIGVycm9yIGRvd25sb2FkaW5nICR7VVJMfWApKTtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBkb3dubG9hZC5zcmMgPSBVUkw7XG4gICAgICAgICAgICAvLyBhYm9ydCBkb3dubG9hZGluZyBvbiB0aW1lb3V0XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkb3dubG9hZC5jb21wbGV0ZSB8fCAhZG93bmxvYWQubmF0dXJhbFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZC5zcmMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIHRpbWVvdXQgZG93bmxvYWRpbmcgJHtVUkx9YCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tVc2VyQ29ubmVjdGlvbihjYikge1xuICAgICAgICBsZXQgbWluU3BlZWQgPSAzOyAvLyAzIG1iaXQgcGVyIHNlYztcbiAgICAgICAgY2IgPSBjYiB8fCAoKCkgPT4ge30pO1xuXG4gICAgICAgIENIZWxwZXJzLmNoZWNrQ29ubmVjdGlvblNwZWVkKGNiKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgY29ubmVjdGlvbiBmYXN0LCBzcGVlZCA+ICR7bWluU3BlZWR9IG1iaXQgcGVyIHNlY2ApO1xuICAgICAgICAgICAgICAgICAgICBjYihyZXN1bHQgPj0gbWluU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgICAgICBjYihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbn0iLCJjbGFzcyBDUGxheWVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmluaXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZGVvU1JDID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuaW5pdEhUTUwoZWxlbWVudCwgZGF0YSkpXG4gICAgICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaW5pdEhUTUwoZWxlbWVudCwgZGF0YSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCdlbXB0eSBwYXJlbnQgZm9yIHZpZGVvIGVsZW1lbnQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpXG4gICAgICAgIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIGlmIChkYXRhLnBvc3RlcilcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zdGVyKGRhdGEucG9zdGVyKTtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUpIHtcbiAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoJ3BsYXllciBjYW4gbm90IGJlIGluaXRlZCwgY2FudCBwbGF5aW5nIHZpZGVvJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50Lm11dGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmF1dG9wbGF5ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Lm9ubG9hZGVkZGF0YSAgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudC5vbnRpbWV1cGRhdGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIENIZWxwZXJzLnRyaWdnZXJFdmVudCgncGxheWVyLnRpbWV1cGRhdGUnLCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRTb3VyY2UoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5zcmMud2VibSAmJiB0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUoXCJ2aWRlby93ZWJtXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU1JDID0gZGF0YS5zcmMud2VibTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zcmMubXA0ICYmIHRoaXMuZWxlbWVudC5jYW5QbGF5VHlwZShcInZpZGVvL21wNFwiKSkge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm1wNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLnNyYy5vZ2cgJiYgdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKFwidmlkZW8vb2dnXCIpKSAge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm9nZztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52aWRlb1NSQykge1xuICAgICAgICAgICAgdGhpcy5mZXRjaFZpZGVvKHRoaXMudmlkZW9TUkMgKyAnP3I9JyArIE1hdGgucmFuZG9tKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGJsb2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZSgndmlkZW8gZmV0Y2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCd1bmFibGUgdG8gZmV0Y2ggdmlkZW8uICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmluYWxseSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFBvc3Rlcih1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3Bvc3RlcicsIHVybCk7XG4gICAgfVxuXG4gICAgZmV0Y2hWaWRlbyh1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHJldHVybiBDSGVscGVycy5mZXRjaERhdGEodXJsLCdibG9iJyk7XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGxheSgpO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGF1c2UoKTtcbiAgICB9XG59IiwiY2xhc3MgR2V0Q29vcmRzIHtcbiAgc3RhdGljIGdldENvb3JkcyhlbGVtZW50KSB7XG4gICAgY29uc3QgYm94ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogYm94LnRvcCArIHBhZ2VZT2Zmc2V0LCBcbiAgICAgIGJvdHRvbTogYm94LmJvdHRvbSArIHBhZ2VZT2Zmc2V0ICBcbiAgICB9OyBcbiAgfSBcbn0iLCJjbGFzcyBBbmNob3JBZGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICghaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBhZGRBbmNob3IobmFtZSkge1xuICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgdmFyIG5ld1VybCA9IGJhc2VVcmwgKyBgIyR7bmFtZX1gO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIG5ld1VybCk7XG4gIH0gXG5cbiAgZ2V0IGFuY2hvcnNMaW5rICgpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS5hbmNob3InKTtcbiAgfVxufSIsImNsYXNzIFNjcmVlblNsaWRlciB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG5cbiAgICBpZiAoIXRoaXMubWFpbkNvbnRhaW5lcikge1xuICAgICAgdGhyb3cobmV3IEVycm9yKCdJZCDQvdC1INC/0LXRgNC10LTQsNC9INCyINC60L7QvdGB0YLRgNGD0LrRgtC+0YAg0Y3Qu9C10LzQtdC90YLQsCBTY3JlZW5TbGlkZXIsINC70LjQsdC+INGN0LvQtdC80LXQvdGCINC90LUg0L3QsNC50LTQtdC9INC90LAg0YHRgtGA0LDQvdC40YbQtScpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlY3Rpb25zID0gWy4uLnRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCcuZnVsbC1zY3JvbGxfX2VsZW1lbnQnKV07XG4gICAgdGhpcy5mb2cgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19mb2cnKTtcblxuICAgIHRoaXMuc21va2UxID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmcxJyk7XG4gICAgdGhpcy5zbW9rZTIgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzInKTtcbiAgICB0aGlzLnNtb2tlMyA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMycpO1xuXG4gICAgdGhpcy5zbW9rZTFCbGFjayA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMS1ibGFjaycpO1xuICAgIHRoaXMuc21va2UyQmxhY2sgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzItYmxhY2snKTtcbiAgICB0aGlzLnNtb2tlM0JsYWNrID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmczLWJsYWNrJyk7XG4gICAgXG4gICAgdGhpcy5hY3RpdmVTbW9rZTE7XG4gICAgdGhpcy5hY3RpdmVTbW9rZTI7XG4gICAgdGhpcy5hY3RpdmVTbW9rZTM7XG5cbiAgICB0aGlzLmNvbG9yVGhlbWUgPSAnd2hpdGUnO1xuXG4gICAgdGhpcy5wcm9ncmVzc0JhciA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Byb2dyZXNzLWJhcicpO1xuXG4gICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9ICcnO1xuICAgIHRoaXMuc2Nyb2xsRGlyZWN0aW9uO1xuXG4gICAgaWYgKHRoaXMubWFpbkNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ2Z1bGwtc2Nyb2xsX190by1zdGFuZGFydC1zY3JvbGwnKSkge1xuICAgICAgdGhpcy50b1N0YW5kYXJ0U2Nyb2xsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5jaGFuZ2VFbGVtZW50VmlzaWJsZSgpO1xuICAgIFxuICB9XG4gIFxuICBjYWxjU2Nyb2xsUGVyY2VudCgpIHtcbiAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pID09PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChwYWdlWU9mZnNldCAtIEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikudG9wKSAvICh0aGlzLmN1cnJlbnRTZWN0aW9uLmNsaWVudEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCkgICogMTAwKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbikge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHBhZ2VZT2Zmc2V0IC0gR2V0Q29vcmRzLmdldENvb3Jkcyh0aGlzLmN1cnJlbnRTZWN0aW9uKS50b3ApIC8gdGhpcy5jdXJyZW50U2VjdGlvbi5jbGllbnRIZWlnaHQgKiAxMDApO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZUVsZW1lbnRWaXNpYmxlKCkge1xuICAgIHRoaXMuc2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IGZpeGVkQmxvY2sgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fZml4ZWQtd3JhcHBlcicpO1xuICAgICAgY29uc3QgZWxlbUNvb3JkcyA9IEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSk7XG4gICAgICBpZiAocGFnZVlPZmZzZXQgPj0gZWxlbUNvb3Jkcy50b3AgJiYgZWxlbUNvb3Jkcy5ib3R0b20gPj0gcGFnZVlPZmZzZXQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGl0ZW07XG4gICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fZml4LXN0YXRlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTZWN0aW9uID09PSB0aGlzLnNlY3Rpb25zW3RoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikuYm90dG9tIC0gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fZml4LXN0YXRlJyk7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QuYWRkKCdmdWxsLXNjcm9sbF9fbGFzdC1lbGVtJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fbGFzdC1lbGVtJyk7XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgfSk7XG4gIH1cbiAgXG4gIHNldEFib3ZlQmdPcGFjaXR5KCkge1xuXG4gICAgaWYgKHRoaXMuY29sb3JUaGVtZSA9PT0gJ3doaXRlJykge1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEgPSB0aGlzLnNtb2tlMTtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyID0gdGhpcy5zbW9rZTI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMyA9IHRoaXMuc21va2UzO1xuXG4gICAgICB0aGlzLnNtb2tlMUJsYWNrLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgdGhpcy5zbW9rZTJCbGFjay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzQmxhY2suc3R5bGUub3BhY2l0eSA9IDA7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEgPSB0aGlzLnNtb2tlMUJsYWNrO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTIgPSB0aGlzLnNtb2tlMkJsYWNrO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMgPSB0aGlzLnNtb2tlM0JsYWNrO1xuXG4gICAgICB0aGlzLnNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgdGhpcy5zbW9rZTMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfVxuXG4gICAgLy8g0J/QvtC60LDQt9GL0LLQsNC10Lwg0YHQutGA0L7Qu9C70LHQsNGAXG4gICAgdGhpcy5wcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSArICclJztcbiAgICBcbiAgICAvLyDQldGB0LvQuCDQvNGLINC90LDRhdC+0LTQuNC80YHRjyDQvdC1INCyINC+0LHQu9Cw0YHRgtC4INC/0YDQvtGB0LzQvtGC0YDQsCDRgdC10LrRhtC40LgsINCy0YHQtSDRgdC70L7QuNGFINGB0LLQtdGA0YXRgyBkaXNwbGF5ID0gJ25vbmUnLFxuICAgIC8vINCn0YLQvtCx0Ysg0L3QsCDQtNGA0YPQs9C40YUg0Y3QutGA0LDQvdCw0YUg0L7QvdC4INC90LUg0L/QtdGA0LXQutGA0YvQstCw0LvQuCDQutC+0L3RgtC10L3RglxuXG4gICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDAgfHwgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID4gMTAwKSB7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgIHRoaXMuc21va2UxLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgdGhpcy5zbW9rZTFCbGFjay5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMkJsYWNrLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UzQmxhY2suc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICB0aGlzLnByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gMDtcblxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH1cblxuICAgIC8vINCe0LHRgNCw0LHQsNGC0YvQstCw0LXQvCDRgdC60YDQvtC70Lsg0LLQvdC40LdcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG5cbiAgICAgIC8vINCU0LvRjyDQv9C10YDQstC+0LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQstGF0L7QtNCwXCJcbiAgICAgIGlmICh0aGlzLnNlY3Rpb25zLmluZGV4T2YodGhpcy5jdXJyZW50U2VjdGlvbikgIT09IDApIHtcblxuICAgICAgICAvLyDQldGB0LvQuCDRgdC60YDQvtC70Lsg0LzQtdC90YzRiNC1IDI1JSwg0YLQviDRg9Cx0LjRgNCw0LXQvCDQv9GA0L7Qt9GA0LDRh9C90L7RgdGC0Ywg0YMgXCLRgtGD0LzQsNC90LBcIi5cbiAgICAgICAgLy8g0Lgg0YPRgdGC0LDQvdCw0LLQu9C40LLQsNC10Lwg0YHQutC+0YDQvtGB0YLRjCDRgtGA0LDQvdC30LjRiNC10L3QsCwg0YfRgtC+0LHRiyDQsdGL0LvQviDQv9C70LDQstC90L4uXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjUpIHtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMXMnO1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vINCV0YHQu9C4INC90LXRgiwg0YLQviDQstC+0LfQstGA0LDRidCw0LXQvCDRgtGA0LDQvdC30LjRiNC9INCyINGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0L/QvtC70L7QttC10L3QuNC1XG4gICAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuMnMnO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8g0JTQu9GPINC/0L7RgdC70LXQtNC90LXQs9C+INGN0LvQtdC80LXQvdGC0LAg0L3QtSDQtNC10LvQsNC10Lwg0LDQvdC40LzQsNGG0LjQuSBcItCS0YvRhdC+0LTQsFwiLiBcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTZWN0aW9uICE9PSB0aGlzLnNlY3Rpb25zW3RoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMV0pIHtcblxuICAgICAgICAvLyAg0JTRi9C8INCy0YvRhdC+0LRcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1NSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNjUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDcwKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA3NSkge1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIC0gNzUpICogNSArICclJztcbiAgICAgICAgfSBcbiAgICAgIH1cblxuXG4gICAgICAvLyDQlNGL0Lwg0LLRhdC+0LRcbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNSAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCA0MCAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLWJvdHRvbScpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTEuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDEzICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDQwICYmIHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gMTAgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDwgNDAgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcblxuICAgIH1cblxuXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAndG8tdG9wJykge1xuICAgICAgLy8g0JTQu9GPINC/0LXRgNCy0L7Qs9C+INGN0LvQtdC80LXQvdGC0LAg0L3QtSDQtNC10LvQsNC10Lwg0LDQvdC40LzQsNGG0LjQuSBcItCy0YXQvtC00LBcIlxuICAgICAgXG4gICAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pICE9PSAwKSB7XG5cbiAgICAgICAgLy8g0JTQtdC70LDQtdC8IFwi0LfQsNGC0LXQvdC10L3QuNC1XCIsINC10YHQu9C4INC40LTRkdC8INCy0LLQtdGA0YVcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAyNSkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKDEyNSAtIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSAqIDQgKyAnJScpO1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAxMjUgLSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKiA0ICsgJyUnO1xuICAgICAgICB9IFxuXG4gICAgICAgIC8vINCU0YvQvCDQv9GA0Lgg0L/RgNC+0LrRgNGD0YLQutC1INCy0LLQtdGA0YVcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAxNSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjMpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDM1KSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gODUpIHtcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDQldGB0LvQuCDQvdC10YIsINGC0L4g0LLQvtC30LLRgNCw0YnQsNC10Lwg0YLRgNCw0L3Qt9C40YjQvSDQsiDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC/0L7Qu9C+0LbQtdC90LjQtVxuICAgICAgICB0aGlzLmZvZy5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC4ycyc7XG4gICAgICB9XG5cbiAgICAgIC8vINCU0YvQvCDQstCy0LXRgNGFINC30LDRgtC80LXQvdC10L3QuNC1INC/0YDQuCDQv9C10YDQtdGF0L7QtNC1INGBINC/0YDQtdC00YvQtNGD0YnQtdCz0L5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gOTAgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUwKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcbiAgXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDgwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1MCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG4gIFxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA3NSAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuICAgICAgXG4gICAgfVxuXG4gICAgLy8g0JzQtdC90Y/QtdC8INC+0YHQvdC+0LLQvdC+0Lkg0YbQstC10YJcbiAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDQwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA2MCkge1xuICAgICAgaWYgKHdpbmRvdy5jb2xvclN0YXRlID09PSAnYmxhY2snKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlVGhlbWUoJ2JsYWNrJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZVRoZW1lKCd3aGl0ZScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEFjdGl2ZVRoZW1lKHRoZW1lID0gJ3doaXRlJykge1xuICAgIGlmICh0aGVtZSA9PT0gJ3doaXRlJykge1xuICAgICAgdGhpcy5jb2xvclRoZW1lID0gJ3doaXRlJztcbiAgICAgIHRoaXMuZm9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZmRmNWU2JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2xvclRoZW1lID0gJ2JsYWNrJztcbiAgICAgIHRoaXMuZm9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMDMwYzFhJztcbiAgICB9XG4gIH1cblxuICB0b1N0YW5kYXJ0U2Nyb2xsKCkge1xuICAgIHRoaXMuc2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2VsZW1lbnQtc3RhbmRhcmQtaGVpZ2h0Jyk7XG4gICAgfSk7XG4gIH1cbiAgXG59IiwiY2xhc3MgQ29sb3JTZXR0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmFsbFNlY3Rpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJsYWNrLXNlY3Rpb24nKTtcbiAgICB0aGlzLmJsYWNrU2VjdGlvbnNDb29yZCA9IHRoaXMuZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcygpO1xuICB9XG5cbiAgZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcygpIHtcbiAgICBjb25zdCBjb29yZHMgPSBbXVxuICAgIFxuICAgIHRoaXMuYWxsU2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvb3Jkcy5wdXNoKFtHZXRDb29yZHMuZ2V0Q29vcmRzKGl0ZW0pLnRvcCwgR2V0Q29vcmRzLmdldENvb3JkcyhpdGVtKS5ib3R0b21dKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29vcmRzO1xuICB9XG5cbiAgc2V0Q29sb3JTdGF0ZSgpIHtcbiAgICBsZXQgY29sb3JTdGF0ZTtcblxuICAgIHRoaXMuYmxhY2tTZWN0aW9uc0Nvb3JkLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAocGFnZVlPZmZzZXQgPj0gaXRlbVswXSAmJiBwYWdlWU9mZnNldCA8PSBpdGVtWzFdKSB7XG4gICAgICAgIGNvbG9yU3RhdGUgPSAnYmxhY2snO1xuICAgICAgfVxuICAgIH0pXG4gICAgY29sb3JTdGF0ZSA/IHdpbmRvdy5jb2xvclN0YXRlID0gY29sb3JTdGF0ZSA6IHdpbmRvdy5jb2xvclN0YXRlID0gJ3doaXRlJ1xuICB9XG59IiwiY2xhc3MgU2Nyb2xsSGFuZGxlciB7XG4gIGNvbnN0cnVjdG9yKHNlY3Rpb25TbGlkZXIsIGFuY2hvckFkZGVyLCBjb2xvclNldHRlcikge1xuICAgIHRoaXMuc2VjdGlvblNsaWRlciA9IHNlY3Rpb25TbGlkZXI7XG4gICAgdGhpcy5hbmNob3JBZGRlciA9IGFuY2hvckFkZGVyO1xuICAgIHRoaXMuY29sb3JTZXR0ZXIgPSBjb2xvclNldHRlcjtcblxuICAgIHRoaXMuc2Nyb2xsSGFuZGxlcigpO1xuICB9XG5cbiAgc2Nyb2xsSGFuZGxlcigpIHtcbiAgICBsZXQgb2Zmc2V0ID0gcGFnZVlPZmZzZXQ7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgIHRoaXMuY29sb3JTZXR0ZXIuc2V0Q29sb3JTdGF0ZSgpO1xuICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLmNoYW5nZUVsZW1lbnRWaXNpYmxlKCk7XG4gICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuc2V0QWJvdmVCZ09wYWNpdHkoKTtcblxuICAgICAgaWYgKHBhZ2VZT2Zmc2V0IC0gb2Zmc2V0IDwgMCkge1xuICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuZGlyZWN0aW9uID0gJ3RvLXRvcCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuZGlyZWN0aW9uID0gJ3RvLWJvdHRvbSc7XG4gICAgICB9XG5cbiAgICAgIG9mZnNldCA9IHBhZ2VZT2Zmc2V0O1xuXG4gICAgICB0aGlzLmFuY2hvckFkZGVyLmFuY2hvcnNMaW5rLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGxldCBhbmNob3JUb3BDb29yZCA9IEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSkudG9wO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGFuY2hvclRvcENvb3JkICYmIHBhZ2VZT2Zmc2V0IDw9IGFuY2hvclRvcENvb3JkICsgNTAwKSB7XG4gICAgICAgICAgdGhpcy5hbmNob3JBZGRlci5hZGRBbmNob3IoaXRlbS5uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgIH0pO1xuICB9XG59XG4iXX0=
