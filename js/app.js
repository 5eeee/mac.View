/*
  Общий скрипт для сайта mac.View

  Этот файл реализует:
  – заставку с крупным логотипом, который плавно
    перемещается в область шапки и уменьшается;
  – скрытие/показ шапки при прокрутке;
  – подстановку имени пользователя из Telegram Mini App;
  – подсветку активных пунктов нижней навигации.

  Скрипт запускается после события DOMContentLoaded.
*/

document.addEventListener('DOMContentLoaded', function () {
  /*
    Заставка и анимация логотипа

    На первом посещении страницы показывается splash‑экран с
    большим логотипом. После загрузки ресурсов логотип плавно
    перемещается в область шапки и уменьшается до размера
    логотипа в шапке. Затем заставка исчезает. На последующих
    посещениях заставка сразу удаляется.
  */
  // …внутри document.addEventListener('DOMContentLoaded', …)
(function () {
  var splash = document.getElementById('splash');
  var fly    = document.getElementById('logo-fly');
  var target = document.getElementById('logo-target');
  if (!splash || !fly || !target) return;

  var storageKey = 'splash_shown_v1';
  var hasVisited = false;
  try {
    hasVisited = localStorage.getItem(storageKey) === 'true';
  } catch (e) {
    hasVisited = false;
  }

  // функция запуска анимации
  function startLogoAnimation() {
    // вычисляем траекторию
    var fromRect = fly.getBoundingClientRect();
    var toRect   = target.getBoundingClientRect();

    // если маленький логотип ещё не отрисован, ждём и пробуем снова
    if (toRect.width === 0 || toRect.height === 0) {
      return setTimeout(startLogoAnimation, 50);
    }

    var dx    = (toRect.left + toRect.width  / 2) - (fromRect.left + fromRect.width  / 2);
    var dy    = (toRect.top  + toRect.height / 2) - (fromRect.top  + fromRect.height / 2);
    var scale = toRect.width / fromRect.width;

    // плавное перемещение и масштабирование
    fly.style.transition = 'transform 1.6s cubic-bezier(.22,1,.36,1)';
    fly.style.transform  = 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';

    // скрываем заставку через 1.7 с
    setTimeout(function () {
      splash.style.transition = 'opacity 0.5s ease';
      splash.style.opacity    = '0';
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 600);
    }, 1700);
  }

  if (!hasVisited) {
    // отмечаем, что заставка уже показывалась
    try { localStorage.setItem(storageKey, 'true'); } catch (e) {}
    // если страница уже загружена, запускаем сразу, иначе ждём события load
    function runAnimation() {
      setTimeout(startLogoAnimation, 200);
    }
    if (document.readyState === 'complete') {
      runAnimation();
    } else {
      window.addEventListener('load', runAnimation);
    }
  } else {
    // при повторных визитах просто удаляем заставку
    if (splash.parentNode) splash.parentNode.removeChild(splash);
  }
})();


  /*
    Подстановка имени пользователя из Telegram Mini App
  */
  (function () {
    try {
      if (window.Telegram && Telegram.WebApp && Telegram.WebApp.initDataUnsafe) {
        var user = Telegram.WebApp.initDataUnsafe.user;
        if (user && user.first_name) {
          var nameEl = document.getElementById('username');
          if (nameEl) nameEl.textContent = user.first_name;
        }
      }
    } catch (e) {}
  })();

  /*
    Скрытие/показ шапки при прокрутке
  */
  (function () {
    var header = document.querySelector('header');
    if (!header) return;
    var lastScrollY = window.scrollY;
    window.addEventListener('scroll', function () {
      var currentY = window.scrollY;
      if (currentY > lastScrollY && currentY > 80) {
        header.classList.add('hidden');
      } else {
        header.classList.remove('hidden');
      }
      lastScrollY = currentY;
    });
  })();

  /*
    Подсветка активной кнопки в нижней навигации
  */
  (function () {
    var buttons = document.querySelectorAll('.nav [data-target]');
    if (!buttons || !buttons.length) return;
    var current = location.pathname.split('/').pop() || 'index.html';
    buttons.forEach(function (btn) {
      var target = btn.getAttribute('data-target');
      if (target === current) btn.classList.add('active');
      btn.addEventListener('click', function () {
        if (target) window.location.href = target;
      });
    });
  })();
});