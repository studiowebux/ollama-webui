/* messages.js — Message rendering, scroll helpers, context usage */

App.appendMessageEl = function (role, content, animate, index, images, searchResults) {
  var div = document.createElement("div");
  div.className = "message " + role;

  if (role === "assistant") {
    div.innerHTML = App.renderMarkdown(content);
    App.addCopyButtons(div);
    App.wrapTables(div);

    /* Action bar with Regenerate */
    var actions = document.createElement("div");
    actions.className = "message-actions";
    var regenBtn = document.createElement("button");
    regenBtn.className = "msg-action-btn";
    regenBtn.textContent = "Regenerate";
    regenBtn.addEventListener("click", function () {
      App.regenerate();
    });
    actions.appendChild(regenBtn);
    div.appendChild(actions);
  } else {
    /* User message */
    if (images && images.length) {
      var imgRow = document.createElement("div");
      imgRow.className = "user-msg-images";
      images.forEach(function (b64) {
        var img = document.createElement("img");
        img.className = "user-msg-image";
        img.src = "data:image/png;base64," + b64;
        imgRow.appendChild(img);
      });
      div.appendChild(imgRow);
    }

    var textNode = document.createTextNode(content);
    div.appendChild(textNode);

    /* Search results */
    if (searchResults && searchResults.length) {
      var details = document.createElement("details");
      details.className = "search-results";
      var summary = document.createElement("summary");
      summary.textContent = searchResults.length + " sources";
      details.appendChild(summary);

      var list = document.createElement("ol");
      searchResults.forEach(function (r) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = r.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = r.title || r.url;
        li.appendChild(a);
        if (r.content) {
          var snippet = document.createElement("span");
          snippet.className = "search-snippet";
          snippet.textContent = " -- " + r.content.substring(0, 120);
          li.appendChild(snippet);
        }
        list.appendChild(li);
      });
      details.appendChild(list);
      div.appendChild(details);
    }

    /* Edit button */
    if (index !== undefined) {
      var editBtn = document.createElement("button");
      editBtn.className = "msg-action-btn edit-btn";
      editBtn.textContent = "Edit";
      editBtn.title = "Edit & resend";
      editBtn.addEventListener("click", function () {
        App.editAndResend(index);
      });
      div.appendChild(editBtn);
    }
  }

  App.el.messagesEl.appendChild(div);

  if (animate !== false) {
    App.scrollToBottom();
  }

  return div;
};

App.renderHistory = function () {
  App.el.messagesEl.innerHTML = "";
  App.chatHistory.forEach(function (msg, i) {
    App.appendMessageEl(msg.role, msg.content, false, i, msg.images, msg.searchResults);
  });
  App.scrollToBottom(true);
};

App.clearChat = function () {
  App.chatHistory = [];
  App.saveHistory();
  App.el.messagesEl.innerHTML = "";
  App.el.ctxUsageEl.parentElement.style.display = "none";
};

/* -------- Scroll helpers -------- */

App.isNearBottom = function () {
  var threshold = 80;
  return (
    App.el.messagesEl.scrollHeight -
      App.el.messagesEl.scrollTop -
      App.el.messagesEl.clientHeight <
    threshold
  );
};

App.scrollToBottom = function (force) {
  if (force || App.isNearBottom()) {
    App.el.messagesEl.scrollTop = App.el.messagesEl.scrollHeight;
  }
};

App.el.messagesEl.addEventListener("scroll", function () {
  App.el.scrollBottomBtn.style.display = App.isNearBottom() ? "none" : "block";
});

App.el.scrollBottomBtn.addEventListener("click", function () {
  App.el.messagesEl.scrollTop = App.el.messagesEl.scrollHeight;
  App.el.scrollBottomBtn.style.display = "none";
});

/* -------- Context usage -------- */

App.updateCtxUsage = function (used, total) {
  var pct = Math.min((used / total) * 100, 100);
  App.el.ctxUsageEl.textContent = used + " / " + total;
  App.el.ctxBarEl.style.width = pct + "%";
  App.el.ctxUsageEl.parentElement.style.display = "";
};
