/* この端末（localStorage）にだけ残す記録。サーバーには送らない・URLにも入れない。
   読めない環境（プライベートブラウズ等）でも動くよう、失敗は黙って無視する。 */
window.MamoruStore = (function () {
  var PREFIX = 'mamoru:';
  function get(key) { try { var v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function set(key, val) { try { localStorage.setItem(PREFIX + key, JSON.stringify(val)); } catch (e) {} }
  function clearAll() {
    try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PREFIX) === 0) localStorage.removeItem(k); }); } catch (e) {}
  }
  return { get: get, set: set, clearAll: clearAll };
})();
