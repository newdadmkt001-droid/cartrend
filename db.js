/* ============================================================
 * cartrend — Supabase 연동
 *  - 공개(읽기): publishable 키로 catalog 행 읽기 (누구나)
 *  - 관리자(쓰기): 로그인(email/pw) → 토큰으로 catalog 저장
 *  - REST(fetch)만 사용, 외부 SDK 불필요
 * ============================================================ */
(function (w) {
  var URL = "https://ktouyjosrdejcxonrwry.supabase.co";
  var KEY = "sb_publishable_I-SHBeWNxDwiBpgTvAx5zA__L0Sybzs";
  var TKEY = "cartrend:token";   // 관리자 access_token 보관(브라우저)

  function fetchCatalog() {
    return fetch(URL + "/rest/v1/catalog?id=eq.1&select=data", { headers: { apikey: KEY } })
      .then(function (r) { return r.json(); })
      .then(function (rows) { return (rows && rows[0] && Array.isArray(rows[0].data)) ? rows[0].data : null; })
      .catch(function () { return null; });
  }
  function login(email, password) {
    return fetch(URL + "/auth/v1/token?grant_type=password", {
      method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.access_token) { try { localStorage.setItem(TKEY, d.access_token); } catch (e) {} return d.access_token; }
      throw new Error(d && d.error_description || d && d.msg || "로그인 실패");
    });
  }
  function token() { try { return localStorage.getItem(TKEY) || ""; } catch (e) { return ""; } }
  function logout() { try { localStorage.removeItem(TKEY); } catch (e) {} }
  function saveCatalog(cars) {
    var t = token();
    return fetch(URL + "/rest/v1/catalog?id=eq.1", {
      method: "PATCH",
      headers: { apikey: KEY, Authorization: "Bearer " + t, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ data: cars, updated_at: new Date().toISOString() })
    }).then(function (r) { return { ok: r.ok, status: r.status }; });
  }
  w.CARTREND_DB = { fetchCatalog: fetchCatalog, login: login, logout: logout, token: token, saveCatalog: saveCatalog, URL: URL };
})(window);
