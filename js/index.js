"use strict";

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9zaGFyZWQvSGVscGVycy5qcyIsImNvbW1vbi9zaGFyZWQvVmlkZW8uanMiLCJjb21tb24vc2hhcmVkL0dldENvb3Jkcy5qcyIsImNvbW1vbi9BbmNob3JBZGRlci5qcyIsImNvbW1vbi9TY3JlZW5TbGlkZXIuanMiLCJjb21tb24vQ29sb3JTZXR0ZXIuanMiLCJjb21tb24vU2Nyb2xsSGFuZGxlci5qcyJdLCJuYW1lcyI6WyJDSGVscGVycyIsImxvYWRlciIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsIm1zZyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsInR5cGUiLCJkYXRhIiwiZWxlbWVudCIsImV2ZW50IiwiRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwidXJsIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZXF1ZXN0IiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwib25sb2FkIiwic3RhdHVzIiwicmVzcG9uc2UiLCJFcnJvciIsInN0YXR1c1RleHQiLCJvbmVycm9yIiwic2VuZCIsInN0YXJ0VGltZSIsImVuZFRpbWUiLCJVUkwiLCJNYXRoIiwicmFuZG9tIiwic2l6ZSIsImRvd25sb2FkIiwiSW1hZ2UiLCJ0aW1lb3V0IiwiRGF0ZSIsImdldFRpbWUiLCJzcGVlZEJwcyIsInRvRml4ZWQiLCJsb2dNZXNzYWdlIiwic3JjIiwic2V0VGltZW91dCIsImNvbXBsZXRlIiwibmF0dXJhbFdpZHRoIiwiY2IiLCJtaW5TcGVlZCIsImNoZWNrQ29ubmVjdGlvblNwZWVkIiwidGhlbiIsInJlc3VsdCIsImVyck1lc3NhZ2UiLCJtZXNzYWdlIiwiaGlkZVNwaW5uZXIiLCJDUGxheWVyIiwicGFyZW50IiwiaW5pdGVkIiwidmlkZW9TUkMiLCJpbml0SFRNTCIsImdldEVsZW1lbnRCeUlkIiwiY3JlYXRlRWxlbWVudCIsImFwcGVuZENoaWxkIiwicG9zdGVyIiwic2V0UG9zdGVyIiwiY2FuUGxheVR5cGUiLCJtdXRlZCIsImF1dG9wbGF5Iiwib25sb2FkZWRkYXRhIiwib250aW1ldXBkYXRlIiwidHJpZ2dlckV2ZW50Iiwid2VibSIsIm1wNCIsIm9nZyIsImZldGNoVmlkZW8iLCJibG9iIiwic2V0QXR0cmlidXRlIiwiY3JlYXRlT2JqZWN0VVJMIiwiY2F0Y2giLCJmaW5hbGx5IiwiZmV0Y2hEYXRhIiwicGF1c2VkIiwicGxheSIsInBhdXNlIiwiR2V0Q29vcmRzIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwicGFnZVlPZmZzZXQiLCJib3R0b20iLCJBbmNob3JBZGRlciIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJuYW1lIiwiYmFzZVVybCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0IiwicGF0aG5hbWUiLCJuZXdVcmwiLCJxdWVyeVNlbGVjdG9yQWxsIiwiU2NyZWVuU2xpZGVyIiwiaWQiLCJtYWluQ29udGFpbmVyIiwic2VjdGlvbnMiLCJBcnJheSIsImZyb20iLCJmb2ciLCJzbW9rZTEiLCJzbW9rZTIiLCJzbW9rZTMiLCJzbW9rZTFCbGFjayIsInNtb2tlMkJsYWNrIiwic21va2UzQmxhY2siLCJhY3RpdmVTbW9rZTEiLCJhY3RpdmVTbW9rZTIiLCJhY3RpdmVTbW9rZTMiLCJjb2xvclRoZW1lIiwicHJvZ3Jlc3NCYXIiLCJjdXJyZW50U2VjdGlvbiIsInNjcm9sbERpcmVjdGlvbiIsImNvbnRhaW5zIiwidG9TdGFuZGFydFNjcm9sbCIsImNoYW5nZUVsZW1lbnRWaXNpYmxlIiwiaW5kZXhPZiIsImxlbmd0aCIsImZsb29yIiwiZ2V0Q29vcmRzIiwiY2xpZW50SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJmb3JFYWNoIiwiaXRlbSIsImZpeGVkQmxvY2siLCJlbGVtQ29vcmRzIiwic3R5bGUiLCJvcGFjaXR5Iiwid2lkdGgiLCJjYWxjU2Nyb2xsUGVyY2VudCIsInVuZGVmaW5lZCIsImRpc3BsYXkiLCJkaXJlY3Rpb24iLCJ0cmFuc2l0aW9uIiwiY29sb3JTdGF0ZSIsInNldEFjdGl2ZVRoZW1lIiwidGhlbWUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJDb2xvclNldHRlciIsImFsbFNlY3Rpb25zIiwiYmxhY2tTZWN0aW9uc0Nvb3JkIiwiZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcyIsImNvb3JkcyIsInB1c2giLCJTY3JvbGxIYW5kbGVyIiwic2VjdGlvblNsaWRlciIsImFuY2hvckFkZGVyIiwiY29sb3JTZXR0ZXIiLCJzY3JvbGxIYW5kbGVyIiwib2Zmc2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldENvbG9yU3RhdGUiLCJzZXRBYm92ZUJnT3BhY2l0eSIsImFuY2hvcnNMaW5rIiwiYW5jaG9yVG9wQ29vcmQiLCJhZGRBbmNob3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUFBLFE7Ozs7Ozs7a0NBRUE7QUFDQSxVQUFBQyxNQUFBLEdBQUFDLFFBQUEsQ0FBQUMsYUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBRixNQUFBQSxNQUFBLENBQUFHLFNBQUEsQ0FBQUMsR0FBQSxDQUFBLFFBQUE7QUFDQTs7O2tDQUVBO0FBQ0EsVUFBQUosTUFBQSxHQUFBQyxRQUFBLENBQUFDLGFBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQUYsTUFBQUEsTUFBQSxDQUFBRyxTQUFBLENBQUFFLE1BQUEsQ0FBQSxRQUFBO0FBQ0E7OzsrQkFFQUMsRyxFQUFBO0FBQ0E7QUFDQUMsTUFBQUEsT0FBQSxDQUFBQyxHQUFBLGtCQUFBRixHQUFBLEdBRkEsQ0FFQTtBQUNBOzs7K0JBRUFHLEssRUFBQTtBQUNBRixNQUFBQSxPQUFBLENBQUFDLEdBQUEsa0JBQUFDLEtBQUE7QUFDQTs7O2lDQUVBQyxJLEVBQUFDLEksRUFBQTtBQUFBLFVBQUFDLE9BQUEsdUVBQUFYLFFBQUE7QUFDQSxVQUFBWSxLQUFBLEdBQUEsSUFBQUMsS0FBQSxDQUFBSixJQUFBLEVBQUFDLElBQUEsQ0FBQTtBQUNBQyxNQUFBQSxPQUFBLENBQUFHLGFBQUEsQ0FBQUYsS0FBQTtBQUNB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QUEsTUFBQSxDQUFBSixhQUFBLENBQUFiLFNBQUEsR0FBQSxRQUFBO0FBQ0EsU0FGQSxNQUVBO0FBQ0EsVUFBQSxNQUFBLENBQUFhLGFBQUEsQ0FBQWIsU0FBQSxHQUFBLFdBQUE7QUFDQTs7QUFFQWlCLFFBQUFBLE1BQUEsR0FBQXRFLFdBQUE7O0FBRUEsUUFBQSxNQUFBLENBQUFtRSxXQUFBLENBQUFPLFdBQUEsQ0FBQS9CLE9BQUEsQ0FBQSxVQUFBQyxJQUFBLEVBQUE7QUFDQSxjQUFBK0IsY0FBQSxHQUFBL0UsU0FBQSxDQUFBNEMsU0FBQSxDQUFBSSxJQUFBLEVBQUE3QyxHQUFBOztBQUVBLGNBQUFDLFdBQUEsSUFBQTJFLGNBQUEsSUFBQTNFLFdBQUEsSUFBQTJFLGNBQUEsR0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLE1BQUEsQ0FBQVIsV0FBQSxDQUFBUyxTQUFBLENBQUFoQyxJQUFBLENBQUF2QyxJQUFBO0FBQ0E7QUFDQSxTQU5BO0FBUUEsT0FyQkE7QUFzQkEiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDSGVscGVycyB7XG5cbiAgICBzdGF0aWMgc2hvd1NwaW5uZXIoKSB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGVyXCIpO1xuICAgICAgICBsb2FkZXIuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGhpZGVTcGlubmVyKCkge1xuICAgICAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmxvYWRlclwiKTtcbiAgICAgICAgbG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuICAgIH1cblxuICAgIHN0YXRpYyBsb2dNZXNzYWdlKG1zZykge1xuICAgICAgICAvLyBuZWVkIHRvIHJlbW92ZSB0aGlzIGxpbmUgZnJvbSBwcm9kIGJ1aWxkIG9yIHNvbWV0aGluZyBlbHNlXG4gICAgICAgIGNvbnNvbGUubG9nKGBNRVNTRzogJHttc2d9YCk7IC8vIC0tLSBERUJVRyAtLS1cbiAgICB9XG5cbiAgICBzdGF0aWMgZXJyTWVzc2FnZShlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhgRVJST1I6ICR7ZXJyb3J9YCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHRyaWdnZXJFdmVudCh0eXBlLCBkYXRhLCBlbGVtZW50ID0gZG9jdW1lbnQpIHtcbiAgICAgICAgbGV0IGV2ZW50ID0gbmV3IEV2ZW50KHR5cGUsIGRhdGEpO1xuICAgICAgICBlbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBmZXRjaERhdGEodXJsLCB0eXBlPSdqc29uJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgbmV0d29yayBlcnJvciBnZXR0aW5nICR7dXJsfWApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tDb25uZWN0aW9uU3BlZWQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RhcnRUaW1lLCBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIFVSTCA9IFwiLy9zdGF0aWMuMXR2LnJ1L3BsYXllci9zYW5pdGFyL25ldy9taXNjL2ltZzVtYi5qcGdcIiArIFwiP3I9XCIgKyBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgICAgIHNpemUgPSA0OTk1Mzc0LCAvLyA1LjM2TWJcbiAgICAgICAgICAgICAgICBkb3dubG9hZCA9IG5ldyBJbWFnZSgpLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSAzMDAwMDsgLy8gMzAgc2Vjc1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNwZWVkQnBzID0gKChzaXplICogOCkgLyAoZW5kVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoJ2NoZWNrVXNlckNvbm5lY3Rpb24sIHNwZWVkICcgKyBzcGVlZEJwcyArICcgbWJpdHMgcGVyIHNlYycpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc3BlZWRCcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG93bmxvYWQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIGVycm9yIGRvd25sb2FkaW5nICR7VVJMfWApKTtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBkb3dubG9hZC5zcmMgPSBVUkw7XG4gICAgICAgICAgICAvLyBhYm9ydCBkb3dubG9hZGluZyBvbiB0aW1lb3V0XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkb3dubG9hZC5jb21wbGV0ZSB8fCAhZG93bmxvYWQubmF0dXJhbFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZC5zcmMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIHRpbWVvdXQgZG93bmxvYWRpbmcgJHtVUkx9YCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tVc2VyQ29ubmVjdGlvbihjYikge1xuICAgICAgICBsZXQgbWluU3BlZWQgPSAzOyAvLyAzIG1iaXQgcGVyIHNlYztcbiAgICAgICAgY2IgPSBjYiB8fCAoKCkgPT4ge30pO1xuXG4gICAgICAgIENIZWxwZXJzLmNoZWNrQ29ubmVjdGlvblNwZWVkKGNiKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgY29ubmVjdGlvbiBmYXN0LCBzcGVlZCA+ICR7bWluU3BlZWR9IG1iaXQgcGVyIHNlY2ApO1xuICAgICAgICAgICAgICAgICAgICBjYihyZXN1bHQgPj0gbWluU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgICAgICBjYihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG5cbn0iLCJjbGFzcyBDUGxheWVyIHtcblxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICB0aGlzLmluaXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZGVvU1JDID0gJyc7XG5cbiAgICAgICAgaWYgKHRoaXMuaW5pdEhUTUwoZWxlbWVudCwgZGF0YSkpXG4gICAgICAgICAgICB0aGlzLmluaXRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaW5pdEhUTUwoZWxlbWVudCwgZGF0YSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGVsZW1lbnQpO1xuICAgICAgICBpZiAoIXRoaXMucGFyZW50KSB7XG4gICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCdlbXB0eSBwYXJlbnQgZm9yIHZpZGVvIGVsZW1lbnQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpXG4gICAgICAgIHRoaXMucGFyZW50LmFwcGVuZENoaWxkKHRoaXMuZWxlbWVudCk7XG4gICAgICAgIGlmIChkYXRhLnBvc3RlcilcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zdGVyKGRhdGEucG9zdGVyKTtcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUpIHtcbiAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoJ3BsYXllciBjYW4gbm90IGJlIGluaXRlZCwgY2FudCBwbGF5aW5nIHZpZGVvJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50Lm11dGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5lbGVtZW50LmF1dG9wbGF5ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaW5pdEV2ZW50cygpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50Lm9ubG9hZGVkZGF0YSAgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZWxlbWVudC5vbnRpbWV1cGRhdGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIENIZWxwZXJzLnRyaWdnZXJFdmVudCgncGxheWVyLnRpbWV1cGRhdGUnLCBldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRTb3VyY2UoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5zcmMud2VibSAmJiB0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUoXCJ2aWRlby93ZWJtXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU1JDID0gZGF0YS5zcmMud2VibTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zcmMubXA0ICYmIHRoaXMuZWxlbWVudC5jYW5QbGF5VHlwZShcInZpZGVvL21wNFwiKSkge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm1wNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLnNyYy5vZ2cgJiYgdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKFwidmlkZW8vb2dnXCIpKSAge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm9nZztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52aWRlb1NSQykge1xuICAgICAgICAgICAgdGhpcy5mZXRjaFZpZGVvKHRoaXMudmlkZW9TUkMgKyAnP3I9JyArIE1hdGgucmFuZG9tKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGJsb2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZSgndmlkZW8gZmV0Y2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCd1bmFibGUgdG8gZmV0Y2ggdmlkZW8uICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmluYWxseSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFBvc3Rlcih1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3Bvc3RlcicsIHVybCk7XG4gICAgfVxuXG4gICAgZmV0Y2hWaWRlbyh1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHJldHVybiBDSGVscGVycy5mZXRjaERhdGEodXJsLCdibG9iJyk7XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGxheSgpO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGF1c2UoKTtcbiAgICB9XG59IiwiY2xhc3MgR2V0Q29vcmRzIHtcbiAgc3RhdGljIGdldENvb3JkcyhlbGVtZW50KSB7XG4gICAgY29uc3QgYm94ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogYm94LnRvcCArIHBhZ2VZT2Zmc2V0LCBcbiAgICAgIGJvdHRvbTogYm94LmJvdHRvbSArIHBhZ2VZT2Zmc2V0ICBcbiAgICB9OyBcbiAgfSBcbn0iLCJjbGFzcyBBbmNob3JBZGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICghaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBhZGRBbmNob3IobmFtZSkge1xuICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgdmFyIG5ld1VybCA9IGJhc2VVcmwgKyBgIyR7bmFtZX1gO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIG5ld1VybCk7XG4gIH0gXG5cbiAgZ2V0IGFuY2hvcnNMaW5rICgpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnYS5hbmNob3InKTtcbiAgfVxufSIsImNsYXNzIFNjcmVlblNsaWRlciB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG5cbiAgICBpZiAoIXRoaXMubWFpbkNvbnRhaW5lcikge1xuICAgICAgdGhyb3cobmV3IEVycm9yKCdJZCDQvdC1INC/0LXRgNC10LTQsNC9INCyINC60L7QvdGB0YLRgNGD0LrRgtC+0YAg0Y3Qu9C10LzQtdC90YLQsCBTY3JlZW5TbGlkZXIsINC70LjQsdC+INGN0LvQtdC80LXQvdGCINC90LUg0L3QsNC50LTQtdC9INC90LAg0YHRgtGA0LDQvdC40YbQtScpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlY3Rpb25zID0gQXJyYXkuZnJvbSh0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmZ1bGwtc2Nyb2xsX19lbGVtZW50JykpO1xuICAgIHRoaXMuZm9nID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fZm9nJyk7XG5cbiAgICB0aGlzLnNtb2tlMSA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMScpO1xuICAgIHRoaXMuc21va2UyID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmcyJyk7XG4gICAgdGhpcy5zbW9rZTMgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzMnKTtcblxuICAgIHRoaXMuc21va2UxQmxhY2sgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzEtYmxhY2snKTtcbiAgICB0aGlzLnNtb2tlMkJsYWNrID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmcyLWJsYWNrJyk7XG4gICAgdGhpcy5zbW9rZTNCbGFjayA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMy1ibGFjaycpO1xuICAgIFxuICAgIHRoaXMuYWN0aXZlU21va2UxO1xuICAgIHRoaXMuYWN0aXZlU21va2UyO1xuICAgIHRoaXMuYWN0aXZlU21va2UzO1xuXG4gICAgdGhpcy5jb2xvclRoZW1lID0gJ3doaXRlJztcblxuICAgIHRoaXMucHJvZ3Jlc3NCYXIgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19wcm9ncmVzcy1iYXInKTtcblxuICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAnJztcbiAgICB0aGlzLnNjcm9sbERpcmVjdGlvbjtcblxuICAgIGlmICh0aGlzLm1haW5Db250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdmdWxsLXNjcm9sbF9fdG8tc3RhbmRhcnQtc2Nyb2xsJykpIHtcbiAgICAgIHRoaXMudG9TdGFuZGFydFNjcm9sbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuY2hhbmdlRWxlbWVudFZpc2libGUoKTtcbiAgICBcbiAgfVxuICBcbiAgY2FsY1Njcm9sbFBlcmNlbnQoKSB7XG4gICAgaWYgKHRoaXMuc2VjdGlvbnMuaW5kZXhPZih0aGlzLmN1cnJlbnRTZWN0aW9uKSA9PT0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigocGFnZVlPZmZzZXQgLSBHZXRDb29yZHMuZ2V0Q29vcmRzKHRoaXMuY3VycmVudFNlY3Rpb24pLnRvcCkgLyAodGhpcy5jdXJyZW50U2VjdGlvbi5jbGllbnRIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQpICAqIDEwMCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY3VycmVudFNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChwYWdlWU9mZnNldCAtIEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikudG9wKSAvIHRoaXMuY3VycmVudFNlY3Rpb24uY2xpZW50SGVpZ2h0ICogMTAwKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VFbGVtZW50VmlzaWJsZSgpIHtcbiAgICB0aGlzLnNlY3Rpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb25zdCBmaXhlZEJsb2NrID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX2ZpeGVkLXdyYXBwZXInKTtcbiAgICAgIGNvbnN0IGVsZW1Db29yZHMgPSBHZXRDb29yZHMuZ2V0Q29vcmRzKGl0ZW0pO1xuICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGVsZW1Db29yZHMudG9wICYmIGVsZW1Db29yZHMuYm90dG9tID49IHBhZ2VZT2Zmc2V0KSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpdGVtO1xuICAgICAgICBmaXhlZEJsb2NrLmNsYXNzTGlzdC5hZGQoJ2Z1bGwtc2Nyb2xsX19maXgtc3RhdGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbiA9PT0gdGhpcy5zZWN0aW9uc1t0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGlmIChwYWdlWU9mZnNldCA+PSBHZXRDb29yZHMuZ2V0Q29vcmRzKHRoaXMuY3VycmVudFNlY3Rpb24pLmJvdHRvbSAtIHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2xhc3QtZWxlbScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1zY3JvbGxfX2xhc3QtZWxlbScpO1xuICAgICAgICB9XG4gICAgICB9IFxuICAgIH0pO1xuICB9XG4gIFxuICBzZXRBYm92ZUJnT3BhY2l0eSgpIHtcblxuICAgIGlmICh0aGlzLmNvbG9yVGhlbWUgPT09ICd3aGl0ZScpIHtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UxID0gdGhpcy5zbW9rZTE7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMiA9IHRoaXMuc21va2UyO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMgPSB0aGlzLnNtb2tlMztcblxuICAgICAgdGhpcy5zbW9rZTFCbGFjay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UyQmxhY2suc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB0aGlzLnNtb2tlM0JsYWNrLnN0eWxlLm9wYWNpdHkgPSAwO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UxID0gdGhpcy5zbW9rZTFCbGFjaztcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyID0gdGhpcy5zbW9rZTJCbGFjaztcbiAgICAgIHRoaXMuYWN0aXZlU21va2UzID0gdGhpcy5zbW9rZTNCbGFjaztcblxuICAgICAgdGhpcy5zbW9rZTEuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB0aGlzLnNtb2tlMy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgIH1cblxuICAgIC8vINCf0L7QutCw0LfRi9Cy0LDQtdC8INGB0LrRgNC+0LvQu9Cx0LDRgFxuICAgIHRoaXMucHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKyAnJSc7XG4gICAgXG4gICAgLy8g0JXRgdC70Lgg0LzRiyDQvdCw0YXQvtC00LjQvNGB0Y8g0L3QtSDQsiDQvtCx0LvQsNGB0YLQuCDQv9GA0L7RgdC80L7RgtGA0LAg0YHQtdC60YbQuNC4LCDQstGB0LUg0YHQu9C+0LjRhSDRgdCy0LXRgNGF0YMgZGlzcGxheSA9ICdub25lJyxcbiAgICAvLyDQp9GC0L7QsdGLINC90LAg0LTRgNGD0LPQuNGFINGN0LrRgNCw0L3QsNGFINC+0L3QuCDQvdC1INC/0LXRgNC10LrRgNGL0LLQsNC70Lgg0LrQvtC90YLQtdC90YJcblxuICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCAwIHx8IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+IDEwMCkge1xuICAgICAgdGhpcy5mb2cuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICB0aGlzLnNtb2tlMS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgIHRoaXMuc21va2UxQmxhY2suc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgdGhpcy5zbW9rZTJCbGFjay5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlM0JsYWNrLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgdGhpcy5wcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IDA7XG5cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb2cuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9XG5cbiAgICAvLyDQntCx0YDQsNCx0LDRgtGL0LLQsNC10Lwg0YHQutGA0L7Qu9C7INCy0L3QuNC3XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuXG4gICAgICAvLyDQlNC70Y8g0L/QtdGA0LLQvtCz0L4g0Y3Qu9C10LzQtdC90YLQsCDQvdC1INC00LXQu9Cw0LXQvCDQsNC90LjQvNCw0YbQuNC5IFwi0LLRhdC+0LTQsFwiXG4gICAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pICE9PSAwKSB7XG5cbiAgICAgICAgLy8g0JXRgdC70Lgg0YHQutGA0L7Qu9C7INC80LXQvdGM0YjQtSAyNSUsINGC0L4g0YPQsdC40YDQsNC10Lwg0L/RgNC+0LfRgNCw0YfQvdC+0YHRgtGMINGDIFwi0YLRg9C80LDQvdCwXCIuXG4gICAgICAgIC8vINC4INGD0YHRgtCw0L3QsNCy0LvQuNCy0LDQtdC8INGB0LrQvtGA0L7RgdGC0Ywg0YLRgNCw0L3Qt9C40YjQtdC90LAsINGH0YLQvtCx0Ysg0LHRi9C70L4g0L/Qu9Cw0LLQvdC+LlxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDI1KSB7XG4gICAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDQldGB0LvQuCDQvdC10YIsINGC0L4g0LLQvtC30LLRgNCw0YnQsNC10Lwg0YLRgNCw0L3Qt9C40YjQvSDQsiDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC/0L7Qu9C+0LbQtdC90LjQtVxuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAwLjJzJztcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIC8vINCU0LvRjyDQv9C+0YHQu9C10LTQvdC10LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQktGL0YXQvtC00LBcIi4gXG4gICAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbiAhPT0gdGhpcy5zZWN0aW9uc1t0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDFdKSB7XG5cbiAgICAgICAgLy8gINCU0YvQvCDQstGL0YXQvtC0XG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDY1KSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA3MCkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNzUpIHtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS5vcGFjaXR5ID0gKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSAtIDc1KSAqIDUgKyAnJSc7XG4gICAgICAgIH0gXG4gICAgICB9XG5cblxuICAgICAgLy8g0JTRi9C8INCy0YXQvtC0XG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDwgNDAgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcblxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSAxMyAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCA0MCAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLWJvdHRvbScpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDEwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDQwICYmIHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG5cbiAgICB9XG5cblxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLXRvcCcpIHtcbiAgICAgIC8vINCU0LvRjyDQv9C10YDQstC+0LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQstGF0L7QtNCwXCJcbiAgICAgIFxuICAgICAgaWYgKHRoaXMuc2VjdGlvbnMuaW5kZXhPZih0aGlzLmN1cnJlbnRTZWN0aW9uKSAhPT0gMCkge1xuXG4gICAgICAgIC8vINCU0LXQu9Cw0LXQvCBcItC30LDRgtC10L3QtdC90LjQtVwiLCDQtdGB0LvQuCDQuNC00ZHQvCDQstCy0LXRgNGFXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjUpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygxMjUgLSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKiA0ICsgJyUnKTtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS5vcGFjaXR5ID0gMTI1IC0gdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpICogNCArICclJztcbiAgICAgICAgfSBcblxuICAgICAgICAvLyDQlNGL0Lwg0L/RgNC4INC/0YDQvtC60YDRg9GC0LrQtSDQstCy0LXRgNGFXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMTUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDIzKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAzNSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDg1KSB7XG4gICAgICAgIHRoaXMuZm9nLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAxcyc7XG4gICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g0JXRgdC70Lgg0L3QtdGCLCDRgtC+INCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INGC0YDQsNC90LfQuNGI0L0g0LIg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQv9C+0LvQvtC20LXQvdC40LVcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuMnMnO1xuICAgICAgfVxuXG4gICAgICAvLyDQlNGL0Lwg0LLQstC10YDRhSDQt9Cw0YLQvNC10L3QtdC90LjQtSDQv9GA0Lgg0L/QtdGA0LXRhdC+0LTQtSDRgSDQv9GA0LXQtNGL0LTRg9GJ0LXQs9C+XG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDkwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1MCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG4gIFxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA4MCAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuICBcbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gNzUgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUwKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcbiAgICAgIFxuICAgIH1cblxuICAgIC8vINCc0LXQvdGP0LXQvCDQvtGB0L3QvtCy0L3QvtC5INGG0LLQtdGCXG4gICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA0MCAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gNjApIHtcbiAgICAgIGlmICh3aW5kb3cuY29sb3JTdGF0ZSA9PT0gJ2JsYWNrJykge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZVRoZW1lKCdibGFjaycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmVUaGVtZSgnd2hpdGUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRBY3RpdmVUaGVtZSh0aGVtZSA9ICd3aGl0ZScpIHtcbiAgICBpZiAodGhlbWUgPT09ICd3aGl0ZScpIHtcbiAgICAgIHRoaXMuY29sb3JUaGVtZSA9ICd3aGl0ZSc7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZkZjVlNic7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29sb3JUaGVtZSA9ICdibGFjayc7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzAzMGMxYSc7XG4gICAgfVxuICB9XG5cbiAgdG9TdGFuZGFydFNjcm9sbCgpIHtcbiAgICB0aGlzLnNlY3Rpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2Z1bGwtc2Nyb2xsX19lbGVtZW50LXN0YW5kYXJkLWhlaWdodCcpO1xuICAgIH0pO1xuICB9XG4gIFxufSIsImNsYXNzIENvbG9yU2V0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hbGxTZWN0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5ibGFjay1zZWN0aW9uJyk7XG4gICAgdGhpcy5ibGFja1NlY3Rpb25zQ29vcmQgPSB0aGlzLmdldEJsYWNrU2VjdGlvbnNDb29yZHMoKTtcbiAgfVxuXG4gIGdldEJsYWNrU2VjdGlvbnNDb29yZHMoKSB7XG4gICAgY29uc3QgY29vcmRzID0gW11cbiAgICBcbiAgICB0aGlzLmFsbFNlY3Rpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb29yZHMucHVzaChbR2V0Q29vcmRzLmdldENvb3JkcyhpdGVtKS50b3AsIEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSkuYm90dG9tXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvb3JkcztcbiAgfVxuXG4gIHNldENvbG9yU3RhdGUoKSB7XG4gICAgbGV0IGNvbG9yU3RhdGU7XG5cbiAgICB0aGlzLmJsYWNrU2VjdGlvbnNDb29yZC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGl0ZW1bMF0gJiYgcGFnZVlPZmZzZXQgPD0gaXRlbVsxXSkge1xuICAgICAgICBjb2xvclN0YXRlID0gJ2JsYWNrJztcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbG9yU3RhdGUgPyB3aW5kb3cuY29sb3JTdGF0ZSA9IGNvbG9yU3RhdGUgOiB3aW5kb3cuY29sb3JTdGF0ZSA9ICd3aGl0ZSdcbiAgfVxufSIsImNsYXNzIFNjcm9sbEhhbmRsZXIge1xuICBjb25zdHJ1Y3RvcihzZWN0aW9uU2xpZGVyLCBhbmNob3JBZGRlciwgY29sb3JTZXR0ZXIpIHtcbiAgICB0aGlzLnNlY3Rpb25TbGlkZXIgPSBzZWN0aW9uU2xpZGVyO1xuICAgIHRoaXMuYW5jaG9yQWRkZXIgPSBhbmNob3JBZGRlcjtcbiAgICB0aGlzLmNvbG9yU2V0dGVyID0gY29sb3JTZXR0ZXI7XG5cbiAgICB0aGlzLnNjcm9sbEhhbmRsZXIoKTtcbiAgfVxuXG4gIHNjcm9sbEhhbmRsZXIoKSB7XG4gICAgbGV0IG9mZnNldCA9IHBhZ2VZT2Zmc2V0O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvbG9yU2V0dGVyLnNldENvbG9yU3RhdGUoKTtcbiAgICAgIHRoaXMuc2VjdGlvblNsaWRlci5jaGFuZ2VFbGVtZW50VmlzaWJsZSgpO1xuICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLnNldEFib3ZlQmdPcGFjaXR5KCk7XG5cbiAgICAgIGlmIChwYWdlWU9mZnNldCAtIG9mZnNldCA8IDApIHtcbiAgICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLmRpcmVjdGlvbiA9ICd0by10b3AnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLmRpcmVjdGlvbiA9ICd0by1ib3R0b20nO1xuICAgICAgfVxuXG4gICAgICBvZmZzZXQgPSBwYWdlWU9mZnNldDtcblxuICAgICAgdGhpcy5hbmNob3JBZGRlci5hbmNob3JzTGluay5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgICBsZXQgYW5jaG9yVG9wQ29vcmQgPSBHZXRDb29yZHMuZ2V0Q29vcmRzKGl0ZW0pLnRvcDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYWdlWU9mZnNldCA+PSBhbmNob3JUb3BDb29yZCAmJiBwYWdlWU9mZnNldCA8PSBhbmNob3JUb3BDb29yZCArIDUwMCkge1xuICAgICAgICAgIHRoaXMuYW5jaG9yQWRkZXIuYWRkQW5jaG9yKGl0ZW0ubmFtZSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICB9KTtcbiAgfVxufVxuIl19
