/* =========================================================
   videoruta.js – klicka-för-att-ladda YouTube (GDPR-vänligt)
   ---------------------------------------------------------
   Ingen kontakt tas med Google förrän eleven klickar på play.
   Vid klick laddas en youtube-nocookie-iframe (ingen spårning
   innan uppspelning, inga cookies förrän man startar filmen).

   Användning – lägg en tom div på sidan:

     <div class="videoruta"
          data-yt="9gUdDM6LZGo"
          data-start="2738"
          data-titel="Energiprincipen förklarad"
          data-text="Klippet börjar där genomgången av energiprincipen tar vid."
          data-flagga="🇸🇪"></div>

   Attribut:
     data-yt      (krävs) YouTubes video-id
     data-start   (valfritt) starttid i sekunder
     data-titel   (valfritt) rubrik ovanför rutan
     data-text    (valfritt) kort beskrivning under rubriken
     data-flagga  (valfritt) emoji-flagga för klippets språk
   ========================================================= */
(function () {
  "use strict";

  function buildOne(box) {
    var id = box.getAttribute("data-yt");
    if (!id) return;

    var start = parseInt(box.getAttribute("data-start") || "0", 10);
    var titel = box.getAttribute("data-titel") || "";
    var text = box.getAttribute("data-text") || "";
    var flagga = box.getAttribute("data-flagga") || "";

    if (titel || text) {
      var head = document.createElement("div");
      head.className = "videoruta-head";
      head.innerHTML =
        (titel ? '<h3 class="videoruta-titel">' +
          (flagga ? '<span class="videoruta-flagga">' + flagga + "</span> " : "") +
          escapeHtml(titel) + "</h3>" : "") +
        (text ? '<p class="videoruta-text">' + escapeHtml(text) + "</p>" : "");
      box.appendChild(head);
    }

    var frame = document.createElement("div");
    frame.className = "videoruta-frame";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "videoruta-play";
    btn.setAttribute("aria-label", "Spela upp klippet" + (titel ? ": " + titel : ""));
    btn.innerHTML =
      '<span class="videoruta-play-icon" aria-hidden="true">▶</span>' +
      '<span class="videoruta-play-text">Spela upp klippet<br><small>Öppnar YouTube (utan spårning innan du startar)</small></span>';

    btn.addEventListener("click", function () {
      var src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
        "?autoplay=1&rel=0" + (start > 0 ? "&start=" + start : "");
      var iframe = document.createElement("iframe");
      iframe.setAttribute("src", src);
      iframe.setAttribute("title", titel || "YouTube-klipp");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute("allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      frame.innerHTML = "";
      frame.appendChild(iframe);
    });

    frame.appendChild(btn);
    box.appendChild(frame);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function init() {
    var boxes = document.querySelectorAll(".videoruta");
    for (var i = 0; i < boxes.length; i++) buildOne(boxes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
