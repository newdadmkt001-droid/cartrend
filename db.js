/* ============================================================
 * cartrend — Supabase 연동
 *  - 공개(읽기): publishable 키로 catalog 행 읽기 (누구나)
 *  - 관리자(쓰기): 로그인(email/pw) → 세션 저장 → 토큰 자동갱신으로 재로그인 최소화
 *  - REST(fetch)만 사용, 외부 SDK 불필요
 * ============================================================ */
(function (w) {
  var URL = "https://ktouyjosrdejcxonrwry.supabase.co";
  var KEY = "sb_publishable_I-SHBeWNxDwiBpgTvAx5zA__L0Sybzs";
  var SKEY = "cartrend:session";   // {access_token, refresh_token}

  function getSession() { try { return JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { return null; } }
  function setSession(d) { try { if (d && d.access_token) localStorage.setItem(SKEY, JSON.stringify({ access_token: d.access_token, refresh_token: d.refresh_token })); } catch (e) {} }
  function clearSession() { try { localStorage.removeItem(SKEY); localStorage.removeItem("cartrend:token"); } catch (e) {} }

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
      if (d && d.access_token) { setSession(d); return d.access_token; }
      throw new Error((d && (d.error_description || d.msg || d.error)) || "로그인 실패");
    });
  }
  function refresh() {
    var s = getSession();
    if (!s || !s.refresh_token) return Promise.reject(new Error("no session"));
    return fetch(URL + "/auth/v1/token?grant_type=refresh_token", {
      method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.access_token) { setSession(d); return d.access_token; }
      throw new Error("refresh 실패");
    });
  }
  function hasSession() { var s = getSession(); return !!(s && s.access_token); }

  function _patch(token, cars) {
    return fetch(URL + "/rest/v1/catalog?id=eq.1", {
      method: "PATCH",
      headers: { apikey: KEY, Authorization: "Bearer " + token, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ data: cars, updated_at: new Date().toISOString() })
    });
  }
  // 저장: 현재 토큰으로 시도 → 401이면 refresh 후 1회 재시도
  function saveCatalog(cars) {
    var s = getSession();
    if (!s || !s.access_token) return Promise.resolve({ ok: false, status: 401 });
    return _patch(s.access_token, cars).then(function (r) {
      if (r.status !== 401) return { ok: r.ok, status: r.status };
      return refresh().then(function (tok) { return _patch(tok, cars).then(function (r2) { return { ok: r2.ok, status: r2.status }; }); })
        .catch(function () { return { ok: false, status: 401 }; });
    });
  }
  w.CARTREND_DB = {
    fetchCatalog: fetchCatalog, login: login, refresh: refresh,
    hasSession: hasSession, logout: clearSession, saveCatalog: saveCatalog, URL: URL
  };
})(window);
