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
      var event = new this.createNewEvent(type, data);
      element.dispatchEvent(event);
    }
  }, {
    key: "createNewEvent",
    value: function createNewEvent(type, data) {
      var event;

      if (typeof CustomEvent !== 'function') {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, false, false, data);
      } else {
        event = new CustomEvent(type, {
          detail: data
        });
      }

      return event;
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

      if (!data) {
        CHelpers.errMessage('empty data for video element');
        return false;
      }

      this.element = document.createElement('video');
      this.parent.appendChild(this.element);
      if (data.poster) this.setPoster(data.poster);

      if (!this.element.canPlayType) {
        CHelpers.logMessage('player can not be inited, can`t playing video');
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
        CHelpers.triggerEvent('player.timeupdate', {
          'time': event.target.currentTime
        });
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
      return Array.from(document.querySelectorAll('a.anchor'));
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

    if (this.mainContainer.classList.contains('full-scroll__to-standart-scroll')) {
      this.disable = true;
      this.toStandartScroll();
      return;
    }

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

    this.allSections = Array.from(document.querySelectorAll('.black-section'));
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

        if (!_this3.sectionSlider.disable) {
          _this3.sectionSlider.changeElementVisible();

          _this3.sectionSlider.setAboveBgOpacity();

          if (pageYOffset - offset < 0) {
            _this3.sectionSlider.direction = 'to-top';
          } else {
            _this3.sectionSlider.direction = 'to-bottom';
          }

          offset = pageYOffset;
        }

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9zaGFyZWQvSGVscGVycy5qcyIsImNvbW1vbi9zaGFyZWQvVmlkZW8uanMiLCJjb21tb24vc2hhcmVkL0dldENvb3Jkcy5qcyIsImNvbW1vbi9BbmNob3JBZGRlci5qcyIsImNvbW1vbi9TY3JlZW5TbGlkZXIuanMiLCJjb21tb24vQ29sb3JTZXR0ZXIuanMiLCJjb21tb24vU2Nyb2xsSGFuZGxlci5qcyJdLCJuYW1lcyI6WyJDSGVscGVycyIsImxvYWRlciIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsIm1zZyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsInR5cGUiLCJkYXRhIiwiZWxlbWVudCIsImV2ZW50IiwiY3JlYXRlTmV3RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRDdXN0b21FdmVudCIsImRldGFpbCIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicmVxdWVzdCIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsIm9ubG9hZCIsInN0YXR1cyIsInJlc3BvbnNlIiwiRXJyb3IiLCJzdGF0dXNUZXh0Iiwib25lcnJvciIsInNlbmQiLCJzdGFydFRpbWUiLCJlbmRUaW1lIiwiVVJMIiwiTWF0aCIsInJhbmRvbSIsInNpemUiLCJkb3dubG9hZCIsIkltYWdlIiwidGltZW91dCIsIkRhdGUiLCJnZXRUaW1lIiwic3BlZWRCcHMiLCJ0b0ZpeGVkIiwibG9nTWVzc2FnZSIsInNyYyIsInNldFRpbWVvdXQiLCJjb21wbGV0ZSIsIm5hdHVyYWxXaWR0aCIsImNiIiwibWluU3BlZWQiLCJjaGVja0Nvbm5lY3Rpb25TcGVlZCIsInRoZW4iLCJyZXN1bHQiLCJlcnJNZXNzYWdlIiwibWVzc2FnZSIsImhpZGVTcGlubmVyIiwiQ1BsYXllciIsInBhcmVudCIsImluaXRlZCIsInZpZGVvU1JDIiwiaW5pdEhUTUwiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsInBvc3RlciIsInNldFBvc3RlciIsImNhblBsYXlUeXBlIiwibXV0ZWQiLCJhdXRvcGxheSIsIm9ubG9hZGVkZGF0YSIsIm9udGltZXVwZGF0ZSIsInRyaWdnZXJFdmVudCIsInRhcmdldCIsImN1cnJlbnRUaW1lIiwid2VibSIsIm1wNCIsIm9nZyIsImZldGNoVmlkZW8iLCJibG9iIiwic2V0QXR0cmlidXRlIiwiY3JlYXRlT2JqZWN0VVJMIiwiY2F0Y2giLCJmaW5hbGx5IiwiZmV0Y2hEYXRhIiwicGF1c2VkIiwicGxheSIsInBhdXNlIiwiR2V0Q29vcmRzIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwicGFnZVlPZmZzZXQiLCJib3R0b20iLCJBbmNob3JBZGRlciIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJuYW1lIiwiYmFzZVVybCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0IiwicGF0aG5hbWUiLCJuZXdVcmwiLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwiU2NyZWVuU2xpZGVyIiwiaWQiLCJtYWluQ29udGFpbmVyIiwic2VjdGlvbnMiLCJjb250YWlucyIsImRpc2FibGUiLCJ0b1N0YW5kYXJ0U2Nyb2xsIiwiZm9nIiwic21va2UxIiwic21va2UyIiwic21va2UzIiwic21va2UxQmxhY2siLCJzbW9rZTJCbGFjayIsInNtb2tlM0JsYWNrIiwiYWN0aXZlU21va2UxIiwiYWN0aXZlU21va2UyIiwiYWN0aXZlU21va2UzIiwiY29sb3JUaGVtZSIsInByb2dyZXNzQmFyIiwiY3VycmVudFNlY3Rpb24iLCJzY3JvbGxEaXJlY3Rpb24iLCJjaGFuZ2VFbGVtZW50VmlzaWJsZSIsImluZGV4T2YiLCJsZW5ndGgiLCJmbG9vciIsImdldENvb3JkcyIsImNsaWVudEhlaWdodCIsImlubmVySGVpZ2h0IiwiZm9yRWFjaCIsIml0ZW0iLCJmaXhlZEJsb2NrIiwiZWxlbUNvb3JkcyIsInN0eWxlIiwib3BhY2l0eSIsIndpZHRoIiwiY2FsY1Njcm9sbFBlcmNlbnQiLCJ1bmRlZmluZWQiLCJkaXNwbGF5IiwiZGlyZWN0aW9uIiwidHJhbnNpdGlvbiIsImNvbG9yU3RhdGUiLCJzZXRBY3RpdmVUaGVtZSIsInRoZW1lIiwiYmFja2dyb3VuZENvbG9yIiwiQ29sb3JTZXR0ZXIiLCJhbGxTZWN0aW9ucyIsImJsYWNrU2VjdGlvbnNDb29yZCIsImdldEJsYWNrU2VjdGlvbnNDb29yZHMiLCJjb29yZHMiLCJwdXNoIiwiU2Nyb2xsSGFuZGxlciIsInNlY3Rpb25TbGlkZXIiLCJhbmNob3JBZGRlciIsImNvbG9yU2V0dGVyIiwic2Nyb2xsSGFuZGxlciIsIm9mZnNldCIsImFkZEV2ZW50TGlzdGVuZXIiLCJzZXRDb2xvclN0YXRlIiwic2V0QWJvdmVCZ09wYWNpdHkiLCJhbmNob3JzTGluayIsImFuY2hvclRvcENvb3JkIiwiYWRkQW5jaG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztJQUFBQSxROzs7Ozs7O2tDQUVBO0FBQ0EsVUFBQUMsTUFBQSxHQUFBQyxRQUFBLENBQUFDLGFBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQUYsTUFBQUEsTUFBQSxDQUFBRyxTQUFBLENBQUFDLEdBQUEsQ0FBQSxRQUFBO0FBQ0E7OztrQ0FFQTtBQUNBLFVBQUFKLE1BQUEsR0FBQUMsUUFBQSxDQUFBQyxhQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0FGLE1BQUFBLE1BQUEsQ0FBQUcsU0FBQSxDQUFBRSxNQUFBLENBQUEsUUFBQTtBQUNBOzs7K0JBRUFDLEcsRUFBQTtBQUNBO0FBQ0FDLE1BQUFBLE9BQUEsQ0FBQUMsR0FBQSxrQkFBQUYsR0FBQSxHQUZBLENBRUE7QUFDQTs7OytCQUVBRyxLLEVBQUE7QUFDQUYsTUFBQUEsT0FBQSxDQUFBQyxHQUFBLGtCQUFBQyxLQUFBO0FBQ0E7OztpQ0FFQUMsSSxFQUFBQyxJLEVBQUE7QUFBQSxVQUFBQyxPQUFBLHVFQUFBWCxRQUFBO0FBQ0Es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QUEsRUFBQTtBQUNBLGNBQUErQixjQUFBLEdBQUFoRixTQUFBLENBQUE2QyxTQUFBLENBQUFJLElBQUEsRUFBQTlDLEdBQUE7O0FBRUEsY0FBQUMsV0FBQSxJQUFBNEUsY0FBQSxJQUFBNUUsV0FBQSxJQUFBNEUsY0FBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsTUFBQSxDQUFBUixXQUFBLENBQUFTLFNBQUEsQ0FBQWhDLElBQUEsQ0FBQXhDLElBQUE7QUFDQTtBQUNBLFNBTkE7QUFRQSxPQXhCQTtBQXlCQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENIZWxwZXJzIHtcblxuICAgIHN0YXRpYyBzaG93U3Bpbm5lcigpIHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkZXJcIik7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaGlkZVNwaW5uZXIoKSB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGVyXCIpO1xuICAgICAgICBsb2FkZXIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvZ01lc3NhZ2UobXNnKSB7XG4gICAgICAgIC8vIG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGluZSBmcm9tIHByb2QgYnVpbGQgb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2coYE1FU1NHOiAke21zZ31gKTsgLy8gLS0tIERFQlVHIC0tLVxuICAgIH1cblxuICAgIHN0YXRpYyBlcnJNZXNzYWdlKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBFUlJPUjogJHtlcnJvcn1gKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgdHJpZ2dlckV2ZW50KHR5cGUsIGRhdGEsIGVsZW1lbnQgPSBkb2N1bWVudCkge1xuICAgICAgICBsZXQgZXZlbnQgPSBuZXcgdGhpcy5jcmVhdGVOZXdFdmVudCh0eXBlLCBkYXRhKTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlTmV3RXZlbnQodHlwZSwgZGF0YSkge1xuICAgICAgICBsZXQgZXZlbnQ7XG4gICAgICAgIGlmICh0eXBlb2YgKEN1c3RvbUV2ZW50KSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWw6IGRhdGEgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBmZXRjaERhdGEodXJsLCB0eXBlPSdqc29uJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgbmV0d29yayBlcnJvciBnZXR0aW5nICR7dXJsfWApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tDb25uZWN0aW9uU3BlZWQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RhcnRUaW1lLCBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIFVSTCA9IFwiLy9zdGF0aWMuMXR2LnJ1L3BsYXllci9zYW5pdGFyL25ldy9taXNjL2ltZzVtYi5qcGdcIiArIFwiP3I9XCIgKyBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgICAgIHNpemUgPSA0OTk1Mzc0LCAvLyA1LjM2TWJcbiAgICAgICAgICAgICAgICBkb3dubG9hZCA9IG5ldyBJbWFnZSgpLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSAzMDAwMDsgLy8gMzAgc2Vjc1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNwZWVkQnBzID0gKChzaXplICogOCkgLyAoZW5kVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoJ2NoZWNrVXNlckNvbm5lY3Rpb24sIHNwZWVkICcgKyBzcGVlZEJwcyArICcgbWJpdHMgcGVyIHNlYycpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc3BlZWRCcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG93bmxvYWQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIGVycm9yIGRvd25sb2FkaW5nICR7VVJMfWApKTtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBkb3dubG9hZC5zcmMgPSBVUkw7XG4gICAgICAgICAgICAvLyBhYm9ydCBkb3dubG9hZGluZyBvbiB0aW1lb3V0XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkb3dubG9hZC5jb21wbGV0ZSB8fCAhZG93bmxvYWQubmF0dXJhbFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZC5zcmMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIHRpbWVvdXQgZG93bmxvYWRpbmcgJHtVUkx9YCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tVc2VyQ29ubmVjdGlvbihjYikge1xuICAgICAgICBsZXQgbWluU3BlZWQgPSAzOyAvLyAzIG1iaXQgcGVyIHNlYztcbiAgICAgICAgY2IgPSBjYiB8fCAoKCkgPT4ge30pO1xuXG4gICAgICAgIENIZWxwZXJzLmNoZWNrQ29ubmVjdGlvblNwZWVkKGNiKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgY29ubmVjdGlvbiBmYXN0LCBzcGVlZCA+ICR7bWluU3BlZWR9IG1iaXQgcGVyIHNlY2ApO1xuICAgICAgICAgICAgICAgICAgICBjYihyZXN1bHQgPj0gbWluU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgICAgICBjYihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG59IiwiY2xhc3MgQ1BsYXllciB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5pbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52aWRlb1NSQyA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLmluaXRIVE1MKGVsZW1lbnQsIGRhdGEpKVxuICAgICAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGluaXRIVE1MKGVsZW1lbnQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50KTtcbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgQ0hlbHBlcnMuZXJyTWVzc2FnZSgnZW1wdHkgcGFyZW50IGZvciB2aWRlbyBlbGVtZW50Jyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCdlbXB0eSBkYXRhIGZvciB2aWRlbyBlbGVtZW50Jyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKVxuICAgICAgICB0aGlzLnBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICAgICAgICBpZiAoZGF0YS5wb3N0ZXIpXG4gICAgICAgICAgICB0aGlzLnNldFBvc3RlcihkYXRhLnBvc3Rlcik7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKSB7XG4gICAgICAgICAgICBDSGVscGVycy5sb2dNZXNzYWdlKCdwbGF5ZXIgY2FuIG5vdCBiZSBpbml0ZWQsIGNhbmB0IHBsYXlpbmcgdmlkZW8nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQubXV0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQub25sb2FkZWRkYXRhICA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9udGltZXVwZGF0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgQ0hlbHBlcnMudHJpZ2dlckV2ZW50KCdwbGF5ZXIudGltZXVwZGF0ZScsIHsgJ3RpbWUnOiBldmVudC50YXJnZXQuY3VycmVudFRpbWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRTb3VyY2UoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5zcmMud2VibSAmJiB0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUoXCJ2aWRlby93ZWJtXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU1JDID0gZGF0YS5zcmMud2VibTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zcmMubXA0ICYmIHRoaXMuZWxlbWVudC5jYW5QbGF5VHlwZShcInZpZGVvL21wNFwiKSkge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm1wNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLnNyYy5vZ2cgJiYgdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKFwidmlkZW8vb2dnXCIpKSAge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm9nZztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52aWRlb1NSQykge1xuICAgICAgICAgICAgdGhpcy5mZXRjaFZpZGVvKHRoaXMudmlkZW9TUkMgKyAnP3I9JyArIE1hdGgucmFuZG9tKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGJsb2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZSgndmlkZW8gZmV0Y2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCd1bmFibGUgdG8gZmV0Y2ggdmlkZW8uICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmluYWxseSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFBvc3Rlcih1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3Bvc3RlcicsIHVybCk7XG4gICAgfVxuXG4gICAgZmV0Y2hWaWRlbyh1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHJldHVybiBDSGVscGVycy5mZXRjaERhdGEodXJsLCdibG9iJyk7XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGxheSgpO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGF1c2UoKTtcbiAgICB9XG59IiwiY2xhc3MgR2V0Q29vcmRzIHtcbiAgc3RhdGljIGdldENvb3JkcyhlbGVtZW50KSB7XG4gICAgY29uc3QgYm94ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogYm94LnRvcCArIHBhZ2VZT2Zmc2V0LCBcbiAgICAgIGJvdHRvbTogYm94LmJvdHRvbSArIHBhZ2VZT2Zmc2V0ICBcbiAgICB9OyBcbiAgfSBcbn0iLCJjbGFzcyBBbmNob3JBZGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICghaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBhZGRBbmNob3IobmFtZSkge1xuICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgdmFyIG5ld1VybCA9IGJhc2VVcmwgKyBgIyR7bmFtZX1gO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIG5ld1VybCk7XG4gIH0gXG5cbiAgZ2V0IGFuY2hvcnNMaW5rICgpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhLmFuY2hvcicpKTtcbiAgfVxufSIsImNsYXNzIFNjcmVlblNsaWRlciB7XG4gIGNvbnN0cnVjdG9yKGlkKSB7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgIyR7aWR9YCk7XG5cbiAgICBpZiAoIXRoaXMubWFpbkNvbnRhaW5lcikge1xuICAgICAgdGhyb3cobmV3IEVycm9yKCdJZCDQvdC1INC/0LXRgNC10LTQsNC9INCyINC60L7QvdGB0YLRgNGD0LrRgtC+0YAg0Y3Qu9C10LzQtdC90YLQsCBTY3JlZW5TbGlkZXIsINC70LjQsdC+INGN0LvQtdC80LXQvdGCINC90LUg0L3QsNC50LTQtdC9INC90LAg0YHRgtGA0LDQvdC40YbQtScpKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlY3Rpb25zID0gQXJyYXkuZnJvbSh0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmZ1bGwtc2Nyb2xsX19lbGVtZW50JykpO1xuXG4gICAgaWYgKHRoaXMubWFpbkNvbnRhaW5lci5jbGFzc0xpc3QuY29udGFpbnMoJ2Z1bGwtc2Nyb2xsX190by1zdGFuZGFydC1zY3JvbGwnKSkge1xuICAgICAgdGhpcy5kaXNhYmxlID0gdHJ1ZTtcbiAgICAgIHRoaXMudG9TdGFuZGFydFNjcm9sbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZm9nID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fZm9nJyk7XG5cbiAgICB0aGlzLnNtb2tlMSA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMScpO1xuICAgIHRoaXMuc21va2UyID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmcyJyk7XG4gICAgdGhpcy5zbW9rZTMgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzMnKTtcblxuICAgIHRoaXMuc21va2UxQmxhY2sgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19zbW9rZV9iZzEtYmxhY2snKTtcbiAgICB0aGlzLnNtb2tlMkJsYWNrID0gdGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fc21va2VfYmcyLWJsYWNrJyk7XG4gICAgdGhpcy5zbW9rZTNCbGFjayA9IHRoaXMubWFpbkNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMy1ibGFjaycpO1xuICAgIFxuICAgIHRoaXMuYWN0aXZlU21va2UxO1xuICAgIHRoaXMuYWN0aXZlU21va2UyO1xuICAgIHRoaXMuYWN0aXZlU21va2UzO1xuXG4gICAgdGhpcy5jb2xvclRoZW1lID0gJ3doaXRlJztcblxuICAgIHRoaXMucHJvZ3Jlc3NCYXIgPSB0aGlzLm1haW5Db250YWluZXIucXVlcnlTZWxlY3RvcignLmZ1bGwtc2Nyb2xsX19wcm9ncmVzcy1iYXInKTtcblxuICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSAnJztcbiAgICB0aGlzLnNjcm9sbERpcmVjdGlvbjtcblxuICAgIHRoaXMuY2hhbmdlRWxlbWVudFZpc2libGUoKTtcbiAgICBcbiAgfVxuICBcbiAgY2FsY1Njcm9sbFBlcmNlbnQoKSB7XG4gICAgaWYgKHRoaXMuc2VjdGlvbnMuaW5kZXhPZih0aGlzLmN1cnJlbnRTZWN0aW9uKSA9PT0gdGhpcy5zZWN0aW9ucy5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcigocGFnZVlPZmZzZXQgLSBHZXRDb29yZHMuZ2V0Q29vcmRzKHRoaXMuY3VycmVudFNlY3Rpb24pLnRvcCkgLyAodGhpcy5jdXJyZW50U2VjdGlvbi5jbGllbnRIZWlnaHQgLSB3aW5kb3cuaW5uZXJIZWlnaHQpICAqIDEwMCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY3VycmVudFNlY3Rpb24pIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChwYWdlWU9mZnNldCAtIEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikudG9wKSAvIHRoaXMuY3VycmVudFNlY3Rpb24uY2xpZW50SGVpZ2h0ICogMTAwKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VFbGVtZW50VmlzaWJsZSgpIHtcbiAgICB0aGlzLnNlY3Rpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb25zdCBmaXhlZEJsb2NrID0gaXRlbS5xdWVyeVNlbGVjdG9yKCcuZnVsbC1zY3JvbGxfX2ZpeGVkLXdyYXBwZXInKTtcbiAgICAgIGNvbnN0IGVsZW1Db29yZHMgPSBHZXRDb29yZHMuZ2V0Q29vcmRzKGl0ZW0pO1xuICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGVsZW1Db29yZHMudG9wICYmIGVsZW1Db29yZHMuYm90dG9tID49IHBhZ2VZT2Zmc2V0KSB7XG4gICAgICAgIHRoaXMuY3VycmVudFNlY3Rpb24gPSBpdGVtO1xuICAgICAgICBmaXhlZEJsb2NrLmNsYXNzTGlzdC5hZGQoJ2Z1bGwtc2Nyb2xsX19maXgtc3RhdGUnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbiA9PT0gdGhpcy5zZWN0aW9uc1t0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDFdKSB7XG4gICAgICAgIGlmIChwYWdlWU9mZnNldCA+PSBHZXRDb29yZHMuZ2V0Q29vcmRzKHRoaXMuY3VycmVudFNlY3Rpb24pLmJvdHRvbSAtIHdpbmRvdy5pbm5lckhlaWdodCkge1xuICAgICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2xhc3QtZWxlbScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LnJlbW92ZSgnZnVsbC1zY3JvbGxfX2xhc3QtZWxlbScpO1xuICAgICAgICB9XG4gICAgICB9IFxuICAgIH0pO1xuICB9XG4gIFxuICBzZXRBYm92ZUJnT3BhY2l0eSgpIHtcblxuICAgIGlmICh0aGlzLmNvbG9yVGhlbWUgPT09ICd3aGl0ZScpIHtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UxID0gdGhpcy5zbW9rZTE7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMiA9IHRoaXMuc21va2UyO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMgPSB0aGlzLnNtb2tlMztcblxuICAgICAgdGhpcy5zbW9rZTFCbGFjay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UyQmxhY2suc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB0aGlzLnNtb2tlM0JsYWNrLnN0eWxlLm9wYWNpdHkgPSAwO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UxID0gdGhpcy5zbW9rZTFCbGFjaztcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyID0gdGhpcy5zbW9rZTJCbGFjaztcbiAgICAgIHRoaXMuYWN0aXZlU21va2UzID0gdGhpcy5zbW9rZTNCbGFjaztcblxuICAgICAgdGhpcy5zbW9rZTEuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB0aGlzLnNtb2tlMy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgIH1cblxuICAgIC8vINCf0L7QutCw0LfRi9Cy0LDQtdC8INGB0LrRgNC+0LvQu9Cx0LDRgFxuICAgIHRoaXMucHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKyAnJSc7XG4gICAgXG4gICAgLy8g0JXRgdC70Lgg0LzRiyDQvdCw0YXQvtC00LjQvNGB0Y8g0L3QtSDQsiDQvtCx0LvQsNGB0YLQuCDQv9GA0L7RgdC80L7RgtGA0LAg0YHQtdC60YbQuNC4LCDQstGB0LUg0YHQu9C+0LjRhSDRgdCy0LXRgNGF0YMgZGlzcGxheSA9ICdub25lJyxcbiAgICAvLyDQp9GC0L7QsdGLINC90LAg0LTRgNGD0LPQuNGFINGN0LrRgNCw0L3QsNGFINC+0L3QuCDQvdC1INC/0LXRgNC10LrRgNGL0LLQsNC70Lgg0LrQvtC90YLQtdC90YJcblxuICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCAwIHx8IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+IDEwMCkge1xuICAgICAgdGhpcy5mb2cuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICB0aGlzLnNtb2tlMS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgIHRoaXMuc21va2UxQmxhY2suc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgdGhpcy5zbW9rZTJCbGFjay5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlM0JsYWNrLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgdGhpcy5wcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IDA7XG5cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb2cuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICB9XG5cbiAgICAvLyDQntCx0YDQsNCx0LDRgtGL0LLQsNC10Lwg0YHQutGA0L7Qu9C7INCy0L3QuNC3XG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuXG4gICAgICAvLyDQlNC70Y8g0L/QtdGA0LLQvtCz0L4g0Y3Qu9C10LzQtdC90YLQsCDQvdC1INC00LXQu9Cw0LXQvCDQsNC90LjQvNCw0YbQuNC5IFwi0LLRhdC+0LTQsFwiXG4gICAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pICE9PSAwKSB7XG5cbiAgICAgICAgLy8g0JXRgdC70Lgg0YHQutGA0L7Qu9C7INC80LXQvdGM0YjQtSAyNSUsINGC0L4g0YPQsdC40YDQsNC10Lwg0L/RgNC+0LfRgNCw0YfQvdC+0YHRgtGMINGDIFwi0YLRg9C80LDQvdCwXCIuXG4gICAgICAgIC8vINC4INGD0YHRgtCw0L3QsNCy0LvQuNCy0LDQtdC8INGB0LrQvtGA0L7RgdGC0Ywg0YLRgNCw0L3Qt9C40YjQtdC90LAsINGH0YLQvtCx0Ysg0LHRi9C70L4g0L/Qu9Cw0LLQvdC+LlxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDI1KSB7XG4gICAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyDQldGB0LvQuCDQvdC10YIsINGC0L4g0LLQvtC30LLRgNCw0YnQsNC10Lwg0YLRgNCw0L3Qt9C40YjQvSDQsiDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC/0L7Qu9C+0LbQtdC90LjQtVxuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAwLjJzJztcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIC8vINCU0LvRjyDQv9C+0YHQu9C10LTQvdC10LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQktGL0YXQvtC00LBcIi4gXG4gICAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbiAhPT0gdGhpcy5zZWN0aW9uc1t0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDFdKSB7XG5cbiAgICAgICAgLy8gINCU0YvQvCDQstGL0YXQvtC0XG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDY1KSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA3MCkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNzUpIHtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS5vcGFjaXR5ID0gKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSAtIDc1KSAqIDUgKyAnJSc7XG4gICAgICAgIH0gXG4gICAgICB9XG5cblxuICAgICAgLy8g0JTRi9C8INCy0YXQvtC0XG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDwgNDAgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcblxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSAxMyAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCA0MCAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLWJvdHRvbScpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDEwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDQwICYmIHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMy5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG5cbiAgICB9XG5cblxuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLXRvcCcpIHtcbiAgICAgIC8vINCU0LvRjyDQv9C10YDQstC+0LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQstGF0L7QtNCwXCJcbiAgICAgIFxuICAgICAgaWYgKHRoaXMuc2VjdGlvbnMuaW5kZXhPZih0aGlzLmN1cnJlbnRTZWN0aW9uKSAhPT0gMCkge1xuXG4gICAgICAgIC8vINCU0LXQu9Cw0LXQvCBcItC30LDRgtC10L3QtdC90LjQtVwiLCDQtdGB0LvQuCDQuNC00ZHQvCDQstCy0LXRgNGFXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjUpIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygxMjUgLSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKiA0ICsgJyUnKTtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS5vcGFjaXR5ID0gMTI1IC0gdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpICogNCArICclJztcbiAgICAgICAgfSBcblxuICAgICAgICAvLyDQlNGL0Lwg0L/RgNC4INC/0YDQvtC60YDRg9GC0LrQtSDQstCy0LXRgNGFXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMTUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDIzKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAzNSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDg1KSB7XG4gICAgICAgIHRoaXMuZm9nLnN0eWxlLnRyYW5zaXRpb24gPSAnb3BhY2l0eSAxcyc7XG4gICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8g0JXRgdC70Lgg0L3QtdGCLCDRgtC+INCy0L7Qt9Cy0YDQsNGJ0LDQtdC8INGC0YDQsNC90LfQuNGI0L0g0LIg0YHRgtCw0L3QtNCw0YDRgtC90L7QtSDQv9C+0LvQvtC20LXQvdC40LVcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuMnMnO1xuICAgICAgfVxuXG4gICAgICAvLyDQlNGL0Lwg0LLQstC10YDRhSDQt9Cw0YLQvNC10L3QtdC90LjQtSDQv9GA0Lgg0L/QtdGA0LXRhdC+0LTQtSDRgSDQv9GA0LXQtNGL0LTRg9GJ0LXQs9C+XG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDkwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1MCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG4gIFxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA4MCAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTIuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuICBcbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gNzUgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUwKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcbiAgICAgIFxuICAgIH1cblxuICAgIC8vINCc0LXQvdGP0LXQvCDQvtGB0L3QvtCy0L3QvtC5INGG0LLQtdGCXG4gICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA0MCAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gNjApIHtcbiAgICAgIGlmICh3aW5kb3cuY29sb3JTdGF0ZSA9PT0gJ2JsYWNrJykge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZVRoZW1lKCdibGFjaycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmVUaGVtZSgnd2hpdGUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRBY3RpdmVUaGVtZSh0aGVtZSA9ICd3aGl0ZScpIHtcbiAgICBpZiAodGhlbWUgPT09ICd3aGl0ZScpIHtcbiAgICAgIHRoaXMuY29sb3JUaGVtZSA9ICd3aGl0ZSc7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnI2ZkZjVlNic7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29sb3JUaGVtZSA9ICdibGFjayc7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSAnIzAzMGMxYSc7XG4gICAgfVxuICB9XG5cbiAgdG9TdGFuZGFydFNjcm9sbCgpIHtcbiAgICB0aGlzLnNlY3Rpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ2Z1bGwtc2Nyb2xsX19lbGVtZW50LXN0YW5kYXJkLWhlaWdodCcpO1xuICAgIH0pO1xuICB9XG4gIFxufSIsImNsYXNzIENvbG9yU2V0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5hbGxTZWN0aW9ucyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmJsYWNrLXNlY3Rpb24nKSk7XG4gICAgdGhpcy5ibGFja1NlY3Rpb25zQ29vcmQgPSB0aGlzLmdldEJsYWNrU2VjdGlvbnNDb29yZHMoKTtcbiAgfVxuXG4gIGdldEJsYWNrU2VjdGlvbnNDb29yZHMoKSB7XG4gICAgY29uc3QgY29vcmRzID0gW11cbiAgICBcbiAgICB0aGlzLmFsbFNlY3Rpb25zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBjb29yZHMucHVzaChbR2V0Q29vcmRzLmdldENvb3JkcyhpdGVtKS50b3AsIEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSkuYm90dG9tXSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvb3JkcztcbiAgfVxuXG4gIHNldENvbG9yU3RhdGUoKSB7XG4gICAgbGV0IGNvbG9yU3RhdGU7XG5cbiAgICB0aGlzLmJsYWNrU2VjdGlvbnNDb29yZC5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGl0ZW1bMF0gJiYgcGFnZVlPZmZzZXQgPD0gaXRlbVsxXSkge1xuICAgICAgICBjb2xvclN0YXRlID0gJ2JsYWNrJztcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbG9yU3RhdGUgPyB3aW5kb3cuY29sb3JTdGF0ZSA9IGNvbG9yU3RhdGUgOiB3aW5kb3cuY29sb3JTdGF0ZSA9ICd3aGl0ZSdcbiAgfVxufSIsImNsYXNzIFNjcm9sbEhhbmRsZXIge1xuICBjb25zdHJ1Y3RvcihzZWN0aW9uU2xpZGVyLCBhbmNob3JBZGRlciwgY29sb3JTZXR0ZXIpIHtcbiAgICB0aGlzLnNlY3Rpb25TbGlkZXIgPSBzZWN0aW9uU2xpZGVyO1xuICAgIHRoaXMuYW5jaG9yQWRkZXIgPSBhbmNob3JBZGRlcjtcbiAgICB0aGlzLmNvbG9yU2V0dGVyID0gY29sb3JTZXR0ZXI7XG5cbiAgICB0aGlzLnNjcm9sbEhhbmRsZXIoKTtcbiAgfVxuXG4gIHNjcm9sbEhhbmRsZXIoKSB7XG4gICAgbGV0IG9mZnNldCA9IHBhZ2VZT2Zmc2V0O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgICB0aGlzLmNvbG9yU2V0dGVyLnNldENvbG9yU3RhdGUoKTtcblxuICAgICAgaWYgKCF0aGlzLnNlY3Rpb25TbGlkZXIuZGlzYWJsZSkge1xuICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuY2hhbmdlRWxlbWVudFZpc2libGUoKTtcbiAgICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLnNldEFib3ZlQmdPcGFjaXR5KCk7XG4gIFxuICAgICAgICBpZiAocGFnZVlPZmZzZXQgLSBvZmZzZXQgPCAwKSB7XG4gICAgICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLmRpcmVjdGlvbiA9ICd0by10b3AnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2VjdGlvblNsaWRlci5kaXJlY3Rpb24gPSAndG8tYm90dG9tJztcbiAgICAgICAgfVxuICBcbiAgICAgICAgb2Zmc2V0ID0gcGFnZVlPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYW5jaG9yQWRkZXIuYW5jaG9yc0xpbmsuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgbGV0IGFuY2hvclRvcENvb3JkID0gR2V0Q29vcmRzLmdldENvb3JkcyhpdGVtKS50b3A7XG4gICAgICAgIFxuICAgICAgICBpZiAocGFnZVlPZmZzZXQgPj0gYW5jaG9yVG9wQ29vcmQgJiYgcGFnZVlPZmZzZXQgPD0gYW5jaG9yVG9wQ29vcmQgKyA1MDApIHtcbiAgICAgICAgICB0aGlzLmFuY2hvckFkZGVyLmFkZEFuY2hvcihpdGVtLm5hbWUpO1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
