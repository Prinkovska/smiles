// ============================================================
//  НАЛАШТУВАННЯ САЙТУ — редагуйте тут
// ============================================================
window.CONFIG = {
  // Заголовок сторінки
  title: "Фото на згадку",
  subtitle: "ЗДО №45 · група «Смайлики»",

  // URL веб-застосунку Google Apps Script (поки порожньо — сторінка працює в демо-режимі)
  scriptUrl: "",

  // Оплата на карту
  monobankJarUrl: "https://send.monobank.ua/jar/9jxk1v9aa3",
  cardNumber: "0000 0000 0000 0000",                          // TODO: номер картки банки

  // Електронний варіант фото на e-mail від цієї суми
  emailBonusFrom: 600,

  // Товари: id — латиницею, без пробілів (стає назвою стовпця в таблиці не обов'язково)
  products: [
    { id: "photo10x15", name: "Фото 10×15",          price: 110, icon: "🖼️" },
    { id: "photo15x21", name: "Фото 15×21",          price: 120, icon: "🖼️" },
    { id: "photoA4",    name: "Фото А4 (20×30)",     price: 140, icon: "🖼️" },
    { id: "calendarA4", name: "Календар А4 (20×30)", price: 150, icon: "📅", badge: "Новинка 2027" },
    { id: "calendarHouse", name: "Календар «хатинка»", price: 220, icon: "🗓️", badge: "Новинка 2027" },
    { id: "puzzle",     name: "Пазл + фото 15×21",   price: 250, icon: "🧩" },
    { id: "magnet",     name: "Магніт 7×10",         price: 120, icon: "🧲" },
    { id: "mug",        name: "Горнятко",            price: 290, icon: "☕" },
    { id: "set1", name: "Набір №1", price: 350, icon: "🎁", isSet: true,
      details: "магніти — 2 шт., фото 15×21, фото 10×15 — 2 шт.", saving: 230 },
    { id: "set2", name: "Набір №2", price: 500, icon: "🎁", isSet: true,
      details: "горнятко, магніти — 2 шт., фото 15×21, фото 10×15 — 2 шт.", saving: 370 },
  ],
};
