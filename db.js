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
  // 사진을 Storage에 업로드하고 공개 URL 반환 (로그인 필요)
  function uploadPhoto(file) {
    var s = getSession();
    if (!s || !s.access_token) return Promise.reject(new Error("로그인 필요"));
    var ext = (file.name && file.name.indexOf(".") >= 0 ? file.name.split(".").pop() : "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    var path = "p" + Date.now() + "_" + Math.random().toString(36).slice(2, 8) + "." + ext;
    function put(tok) {
      return fetch(URL + "/storage/v1/object/photos/" + path, {
        method: "POST", body: file,
        headers: { apikey: KEY, Authorization: "Bearer " + tok, "Content-Type": file.type || "image/" + ext, "x-upsert": "true" }
      });
    }
    return put(s.access_token).then(function (r) {
      if (r.ok) return URL + "/storage/v1/object/public/photos/" + path;
      if (r.status === 401) return refresh().then(function (tok) { return put(tok).then(function (r2) { if (r2.ok) return URL + "/storage/v1/object/public/photos/" + path; throw new Error("업로드 실패 " + r2.status); }); });
      return r.text().then(function (t) { throw new Error("업로드 실패 " + r.status); });
    });
  }
  w.CARTREND_DB = {
    fetchCatalog: fetchCatalog, login: login, refresh: refresh, uploadPhoto: uploadPhoto,
    hasSession: hasSession, logout: clearSession, saveCatalog: saveCatalog, URL: URL
  };
})(window);
