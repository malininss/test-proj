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
}(); // Полифилл для prepend. Нужно понять, почему он только напрямую работает


(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('prepend')) {
      return;
    }

    Object.defineProperty(item, 'prepend', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function prepend() {
        var argArr = Array.prototype.slice.call(arguments),
            docFrag = document.createDocumentFragment();
        argArr.forEach(function (argItem) {
          var isNode = argItem instanceof Node;
          docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
        });
        this.insertBefore(docFrag, this.firstChild);
      }
    });
  });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

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

    this.colorTheme = 'white';
    this.currentSection = '';
    this.scrollDirection;
    this.changeElementVisible();
    this.render();
  }

  _createClass(ScreenSlider, [{
    key: "render",
    value: function render() {
      var divCreater = function divCreater(className) {
        var elem = document.createElement('div');
        className.forEach(function (item) {
          elem.classList.add(item);
        });
        return elem;
      };

      this.smoke3Black = divCreater(['full-scroll__smoke', 'full-scroll__smoke_bg3-black']);
      this.mainContainer.prepend(this.smoke3Black);
      this.smoke2Black = divCreater(['full-scroll__smoke', 'full-scroll__smoke_bg2-black']);
      this.mainContainer.prepend(this.smoke2Black);
      this.smoke1Black = divCreater(['full-scroll__smoke', 'full-scroll__smoke_bg1-black']);
      this.mainContainer.prepend(this.smoke1Black);
      this.smoke3 = divCreater(['full-scroll__smoke', 'full-scroll__smoke_bg3']);
      this.mainContainer.prepend(this.smoke3);
      this.smoke2 = divCreater(['full-scroll__smoke', 'full-scroll__smoke_bg2']);
      this.mainContainer.prepend(this.smoke2);
      this.smoke1 = divCreater(['full-scroll__smoke', 'full-scroll__smoke_bg1']);
      this.mainContainer.prepend(this.smoke1);
      this.progressBar = divCreater(['full-scroll__progress-bar']);
      this.mainContainer.prepend(this.progressBar);
      this.fog = divCreater(['full-scroll__smoke', 'full-scroll__fog']);
      this.mainContainer.prepend(this.fog);
      var backgroundsWrappers = Array.from(document.querySelectorAll('.full-scroll__fixed-wrapper'));
      backgroundsWrappers.forEach(function (item) {
        if (item.dataset.background) {
          item.style.backgroundImage = "url(".concat(item.dataset.background, ")");
        }
      });
    }
  }, {
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
          window.scrollDirection = _this3.sectionSlider.direction;
        }

        _this3.anchorAdder.anchorsLink.forEach(function (item) {
          var anchorTopCoord = GetCoords.getCoords(item).top;

          if (pageYOffset >= anchorTopCoord && pageYOffset <= anchorTopCoord + 500) {
            _this3.anchorAdder.addAnchor(item.id);
          }
        });
      });
    }
  }]);

  return ScrollHandler;
}();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi9zaGFyZWQvSGVscGVycy5qcyIsImNvbW1vbi9zaGFyZWQvVmlkZW8uanMiLCJjb21tb24vc2hhcmVkL0dldENvb3Jkcy5qcyIsImNvbW1vbi9BbmNob3JBZGRlci5qcyIsImNvbW1vbi9TY3JlZW5TbGlkZXIuanMiLCJjb21tb24vQ29sb3JTZXR0ZXIuanMiLCJjb21tb24vU2Nyb2xsSGFuZGxlci5qcyJdLCJuYW1lcyI6WyJDSGVscGVycyIsImxvYWRlciIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvciIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsIm1zZyIsImNvbnNvbGUiLCJsb2ciLCJlcnJvciIsInR5cGUiLCJkYXRhIiwiZWxlbWVudCIsImV2ZW50IiwiY3JlYXRlTmV3RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiQ3VzdG9tRXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRDdXN0b21FdmVudCIsImRldGFpbCIsInVybCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicmVxdWVzdCIsIlhNTEh0dHBSZXF1ZXN0Iiwib3BlbiIsInJlc3BvbnNlVHlwZSIsIm9ubG9hZCIsInN0YXR1cyIsInJlc3BvbnNlIiwiRXJyb3IiLCJzdGF0dXNUZXh0Iiwib25lcnJvciIsInNlbmQiLCJzdGFydFRpbWUiLCJlbmRUaW1lIiwiVVJMIiwiTWF0aCIsInJhbmRvbSIsInNpemUiLCJkb3dubG9hZCIsIkltYWdlIiwidGltZW91dCIsIkRhdGUiLCJnZXRUaW1lIiwic3BlZWRCcHMiLCJ0b0ZpeGVkIiwibG9nTWVzc2FnZSIsInNyYyIsInNldFRpbWVvdXQiLCJjb21wbGV0ZSIsIm5hdHVyYWxXaWR0aCIsImNiIiwibWluU3BlZWQiLCJjaGVja0Nvbm5lY3Rpb25TcGVlZCIsInRoZW4iLCJyZXN1bHQiLCJlcnJNZXNzYWdlIiwibWVzc2FnZSIsImhpZGVTcGlubmVyIiwiQ1BsYXllciIsInBhcmVudCIsImluaXRlZCIsInZpZGVvU1JDIiwiaW5pdEhUTUwiLCJnZXRFbGVtZW50QnlJZCIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmRDaGlsZCIsInBvc3RlciIsInNldFBvc3RlciIsImNhblBsYXlUeXBlIiwibXV0ZWQiLCJhdXRvcGxheSIsIm9ubG9hZGVkZGF0YSIsIm9udGltZXVwZGF0ZSIsInRyaWdnZXJFdmVudCIsInRhcmdldCIsImN1cnJlbnRUaW1lIiwid2VibSIsIm1wNCIsIm9nZyIsImZldGNoVmlkZW8iLCJibG9iIiwic2V0QXR0cmlidXRlIiwiY3JlYXRlT2JqZWN0VVJMIiwiY2F0Y2giLCJmaW5hbGx5IiwiZmV0Y2hEYXRhIiwicGF1c2VkIiwicGxheSIsInBhdXNlIiwiR2V0Q29vcmRzIiwiYm94IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwidG9wIiwicGFnZVlPZmZzZXQiLCJib3R0b20iLCJBbmNob3JBZGRlciIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJuYW1lIiwiYmFzZVVybCIsIndpbmRvdyIsImxvY2F0aW9uIiwicHJvdG9jb2wiLCJob3N0IiwicGF0aG5hbWUiLCJuZXdVcmwiLCJBcnJheSIsImZyb20iLCJxdWVyeVNlbGVjdG9yQWxsIiwiYXJyIiwiZm9yRWFjaCIsIml0ZW0iLCJoYXNPd25Qcm9wZXJ0eSIsIk9iamVjdCIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwidmFsdWUiLCJwcmVwZW5kIiwiYXJnQXJyIiwicHJvdG90eXBlIiwic2xpY2UiLCJjYWxsIiwiYXJndW1lbnRzIiwiZG9jRnJhZyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJhcmdJdGVtIiwiaXNOb2RlIiwiTm9kZSIsImNyZWF0ZVRleHROb2RlIiwiU3RyaW5nIiwiaW5zZXJ0QmVmb3JlIiwiZmlyc3RDaGlsZCIsIkVsZW1lbnQiLCJEb2N1bWVudCIsIkRvY3VtZW50RnJhZ21lbnQiLCJTY3JlZW5TbGlkZXIiLCJpZCIsIm1haW5Db250YWluZXIiLCJzZWN0aW9ucyIsImNvbnRhaW5zIiwiZGlzYWJsZSIsInRvU3RhbmRhcnRTY3JvbGwiLCJjb2xvclRoZW1lIiwiY3VycmVudFNlY3Rpb24iLCJzY3JvbGxEaXJlY3Rpb24iLCJjaGFuZ2VFbGVtZW50VmlzaWJsZSIsInJlbmRlciIsImRpdkNyZWF0ZXIiLCJjbGFzc05hbWUiLCJlbGVtIiwic21va2UzQmxhY2siLCJzbW9rZTJCbGFjayIsInNtb2tlMUJsYWNrIiwic21va2UzIiwic21va2UyIiwic21va2UxIiwicHJvZ3Jlc3NCYXIiLCJmb2ciLCJiYWNrZ3JvdW5kc1dyYXBwZXJzIiwiZGF0YXNldCIsImJhY2tncm91bmQiLCJzdHlsZSIsImJhY2tncm91bmRJbWFnZSIsImluZGV4T2YiLCJsZW5ndGgiLCJmbG9vciIsImdldENvb3JkcyIsImNsaWVudEhlaWdodCIsImlubmVySGVpZ2h0IiwiZml4ZWRCbG9jayIsImVsZW1Db29yZHMiLCJhY3RpdmVTbW9rZTEiLCJhY3RpdmVTbW9rZTIiLCJhY3RpdmVTbW9rZTMiLCJvcGFjaXR5Iiwid2lkdGgiLCJjYWxjU2Nyb2xsUGVyY2VudCIsInVuZGVmaW5lZCIsImRpc3BsYXkiLCJkaXJlY3Rpb24iLCJ0cmFuc2l0aW9uIiwiY29sb3JTdGF0ZSIsInNldEFjdGl2ZVRoZW1lIiwidGhlbWUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJDb2xvclNldHRlciIsImFsbFNlY3Rpb25zIiwiYmxhY2tTZWN0aW9uc0Nvb3JkIiwiZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcyIsImNvb3JkcyIsInB1c2giLCJTY3JvbGxIYW5kbGVyIiwic2VjdGlvblNsaWRlciIsImFuY2hvckFkZGVyIiwiY29sb3JTZXR0ZXIiLCJzY3JvbGxIYW5kbGVyIiwib2Zmc2V0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldENvbG9yU3RhdGUiLCJzZXRBYm92ZUJnT3BhY2l0eSIsImFuY2hvcnNMaW5rIiwiYW5jaG9yVG9wQ29vcmQiLCJhZGRBbmNob3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQUFBLFE7Ozs7Ozs7a0NBRUE7QUFD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QStDLGFBQUEsQ0FBQU8saUJBQUE7O0FBRUEsY0FBQTVHLFdBQUEsR0FBQXlHLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLE1BQUEsQ0FBQUosYUFBQSxDQUFBYixTQUFBLEdBQUEsUUFBQTtBQUNBLFdBRkEsTUFFQTtBQUNBLFlBQUEsTUFBQSxDQUFBYSxhQUFBLENBQUFiLFNBQUEsR0FBQSxXQUFBO0FBQ0E7O0FBRUFpQixVQUFBQSxNQUFBLEdBQUF6RyxXQUFBO0FBRUFPLFVBQUFBLE1BQUEsQ0FBQThDLGVBQUEsR0FBQSxNQUFBLENBQUFnRCxhQUFBLENBQUFiLFNBQUE7QUFDQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQWMsV0FBQSxDQUFBTyxXQUFBLENBQUE1RixPQUFBLENBQUEsVUFBQUMsSUFBQSxFQUFBO0FBQ0EsY0FBQTRGLGNBQUEsR0FBQWxILFNBQUEsQ0FBQStFLFNBQUEsQ0FBQXpELElBQUEsRUFBQW5CLEdBQUE7O0FBRUEsY0FBQUMsV0FBQSxJQUFBOEcsY0FBQSxJQUFBOUcsV0FBQSxJQUFBOEcsY0FBQSxHQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsTUFBQSxDQUFBUixXQUFBLENBQUFTLFNBQUEsQ0FBQTdGLElBQUEsQ0FBQTJCLEVBQUE7QUFDQTtBQUNBLFNBTkE7QUFRQSxPQTFCQTtBQTJCQSIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENIZWxwZXJzIHtcblxuICAgIHN0YXRpYyBzaG93U3Bpbm5lcigpIHtcbiAgICAgICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5sb2FkZXJcIik7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgaGlkZVNwaW5uZXIoKSB7XG4gICAgICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubG9hZGVyXCIpO1xuICAgICAgICBsb2FkZXIuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGxvZ01lc3NhZ2UobXNnKSB7XG4gICAgICAgIC8vIG5lZWQgdG8gcmVtb3ZlIHRoaXMgbGluZSBmcm9tIHByb2QgYnVpbGQgb3Igc29tZXRoaW5nIGVsc2VcbiAgICAgICAgY29uc29sZS5sb2coYE1FU1NHOiAke21zZ31gKTsgLy8gLS0tIERFQlVHIC0tLVxuICAgIH1cblxuICAgIHN0YXRpYyBlcnJNZXNzYWdlKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBFUlJPUjogJHtlcnJvcn1gKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgdHJpZ2dlckV2ZW50KHR5cGUsIGRhdGEsIGVsZW1lbnQgPSBkb2N1bWVudCkge1xuICAgICAgICBsZXQgZXZlbnQgPSBuZXcgdGhpcy5jcmVhdGVOZXdFdmVudCh0eXBlLCBkYXRhKTtcbiAgICAgICAgZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY3JlYXRlTmV3RXZlbnQodHlwZSwgZGF0YSkge1xuICAgICAgICBsZXQgZXZlbnQ7XG4gICAgICAgIGlmICh0eXBlb2YgKEN1c3RvbUV2ZW50KSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICAgICAgICAgIGV2ZW50LmluaXRDdXN0b21FdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UsIGRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWw6IGRhdGEgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cblxuICAgIHN0YXRpYyBmZXRjaERhdGEodXJsLCB0eXBlPSdqc29uJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3QucmVzcG9uc2VUeXBlID0gdHlwZTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihyZXF1ZXN0LnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgbmV0d29yayBlcnJvciBnZXR0aW5nICR7dXJsfWApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tDb25uZWN0aW9uU3BlZWQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgc3RhcnRUaW1lLCBlbmRUaW1lLFxuICAgICAgICAgICAgICAgIFVSTCA9IFwiLy9zdGF0aWMuMXR2LnJ1L3BsYXllci9zYW5pdGFyL25ldy9taXNjL2ltZzVtYi5qcGdcIiArIFwiP3I9XCIgKyBNYXRoLnJhbmRvbSgpLFxuICAgICAgICAgICAgICAgIHNpemUgPSA0OTk1Mzc0LCAvLyA1LjM2TWJcbiAgICAgICAgICAgICAgICBkb3dubG9hZCA9IG5ldyBJbWFnZSgpLFxuICAgICAgICAgICAgICAgIHRpbWVvdXQgPSAzMDAwMDsgLy8gMzAgc2Vjc1xuXG4gICAgICAgICAgICBkb3dubG9hZC5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgZW5kVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgbGV0IHNwZWVkQnBzID0gKChzaXplICogOCkgLyAoZW5kVGltZSAtIHN0YXJ0VGltZSkgLyAxMDAwKS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgIENIZWxwZXJzLmxvZ01lc3NhZ2UoJ2NoZWNrVXNlckNvbm5lY3Rpb24sIHNwZWVkICcgKyBzcGVlZEJwcyArICcgbWJpdHMgcGVyIHNlYycpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoc3BlZWRCcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG93bmxvYWQub25lcnJvciA9ICgpID0+IHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIGVycm9yIGRvd25sb2FkaW5nICR7VVJMfWApKTtcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgICAgICBkb3dubG9hZC5zcmMgPSBVUkw7XG4gICAgICAgICAgICAvLyBhYm9ydCBkb3dubG9hZGluZyBvbiB0aW1lb3V0XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkb3dubG9hZC5jb21wbGV0ZSB8fCAhZG93bmxvYWQubmF0dXJhbFdpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb3dubG9hZC5zcmMgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoYGNoZWNrVXNlckNvbm5lY3Rpb24sIHRpbWVvdXQgZG93bmxvYWRpbmcgJHtVUkx9YCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aW1lb3V0XG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgY2hlY2tVc2VyQ29ubmVjdGlvbihjYikge1xuICAgICAgICBsZXQgbWluU3BlZWQgPSAzOyAvLyAzIG1iaXQgcGVyIHNlYztcbiAgICAgICAgY2IgPSBjYiB8fCAoKCkgPT4ge30pO1xuXG4gICAgICAgIENIZWxwZXJzLmNoZWNrQ29ubmVjdGlvblNwZWVkKGNiKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZShgY29ubmVjdGlvbiBmYXN0LCBzcGVlZCA+ICR7bWluU3BlZWR9IG1iaXQgcGVyIHNlY2ApO1xuICAgICAgICAgICAgICAgICAgICBjYihyZXN1bHQgPj0gbWluU3BlZWQpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpO1xuICAgICAgICAgICAgICAgICAgICBjYihmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICB9XG59IiwiY2xhc3MgQ1BsYXllciB7XG5cbiAgICBjb25zdHJ1Y3RvcihlbGVtZW50LCBkYXRhKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5pbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52aWRlb1NSQyA9ICcnO1xuXG4gICAgICAgIGlmICh0aGlzLmluaXRIVE1MKGVsZW1lbnQsIGRhdGEpKVxuICAgICAgICAgICAgdGhpcy5pbml0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGluaXRIVE1MKGVsZW1lbnQsIGRhdGEpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChlbGVtZW50KTtcbiAgICAgICAgaWYgKCF0aGlzLnBhcmVudCkge1xuICAgICAgICAgICAgQ0hlbHBlcnMuZXJyTWVzc2FnZSgnZW1wdHkgcGFyZW50IGZvciB2aWRlbyBlbGVtZW50Jyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCdlbXB0eSBkYXRhIGZvciB2aWRlbyBlbGVtZW50Jyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKVxuICAgICAgICB0aGlzLnBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICAgICAgICBpZiAoZGF0YS5wb3N0ZXIpXG4gICAgICAgICAgICB0aGlzLnNldFBvc3RlcihkYXRhLnBvc3Rlcik7XG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKSB7XG4gICAgICAgICAgICBDSGVscGVycy5sb2dNZXNzYWdlKCdwbGF5ZXIgY2FuIG5vdCBiZSBpbml0ZWQsIGNhbmB0IHBsYXlpbmcgdmlkZW8nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsZW1lbnQubXV0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmVsZW1lbnQuYXV0b3BsYXkgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpbml0RXZlbnRzKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQub25sb2FkZWRkYXRhICA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gdGhpcy5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbGVtZW50Lm9udGltZXVwZGF0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgQ0hlbHBlcnMudHJpZ2dlckV2ZW50KCdwbGF5ZXIudGltZXVwZGF0ZScsIHsgJ3RpbWUnOiBldmVudC50YXJnZXQuY3VycmVudFRpbWUgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZXRTb3VyY2UoZGF0YSkge1xuICAgICAgICBpZiAoZGF0YS5zcmMud2VibSAmJiB0aGlzLmVsZW1lbnQuY2FuUGxheVR5cGUoXCJ2aWRlby93ZWJtXCIpKSB7XG4gICAgICAgICAgICB0aGlzLnZpZGVvU1JDID0gZGF0YS5zcmMud2VibTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YS5zcmMubXA0ICYmIHRoaXMuZWxlbWVudC5jYW5QbGF5VHlwZShcInZpZGVvL21wNFwiKSkge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm1wNDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkYXRhLnNyYy5vZ2cgJiYgdGhpcy5lbGVtZW50LmNhblBsYXlUeXBlKFwidmlkZW8vb2dnXCIpKSAge1xuICAgICAgICAgICAgdGhpcy52aWRlb1NSQyA9IGRhdGEuc3JjLm9nZztcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy52aWRlb1NSQykge1xuICAgICAgICAgICAgdGhpcy5mZXRjaFZpZGVvKHRoaXMudmlkZW9TUkMgKyAnP3I9JyArIE1hdGgucmFuZG9tKCkpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGJsb2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ0hlbHBlcnMubG9nTWVzc2FnZSgndmlkZW8gZmV0Y2hlZCcpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwic3JjXCIsIFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5lcnJNZXNzYWdlKCd1bmFibGUgdG8gZmV0Y2ggdmlkZW8uICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmluYWxseSgoKSA9PlxuICAgICAgICAgICAgICAgICAgICBDSGVscGVycy5oaWRlU3Bpbm5lcigpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldFBvc3Rlcih1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3Bvc3RlcicsIHVybCk7XG4gICAgfVxuXG4gICAgZmV0Y2hWaWRlbyh1cmwpIHtcbiAgICAgICAgaWYgKHVybClcbiAgICAgICAgICAgIHJldHVybiBDSGVscGVycy5mZXRjaERhdGEodXJsLCdibG9iJyk7XG4gICAgfVxuXG4gICAgcGxheSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGxheSgpO1xuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudC5wYXVzZWQpXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucGF1c2UoKTtcbiAgICB9XG59IiwiY2xhc3MgR2V0Q29vcmRzIHtcbiAgc3RhdGljIGdldENvb3JkcyhlbGVtZW50KSB7XG4gICAgY29uc3QgYm94ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgXG4gICAgcmV0dXJuIHtcbiAgICAgIHRvcDogYm94LnRvcCArIHBhZ2VZT2Zmc2V0LCBcbiAgICAgIGJvdHRvbTogYm94LmJvdHRvbSArIHBhZ2VZT2Zmc2V0ICBcbiAgICB9OyBcbiAgfSBcbn0iLCJjbGFzcyBBbmNob3JBZGRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmICghaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICBhZGRBbmNob3IobmFtZSkge1xuICAgIHZhciBiYXNlVXJsID0gd2luZG93LmxvY2F0aW9uLnByb3RvY29sICsgXCIvL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XG4gICAgdmFyIG5ld1VybCA9IGJhc2VVcmwgKyBgIyR7bmFtZX1gO1xuICAgIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIG5ld1VybCk7XG4gIH0gXG5cbiAgZ2V0IGFuY2hvcnNMaW5rICgpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdhLmFuY2hvcicpKTtcbiAgfVxufSIsIi8vINCf0L7Qu9C40YTQuNC70Lsg0LTQu9GPIHByZXBlbmQuINCd0YPQttC90L4g0L/QvtC90Y/RgtGMLCDQv9C+0YfQtdC80YMg0L7QvSDRgtC+0LvRjNC60L4g0L3QsNC/0YDRj9C80YPRjiDRgNCw0LHQvtGC0LDQtdGCXG5cbihmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3ByZXBlbmQnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoaXRlbSwgJ3ByZXBlbmQnLCB7XG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICB2YWx1ZTogZnVuY3Rpb24gcHJlcGVuZCgpIHtcbiAgICAgICAgdmFyIGFyZ0FyciA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyksXG4gICAgICAgICAgZG9jRnJhZyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcblxuICAgICAgICBhcmdBcnIuZm9yRWFjaChmdW5jdGlvbiAoYXJnSXRlbSkge1xuICAgICAgICAgIHZhciBpc05vZGUgPSBhcmdJdGVtIGluc3RhbmNlb2YgTm9kZTtcbiAgICAgICAgICBkb2NGcmFnLmFwcGVuZENoaWxkKGlzTm9kZSA/IGFyZ0l0ZW0gOiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShTdHJpbmcoYXJnSXRlbSkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pbnNlcnRCZWZvcmUoZG9jRnJhZywgdGhpcy5maXJzdENoaWxkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59KShbRWxlbWVudC5wcm90b3R5cGUsIERvY3VtZW50LnByb3RvdHlwZSwgRG9jdW1lbnRGcmFnbWVudC5wcm90b3R5cGVdKTtcblxuXG5jbGFzcyBTY3JlZW5TbGlkZXIge1xuICBjb25zdHJ1Y3RvcihpZCkge1xuICAgIHRoaXMubWFpbkNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYCMke2lkfWApO1xuXG4gICAgaWYgKCF0aGlzLm1haW5Db250YWluZXIpIHtcbiAgICAgIHRocm93KG5ldyBFcnJvcignSWQg0L3QtSDQv9C10YDQtdC00LDQvSDQsiDQutC+0L3RgdGC0YDRg9C60YLQvtGAINGN0LvQtdC80LXQvdGC0LAgU2NyZWVuU2xpZGVyLCDQu9C40LHQviDRjdC70LXQvNC10L3RgiDQvdC1INC90LDQudC00LXQvSDQvdCwINGB0YLRgNCw0L3QuNGG0LUnKSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZWN0aW9ucyA9IEFycmF5LmZyb20odGhpcy5tYWluQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5mdWxsLXNjcm9sbF9fZWxlbWVudCcpKTtcblxuICAgIGlmICh0aGlzLm1haW5Db250YWluZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdmdWxsLXNjcm9sbF9fdG8tc3RhbmRhcnQtc2Nyb2xsJykpIHtcbiAgICAgIHRoaXMuZGlzYWJsZSA9IHRydWU7XG4gICAgICB0aGlzLnRvU3RhbmRhcnRTY3JvbGwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmNvbG9yVGhlbWUgPSAnd2hpdGUnO1xuXG4gICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9ICcnO1xuICAgIHRoaXMuc2Nyb2xsRGlyZWN0aW9uO1xuXG4gICAgdGhpcy5jaGFuZ2VFbGVtZW50VmlzaWJsZSgpO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gICAgXG4gIH1cbiAgXG4gIHJlbmRlcigpIHtcblxuICAgIGNvbnN0IGRpdkNyZWF0ZXIgPSAoY2xhc3NOYW1lKSA9PiB7XG4gICAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICBjbGFzc05hbWUuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgZWxlbS5jbGFzc0xpc3QuYWRkKGl0ZW0pO1xuICAgICAgfSlcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIH1cblxuXG4gICAgdGhpcy5zbW9rZTNCbGFjayA9IGRpdkNyZWF0ZXIoWydmdWxsLXNjcm9sbF9fc21va2UnLCAnZnVsbC1zY3JvbGxfX3Ntb2tlX2JnMy1ibGFjayddKTtcbiAgICB0aGlzLm1haW5Db250YWluZXIucHJlcGVuZCh0aGlzLnNtb2tlM0JsYWNrKTtcblxuICAgIHRoaXMuc21va2UyQmxhY2sgPSBkaXZDcmVhdGVyKFsnZnVsbC1zY3JvbGxfX3Ntb2tlJywgJ2Z1bGwtc2Nyb2xsX19zbW9rZV9iZzItYmxhY2snXSk7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyLnByZXBlbmQodGhpcy5zbW9rZTJCbGFjayk7XG5cbiAgICB0aGlzLnNtb2tlMUJsYWNrID0gZGl2Q3JlYXRlcihbJ2Z1bGwtc2Nyb2xsX19zbW9rZScsICdmdWxsLXNjcm9sbF9fc21va2VfYmcxLWJsYWNrJ10pO1xuICAgIHRoaXMubWFpbkNvbnRhaW5lci5wcmVwZW5kKHRoaXMuc21va2UxQmxhY2spO1xuXG4gICAgdGhpcy5zbW9rZTMgPSBkaXZDcmVhdGVyKFsnZnVsbC1zY3JvbGxfX3Ntb2tlJywgJ2Z1bGwtc2Nyb2xsX19zbW9rZV9iZzMnXSk7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyLnByZXBlbmQodGhpcy5zbW9rZTMpO1xuXG4gICAgdGhpcy5zbW9rZTIgPSBkaXZDcmVhdGVyKFsnZnVsbC1zY3JvbGxfX3Ntb2tlJywgJ2Z1bGwtc2Nyb2xsX19zbW9rZV9iZzInXSk7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyLnByZXBlbmQodGhpcy5zbW9rZTIpO1xuXG4gICAgdGhpcy5zbW9rZTEgPSBkaXZDcmVhdGVyKFsnZnVsbC1zY3JvbGxfX3Ntb2tlJywgJ2Z1bGwtc2Nyb2xsX19zbW9rZV9iZzEnXSk7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyLnByZXBlbmQodGhpcy5zbW9rZTEpO1xuXG4gICAgdGhpcy5wcm9ncmVzc0JhciA9IGRpdkNyZWF0ZXIoWydmdWxsLXNjcm9sbF9fcHJvZ3Jlc3MtYmFyJ10pO1xuICAgIHRoaXMubWFpbkNvbnRhaW5lci5wcmVwZW5kKHRoaXMucHJvZ3Jlc3NCYXIpO1xuXG4gICAgdGhpcy5mb2cgPSBkaXZDcmVhdGVyKFsnZnVsbC1zY3JvbGxfX3Ntb2tlJywgJ2Z1bGwtc2Nyb2xsX19mb2cnXSk7XG4gICAgdGhpcy5tYWluQ29udGFpbmVyLnByZXBlbmQodGhpcy5mb2cpO1xuXG4gICAgY29uc3QgYmFja2dyb3VuZHNXcmFwcGVycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmZ1bGwtc2Nyb2xsX19maXhlZC13cmFwcGVyJykpO1xuICBcbiAgICBiYWNrZ3JvdW5kc1dyYXBwZXJzLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAoaXRlbS5kYXRhc2V0LmJhY2tncm91bmQpIHtcbiAgICAgICAgaXRlbS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7aXRlbS5kYXRhc2V0LmJhY2tncm91bmR9KWA7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjYWxjU2Nyb2xsUGVyY2VudCgpIHtcbiAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pID09PSB0aGlzLnNlY3Rpb25zLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChwYWdlWU9mZnNldCAtIEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikudG9wKSAvICh0aGlzLmN1cnJlbnRTZWN0aW9uLmNsaWVudEhlaWdodCAtIHdpbmRvdy5pbm5lckhlaWdodCkgICogMTAwKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jdXJyZW50U2VjdGlvbikge1xuICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHBhZ2VZT2Zmc2V0IC0gR2V0Q29vcmRzLmdldENvb3Jkcyh0aGlzLmN1cnJlbnRTZWN0aW9uKS50b3ApIC8gdGhpcy5jdXJyZW50U2VjdGlvbi5jbGllbnRIZWlnaHQgKiAxMDApO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZUVsZW1lbnRWaXNpYmxlKCkge1xuICAgIHRoaXMuc2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IGZpeGVkQmxvY2sgPSBpdGVtLnF1ZXJ5U2VsZWN0b3IoJy5mdWxsLXNjcm9sbF9fZml4ZWQtd3JhcHBlcicpO1xuICAgICAgY29uc3QgZWxlbUNvb3JkcyA9IEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSk7XG4gICAgICBpZiAocGFnZVlPZmZzZXQgPj0gZWxlbUNvb3Jkcy50b3AgJiYgZWxlbUNvb3Jkcy5ib3R0b20gPj0gcGFnZVlPZmZzZXQpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50U2VjdGlvbiA9IGl0ZW07XG4gICAgICAgIGZpeGVkQmxvY2suY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2ZpeC1zdGF0ZScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fZml4LXN0YXRlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTZWN0aW9uID09PSB0aGlzLnNlY3Rpb25zW3RoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IEdldENvb3Jkcy5nZXRDb29yZHModGhpcy5jdXJyZW50U2VjdGlvbikuYm90dG9tIC0gd2luZG93LmlubmVySGVpZ2h0KSB7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fZml4LXN0YXRlJyk7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QuYWRkKCdmdWxsLXNjcm9sbF9fbGFzdC1lbGVtJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZml4ZWRCbG9jay5jbGFzc0xpc3QucmVtb3ZlKCdmdWxsLXNjcm9sbF9fbGFzdC1lbGVtJyk7XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgfSk7XG4gIH1cbiAgXG4gIHNldEFib3ZlQmdPcGFjaXR5KCkge1xuXG4gICAgaWYgKHRoaXMuY29sb3JUaGVtZSA9PT0gJ3doaXRlJykge1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEgPSB0aGlzLnNtb2tlMTtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyID0gdGhpcy5zbW9rZTI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMyA9IHRoaXMuc21va2UzO1xuXG4gICAgICB0aGlzLnNtb2tlMUJsYWNrLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgdGhpcy5zbW9rZTJCbGFjay5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzQmxhY2suc3R5bGUub3BhY2l0eSA9IDA7XG5cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEgPSB0aGlzLnNtb2tlMUJsYWNrO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTIgPSB0aGlzLnNtb2tlMkJsYWNrO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTMgPSB0aGlzLnNtb2tlM0JsYWNrO1xuXG4gICAgICB0aGlzLnNtb2tlMS5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgdGhpcy5zbW9rZTMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgfVxuXG4gICAgLy8g0J/QvtC60LDQt9GL0LLQsNC10Lwg0YHQutGA0L7Qu9C70LHQsNGAXG4gICAgdGhpcy5wcm9ncmVzc0Jhci5zdHlsZS53aWR0aCA9IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSArICclJztcbiAgICBcbiAgICAvLyDQldGB0LvQuCDQvNGLINC90LDRhdC+0LTQuNC80YHRjyDQvdC1INCyINC+0LHQu9Cw0YHRgtC4INC/0YDQvtGB0LzQvtGC0YDQsCDRgdC10LrRhtC40LgsINCy0YHQtSDRgdC70L7QuNGFINGB0LLQtdGA0YXRgyBkaXNwbGF5ID0gJ25vbmUnLFxuICAgIC8vINCn0YLQvtCx0Ysg0L3QsCDQtNGA0YPQs9C40YUg0Y3QutGA0LDQvdCw0YUg0L7QvdC4INC90LUg0L/QtdGA0LXQutGA0YvQstCw0LvQuCDQutC+0L3RgtC10L3RglxuXG4gICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA9PT0gdW5kZWZpbmVkIHx8IHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDAgfHwgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID4gMTAwKSB7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG5cbiAgICAgIHRoaXMuc21va2UxLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UzLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcblxuICAgICAgdGhpcy5zbW9rZTFCbGFjay5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICB0aGlzLnNtb2tlMkJsYWNrLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgIHRoaXMuc21va2UzQmxhY2suc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuXG4gICAgICB0aGlzLnByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gMDtcblxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvZy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgdGhpcy5hY3RpdmVTbW9rZTEuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIHRoaXMuYWN0aXZlU21va2UyLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB0aGlzLmFjdGl2ZVNtb2tlMy5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIH1cblxuICAgIC8vINCe0LHRgNCw0LHQsNGC0YvQstCw0LXQvCDRgdC60YDQvtC70Lsg0LLQvdC40LdcbiAgICBpZiAodGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG5cbiAgICAgIC8vINCU0LvRjyDQv9C10YDQstC+0LPQviDRjdC70LXQvNC10L3RgtCwINC90LUg0LTQtdC70LDQtdC8INCw0L3QuNC80LDRhtC40LkgXCLQstGF0L7QtNCwXCJcbiAgICAgIGlmICh0aGlzLnNlY3Rpb25zLmluZGV4T2YodGhpcy5jdXJyZW50U2VjdGlvbikgIT09IDApIHtcblxuICAgICAgICAvLyDQldGB0LvQuCDRgdC60YDQvtC70Lsg0LzQtdC90YzRiNC1IDI1JSwg0YLQviDRg9Cx0LjRgNCw0LXQvCDQv9GA0L7Qt9GA0LDRh9C90L7RgdGC0Ywg0YMgXCLRgtGD0LzQsNC90LBcIi5cbiAgICAgICAgLy8g0Lgg0YPRgdGC0LDQvdCw0LLQu9C40LLQsNC10Lwg0YHQutC+0YDQvtGB0YLRjCDRgtGA0LDQvdC30LjRiNC10L3QsCwg0YfRgtC+0LHRiyDQsdGL0LvQviDQv9C70LDQstC90L4uXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjUpIHtcbiAgICAgICAgICB0aGlzLmZvZy5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMXMnO1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vINCV0YHQu9C4INC90LXRgiwg0YLQviDQstC+0LfQstGA0LDRidCw0LXQvCDRgtGA0LDQvdC30LjRiNC9INCyINGB0YLQsNC90LTQsNGA0YLQvdC+0LUg0L/QvtC70L7QttC10L3QuNC1XG4gICAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDAuMnMnO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgLy8g0JTQu9GPINC/0L7RgdC70LXQtNC90LXQs9C+INGN0LvQtdC80LXQvdGC0LAg0L3QtSDQtNC10LvQsNC10Lwg0LDQvdC40LzQsNGG0LjQuSBcItCS0YvRhdC+0LTQsFwiLiBcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRTZWN0aW9uICE9PSB0aGlzLnNlY3Rpb25zW3RoaXMuc2VjdGlvbnMubGVuZ3RoIC0gMV0pIHtcblxuICAgICAgICAvLyAg0JTRi9C8INCy0YvRhdC+0LRcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1NSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNjUpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDcwKSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG5cbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA3NSkge1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIC0gNzUpICogNSArICclJztcbiAgICAgICAgfSBcbiAgICAgIH1cblxuXG4gICAgICAvLyDQlNGL0Lwg0LLRhdC+0LRcbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNSAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPCA0MCAmJiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3RvLWJvdHRvbScpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTEuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDEzICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8IDQwICYmIHRoaXMuZGlyZWN0aW9uID09PSAndG8tYm90dG9tJykge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gMTAgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDwgNDAgJiYgdGhpcy5kaXJlY3Rpb24gPT09ICd0by1ib3R0b20nKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UzLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcblxuICAgIH1cblxuXG4gICAgaWYgKHRoaXMuZGlyZWN0aW9uID09PSAndG8tdG9wJykge1xuICAgICAgLy8g0JTQu9GPINC/0LXRgNCy0L7Qs9C+INGN0LvQtdC80LXQvdGC0LAg0L3QtSDQtNC10LvQsNC10Lwg0LDQvdC40LzQsNGG0LjQuSBcItCy0YXQvtC00LBcIlxuICAgICAgXG4gICAgICBpZiAodGhpcy5zZWN0aW9ucy5pbmRleE9mKHRoaXMuY3VycmVudFNlY3Rpb24pICE9PSAwKSB7XG5cbiAgICAgICAgLy8g0JTQtdC70LDQtdC8IFwi0LfQsNGC0LXQvdC10L3QuNC1XCIsINC10YHQu9C4INC40LTRkdC8INCy0LLQtdGA0YVcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAyNSkge1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKDEyNSAtIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSAqIDQgKyAnJScpO1xuICAgICAgICAgIHRoaXMuZm9nLnN0eWxlLm9wYWNpdHkgPSAxMjUgLSB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgKiA0ICsgJyUnO1xuICAgICAgICB9IFxuXG4gICAgICAgIC8vINCU0YvQvCDQv9GA0Lgg0L/RgNC+0LrRgNGD0YLQutC1INCy0LLQtdGA0YVcbiAgICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSAxNSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICB9IFxuXG4gICAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gMjMpIHtcbiAgICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMTtcbiAgICAgICAgfSBcblxuICAgICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDM1KSB7XG4gICAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDE7XG4gICAgICAgIH0gXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gODUpIHtcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUudHJhbnNpdGlvbiA9ICdvcGFjaXR5IDFzJztcbiAgICAgICAgdGhpcy5mb2cuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyDQldGB0LvQuCDQvdC10YIsINGC0L4g0LLQvtC30LLRgNCw0YnQsNC10Lwg0YLRgNCw0L3Qt9C40YjQvSDQsiDRgdGC0LDQvdC00LDRgNGC0L3QvtC1INC/0L7Qu9C+0LbQtdC90LjQtVxuICAgICAgICB0aGlzLmZvZy5zdHlsZS50cmFuc2l0aW9uID0gJ29wYWNpdHkgMC4ycyc7XG4gICAgICB9XG5cbiAgICAgIC8vINCU0YvQvCDQstCy0LXRgNGFINC30LDRgtC80LXQvdC10L3QuNC1INC/0YDQuCDQv9C10YDQtdGF0L7QtNC1INGBINC/0YDQtdC00YvQtNGD0YnQtdCz0L5cbiAgICAgIGlmICh0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPD0gOTAgJiYgdGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDUwKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU21va2UxLnN0eWxlLm9wYWNpdHkgPSAwO1xuICAgICAgfSBcbiAgXG4gICAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpIDw9IDgwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA+PSA1MCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNtb2tlMi5zdHlsZS5vcGFjaXR5ID0gMDtcbiAgICAgIH0gXG4gIFxuICAgICAgaWYgKHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA3NSAmJiB0aGlzLmNhbGNTY3JvbGxQZXJjZW50KCkgPj0gNTApIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTbW9rZTMuc3R5bGUub3BhY2l0eSA9IDA7XG4gICAgICB9IFxuICAgICAgXG4gICAgfVxuXG4gICAgLy8g0JzQtdC90Y/QtdC8INC+0YHQvdC+0LLQvdC+0Lkg0YbQstC10YJcbiAgICBpZiAodGhpcy5jYWxjU2Nyb2xsUGVyY2VudCgpID49IDQwICYmIHRoaXMuY2FsY1Njcm9sbFBlcmNlbnQoKSA8PSA2MCkge1xuICAgICAgaWYgKHdpbmRvdy5jb2xvclN0YXRlID09PSAnYmxhY2snKSB7XG4gICAgICAgIHRoaXMuc2V0QWN0aXZlVGhlbWUoJ2JsYWNrJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNldEFjdGl2ZVRoZW1lKCd3aGl0ZScpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEFjdGl2ZVRoZW1lKHRoZW1lID0gJ3doaXRlJykge1xuICAgIGlmICh0aGVtZSA9PT0gJ3doaXRlJykge1xuICAgICAgdGhpcy5jb2xvclRoZW1lID0gJ3doaXRlJztcbiAgICAgIHRoaXMuZm9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjZmRmNWU2JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb2xvclRoZW1lID0gJ2JsYWNrJztcbiAgICAgIHRoaXMuZm9nLnN0eWxlLmJhY2tncm91bmRDb2xvciA9ICcjMDMwYzFhJztcbiAgICB9XG4gIH1cblxuICB0b1N0YW5kYXJ0U2Nyb2xsKCkge1xuICAgIHRoaXMuc2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnZnVsbC1zY3JvbGxfX2VsZW1lbnQtc3RhbmRhcmQtaGVpZ2h0Jyk7XG4gICAgfSk7XG4gIH1cbiAgXG59IiwiY2xhc3MgQ29sb3JTZXR0ZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmFsbFNlY3Rpb25zID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYmxhY2stc2VjdGlvbicpKTtcbiAgICB0aGlzLmJsYWNrU2VjdGlvbnNDb29yZCA9IHRoaXMuZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcygpO1xuICB9XG5cbiAgZ2V0QmxhY2tTZWN0aW9uc0Nvb3JkcygpIHtcbiAgICBjb25zdCBjb29yZHMgPSBbXVxuICAgIFxuICAgIHRoaXMuYWxsU2VjdGlvbnMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvb3Jkcy5wdXNoKFtHZXRDb29yZHMuZ2V0Q29vcmRzKGl0ZW0pLnRvcCwgR2V0Q29vcmRzLmdldENvb3JkcyhpdGVtKS5ib3R0b21dKTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29vcmRzO1xuICB9XG5cbiAgc2V0Q29sb3JTdGF0ZSgpIHtcbiAgICBsZXQgY29sb3JTdGF0ZTtcblxuICAgIHRoaXMuYmxhY2tTZWN0aW9uc0Nvb3JkLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICBpZiAocGFnZVlPZmZzZXQgPj0gaXRlbVswXSAmJiBwYWdlWU9mZnNldCA8PSBpdGVtWzFdKSB7XG4gICAgICAgIGNvbG9yU3RhdGUgPSAnYmxhY2snO1xuICAgICAgfVxuICAgIH0pXG4gICAgY29sb3JTdGF0ZSA/IHdpbmRvdy5jb2xvclN0YXRlID0gY29sb3JTdGF0ZSA6IHdpbmRvdy5jb2xvclN0YXRlID0gJ3doaXRlJ1xuICB9XG59IiwiY2xhc3MgU2Nyb2xsSGFuZGxlciB7XG4gIGNvbnN0cnVjdG9yKHNlY3Rpb25TbGlkZXIsIGFuY2hvckFkZGVyLCBjb2xvclNldHRlcikge1xuICAgIHRoaXMuc2VjdGlvblNsaWRlciA9IHNlY3Rpb25TbGlkZXI7XG4gICAgdGhpcy5hbmNob3JBZGRlciA9IGFuY2hvckFkZGVyO1xuICAgIHRoaXMuY29sb3JTZXR0ZXIgPSBjb2xvclNldHRlcjtcblxuICAgIHRoaXMuc2Nyb2xsSGFuZGxlcigpO1xuICB9XG5cbiAgc2Nyb2xsSGFuZGxlcigpIHtcbiAgICBsZXQgb2Zmc2V0ID0gcGFnZVlPZmZzZXQ7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsICgpID0+IHtcbiAgICAgIHRoaXMuY29sb3JTZXR0ZXIuc2V0Q29sb3JTdGF0ZSgpO1xuXG4gICAgICBpZiAoIXRoaXMuc2VjdGlvblNsaWRlci5kaXNhYmxlKSB7XG4gICAgICAgIHRoaXMuc2VjdGlvblNsaWRlci5jaGFuZ2VFbGVtZW50VmlzaWJsZSgpO1xuICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuc2V0QWJvdmVCZ09wYWNpdHkoKTtcbiAgXG4gICAgICAgIGlmIChwYWdlWU9mZnNldCAtIG9mZnNldCA8IDApIHtcbiAgICAgICAgICB0aGlzLnNlY3Rpb25TbGlkZXIuZGlyZWN0aW9uID0gJ3RvLXRvcCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5zZWN0aW9uU2xpZGVyLmRpcmVjdGlvbiA9ICd0by1ib3R0b20nO1xuICAgICAgICB9XG4gIFxuICAgICAgICBvZmZzZXQgPSBwYWdlWU9mZnNldDtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5zY3JvbGxEaXJlY3Rpb24gPSB0aGlzLnNlY3Rpb25TbGlkZXIuZGlyZWN0aW9uO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmFuY2hvckFkZGVyLmFuY2hvcnNMaW5rLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICAgIGxldCBhbmNob3JUb3BDb29yZCA9IEdldENvb3Jkcy5nZXRDb29yZHMoaXRlbSkudG9wO1xuICAgICAgICBcbiAgICAgICAgaWYgKHBhZ2VZT2Zmc2V0ID49IGFuY2hvclRvcENvb3JkICYmIHBhZ2VZT2Zmc2V0IDw9IGFuY2hvclRvcENvb3JkICsgNTAwKSB7XG4gICAgICAgICAgdGhpcy5hbmNob3JBZGRlci5hZGRBbmNob3IoaXRlbS5pZCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICB9KTtcbiAgfVxufVxuIl19
