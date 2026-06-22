/* ============================================================
   cartrend — 차량 상세 / 견적 (신규 데이터 구조)
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var won = function (n) { return Math.round(n || 0).toLocaleString("ko-KR"); };

  var params = new URLSearchParams(location.search);
  var car, D;
  if (params.get("preview") === "1") {
    // 관리자 미리보기: sessionStorage의 임시 차량을 그대로 렌더 (저장 X)
    try { car = JSON.parse(localStorage.getItem("cartrend:preview")); } catch (e) { car = null; }
    if (!car) car = CARS[0] || {};
    D = carDetailOf(car);
  } else {
    var id = parseInt(params.get("id"), 10);
    if (isNaN(id) || !CARS[id]) id = 0;
    car = CARS[id];
    D = getCarDetail(id);
  }

  // 기본 계약기간 = 72개월(있으면) 또는 첫 행
  var defTerm = 0;
  D.rentTable.forEach(function (r, i) { if (r.months === 72) defTerm = i; });

  var state = { vtype: 0, trim: 0, term: defTerm, specTab: 0, sel: {}, custom: {}, addsel: {} };
  var BADGE = {
    hot: '<span class="card__badge card__badge--hot">🔥 인기</span>',
    "new": '<span class="card__badge card__badge--new">NEW</span>',
    rec: '<span class="card__badge card__badge--rec">추천</span>'
  };

  function curType() { return D.vehicleTypes[state.vtype] || D.vehicleTypes[0] || { name: "", trims: D.trims }; }
  function curTrims() { var t = curType().trims; return (t && t.length) ? t : D.trims; }
  function curTrim() { return curTrims()[state.trim] || curTrims()[0] || { name: "", price: 0, features: [] }; }
  // cartrend 자체 견적 엔진 + 가격 정책 (관리자 설정 또는 기본값)
  var QE = window.QuoteEngine;
  var POLICY = QE.loadPricingPolicy();
  function trimWon() { return (curTrim().price || 0); }   // 트림 가격(원)
  function manWon(w) { return won(Math.round((w || 0) / 10000)); }   // 원 → 만원 표시
  function maintFee() { return D.maintenanceFee || 0; }
  function optGroups() { return curTrim().addOptions || []; }   // 비노출 항목도 유지(상세에서 회색·선택불가로 표시)
  function addSel(gi) { return Array.isArray(state.addsel[gi]) ? state.addsel[gi] : []; }  // 다중 선택(인덱스 배열)
  function addOptCount() { var n = 0; optGroups().forEach(function (g, gi) { n += addSel(gi).length; }); return n; }
  function addOptPrice() {
    var sum = 0;
    optGroups().forEach(function (g, gi) { addSel(gi).forEach(function (i) { if (g.items[i] && !g.items[i].hidden) sum += (g.items[i].price || 0); }); });
    return sum;
  }
  function effSub() { return curType().name || ""; }
  // 계약기간(개월) 목록 — 엔진 표준 기간 (높은 개월이 위로)
  function termMonthsList() { return QE.PERIODS.slice(); }
  // 선택한 보증금/선납금 금액 (차량가 × 비율, 표시용)
  function depositAmt() { return condAmt("deposit"); }
  function prepayAmt() { return condAmt("prepay"); }
  // 월 렌트료 = 엔진 계산(자체 정책) + 옵션 증가분 + 정비추가요금
  //  - 옵션 없으면 기본 엔진값, 옵션 선택 시 증가분만 가산 (quoteMonthly 내부 처리)
  function monthlyByMonths(m) {
    // 보증금·선납금 반영(선택 시 월렌트료 변동) + 옵션 증가분
    var base = QE.quoteMonthly(trimWon(), addOptPrice(), m, POLICY, depositAmt(), prepayAmt());
    var adj = curType().adjRate || 0;   // 차량유형별 조정율(하이루프 등)
    if (adj) base = Math.round(base * (1 + adj) / 10) * 10;
    return base + maintFee();
  }
  function currentMonths() { var l = termMonthsList(); return l[state.term] != null ? l[state.term] : l[0]; }
  function currentMonthly() { return monthlyByMonths(currentMonths()); }
  function clampTerm() {
    var l = termMonthsList();
    if (state.term >= l.length) state.term = 0;
    l.forEach(function (m, i) { if (m === 72) state.term = i; });
  }

  function splitName(name) {
    var t = name.split(" ");
    var idx = -1;
    for (var i = 1; i < t.length; i++) { if (/\d/.test(t[i])) { idx = i; break; } }
    if (idx <= 0) return name;
    return t.slice(0, idx).join(" ") + "<br>" + t.slice(idx).join(" ");
  }

  $("#dImg").innerHTML = photoCell(car);
  document.title = car.name + " · Cartrend 신차장기렌트";

  /* ---------- 렌더 ---------- */
  function renderHero() {
    $("#dBadges").innerHTML = (car.badges || []).map(function (b) { return BADGE[b] || ""; }).join("");
    var sub = effSub();
    var tn = curTrim().name || "";
    // 차량명 + 연료 + 차량유형 + 트림
    $("#dTitle").textContent = car.name + (car.fuel ? " " + car.fuel : "") + (sub ? " " + sub : "") + (tn ? " " + tn : "");
    var ml = state.custom.mileage != null ? state.custom.mileage : (MILEAGE_OPTS[state.sel.mileage != null ? state.sel.mileage : 0] || D.mileage || "10,000km");
    var depLabel = state.custom.deposit != null ? "직접입력" : (DEPOSIT_OPTS[state.sel.deposit != null ? state.sel.deposit : 0] || "15%");
    var spec = currentMonths() + "개월 · 연간 " + ml + " · 보증금 " + depLabel + " 기준";
    $("#paySub").textContent = spec;
    $("#dMsrp").textContent = manWon(trimWon());
    $("#payTotal").textContent = won(currentMonthly());
    var pts = $("#payTotalSide"); if (pts) pts.textContent = won(currentMonthly());   // PC 견적 패널
    var pss = $("#paySubSide"); if (pss) pss.textContent = spec;
    renderQuote();
  }
  function renderQuote() {
    if (!$("#quoteBox")) return;
    var base = trimWon(), opt = addOptPrice(), total = base + opt;
    $("#q-base").textContent = manWon(base) + "만원";
    $("#q-opt").textContent = "+ " + won(opt) + "원";        // 추가옵션은 원
    $("#q-total").textContent = manWon(total) + "만원";
    $("#q-deposit").textContent = won(depositAmt()) + "원";
    $("#q-prepay").textContent = won(prepayAmt()) + "원";
    $("#q-term").textContent = currentMonths() + "개월";
    $("#q-monthly").textContent = won(currentMonthly()) + "원";
  }

  function renderVtypes() {
    var box = $("#variantList");
    var head = $("#vtypeHead");
    // 차량유형이 1개뿐이면(또는 없으면) 차종 선택 숨김 — 트림만 있는 차량
    if (D.vehicleTypes.length <= 1) { box.innerHTML = ""; if (head) head.style.display = "none"; return; }
    if (head) head.style.display = "";
    box.innerHTML = D.vehicleTypes.map(function (v, i) {
      return '<button class="vpill' + (i === state.vtype ? " is-active" : "") + '" data-v="' + i + '">' + (v.name || "유형") + "</button>";
    }).join("");
  }

  function renderTrims() {
    $("#trimList").innerHTML = curTrims().map(function (t, i) {
      var on = i === state.trim;
      return (
        '<button class="trimcard' + (on ? " is-active" : "") + '" data-i="' + i + '">' +
          (on ? '<span class="trimcard__check">✓</span>' : "") +
          '<span class="trimcard__name">' + t.name + "</span>" +
          '<span class="trimcard__price">' + manWon(t.price || 0) + "만원</span>" +
        "</button>"
      );
    }).join("");
  }

  function specRow(label, val) {
    return '<div class="specrow"><span>' + label + "</span><strong>" + val + "</strong></div>";
  }
  function renderSpecs() {
    $("#specTabs").querySelectorAll(".spectab").forEach(function (b) {
      b.classList.toggle("is-active", +b.getAttribute("data-tab") === state.specTab);
    });
    var html;
    if (state.specTab === 0) {
      var disp = curType().displacement != null ? curType().displacement : D.displacement;
      var seats = (curTrim().seats != null && curTrim().seats !== "") ? curTrim().seats : D.seats;
      html = specRow("제조사", car.brand) +
        (effSub() ? specRow("세부모델", effSub()) : "") +
        specRow("배기량", won(disp || 0) + "cc") +
        specRow("승차정원", (seats || 5) + "인승") +
        specRow("연료", car.fuel);
    } else {
      html = specRow("차급", car.seg) +
        specRow("차량용품", (D.accessories || "-").replace(/\n/g, ", "));
    }
    $("#specTable").innerHTML = html;
  }

  function renderMaint() {
    $("#maintList").innerHTML = D.maintenance.length
      ? D.maintenance.map(function (m) { return "<li>" + m + "</li>"; }).join("")
      : '<li style="color:#9AA3B0">등록된 항목 없음</li>';
    $("#maintFee").textContent = maintFee() ? "정비 서비스 추가요금 월 +" + won(maintFee()) + "원" : "";
  }

  function pctOf(s) { var m = parseFloat(s); return isNaN(m) ? 0 : m / 100; }
  var CONDS = [
    { key: "buy", label: "매입 옵션", type: "info", value: function () { return D.buyOption || "-"; } },
    { key: "mileage", label: "연간 약정운행거리", type: "plain", direct: true, get: function () { return MILEAGE_OPTS; }, desc: ["약정운행거리는 짧을수록 저렴합니다.", "약정운행거리는 1,000km 단위로 견적가능합니다.", "최소 10,000km ~ 최대 50,000km 까지 설정 가능합니다."] },
    { key: "deposit", label: "보증금", type: "pct", get: function () { return DEPOSIT_OPTS; }, desc: ["보증금은 계약기간 만료 후 환불해 드립니다.", "보증금을 증액하면 월 렌트료가 인하됩니다.", "신용도에 따라 최소 초기납입금(보증금·선납금) 규정이 있습니다."] },
    { key: "prepay", label: "선납금", type: "pct", get: function () { return PREPAY_OPTS; }, desc: ["매월 대여료를 크게 줄이려면 선납금 방식을 추천합니다. (선납금은 매월 일정액 공제되어 소멸됩니다.)", "신용도에 따라 최소 초기납입금(보증금·선납금) 규정이 있습니다."] },
    { key: "age", label: "운전자 연령", type: "plain", get: function () { return AGE_OPTS; } },
    { key: "liab", label: "대물배상", type: "plain", get: function () { return LIAB_OPTS; } },
    { key: "ded", label: "자차 면책금", type: "plain", get: function () { return DED_OPTS; } },
    { key: "accessories", label: "차량용품", type: "info", value: function () { return (D.accessories || "-").replace(/\n/g, ", "); } },
    { key: "region", label: "차량 인도지역", type: "plain", get: function () { return REGION_OPTS; } },
    { key: "addopt", label: "추가 옵션", type: "optg" }
  ];
  function condCfg(key) { for (var i = 0; i < CONDS.length; i++) if (CONDS[i].key === key) return CONDS[i]; return null; }
  // 보증금/선납금 과세표준 = 차량가 - 개별소비세 감면액(자동) - 제조사 DC
  function depositBase() { return QE.calcDepositBase(trimWon(), curTrim().makerDC || 0); }
  // 보증금 = floor(과세표준 × 비율 / 1000) × 1000  (천원 단위 내림 — 엔진 계산)
  function condAmt(key) {
    if (state.custom[key] != null) return state.custom[key];
    var arr = key === "deposit" ? DEPOSIT_OPTS : PREPAY_OPTS;
    if (!arr.length) return 0;
    var v = arr[state.sel[key] != null ? state.sel[key] : 0] || arr[0];
    return QE.quoteDeposit(trimWon(), parseFloat(v), curTrim().makerDC || 0);
  }
  function condValue(cfg) {
    if (cfg.type === "info") return cfg.value();
    if (cfg.type === "pct") return won(condAmt(cfg.key)) + "원";
    if (cfg.type === "optg") {
      var t = addOptPrice();
      return t > 0 ? "+ " + won(t) + "원" : "선택";
    }
    if (state.custom[cfg.key] != null) return state.custom[cfg.key];
    var arr = cfg.get(); if (!arr.length) return "-";
    return arr[state.sel[cfg.key] != null ? state.sel[cfg.key] : 0] || arr[0];
  }
  function renderConds() {
    $("#infoRows").innerHTML = CONDS.map(function (cfg) {
      if (cfg.type === "optg") return "";   // 추가옵션은 별도 섹션에서 렌더
      if (cfg.key === "accessories") {      // 차량용품은 박스로 렌더
        var raw = (D.accessories || "").trim();
        if (!raw) return "";
        var items = raw.split(/\n|,/).map(function (s) { return s.trim(); }).filter(Boolean);
        return '<div class="condblk"><div class="condblk__label">차량용품</div>' +
          '<div class="condblk__body"><div class="maintbox"><ul class="maintbox__list">' +
          items.map(function (it) { return "<li>" + it + "</li>"; }).join("") + "</ul></div></div></div>";
      }
      // 정보형(매입 옵션 등): 라벨 + 값 + 설명
      if (cfg.type === "info") {
        return '<div class="condblk condblk--info"><div class="condblk__label">' + cfg.label + "</div>" +
          '<div class="condblk__body"><div class="condblk__val"><b>' + cfg.value() + "</b>" +
          (cfg.key === "buy" ? '<span class="condblk__note">매입옵션 유무에 따른 대여요금 변동 없음</span>' : "") +
          "</div></div></div>";
      }
      var arr = cfg.get(); if (!arr || !arr.length) return "";
      var selIdx = state.custom[cfg.key] == null ? (state.sel[cfg.key] != null ? state.sel[cfg.key] : 0) : -1;
      var opts = arr.map(function (v, i) {
        var on = selIdx === i;
        if (cfg.type === "pct") {
          var amt = QE.quoteDeposit(trimWon(), parseFloat(v), curTrim().makerDC || 0);
          return '<button class="condopt condopt--pct' + (on ? " is-active" : "") + '" data-cond="' + cfg.key + '" data-i="' + i + '"><b>' + won(amt) + '원</b><span>' + v + "</span></button>";
        }
        return '<button class="condopt condopt--plain' + (on ? " is-active" : "") + '" data-cond="' + cfg.key + '" data-i="' + i + '"><b>' + v + "</b></button>";
      }).join("");
      var direct = cfg.direct
        ? '<button class="condopt condopt--plain' + (state.custom[cfg.key] != null ? " is-active" : "") + '" data-cond="' + cfg.key + '" data-direct="1"><b>' + (state.custom[cfg.key] != null ? String(state.custom[cfg.key]) : "직접입력") + "</b></button>"
        : "";
      var desc = (cfg.desc && cfg.desc.length) ? '<div class="condblk__desc">' + cfg.desc.map(function (t) { return "· " + t; }).join("<br>") + "</div>" : "";
      return '<div class="condblk"><div class="condblk__label">' + cfg.label + "</div>" +
        '<div class="condblk__body"><div class="condopts">' + opts + direct + "</div>" + desc + "</div></div>";
    }).join("");
  }
  function renderAddOpt() {
    var sec = $("#addOptSec");
    if (!sec) return;
    if (!optGroups().length) { sec.style.display = "none"; $("#addOptRows").innerHTML = ""; return; }
    sec.style.display = "";
    var t = $("#addOptTotal"); if (t) t.textContent = won(addOptPrice()) + "원";
    $("#addOptRows").innerHTML = optGroups().map(function (g, gi) {
      var sel = addSel(gi);
      return '<div class="aopt-group"><div class="aopt-group__label">' + (g.title || "옵션") + "</div>" +
        '<div class="aopt-grid">' +
        g.items.map(function (it, i) {
          var on = sel.indexOf(i) !== -1;
          if (it.hidden) {
            return '<div class="aopt aopt--off" aria-disabled="true">' +
              '<div class="aopt__top"><span class="aopt__name">' + it.name + '</span></div>' +
              '<div class="aopt__price">' + (it.price ? "+ " + won(it.price) + "원" : "0원") + "</div></div>";
          }
          return '<button class="aopt' + (on ? " is-active" : "") + '" data-gi="' + gi + '" data-i="' + i + '">' +
            '<div class="aopt__top"><span class="aopt__name">' + it.name + '</span><span class="aopt__i">ⓘ</span></div>' +
            '<div class="aopt__price">' + (it.price ? "+ " + won(it.price) + "원" : "0원") + "</div></button>";
        }).join("") + "</div></div>";
    }).join("");
  }
  /* ---------- 바텀시트 ---------- */
  function openSheet(key) {
    var cfg = condCfg(key); if (!cfg || cfg.type === "info") return;
    var html, arr;
    if (cfg.type === "optg") {
      html = '<div class="sheet__f">여러 개 선택할 수 있습니다 (다시 누르면 해제)</div>' + optGroups().map(function (g, gi) {
        var sel = addSel(gi);
        return '<div class="sheet__gtitle">' + g.title + '</div><div class="sheet__listv">' +
          g.items.map(function (it, i) {
            var on = sel.indexOf(i) !== -1;
            if (it.hidden) return '<div class="sheetopt sheetopt--row sheetopt--opt sheetopt--off" aria-disabled="true"><span>' + it.name + '</span><span>' + (it.price ? "+" + won(it.price) + "원" : "0원") + '</span></div>';
            return '<button class="sheetopt sheetopt--row sheetopt--opt' + (on ? " on" : "") + '" data-gi="' + gi + '" data-i="' + i + '"><span>' + it.name + '</span><span>' + (it.price ? "+" + won(it.price) + "원" : "0원") + '</span></button>';
          }).join("") + "</div>";
      }).join("");
    } else if (cfg.type === "pct") {
      arr = cfg.get();
      html = '<div class="sheet__f">' + cfg.label + " = 차량가 × 비율 (자동 계산)</div><div class=\"sheet__grid\">" +
        arr.map(function (v, i) {
          var amt = QE.quoteDeposit(trimWon(), parseFloat(v), curTrim().makerDC || 0);
          var on = state.custom[key] == null && (state.sel[key] != null ? state.sel[key] : 0) === i;
          return '<button class="sheetopt' + (on ? " on" : "") + '" data-i="' + i + '"><b>' + won(amt) + "원</b><span>" + v + "</span></button>";
        }).join("") + '<button class="sheetopt sheetopt--direct" data-direct="1">직접입력</button></div>';
    } else {
      arr = cfg.get();
      html = '<div class="sheet__listv">' + arr.map(function (v, i) {
        var on = state.custom[key] == null && (state.sel[key] != null ? state.sel[key] : 0) === i;
        return '<button class="sheetopt sheetopt--row' + (on ? " on" : "") + '" data-i="' + i + '">' + v + "</button>";
      }).join("") +
        (cfg.direct ? '<button class="sheetopt sheetopt--row sheetopt--direct' + (state.custom[key] != null ? " on" : "") + '" data-direct="1">직접입력' + (state.custom[key] != null ? " (" + state.custom[key] + ")" : "") + "</button>" : "") +
        "</div>";
    }
    $("#sheetTitle").textContent = cfg.label;
    $("#sheetBody").setAttribute("data-key", key);
    $("#sheetBody").innerHTML = html;
    $("#sheet").classList.add("open");
  }
  function closeSheet() { $("#sheet").classList.remove("open"); }

  function renderTerms() {
    $("#termList").innerHTML = termMonthsList().map(function (m, i) {
      var on = i === state.term;
      return (
        '<button class="termrow' + (on ? " is-active" : "") + '" data-i="' + i + '">' +
          '<span class="termrow__m">' + m + "개월" + (m === 72 ? '<span class="termrow__best">BEST</span>' : "") + "</span>" +
          '<span class="termrow__p">월 ' + won(monthlyByMonths(m)) + "원</span>" +
        "</button>"
      );
    }).join("");
  }

  function renderTrimFeat() {
    var f = curTrim().features || [];
    var sec = $("#trimFeatSec");
    if (!f.length) { sec.style.display = "none"; return; }
    sec.style.display = "";
    $("#trimFeat").innerHTML = f.map(function (x) { return "<li>" + x + "</li>"; }).join("");
  }
  function renderAll() {
    renderVtypes(); renderHero(); renderTrims(); renderTrimFeat(); renderSpecs(); renderMaint(); renderConds(); renderAddOpt(); renderTerms();
  }
  // 관리자에서 지정한 기본 보증금/선납금 적용
  (function initDefaults() {
    var di = DEPOSIT_OPTS.indexOf(D.deposit); state.sel.deposit = di >= 0 ? di : DEPOSIT_OPTS.indexOf("15%");   // 관리자 지정 보증금(없으면 15%) — 고객 변경 가능
    var pi = PREPAY_OPTS.indexOf(D.prepay); if (pi >= 0) state.sel.prepay = pi;
    var mi = MILEAGE_OPTS.indexOf(D.mileage); if (mi >= 0) state.sel.mileage = mi; else if (D.mileage) state.custom.mileage = D.mileage;
    var ai = AGE_OPTS.indexOf(D.driverAge); if (ai >= 0) state.sel.age = ai;
    var li = LIAB_OPTS.indexOf(D.liability); if (li >= 0) state.sel.liab = li;
    var ei = DED_OPTS.indexOf(D.deductible); if (ei >= 0) state.sel.ded = ei;
    var ri = REGION_OPTS.indexOf(D.region); if (ri >= 0) state.sel.region = ri;
  })();
  clampTerm();
  renderAll();

  /* ---------- 이벤트 ---------- */
  $("#variantList").addEventListener("click", function (e) {
    var b = e.target.closest(".vpill"); if (!b) return;
    state.vtype = +b.getAttribute("data-v"); state.trim = 0; state.addsel = {}; clampTerm();
    renderVtypes(); renderTrims(); renderTrimFeat(); renderHero(); renderSpecs(); renderConds(); renderAddOpt(); renderTerms();
  });
  $("#trimList").addEventListener("click", function (e) {
    var b = e.target.closest(".trimcard"); if (!b) return;
    state.trim = +b.getAttribute("data-i"); state.addsel = {}; clampTerm();
    renderHero(); renderTrims(); renderTrimFeat(); renderSpecs(); renderConds(); renderAddOpt(); renderTerms();  // 트림 → 가격·승차정원·추가옵션·보증금/선납금 재계산
  });
  // 계약 조건 행 클릭 → 바텀시트 열기
  $("#infoRows").addEventListener("click", function (e) {
    var opt = e.target.closest(".condopt"); if (!opt) return;
    var key = opt.getAttribute("data-cond"), cfg = condCfg(key);
    if (opt.getAttribute("data-direct")) {
      if (cfg && cfg.type === "pct") {
        var raw = prompt(cfg.label + " 금액을 직접 입력하세요 (원)"); if (raw == null) return;
        state.custom[key] = Math.max(0, parseInt(String(raw).replace(/[^0-9]/g, ""), 10) || 0);
      } else {
        var t = prompt((cfg ? cfg.label : "") + " 직접 입력"); if (t == null) return; t = String(t).trim(); if (!t) return;
        state.custom[key] = t;
      }
    } else {
      state.sel[key] = +opt.getAttribute("data-i"); state.custom[key] = null;
    }
    renderConds(); renderTerms(); renderHero();
  });
  $("#addOptRows").addEventListener("click", function (e) {
    var opt = e.target.closest(".aopt"); if (!opt || opt.classList.contains("aopt--off")) return;   // 비노출 옵션은 선택 불가
    var gi = +opt.getAttribute("data-gi"), i = +opt.getAttribute("data-i");
    var arr = Array.isArray(state.addsel[gi]) ? state.addsel[gi].slice() : [];
    var pos = arr.indexOf(i); if (pos === -1) arr.push(i); else arr.splice(pos, 1);   // 토글(다중)
    state.addsel[gi] = arr;
    renderAddOpt(); renderTerms(); renderHero();
  });
  // 바텀시트 옵션 선택
  $("#sheetBody").addEventListener("click", function (e) {
    var b = e.target.closest(".sheetopt"); if (!b || b.classList.contains("sheetopt--off")) return;   // 비노출 옵션 선택 불가
    var key = $("#sheetBody").getAttribute("data-key");
    // 추가 옵션(그룹): 항목 선택 시 시트 유지하며 갱신 (여러 그룹에서 각각 선택)
    if (key === "addopt" && b.getAttribute("data-gi") != null) {
      var gi = +b.getAttribute("data-gi"), i = +b.getAttribute("data-i");
      var arr = Array.isArray(state.addsel[gi]) ? state.addsel[gi].slice() : [];
      var pos = arr.indexOf(i);
      if (pos === -1) arr.push(i); else arr.splice(pos, 1);   // 토글(다중 선택)
      state.addsel[gi] = arr;
      renderAddOpt(); renderTerms(); renderHero(); openSheet("addopt");
      return;
    }
    if (b.getAttribute("data-direct")) {
      var cfg = condCfg(key);
      if (cfg && cfg.type === "pct") {
        var raw = prompt((key === "deposit" ? "보증금" : "선납금") + " 금액을 직접 입력하세요 (원)");
        if (raw == null) return;
        state.custom[key] = Math.max(0, parseInt(String(raw).replace(/[^0-9]/g, ""), 10) || 0);
      } else {
        var t = prompt((cfg ? cfg.label : "") + " 직접 입력");
        if (t == null) return; t = String(t).trim(); if (!t) return;
        state.custom[key] = t;
      }
    } else {
      state.sel[key] = +b.getAttribute("data-i");
      state.custom[key] = null;
    }
    closeSheet(); renderConds(); renderTerms(); renderHero();
  });
  $("#sheetClose").addEventListener("click", closeSheet);
  $("#sheetDim").addEventListener("click", closeSheet);
  $("#specTabs").addEventListener("click", function (e) {
    var b = e.target.closest(".spectab"); if (!b) return;
    state.specTab = +b.getAttribute("data-tab"); renderSpecs();
  });
  $("#termList").addEventListener("click", function (e) {
    var b = e.target.closest(".termrow"); if (!b) return;
    state.term = +b.getAttribute("data-i"); renderHero(); renderTerms();
  });

  /* ---------- 가로 드래그 스크롤 (트림/유형 손가락·마우스로 넘기기) ---------- */
  function dragScroll(el) {
    if (!el) return;
    var down = false, startX = 0, startL = 0, moved = false;
    el.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startL = el.scrollLeft;
      if (e.pointerType === "mouse") el.classList.add("is-grabbing");
    });
    el.addEventListener("pointermove", function (e) {
      if (!down || e.pointerType !== "mouse") return;   // 터치는 브라우저 기본 스와이프 사용
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startL - dx;
    });
    function end() { down = false; el.classList.remove("is-grabbing"); }
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", function () { if (down) end(); });
    el.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  }
  dragScroll($("#trimList"));
  dragScroll($("#variantList"));
})();
