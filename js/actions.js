/* actions.js — regenerate, edit/resend, export, image paste/attach, web search */

/* -------- Web Search -------- */

App.toggleSearch = function () {
  App.searchEnabled = !App.searchEnabled;
  App.el.searchToggleBtn.className =
    "search-toggle-btn" + (App.searchEnabled ? " active" : "");
};

App.webSearch = async function (query) {
  if (!App.config.searchUrl) return null;

  try {
    var base = App.config.searchUrl.replace(/\/$/, "");
    var url =
      base + "/search?q=" + encodeURIComponent(query) + "&format=json";
    var res = await fetch(url);
    if (!res.ok) return null;
    var data = await res.json();

    if (!data.results || !data.results.length) return null;

    var top = data.results.slice(0, 5);
    var results = top.map(function (r) {
      return { title: r.title || "", url: r.url || "", content: r.content || "" };
    });
    var context = results
      .map(function (r, i) {
        return i + 1 + ". " + r.title + "\n" + r.content + "\nURL: " + r.url;
      })
      .join("\n\n");

    return { context: context, results: results };
  } catch (e) {
    return null;
  }
};

/* -------- Regenerate last response -------- */

App.regenerate = function () {
  if (App.isGenerating) App.stopGeneration();

  /* Find last user message content */
  var lastUserContent = null;
  for (var i = App.chatHistory.length - 1; i >= 0; i--) {
    if (App.chatHistory[i].role === "user") {
      lastUserContent = App.chatHistory[i].content;
      break;
    }
  }
  if (!lastUserContent) return;

  /* Pop last assistant message if present */
  if (
    App.chatHistory.length &&
    App.chatHistory[App.chatHistory.length - 1].role === "assistant"
  ) {
    App.chatHistory.pop();
    var msgs = App.el.messagesEl.querySelectorAll(".message.assistant");
    if (msgs.length) msgs[msgs.length - 1].remove();
  }

  App.saveHistory();
  App.sendMessage(lastUserContent, { skipUserPush: true });
};

/* -------- Edit & Resend -------- */

App.editAndResend = function (index) {
  var msg = App.chatHistory[index];
  if (!msg || msg.role !== "user") return;

  var content = msg.content;

  /* Truncate history to before this message */
  App.chatHistory = App.chatHistory.slice(0, index);
  App.saveHistory();
  App.renderHistory();

  /* Populate input with old content */
  App.el.inputEl.value = content;
  App.el.inputEl.style.height = "auto";
  App.el.inputEl.style.height =
    Math.min(App.el.inputEl.scrollHeight, 150) + "px";
  App.el.inputEl.focus();
};

/* -------- Export chat as Markdown -------- */

App.exportChat = function () {
  if (!App.chatHistory.length) return;

  var md = "";
  App.chatHistory.forEach(function (msg) {
    var heading = msg.role === "user" ? "## User" : "## Assistant";
    md += heading + "\n\n" + msg.content + "\n\n---\n\n";
  });

  var now = new Date();
  var dateStr = now.toISOString().split("T")[0];
  var filename = "ollama-chat-" + dateStr + ".md";

  var blob = new Blob([md], { type: "text/markdown" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* -------- Image helpers -------- */

App.clearPendingImages = function () {
  App.pendingImages = [];
  App.el.imagePreview.innerHTML = "";
};

App.addPendingImage = function (base64) {
  App.pendingImages.push(base64);
  App.renderImagePreviews();
};

App.renderImagePreviews = function () {
  App.el.imagePreview.innerHTML = "";
  App.pendingImages.forEach(function (b64, i) {
    var thumb = document.createElement("div");
    thumb.className = "image-thumb";

    var img = document.createElement("img");
    img.src = "data:image/png;base64," + b64;
    thumb.appendChild(img);

    var removeBtn = document.createElement("button");
    removeBtn.className = "image-thumb-remove";
    removeBtn.textContent = "\u00d7";
    removeBtn.addEventListener(
      "click",
      (function (idx) {
        return function () {
          App.pendingImages.splice(idx, 1);
          App.renderImagePreviews();
        };
      })(i),
    );
    thumb.appendChild(removeBtn);

    App.el.imagePreview.appendChild(thumb);
  });
};

function fileToBase64(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* -------- Paste handler -------- */

App.el.inputEl.addEventListener("paste", async function (e) {
  var items = e.clipboardData && e.clipboardData.items;
  if (!items) return;

  for (var i = 0; i < items.length; i++) {
    if (items[i].type.startsWith("image/")) {
      e.preventDefault();
      var file = items[i].getAsFile();
      if (file) {
        var b64 = await fileToBase64(file);
        App.addPendingImage(b64);
      }
    }
  }
});

/* -------- Attach button handler -------- */

document.getElementById("attachBtn").addEventListener("click", function () {
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.multiple = true;
  fileInput.addEventListener("change", async function () {
    for (var i = 0; i < fileInput.files.length; i++) {
      var b64 = await fileToBase64(fileInput.files[i]);
      App.addPendingImage(b64);
    }
  });
  fileInput.click();
});
