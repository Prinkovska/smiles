(function () {
  "use strict";
  const C = window.CONFIG;
  const $ = (id) => document.getElementById(id);
  const qty = {};
  C.products.forEach((p) => (qty[p.id] = 0));

  const PAY_LABEL = { cash: "готівкою", card: "на карту" };

  // ---------- Тема ----------
  const root = document.documentElement;
  function applyTheme(t) {
    if (t) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    const dark = t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    $("themeToggle").textContent = dark ? "☀️" : "🌙";
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(savedTheme);
  $("themeToggle").addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme")
      ? root.getAttribute("data-theme") === "dark"
      : matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------- Тексти з конфігу ----------
  $("title").textContent = C.title;
  $("subtitle").textContent = C.subtitle;
  $("monoLink").href = C.monobankJarUrl;
  $("cardNumber").textContent = C.cardNumber;

  // ---------- Товари ----------
  const list = $("productList");
  C.products.forEach((p) => {
    const li = document.createElement("li");
    li.className = "product" + (p.isSet ? " is-set" : "");
    li.dataset.id = p.id;
    li.innerHTML =
      '<div class="p-icon" aria-hidden="true">' + p.icon + "</div>" +
      "<div>" +
        '<div class="p-name">' + esc(p.name) + (p.badge ? '<span class="p-badge">' + esc(p.badge) + "</span>" : "") + "</div>" +
        (p.details ? '<div class="p-details">' + esc(p.details) + "</div>" : "") +
        '<div class="p-price">' + p.price + " грн" + (p.saving ? '<span class="p-save">економія ' + p.saving + " грн</span>" : "") + "</div>" +
      "</div>" +
      '<div class="stepper">' +
        '<button type="button" class="minus" aria-label="Менше: ' + esc(p.name) + '">−</button>' +
        '<span class="qty" aria-live="polite">0</span>' +
        '<button type="button" class="plus" aria-label="Більше: ' + esc(p.name) + '">+</button>' +
      "</div>";
    list.appendChild(li);
  });

  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.closest(".product").dataset.id;
    if (btn.classList.contains("plus")) qty[id] = Math.min(qty[id] + 1, 20);
    else qty[id] = Math.max(qty[id] - 1, 0);
    $("errItems").hidden = true;
    render();
  });

  function selected() {
    return C.products.filter((p) => qty[p.id] > 0).map((p) => ({ ...p, qty: qty[p.id], sum: qty[p.id] * p.price }));
  }
  function total() { return selected().reduce((s, i) => s + i.sum, 0); }

  function render() {
    list.querySelectorAll(".product").forEach((li) => {
      const q = qty[li.dataset.id];
      li.classList.toggle("selected", q > 0);
      li.querySelector(".qty").textContent = q;
      li.querySelector(".minus").disabled = q === 0;
    });
    const t = total();
    $("totalSum").textContent = t;
  }

  // ---------- Оплата ----------
  function payment() {
    const r = document.querySelector('input[name="payment"]:checked');
    return r ? r.value : "";
  }
  document.querySelectorAll('input[name="payment"]').forEach((r) =>
    r.addEventListener("change", () => { $("errPay").hidden = true; })
  );
  $("copyCard").addEventListener("click", () => copy(C.cardNumber.replace(/\s/g, ""), "Номер картки скопійовано"));

  $("childName").addEventListener("input", () => {
    $("errName").hidden = true;
    $("childName").classList.remove("invalid");
  });
  $("email").addEventListener("input", () => {
    $("errEmail").hidden = true;
    $("email").classList.remove("invalid");
  });

  // ---------- Перевірка і pop-up ----------
  function cleanName() { return $("childName").value.replace(/\s+/g, " ").trim(); }

  $("continueBtn").addEventListener("click", () => {
    let firstBad = null;
    if (!cleanName()) {
      $("errName").hidden = false; $("childName").classList.add("invalid");
      firstBad = firstBad || $("childName");
    }
    if (!selected().length) { $("errItems").hidden = false; firstBad = firstBad || list; }
    if (!payment()) { $("errPay").hidden = false; firstBad = firstBad || $("errPay"); }
    const email = $("email").value.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      $("errEmail").hidden = false; $("email").classList.add("invalid");
      firstBad = firstBad || $("email");
    }
    if (firstBad) {
      firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    openModal();
  });

  function openModal() {
    $("modalChild").textContent = cleanName();
    $("modalList").innerHTML = selected()
      .map((i) => "<li><span>" + esc(i.name) + " × " + i.qty + "</span><span>" + i.sum + " грн</span></li>")
      .join("");
    $("modalTotal").textContent = total();
    $("modalPay").textContent = "Оплата: " + PAY_LABEL[payment()];
    $("confirmCheck").checked = false;
    $("sendBtn").disabled = true;
    $("errSend").hidden = true;
    $("modal").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    $("modal").hidden = true;
    document.body.style.overflow = "";
  }
  $("modal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close")) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("payModal").hidden) closePay();
    else if (!$("modal").hidden && !sending) closeModal();
  });

  // ---------- Pop-up з оплатою ----------
  function openPay() {
    $("payModal").hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closePay() {
    $("payModal").hidden = true;
    document.body.style.overflow = "";
  }
  $("payModal").addEventListener("click", (e) => { if (e.target.hasAttribute("data-close-pay")) closePay(); });
  $("showPay").addEventListener("click", openPay);
  $("confirmCheck").addEventListener("change", () => { $("sendBtn").disabled = !$("confirmCheck").checked; });

  // ---------- Відправка ----------
  let sending = false;
  function orderText() {
    const lines = selected().map((i) => "• " + i.name + " × " + i.qty + " — " + i.sum + " грн");
    return (
      "Замовлення фото\n" +
      "Дитина: " + cleanName() + "\n\n" +
      lines.join("\n") + "\n\n" +
      "Разом до сплати: " + total() + " грн\n" +
      "Оплата: " + PAY_LABEL[payment()]
    );
  }

  $("sendBtn").addEventListener("click", async () => {
    if (sending) return;
    sending = true;
    const btn = $("sendBtn");
    btn.disabled = true;
    btn.textContent = "Відправляємо...";
    $("errSend").hidden = true;

    const quantities = {};
    C.products.forEach((p) => (quantities[p.id] = qty[p.id]));
    const payload = {
      name: cleanName(),
      quantities,
      payment: PAY_LABEL[payment()],
      email: $("email").value.trim(),
      total: total(),
      orderText: orderText(),
    };

    try {
      if (C.scriptUrl) {
        const res = await fetch(C.scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || "Помилка сервера");
      } else {
        await new Promise((r) => setTimeout(r, 900)); // демо-режим
      }
      showDone(payload);
    } catch (err) {
      $("errSend").textContent = "Не вдалося відправити. Перевірте інтернет і спробуйте ще раз.";
      $("errSend").hidden = false;
      btn.disabled = !$("confirmCheck").checked;
    } finally {
      sending = false;
      btn.textContent = "Відправити";
    }
  });

  function showDone(payload) {
    closeModal();
    $("formScreen").hidden = true;
    $("totalBar").hidden = true;
    $("doneScreen").hidden = false;
    $("demoNote").hidden = !!C.scriptUrl;
    $("doneText").textContent = payload.orderText;
    $("doneMailNote").textContent = payload.email
      ? "Копію замовлення надіслано на " + payload.email
      : "Збережіть замовлення: скопіюйте його або надішліть собі в Телеграм.";
    $("tgShare").href = "https://t.me/share/url?url=" + encodeURIComponent(payload.orderText);
    const isCard = payment() === "card";
    $("payCash").hidden = isCard;
    $("payCard").hidden = !isCard;
    $("paySum").textContent = payload.total;
    window.scrollTo({ top: 0 });
    openPay();
  }

  $("copyOrder").addEventListener("click", () => copy($("doneText").textContent, "Замовлення скопійовано"));
  $("editOrder").addEventListener("click", () => {
    $("doneScreen").hidden = true;
    $("formScreen").hidden = false;
    $("totalBar").hidden = false;
    window.scrollTo({ top: 0 });
  });

  // ---------- Утиліти ----------
  async function copy(text, msg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e2) {}
      ta.remove();
    }
    toast(msg);
  }
  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), 1800);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  render();
})();
