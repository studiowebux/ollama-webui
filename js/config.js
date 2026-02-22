/* config.js — Config panel logic, sliders, model loading, connection status */

App.toggleConfig = function () {
  App.el.configPanel.style.display =
    App.el.configPanel.style.display === "flex" ? "none" : "flex";
};

App.populateConfigUI = function () {
  document.getElementById("configBaseUrl").value = App.config.baseUrl;
  document.getElementById("configStorageKey").value = App.config.storageKey;
  document.getElementById("configSystemPrompt").value =
    App.config.systemPrompt || "";
  document.getElementById("configTemperature").value = App.config.temperature;
  document.getElementById("tempValue").textContent = App.config.temperature;
  document.getElementById("configTopP").value = App.config.topP;
  document.getElementById("topPValue").textContent = App.config.topP;
  document.getElementById("configNumCtx").value = App.config.numCtx;
  document.getElementById("numCtxValue").textContent = App.config.numCtx;
  document.getElementById("configSearchUrl").value = App.config.searchUrl || "";
};

App.saveConfig = function () {
  App.config.baseUrl = document.getElementById("configBaseUrl").value.trim();
  App.config.model = document.getElementById("configModelSelect").value;
  App.config.storageKey = document
    .getElementById("configStorageKey")
    .value.trim();
  App.config.systemPrompt = document
    .getElementById("configSystemPrompt")
    .value.trim();
  App.config.temperature = parseFloat(
    document.getElementById("configTemperature").value,
  );
  App.config.topP = parseFloat(document.getElementById("configTopP").value);
  App.config.numCtx =
    parseInt(document.getElementById("configNumCtx").value, 10) || 8192;
  App.config.searchUrl = document
    .getElementById("configSearchUrl")
    .value.trim();

  localStorage.setItem("ollama-ui-config", JSON.stringify(App.config));
  App.loadHistory();
  App.renderHistory();
  App.toggleConfig();
};

/* Slider live values */

document
  .getElementById("configTemperature")
  .addEventListener("input", function (e) {
    document.getElementById("tempValue").textContent = e.target.value;
  });

document
  .getElementById("configTopP")
  .addEventListener("input", function (e) {
    document.getElementById("topPValue").textContent = e.target.value;
  });

document
  .getElementById("configNumCtx")
  .addEventListener("input", function (e) {
    document.getElementById("numCtxValue").textContent = e.target.value;
  });

/* Auto-refresh models on URL change */

document.getElementById("configBaseUrl").addEventListener(
  "input",
  App.debounce(function () {
    var url = document.getElementById("configBaseUrl").value.trim();
    if (url) {
      var prevUrl = App.config.baseUrl;
      App.config.baseUrl = url;
      App.loadModels().finally(function () {
        App.config.baseUrl = prevUrl;
      });
    }
  }, 800),
);

/* Model loading */

App.loadModels = async function () {
  var select = document.getElementById("configModelSelect");
  select.innerHTML = '<option value="">Loading...</option>';

  try {
    var res = await fetch(App.apiUrl("/api/tags"));
    var data = await res.json();

    select.innerHTML = "";
    data.models.forEach(function (m) {
      var option = document.createElement("option");
      option.value = m.name;
      option.textContent = m.name;
      select.appendChild(option);
    });

    if (App.config.model) {
      select.value = App.config.model;
    }
    if (!select.value && data.models.length > 0) {
      App.config.model = data.models[0].name;
      select.value = App.config.model;
    }

    App.updateHeaderModel();
    App.updateConnectionStatus(true);
  } catch (err) {
    select.innerHTML = '<option value="">Error loading models</option>';
    App.updateConnectionStatus(false);
  }
};

/* Model info (context size) */

App.fetchModelInfo = async function (modelName) {
  try {
    var res = await fetch(App.apiUrl("/api/show"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
    });
    var data = await res.json();

    var info = data.model_info || {};
    var keys = Object.keys(info);
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].endsWith(".context_length")) {
        var ctx = info[keys[i]];
        if (ctx >= 1000) {
          App.el.headerCtx.textContent = Math.round(ctx / 1024) + "K ctx";
        } else {
          App.el.headerCtx.textContent = ctx + " ctx";
        }
        App.el.headerCtx.style.display = "";
        return;
      }
    }
    App.el.headerCtx.style.display = "none";
  } catch (e) {
    App.el.headerCtx.style.display = "none";
  }
};

App.updateHeaderModel = function () {
  var model = document.getElementById("configModelSelect").value;
  if (model) {
    App.el.headerModel.textContent = model;
    App.el.headerModel.style.display = "";
    App.config.model = model;
    App.fetchModelInfo(model);
  } else {
    App.el.headerModel.style.display = "none";
    App.el.headerCtx.style.display = "none";
  }
};

document
  .getElementById("configModelSelect")
  .addEventListener("change", App.updateHeaderModel);

/* Connection status */

App.updateConnectionStatus = function (ok) {
  App.el.connectionDot.className =
    "connection-dot " + (ok ? "connected" : "disconnected");
  App.el.connectionDot.title = ok ? "Connected to Ollama" : "Disconnected from Ollama";
};

App.checkConnection = async function () {
  try {
    var res = await fetch(App.apiUrl("/api/tags"));
    App.updateConnectionStatus(res.ok);
  } catch (e) {
    App.updateConnectionStatus(false);
    if (
      location.protocol === "https:" &&
      App.config.baseUrl.startsWith("http://")
    ) {
      App.el.typingEl.textContent =
        "Mixed content blocked: HTTPS page cannot reach HTTP Ollama. Serve this app over HTTP or use localhost.";
    }
  }
};

document.addEventListener("visibilitychange", function () {
  if (!document.hidden) App.checkConnection();
});
