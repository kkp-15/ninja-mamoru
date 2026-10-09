/* 困ったときの早見: 状況を選ぶと、その欄だけを目立たせて移動する。選んだ内容は送らない。 */
(function () {
  var pick = document.getElementById('pick');
  function mark(id) {
    [].forEach.call(document.querySelectorAll('.case'), function (s) { s.classList.toggle('on', s.id === id); });
    [].forEach.call(pick.querySelectorAll('a'), function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + id)); });
  }
  pick.addEventListener('click', function (e) {
    var a = e.target.closest('a'); if (!a) return;
    mark(a.getAttribute('href').slice(1));
    window.mamoruEvent && mamoruEvent('mamoru_komattara_pick'); // どの状況かは送らない
  });
  if (location.hash) mark(location.hash.slice(1));
})();
