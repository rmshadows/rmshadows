(function () {
  var SCENES = {
    rain: {
      label: "城",
      bg: "../rain/assets/img/rain/bg.png",
      fg: "../rain/assets/img/rain/fg.png"
    },
    fuzhou: {
      label: "福州",
      bg: "../fuzhou/assets/img/rain/bg.png",
      fg: "../fuzhou/assets/img/rain/fg.png"
    },
    cbf125t: {
      label: "125",
      bg: "../cbf125t/assets/img/rain/bg.png",
      fg: "../cbf125t/assets/img/rain/fg.png"
    }
  };
  var DROPS = {
    dropColor: "../common/assets/img/rain/drop-color.png",
    dropAlpha: "../common/assets/img/rain/drop-alpha.png"
  };
  var DB_NAME = "rain-pictures";
  var STORE = "files";
  var PREF_KEY = "rain-picture-choice";

  function pageScene() {
    return SCENES[window.RAIN_PAGE] ? window.RAIN_PAGE : "rain";
  }

  function readPref() {
    try {
      return JSON.parse(localStorage.getItem(PREF_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  function writePref(pref) {
    localStorage.setItem(PREF_KEY, JSON.stringify(pref));
  }

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function idbGet(key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function idbPut(key, value) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function idbDel(key) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function resolveImages() {
    var pref = readPref();
    var sceneId = pageScene();
    if (pref && pref.mode === "preset" && SCENES[pref.scene]) {
      sceneId = pref.scene;
    }
    var scene = SCENES[sceneId];
    function use(bg, fg) {
      window.RAIN_IMAGES = {
        dropColor: DROPS.dropColor,
        dropAlpha: DROPS.dropAlpha,
        rainBg: bg,
        rainFg: fg
      };
    }
    if (!(pref && pref.mode === "custom")) {
      use(scene.bg, scene.fg);
      return Promise.resolve();
    }
    return idbGet("picture").then(function (file) {
      return file || idbGet("bg");
    }).then(function (file) {
      if (file) {
        var url = URL.createObjectURL(file);
        use(url, url);
        return;
      }
      if (pref.url) {
        use(pref.url, pref.url);
        return;
      }
      use(scene.bg, scene.fg);
    });
  }

  function allowLocalJson() {
    if (location.protocol !== "file:") return;
    var body = "{\"version\":{\"current\":\"1.0.5\"},\"site_settings\":{\"site_url\":\"https://civiccccc.ltd/\",\"brand_name\":\"All Rights Reserved - DROP(drop.io) | re-Ported by Ryan\",\"version\":\"Version 0.1.0 (Alpha)\",\"icon\":\"/assets/img/logoO.svg\"},\"routes\":{\"auth_base\":\"/auth\"},\"page_titles\":{\"404_not_found\":\"404 Not Found\"},\"page_errors\":{\"404_title\":\"404\",\"404_sub_title\":\"Not Found\",\"go_home\":\"Go Home\"}}";
    var Real = XMLHttpRequest;
    function LocalXHR() {
      var real = new Real();
      var local = false;
      var responseType = "";
      var listeners = {};
      this.readyState = 0;
      this.status = 0;
      this.statusText = "";
      this.response = null;
      this.responseText = "";
      this.onload = null;
      this.onerror = null;
      this.onreadystatechange = null;
      this.open = function (_method, url) {
        local = String(url).indexOf("assets/i18n/") !== -1;
        if (!local) real.open.apply(real, arguments);
      };
      this.send = function () {
        if (!local) return real.send.apply(real, arguments);
        var xhr = this;
        setTimeout(function () {
          xhr.readyState = 4;
          xhr.status = 200;
          xhr.statusText = "OK";
          xhr.responseText = body;
          xhr.response = responseType === "json" ? JSON.parse(body) : body;
          var event = { target: xhr, currentTarget: xhr };
          (listeners.load || []).forEach(function (fn) { fn(event); });
          if (xhr.onload) xhr.onload(event);
          if (xhr.onreadystatechange) xhr.onreadystatechange(event);
        }, 0);
      };
      this.setRequestHeader = function () {
        if (!local) real.setRequestHeader.apply(real, arguments);
      };
      this.addEventListener = function (type, fn) {
        if (!local) return real.addEventListener.apply(real, arguments);
        (listeners[type] = listeners[type] || []).push(fn);
      };
      this.removeEventListener = function (type, fn) {
        if (!local) return real.removeEventListener.apply(real, arguments);
        listeners[type] = (listeners[type] || []).filter(function (item) { return item !== fn; });
      };
      this.getAllResponseHeaders = function () {
        return local ? "" : real.getAllResponseHeaders();
      };
      this.getResponseHeader = function () {
        return local ? null : real.getResponseHeader.apply(real, arguments);
      };
      this.abort = function () {
        if (!local) real.abort();
      };
      Object.defineProperty(this, "responseType", {
        get: function () { return local ? responseType : real.responseType; },
        set: function (value) {
          responseType = value;
          if (!local) real.responseType = value;
        }
      });
    }
    window.XMLHttpRequest = LocalXHR;
  }

  function hideLoadingNoteWhenReady() {
    var note = document.querySelector("h1.rain-note");
    if (!note) return;

    function hide() {
      if (!note || note.dataset.dismissed === "1") return;
      note.dataset.dismissed = "1";
      note.style.transition = "opacity .35s ease";
      note.style.opacity = "0";
      note.style.pointerEvents = "none";
      setTimeout(function () {
        if (note) note.style.display = "none";
      }, 400);
    }

    function canvasReady(canvas) {
      if (!canvas || canvas.width < 2 || canvas.height < 2) return false;
      try {
        if (canvas.getContext("webgl") || canvas.getContext("webgl2") ||
            canvas.getContext("experimental-webgl")) {
          return true;
        }
      } catch (e) { /* ignore */ }
      try {
        var ctx = canvas.getContext("2d");
        if (!ctx) return false;
        var sample = ctx.getImageData(
          Math.max(0, (canvas.width >> 1) - 1),
          Math.max(0, (canvas.height >> 1) - 1),
          2,
          2
        ).data;
        for (var i = 0; i < sample.length; i += 4) {
          // any non-empty pixel means something drew
          if (sample[i + 3] > 0 && (sample[i] | sample[i + 1] | sample[i + 2])) {
            return true;
          }
        }
      } catch (e2) { /* tainted / unavailable */ }
      return false;
    }

    var frames = 0;
    var readyFrames = 0;
    var started = Date.now();
    function tick() {
      frames += 1;
      var canvas = document.querySelector("app-root canvas, canvas.rain-canvas, canvas");
      if (canvasReady(canvas)) {
        readyFrames += 1;
        // wait a few painted frames so tip doesn't flash away on a blank buffer
        if (readyFrames >= 10) {
          hide();
          return;
        }
      } else {
        readyFrames = 0;
      }
      // keep tip if rain never comes up (灰屏/黑屏时提示仍在)
      if (Date.now() - started > 60000) return;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function loadApp() {
    var files = ["runtime-es2015.js", "polyfills-es2015.js", "main-es2015.js"];
    function next(i) {
      if (i >= files.length) {
        hideLoadingNoteWhenReady();
        return;
      }
      var script = document.createElement("script");
      script.src = "../common/" + files[i];
      script.onload = function () { next(i + 1); };
      script.onerror = function () { next(i + 1); };
      document.body.appendChild(script);
    }
    next(0);
  }

  function currentLabel() {
    var pref = readPref();
    if (pref && pref.mode === "custom") return pref.url || "本机图片";
    if (pref && pref.mode === "preset" && SCENES[pref.scene]) return SCENES[pref.scene].label;
    return SCENES[pageScene()].label + "（本页默认）";
  }

  function mountDialog() {
    var style = document.createElement("style");
    style.textContent = [
      "#rain-picker{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;}",
      "#rain-picker[hidden]{display:none;}",
      "#rain-picker .box{width:min(420px,calc(100% - 32px));background:#111;color:#eee;border:1px solid #444;padding:16px 18px;font:14px/1.5 sans-serif;}",
      "#rain-picker h2{margin:0 0 8px;font-size:16px;}",
      "#rain-picker p{margin:0 0 10px;color:#bbb;}",
      "#rain-picker .row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;}",
      "#rain-picker button,.rain-file{background:#222;color:#eee;border:1px solid #666;padding:6px 10px;cursor:pointer;}",
      "#rain-picker label{display:block;margin:8px 0;}",
      "#rain-picker input.url{width:100%;box-sizing:border-box;margin-top:4px;background:#222;color:#eee;border:1px solid #666;padding:6px 8px;}",
      "#rain-picker .err:empty{display:none;margin:0;}",
      "#rain-picker .now{word-break:break-all;}"
    ].join("");
    document.head.appendChild(style);

    var root = document.createElement("div");
    root.id = "rain-picker";
    root.hidden = true;
    root.innerHTML = [
      '<div class="box" role="dialog" aria-label="更换雨景图片">',
      "<h2>更换图片</h2>",
      '<p class="now"></p>',
      '<div class="row presets"></div>',
      '<label>本地图片 <input class="file" type="file" accept="image/*"></label>',
      '<label>图片链接 <input class="url" type="url" placeholder="https://"></label>',
      '<p class="err"></p>',
      '<div class="row"><button type="button" class="use-url">使用链接</button><button type="button" class="reset">恢复本页默认</button><button type="button" class="close">关闭</button></div>',
      "<p>一张图就行，记在这台浏览器里。按 i 打开或关闭。</p>",
      "</div>"
    ].join("");
    document.body.appendChild(root);

    var now = root.querySelector(".now");
    var presets = root.querySelector(".presets");
    function refresh() {
      now.textContent = "当前：" + currentLabel();
    }
    refresh();

    Object.keys(SCENES).forEach(function (id) {
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = SCENES[id].label;
      button.addEventListener("click", function () {
        writePref({ mode: "preset", scene: id });
        location.reload();
      });
      presets.appendChild(button);
    });

    var err = root.querySelector(".err");
    root.querySelector(".file").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      err.textContent = "";
      idbPut("picture", file).then(function () {
        writePref({ mode: "custom" });
        location.reload();
      });
    });

    function useUrl() {
      var url = root.querySelector(".url").value.trim();
      if (!url) {
        err.textContent = "先填图片链接。";
        return;
      }
      err.textContent = "正在读取图片…";
      fetch(url).then(function (res) {
        if (!res.ok) throw new Error("status");
        return res.blob();
      }).then(function (blob) {
        if (blob.type && blob.type.indexOf("image/") !== 0) throw new Error("type");
        return idbPut("picture", blob);
      }).then(function () {
        writePref({ mode: "custom", url: url });
        location.reload();
      }).catch(function () {
        err.textContent = "读不到这张图。链接要能直接打开图片，并且允许本站读取。";
      });
    }
    root.querySelector(".use-url").addEventListener("click", useUrl);
    root.querySelector(".url").addEventListener("keydown", function (event) {
      if (event.key === "Enter") useUrl();
    });

    root.querySelector(".reset").addEventListener("click", function () {
      Promise.all([idbDel("picture"), idbDel("bg"), idbDel("fg")]).then(function () {
        localStorage.removeItem(PREF_KEY);
        location.reload();
      });
    });
    root.querySelector(".close").addEventListener("click", function () {
      root.hidden = true;
    });
    root.addEventListener("click", function (event) {
      if (event.target === root) root.hidden = true;
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "i" && event.key !== "I") return;
      var tag = event.target && event.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      if (!root.hidden) {
        root.hidden = true;
        return;
      }
      refresh();
      root.hidden = false;
    });
  }

  allowLocalJson();
  mountDialog();
  resolveImages().then(loadApp).catch(loadApp);
})();
