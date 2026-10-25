(function () {
  var btn = document.querySelector('.menu-btn'), nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
    });
    nav.addEventListener('click', function (ev) { if (ev.target.closest('a')) { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }

  function setPressed(group, attr, val) {
    group.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute(attr) === val ? 'true' : 'false'); });
  }
  function fmt(el, n) { return n === 1 ? el.getAttribute('data-one') : el.getAttribute('data-many').replace('{n}', n); }

  // Publications: theme + language
  var pubs = document.getElementById('pubs');
  if (pubs) {
    var items = [].slice.call(pubs.children), st = { theme: 'all', lang: 'all' };
    var tChips = [].slice.call(document.querySelectorAll('[data-filter="pubs"] [data-theme]'));
    var lChips = [].slice.call(document.querySelectorAll('[data-filter="pubs"] [data-lang]'));
    var count = document.querySelector('[data-filter="pubs"] [data-count]'), empty = document.querySelector('[data-empty]');
    function apply() {
      var n = 0;
      items.forEach(function (li) {
        var ok = (st.theme === 'all' || li.dataset.themes.split(' ').indexOf(st.theme) > -1) && (st.lang === 'all' || li.dataset.langs.split(' ').indexOf(st.lang) > -1);
        li.hidden = !ok; if (ok) n++;
      });
      setPressed(tChips, 'data-theme', st.theme); setPressed(lChips, 'data-lang', st.lang);
      count.textContent = fmt(count, n); empty.hidden = n > 0;
    }
    tChips.forEach(function (b) { b.addEventListener('click', function () { st.theme = b.dataset.theme; apply(); }); });
    lChips.forEach(function (b) { b.addEventListener('click', function () { st.lang = b.dataset.lang; apply(); }); });
    pubs.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-pick-theme]'); if (!t) return;
      st.theme = t.dataset.pickTheme; apply();
      document.querySelector('[data-filter="pubs"]').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Blog: series + theme + search
  var posts = document.getElementById('posts');
  if (posts) {
    var cards = [].slice.call(posts.children);
    var langChips = [].slice.call(document.querySelectorAll('[data-filter="posts"] [data-lang]'));
    var pressedLang = langChips.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
    var defLang = pressedLang ? pressedLang.dataset.lang : 'all';
    var bs = { theme: 'all', series: null, q: '', lang: defLang };
    var chips = [].slice.call(document.querySelectorAll('[data-filter="posts"] [data-theme]'));
    var series = [].slice.call(document.querySelectorAll('[data-series-group] [data-series]'));
    var bcount = document.querySelector('[data-filter="posts"] [data-count]'), bempty = document.querySelector('[data-empty]');
    var input = document.getElementById('post-search');
    function run() {
      var n = 0;
      cards.forEach(function (c) {
        var ok = (bs.theme === 'all' || c.dataset.themes.split(' ').indexOf(bs.theme) > -1) && (!bs.series || c.dataset.series === bs.series) && (!bs.q || c.dataset.search.indexOf(bs.q) > -1) && (bs.lang === 'all' || (c.dataset.langs || '').split(' ').indexOf(bs.lang) > -1);
        c.hidden = !ok; if (ok) n++;
      });
      setPressed(chips, 'data-theme', bs.theme); setPressed(langChips, 'data-lang', bs.lang);
      series.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.series === bs.series ? 'true' : 'false'); });
      bcount.textContent = fmt(bcount, n); bempty.hidden = n > 0;
    }
    chips.forEach(function (b) { b.addEventListener('click', function () { bs.theme = b.dataset.theme; run(); }); });
    langChips.forEach(function (b) { b.addEventListener('click', function () { bs.lang = b.dataset.lang; run(); }); });
    series.forEach(function (b) { b.addEventListener('click', function () { bs.series = bs.series === b.dataset.series ? null : b.dataset.series; bs.theme = 'all'; run(); }); });
    if (input) input.addEventListener('input', function () { bs.q = input.value.trim().toLowerCase(); run(); });
    var clear = document.querySelector('[data-clear]');
    if (clear) clear.addEventListener('click', function () { bs = { theme: 'all', series: null, q: '', lang: 'all' }; if (input) input.value = ''; run(); });
    run();
  }

  // Copy buttons (share link, citations)
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-copy]'); if (!btn) return;
    var text = btn.getAttribute('data-copy'), label = btn.textContent, toast = btn.closest('article') ? document.querySelector('[data-toast]') : null;
    function done() { if (toast) toast.textContent = btn.dataset.done; else { btn.textContent = btn.dataset.done; setTimeout(function () { btn.textContent = label; }, 1600); } }
    function fallback() { var p = btn.previousElementSibling; if (p && window.getSelection) { var r = document.createRange(); r.selectNodeContents(p); var s = getSelection(); s.removeAllRanges(); s.addRange(r); } }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  // Hero: scale name, tagline and the discipline line to the exact width of the button row
  function textWidth(el) { var r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect().width; }
  function fitHero() {
    var box = document.querySelector('.hero-text .btns'); if (!box) return;
    var target = box.getBoundingClientRect().width;
    [].forEach.call(document.querySelectorAll('[data-fit]'), function (el) {
      el.style.fontSize = ''; el.style.whiteSpace = 'nowrap';
      var fs = parseFloat(getComputedStyle(el).fontSize), w = textWidth(el);
      if (w > 0) el.style.fontSize = Math.min(fs * target / w, 72) + 'px';
    });
    [].forEach.call(document.querySelectorAll('[data-fit-lines]'), function (el) {
      el.style.fontSize = ''; el.classList.remove('fitted');
      if (window.innerWidth < 600) { el.style.whiteSpace = ''; return; }
      el.style.whiteSpace = 'nowrap';
      var fs = parseFloat(getComputedStyle(el).fontSize), w = textWidth(el);
      if (w > 0) el.style.fontSize = Math.min(fs * target / w, 40) + 'px';
    });
  }
  fitHero();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHero);
  window.addEventListener('load', fitHero);
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fitHero, 80); });
})();
