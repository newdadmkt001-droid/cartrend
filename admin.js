/* ============================================================
   cartrend — 관리자 (신규 상세 폼 + 실시간 미리보기)
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var won = function (n) { return Math.round(n || 0).toLocaleString("ko-KR"); };
  var num = function (v) { if (v === "" || v == null) return 0; return Number(String(v).replace(/[^0-9.-]/g, "")) || 0; };
  var wonStr = function (n) { var d = String(n == null ? "" : n).replace(/[^0-9]/g, ""); return d ? Number(d).toLocaleString("ko-KR") : ""; };
  var manStr = function (won) { return won ? Number(Math.round(won / 10000)).toLocaleString("ko-KR") : ""; };   // 원 → 만원 표시
  var cur = -1;
  var creating = false; // 신규 차량(아직 저장 안 됨)
  // 정비 서비스 기본 문구 (신규/빈 값일 때 자동 채움 — 수정·삭제 가능)
  var DEFAULT_MAINT = [
    "교통사고 발생 시 사고처리 업무 대행",
    "사고대차서비스 (피해사고는 보험대차)",
    "차량 정비 관련 유선 상담서비스 상시 제공",
    "대여 개시 2개월 이내 무상 정비대차 제공 (24시간 이상 정비공장 입고시)",
    "대여 개시 2개월 이후 원가 수준의 유상 정비대차 제공 (단기 대여요금의 15~30% 수준, 탁송료 별도)"
  ].join("\n");
  // 차량용품 기본 문구 (신규/빈 값일 때 자동 채움 — 수정·삭제 가능)
  var DEFAULT_ACCESSORIES = [
    "전면/측후면 썬팅 포함",
    "2채널 블랙박스 포함"
  ].join("\n");
  var listView = $("#listView"), editView = $("#editView");

  /* 프리셋 옵션 */
  var DEP = ["0%", "10%", "20%", "30%", "40%"];
  var PREPAY = ["0%", "10%", "20%", "30%"];
  var AGES = ["만 21세 이상", "만 24세 이상", "만 26세 이상", "만 30세 이상"];
  var LIAB = ["1억원", "2억원", "5억원"];
  var DED = ["20만원", "30만원", "50만원"];
  var REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산"];

  /* ---------- 목록 ---------- */
  function carPrice(c) {
    // 목록 표시용: 기준 트림 72개월 자동 월 렌트료
    var d = c.detail || {};
    var t0 = (d.vehicleTypes && d.vehicleTypes[0] && d.vehicleTypes[0].trims && d.vehicleTypes[0].trims[0]) ||
      (d.trims && d.trims[0]);
    var price = t0 ? t0.price : 0;
    if (price) return engMon(price, 72, d.maintenanceFee || 0);
    return c.price || 0;
  }
  function carCardHTML(c, i) {
    var on = !c.draft && c.status !== "판매중지";
    var tag = c.draft ? '<span class="ccard__st ccard__st--off">임시저장</span>'
      : (on ? '<span class="ccard__st ccard__st--on">노출중</span>' : '<span class="ccard__st ccard__st--stop">미노출</span>');
    var hidden = on ? "" : " is-hidden";
    return (
      '<div class="ccard' + hidden + '" data-id="' + i + '">' +
        '<div class="ccard__head"><input type="checkbox" class="ccard__chk" data-chk="' + i + '" title="선택" />' +
        '<span class="ccard__grip" title="드래그로 순서 이동">⠿</span>' +
        '<button class="ccard__del" data-del="' + i + '" title="삭제">×</button></div>' +
        '<div class="ccard__img">' + photoCell(c) + "</div>" +
        '<div class="ccard__brand">' + c.brand + tag + "</div>" +
        '<div class="ccard__name">' + c.name + "</div>" +
        '<div class="ccard__price">월 ' + won(carPrice(c)) + "원~</div>" +
      "</div>"
    );
  }
  var filterBrand = "전체", sortMode = "manual";
  function brandList() {
    // 전체 + 표준 브랜드 모두 + (표준에 없는) 등록 브랜드
    var extra = CARS.map(function (c) { return c.brand; })
      .filter(function (b) { return BRANDS_ALL.indexOf(b) === -1; })
      .filter(function (b, i, a) { return a.indexOf(b) === i; });
    return ["전체"].concat(BRANDS_ALL, extra);
  }
  function renderBrandFilter() {
    $("#brandFilter").innerHTML = brandList().map(function (b) {
      var n = b === "전체" ? CARS.length : CARS.filter(function (c) { return c.brand === b; }).length;
      return '<button class="bchip' + (b === filterBrand ? " on" : "") + '" data-b="' + b + '">' + b + " (" + n + ")</button>";
    }).join("");
  }
  function sortItems(items) {
    if (sortMode === "latest") return items.slice().sort(function (a, b) { return b.i - a.i; });
    if (sortMode === "priceAsc") return items.slice().sort(function (a, b) { return carPrice(a.c) - carPrice(b.c); });
    if (sortMode === "priceDesc") return items.slice().sort(function (a, b) { return carPrice(b.c) - carPrice(a.c); });
    return items;
  }
  function renderList() {
    renderBrandFilter();
    $("#carCount").textContent = "총 " + CARS.length + "대";
    var items = CARS.map(function (c, i) { return { c: c, i: i }; })
      .filter(function (o) { return filterBrand === "전체" || o.c.brand === filterBrand; });
    items = sortItems(items);
    $("#carGrid").innerHTML =
      '<button class="addcard" id="addCard"><span>+</span>차량 추가</button>' +
      items.map(function (o) { return carCardHTML(o.c, o.i); }).join("");
  }

  /* ---------- 행/그룹 헬퍼 ---------- */
  function val(id) { var el = $("#" + id); return el ? el.value : ""; }
  function setVal(id, v) { var el = $("#" + id); if (el) el.value = (v == null) ? "" : v; }
  function tmRentRowHTML(r) {
    r = r || {};
    return '<div class="row tmrentRow"><input class="tmr-m w2" type="number" placeholder="개월" value="' + (r.months != null ? r.months : "") + '">' +
      '<input class="tmr-p" type="number" placeholder="월 렌트료(원)" value="' + (r.price != null ? r.price : "") + '">' +
      '<button class="rm tmr-rm" type="button">×</button></div>';
  }
  function seatDropdownHTML(seats) {
    var cur = (seats != null && seats !== "") ? String(seats) : "";
    var opts = "";
    for (var n = 1; n <= 10; n++) opts += '<button type="button" class="dd__opt' + (String(n) === cur ? " on" : "") + '" data-v="' + n + '">' + n + "인승</button>";
    return '<div class="dd tm-seatdd"><input type="hidden" class="tm-seats" value="' + cur + '">' +
      '<button type="button" class="dd__btn">' + (cur ? cur + "인승" : "승차정원 선택") + "<i>▾</i></button>" +
      '<div class="dd__menu">' + opts + "</div></div>";
  }
  var RATE_PERIODS = [82, 72, 60, 48, 36, 24];
  var QE = window.QuoteEngine;   // cartrend 자체 견적 엔진
  function genTid() { return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  // 트림 복사/붙여넣기 (localStorage 클립보드 — 다른 차량으로도 붙여넣기 가능)
  var TRIMCLIP = "cartrend:trimclip";
  function collectOneTrim(tm) {
    return {
      name: $(".tm-name", tm).value.trim(),
      price: num($(".tm-price", tm).value) * 10000,
      makerDC: num($(".tm-makerdc", tm).value) * 10000,
      seats: num($(".tm-seats", tm).value),
      features: [],
      addOptions: collectAddOptions(tm)
    };
  }
  function copyTrim(tm) {
    if (!tm) return;
    try { localStorage.setItem(TRIMCLIP, JSON.stringify(collectOneTrim(tm))); toast("트림 복사됨 — '트림 붙여넣기'로 추가"); }
    catch (e) { toast("복사 실패"); }
  }
  function pasteTrim(vblock) {
    if (!vblock) return;
    var raw; try { raw = localStorage.getItem(TRIMCLIP); } catch (e) {}
    if (!raw) { toast("복사된 트림이 없습니다"); return; }
    var t; try { t = JSON.parse(raw); } catch (e) { toast("복사 데이터 오류"); return; }
    t.id = "";   // 새 ID 부여
    vblock.querySelector(".vtrims").insertAdjacentHTML("beforeend", trimMiniHTML(t));
    renderPreview();
    toast("트림을 붙여넣었습니다");
  }
  // 차량유형 복사/붙여넣기 (트림·옵션 통째로, 다른 차량으로도 가능)
  var VTYPECLIP = "cartrend:vtypeclip";
  function collectOneVtype(bl) {
    return {
      name: $(".vt-name", bl).value.trim(),
      displacement: num($(".vt-disp", bl).value),
      trims: [].map.call(bl.querySelectorAll(".tmini"), collectOneTrim)
    };
  }
  function copyVtype(bl) {
    if (!bl) return;
    try { localStorage.setItem(VTYPECLIP, JSON.stringify(collectOneVtype(bl))); toast("차량유형 복사됨 — '차량유형 붙여넣기'로 추가"); }
    catch (e) { toast("복사 실패"); }
  }
  function pasteVtype() {
    var raw; try { raw = localStorage.getItem(VTYPECLIP); } catch (e) {}
    if (!raw) { toast("복사된 차량유형이 없습니다"); return; }
    var v; try { v = JSON.parse(raw); } catch (e) { toast("복사 데이터 오류"); return; }
    (v.trims || []).forEach(function (t) { t.id = ""; });
    $("#vtypeBlocks").insertAdjacentHTML("beforeend", vtypeBlockHTML(v));
    renderPreview();
    toast("차량유형을 붙여넣었습니다");
  }
  // 관리자 표시용 월 렌트료 (상세페이지와 동일한 엔진 계산 + 정비요금)
  function engMon(priceWon, m, fee) { return QE.quoteMonthly(priceWon || 0, 0, m, QE.loadPricingPolicy()) + (fee || 0); }
  // 트림 실시간 견적 미리보기 (현재 가격정책 기준, 옵션 미포함 기본 6기간 + 보증금 예시)
  function trimPreviewHTML(priceWon, makerDC) {
    if (!priceWon) return '<span style="color:#9AA3B0">차량가를 입력하면 기간별 월렌트료가 계산됩니다</span>';
    var pol = QE.loadPricingPolicy();
    var rows = QE.PERIODS.map(function (n) {
      return '<div class="amz-vrow"><span>' + n + '개월</span><span>' + QE.quoteMonthly(priceWon, 0, n, pol).toLocaleString() + '원</span></div>';
    }).join("");
    var deps = [10, 20, 30].map(function (p) { return p + '% ' + QE.quoteDeposit(priceWon, p, makerDC || 0).toLocaleString(); }).join(" · ");
    return '<div class="amz-params">연 요율 ' + (pol.annualRate * 100).toFixed(1) + '% · 마진 ' + (pol.marginRate * 100).toFixed(0) + '%</div>' + rows +
      '<div class="amz-vrow" style="border-top:1px solid var(--line);margin-top:4px;padding-top:6px"><span>보증금</span><span style="text-align:right;font-size:11.5px">' + deps + '</span></div>';
  }
  // 한 트림의 미리보기 갱신
  function refreshTrimPreview(tm) {
    var box = $(".tm-preview", tm); if (!box) return;
    var price = num($(".tm-price", tm).value) * 10000, mk = num($(".tm-makerdc", tm).value) * 10000;
    box.innerHTML = trimPreviewHTML(price, mk);
  }
  // 모든 트림 미리보기 갱신 (정책 변경 시)
  function refreshAllPreviews() { [].forEach.call(document.querySelectorAll(".tmini"), refreshTrimPreview); }
  function tmRateRowHTML(r) {
    r = r || {};
    return '<div class="row tmRateRow"><input class="tr-m" type="number" placeholder="개월" value="' + (r.months != null ? r.months : "") + '">' +
      '<span class="pricew w"><input class="tr-p" type="text" inputmode="numeric" placeholder="월 렌트료" value="' + wonStr(r.price) + '"><span class="wonsuf">원</span></span>' +
      '<button class="rm" type="button">×</button></div>';
  }
  function trimMiniHTML(t) {
    t = t || {};
    return '<div class="tmini' + (t.name ? " collapsed" : "") + '">' +   // 이름 있는(저장된) 트림은 기본 닫힘
      '<div class="trow"><button class="tm-toggle" type="button" title="접기/펼치기">▾</button>' +
      '<input class="tm-name" placeholder="트림명 예: 프레스티지" value="' + (t.name || "") + '">' +
      '<span class="pricew w"><input class="tm-price" type="text" inputmode="numeric" placeholder="차량가격" value="' + manStr(t.price) + '"><span class="wonsuf">만원</span></span>' +
      '<button class="tm-copy" type="button" title="이 트림 복사">복사</button>' +
      '<button class="rm tm-rm" type="button">×</button></div>' +
      '<div class="tmbody">' +
      '<input type="hidden" class="tm-id" value="' + (t.id || genTid()) + '">' +
      seatDropdownHTML(t.seats) +
      '<div class="tmsec collapsed">' +
      '<div class="tmsec__head vao__label" style="margin-top:6px">월렌트료 미리보기 <span>(현재 가격정책 기준 · 차량가만 입력하면 자동 계산)</span><i class="tmsec__arr">▾</i></div>' +
      '<div class="tmsec__body"><div class="tm-preview">' + trimPreviewHTML(t.price || 0, t.makerDC || 0) + "</div></div></div>" +
      '<div class="tmsec collapsed">' +
      '<div class="tmsec__head vao__label" style="margin-top:6px">보증금 계산 <span>(개소세 감면 자동 · 과세표준=차량가−감면−DC)</span><i class="tmsec__arr">▾</i></div>' +
      '<div class="tmsec__body">' +
      '<div class="tmdisc">' +
      '<div class="tmfield"><span>개별소비세 감면액 (자동)</span><div class="tm-taxcut-disp">' + won(calcTaxReduction(t.price || 0)) + '원</div></div>' +
      '<label class="tmfield"><span>제조사 DC(할인)</span><span class="pricew"><input class="tm-makerdc" type="text" inputmode="numeric" placeholder="0" value="' + manStr(t.makerDC) + '"><span class="wonsuf">만원</span></span></label>' +
      "</div>" +
      '<div class="tmbase">보증금 과세표준: <b class="tm-base-disp">' + won(calcDepositBase(t.price || 0, t.makerDC || 0)) + '원</b></div>' +
      "</div></div>" +
      '<div class="vao"><div class="vao__label">추가 옵션 <span>(이 트림 전용)</span></div>' +
      '<div class="vaoGroups">' + ((t.addOptions || []).map(aoGroupHTML).join("")) + "</div>" +
      '<button class="add vao-addgroup" type="button">+ 옵션 그룹 추가</button></div>' +
      "</div></div>";
  }
  function vtypeBlockHTML(v) {
    v = v || { name: "", trims: [] };
    var trims = (v.trims && v.trims.length) ? v.trims : [{}];
    return '<div class="vblock">' +
      '<div class="vhead"><span class="dragh vt-dragh" title="드래그로 차량유형 순서 이동">⠿</span><input class="vt-name" placeholder="차량유형명 예: 1.6 터보 9인승" value="' + (v.name || "") + '">' +
      '<button class="vt-copy" type="button" title="이 차량유형 복사">복사</button>' +
      '<button class="vrm" type="button">유형 삭제</button></div>' +
      '<div class="vmeta">' +
      '<label class="vfield"><span>배기량 (cc · 전기 0)</span><input class="vt-disp" type="number" placeholder="예: 1598" value="' + (v.displacement != null ? v.displacement : "") + '"></label>' +
      '<label class="vfield"><span>월렌트료 조정 (% · 하이루프 등)</span><input class="vt-adj" type="number" step="0.1" placeholder="0" value="' + (v.adjRate ? +(v.adjRate * 100).toFixed(1) : "") + '"></label>' +
      "</div>" +
      '<div class="vtrims">' + trims.map(trimMiniHTML).join("") + "</div>" +
      '<div class="vtrim-actions">' +
      '<button class="add vaddtrim" type="button">+ 트림 추가</button>' +
      '<button class="vtpaste-btn vtpaste" type="button">📋 트림 붙여넣기</button>' +
      "</div>" +
      "</div>";
  }
  function renderVtypeBlocks(types) {
    if (!types || !types.length) types = [{ name: "", trims: [{}] }];
    $("#vtypeBlocks").innerHTML = types.map(vtypeBlockHTML).join("");
  }
  function collectVtypes() {
    return [].map.call(document.querySelectorAll(".vblock"), function (bl) {
      var name = $(".vt-name", bl).value.trim();
      var displacement = num($(".vt-disp", bl).value);
      var adjRate = (parseFloat($(".vt-adj", bl) && $(".vt-adj", bl).value) || 0) / 100;   // % → 비율
      var trims = [].map.call(bl.querySelectorAll(".tmini"), function (tm) {
        var priceWon = num($(".tm-price", tm).value) * 10000;
        return {
          id: ($(".tm-id", tm) && $(".tm-id", tm).value) || genTid(),
          name: $(".tm-name", tm).value.trim(),
          price: priceWon,   // 입력 만원 → 원으로 저장
          makerDC: num($(".tm-makerdc", tm).value) * 10000,   // 입력 만원 → 원
          seats: num($(".tm-seats", tm).value),
          features: [],
          addOptions: collectAddOptions(tm)
        };
      }).filter(function (t) { return t.name; });
      return { name: name, displacement: displacement, adjRate: adjRate, trims: trims };
    }).filter(function (v) { return v.trims.length; });
  }
  function mileRowHTML(v) { return '<div class="row mileRow"><input class="m-val" placeholder="예: 10,000km" value="' + (v || "") + '"><button class="rm" type="button">×</button></div>'; }
  var EYE_ON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>';
  var EYE_OFF = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
  function visIcon(hidden) { return hidden ? EYE_OFF : EYE_ON; }
  function aoItemHTML(it) { it = it || {}; return '<div class="row aoItemRow"><span class="dragh" draggable="true" title="드래그로 순서 이동">⠿</span><input class="ao-name" placeholder="항목명 예: 프리미엄 팩2" value="' + (it.name || "") + '"><span class="pricew w"><input class="ao-price" type="text" inputmode="numeric" placeholder="가격" value="' + wonStr(it.price) + '"><span class="wonsuf">원</span></span><button type="button" class="ao-vis' + (it.hidden ? " is-off" : "") + '" title="' + (it.hidden ? "비노출(클릭 시 노출)" : "노출(클릭 시 비노출)") + '">' + visIcon(it.hidden) + '</button><button class="rm" type="button">×</button></div>'; }
  function aoTitleDropdownHTML(title) {
    var cur = title || "";
    var opts = ["옵션", "액세서리", "외장 색상", "내장 색상", "가니쉬 색상"];
    if (cur && opts.indexOf(cur) === -1) opts.push(cur);
    var menu = opts.map(function (o) { return '<button type="button" class="dd__opt' + (o === cur ? " on" : "") + '" data-v="' + o + '">' + o + "</button>"; }).join("");
    return '<div class="dd ao-titledd dd--abs"><input type="hidden" class="ao-gtitle" value="' + cur + '">' +
      '<button type="button" class="dd__btn">' + (cur || "그룹 선택") + "<i>▾</i></button>" +
      '<div class="dd__menu">' + menu + "</div></div>";
  }
  function aoGroupHTML(g) {
    g = g || {};
    var items = (g.items && g.items.length) ? g.items : [{}];
    return '<div class="aoGroup">' +
      '<div class="aoGhead"><span class="dragh" draggable="true" title="드래그로 순서 이동">⠿</span>' + aoTitleDropdownHTML(g.title) +
      '<button class="ao-grm" type="button">그룹 삭제</button></div>' +
      '<div class="aoItems">' + items.map(aoItemHTML).join("") + "</div>" +
      '<button class="add ao-additem" type="button">+ 항목 추가</button></div>';
  }
  function collectAddOptions(scope) {
    return [].map.call((scope || document).querySelectorAll(".aoGroup"), function (bl) {
      var title = $(".ao-gtitle", bl).value.trim();
      var items = [].map.call(bl.querySelectorAll(".aoItemRow"), function (r) {
        var visBtn = $(".ao-vis", r);
        var it = { name: $(".ao-name", r).value.trim(), price: num($(".ao-price", r).value) };
        if (visBtn && visBtn.classList.contains("is-off")) it.hidden = true;
        return it;
      }).filter(function (it) { return it.name; });
      return { title: title || "옵션", items: items };
    }).filter(function (g) { return g.items.length; });
  }
  function cbGroup(id, options, selected) {
    selected = selected || [];
    $("#" + id).innerHTML = options.map(function (o) {
      return '<label class="cbox"><input type="checkbox" value="' + o + '"' + (selected.indexOf(o) !== -1 ? " checked" : "") + " /> " + o + "</label>";
    }).join("");
  }
  function cbValues(id) { return [].map.call(document.querySelectorAll("#" + id + " input:checked"), function (x) { return x.value; }); }
  function radioGroup(id, name, options, selected) {
    $("#" + id).innerHTML = options.map(function (o) {
      return '<label class="cbox"><input type="radio" name="' + name + '" value="' + o + '"' + (o === selected ? " checked" : "") + " /> " + o + "</label>";
    }).join("");
  }
  function radioVal(name) { var el = document.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ""; }
  function selGroup(containerId, selId, options, selected) {
    var cur = selected || "";
    $("#" + containerId).innerHTML = '<div class="dd">' +
      '<input type="hidden" id="' + selId + '" value="' + cur + '">' +
      '<button type="button" class="dd__btn">' + (cur || "선택") + '<i>▾</i></button>' +
      '<div class="dd__menu">' +
      options.map(function (o) { return '<button type="button" class="dd__opt' + (o === cur ? " on" : "") + '" data-v="' + o + '">' + o + "</button>"; }).join("") +
      "</div></div>";
  }
  function rowsVal(sel, fn) { return [].map.call(document.querySelectorAll(sel), fn); }

  /* ---------- 사진 ---------- */
  function syncThumb() {
    var url = val("c-photo"), box = $("#photoThumb"), rmv = $("#photoRemove");
    if (url) { $("#photoThumbImg").src = url; box.classList.remove("hidden"); if (rmv) rmv.classList.remove("hidden"); }
    else { box.classList.add("hidden"); $("#photoThumbImg").removeAttribute("src"); if (rmv) rmv.classList.add("hidden"); }
  }
  function readImage(file, cb) {
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var max = 900, w = img.width, h = img.height;
        if (w > max) { h = Math.round(h * max / w); w = max; }
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        // PNG(누끼)는 투명 보존을 위해 PNG로, 그 외(JPG 등)는 용량 위해 JPEG로
        var isPng = /png/i.test(file.type || "");
        try { cb(cv.toDataURL(isPng ? "image/png" : "image/jpeg", 0.82)); } catch (e) { cb(r.result); }
      };
      img.onerror = function () { cb(r.result); };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }

  /* ---------- 폼 → 차량 ---------- */
  function buildCar() {
    var base = CARS[cur] || blankCar();
    var vehicleTypes = collectVtypes();
    if (val("c-fuel") === "전기") vehicleTypes.forEach(function (v) { v.displacement = 0; });   // 전기차는 배기량 0
    if (!vehicleTypes.length) vehicleTypes = [{ name: "", trims: [] }];
    var trims = (vehicleTypes[0] && vehicleTypes[0].trims) ? vehicleTypes[0].trims : [];
    var maintenance = $("#f-maintenance").value.split("\n").map(function (s) { return s.trim().replace(/^[•\-]\s*/, ""); }).filter(Boolean);
    var statusEl = document.querySelector('#statusGroup input:checked');
    var buyEl = document.querySelector('#buyOption input:checked');
    var popular = $("#c-popular").checked, recommend = $("#c-recommend").checked;
    var badges = []; if (popular) badges.push("hot"); if (recommend) badges.push("rec");

    var detail = {
      subModel: "",
      displacement: (vehicleTypes[0] && vehicleTypes[0].displacement) || 0,
      seats: (trims[0] && trims[0].seats) || 0,
      vehicleTypes: vehicleTypes,
      trims: trims,
      maintenance: maintenance,
      maintenanceFee: 0,
      buyOption: buyEl ? buyEl.value : "있음",
      mileage: val("sel-mile") || "10,000km",
      deposit: val("sel-dep") || "15%",   // 기본 15% (변경 가능)
      prepay: val("sel-pre") || "0%",
      driverAge: val("sel-age") || "만 26세 이상",
      liability: val("sel-liab") || "1억원",
      deductible: val("sel-ded") || "50만원",
      accessories: $("#f-accessories").value.trim(),
      region: val("sel-region") || "서울",
      rentTable: []
    };
    // 메인 표시용 월납입금 = 기준 트림 요율표의 72(없으면 60/첫)개월 값
    var t0 = trims[0] || {};
    var rt0 = t0.rentTable || [];
    var rr = rt0.filter(function (r) { return r.months === 72; })[0] || rt0.filter(function (r) { return r.months === 60; })[0] || rt0[0];
    var price = rr ? rr.price : (t0.price ? engMon(t0.price, 72, 0) : 0);
    return {
      brand: val("c-brand").trim() || "기타",
      name: val("c-name").trim() || "새 차량",
      seg: "",
      fuel: val("c-fuel") || "가솔린",
      photo: val("c-photo").trim(),
      price: price,
      km: (val("sel-mile") || "10,000km"),
      badges: badges,
      body: base.body || "suv",
      color: base.color || "#1A2332",
      term: 72,
      status: statusEl ? statusEl.value : "판매중",
      popular: popular, recommend: recommend,
      detail: detail
    };
  }

  /* ---------- 편집 진입 ---------- */
  function applyEditView(id, isNew, override) {
    creating = !!isNew;
    cur = isNew ? -1 : id;
    pv = { vtype: 0, trim: 0, term: null, open: null, deposit: null, prepay: null, mileage: null, age: null, liab: null, ded: null, region: null, addopt: null };
    var c = override ? override.car : (isNew ? blankCar() : CARS[id]);
    var d = override ? override.detail : (isNew ? carDetailDefaults(c) : getCarDetail(id));
    if (override) isNew = false;   // override면 빈 폼이 아니라 전달된 값으로 채움(저장 시 신규로 추가)
    setVal("c-photo", isNew ? "" : (c.photo || "")); syncThumb();
    var brands = BRANDS_ALL.slice();
    if (!isNew && c.brand && brands.indexOf(c.brand) === -1) brands.unshift(c.brand);
    selGroup("brandGroup", "c-brand", brands, isNew ? "" : (c.brand || ""));
    setVal("c-name", isNew ? "" : c.name);
    selGroup("fuelGroup", "c-fuel", ["가솔린", "하이브리드", "전기", "디젤"], isNew ? "가솔린" : (c.fuel || "가솔린"));
    renderVtypeBlocks(isNew ? [{ name: "", trims: [{}] }] : d.vehicleTypes);
    $("#f-maintenance").value = (!isNew && d.maintenance && d.maintenance.length) ? d.maintenance.join("\n") : DEFAULT_MAINT;
    setRadio("buyOption", isNew ? "있음" : (d.buyOption || "있음"));
    var selMile = isNew ? "10,000km" : (d.mileage || "");
    var mileOpts = MILEAGE_OPTS.slice();
    if (selMile && mileOpts.indexOf(selMile) === -1 && selMile !== "직접입력") mileOpts.push(selMile);
    mileOpts.push("직접입력");
    selGroup("mileGroup", "sel-mile", mileOpts, selMile);
    var selDep = isNew ? "15%" : (d.deposit || "15%");   // 저장된 보증금 표시(신규는 기본 15%)
    var depOpts = DEPOSIT_OPTS.slice();
    if (selDep && depOpts.indexOf(selDep) === -1 && selDep !== "직접입력") depOpts.push(selDep);
    depOpts.push("직접입력");
    selGroup("depGroup", "sel-dep", depOpts, selDep);
    var selPre = isNew ? "0%" : (d.prepay || "");
    var preOpts = PREPAY_OPTS.slice();
    if (selPre && preOpts.indexOf(selPre) === -1 && selPre !== "직접입력") preOpts.push(selPre);
    preOpts.push("직접입력");
    selGroup("prepayGroup", "sel-pre", preOpts, selPre);
    selGroup("ageGroup", "sel-age", AGE_OPTS, isNew ? "만 26세 이상" : (d.driverAge || ""));
    selGroup("liabGroup", "sel-liab", LIAB_OPTS, isNew ? "1억원" : (d.liability || ""));
    selGroup("dedGroup", "sel-ded", DED_OPTS, isNew ? "30만원" : (d.deductible || ""));
    selGroup("regionGroup", "sel-region", REGION_OPTS, isNew ? "" : (d.region || ""));
    $("#f-accessories").value = (!isNew && d.accessories) ? d.accessories : DEFAULT_ACCESSORIES;
    setRadio("statusGroup", isNew ? "판매중" : (c.status || "판매중"));
    $("#c-popular").checked = isNew ? false : !!c.popular;
    $("#c-recommend").checked = isNew ? false : !!c.recommend;
    renderPreview();
    listView.classList.add("hidden"); editView.classList.remove("hidden"); window.scrollTo(0, 0);
  }
  function setRadio(groupId, value) {
    [].forEach.call(document.querySelectorAll("#" + groupId + " input"), function (x) { x.checked = (x.value === value); });
  }
  function openEdit(id, isNew) { applyEditView(id, isNew); history.pushState({ mode: "edit", id: id }, "", "#edit-" + id); }
  function applyListView() { creating = false; editView.classList.add("hidden"); listView.classList.remove("hidden"); renderList(); }
  function hasInput() {
    if (val("c-name").trim() || val("c-brand") || val("c-photo")) return true;
    return [].some.call(document.querySelectorAll(".tm-name, .ao-name"), function (x) { return (x.value || "").trim(); });
  }
  function autosaveIfEditing() {
    if (!editView.classList.contains("hidden") && hasInput()) saveData(creating ? true : undefined);  // 입력 있으면 자동저장(신규=임시저장)
  }
  function backToList() { autosaveIfEditing(); creating = false; applyListView(); history.replaceState({ mode: "list" }, "", location.pathname + location.search); }
  window.addEventListener("popstate", function (e) {
    autosaveIfEditing(); creating = false;
    var s = e.state;
    if (s && s.mode === "edit" && CARS[s.id]) applyEditView(s.id);
    else applyListView();
  });
  function saveData(isDraft) {
    var built = buildCar();
    // 임시저장(true)=메인 미노출, 저장(false)=노출, 그 외(미리보기 등)=기존 상태 유지
    if (isDraft === true) built.draft = true;
    else if (isDraft === false) built.draft = false;
    else built.draft = creating ? true : !!(CARS[cur] && CARS[cur].draft);
    if (creating) { CARS.push(built); cur = CARS.length - 1; creating = false; }
    else { var c = CARS[cur]; for (var k in built) c[k] = built[k]; }
    saveCars();
  }

  /* ---------- 미리보기 (실제 상세화면처럼 선택 가능) ---------- */
  var pv = { vtype: 0, trim: 0, term: null, open: null, deposit: null, prepay: null, mileage: null, age: null, liab: null, ded: null, region: null };
  var previewTimer = null, previewN = 0;
  function renderPreview() {
    var frame = $("#previewFrame"); if (!frame) return;
    try { localStorage.setItem("cartrend:preview", JSON.stringify(buildCar())); } catch (e) {}
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      frame.src = "car.html?preview=1&n=" + (++previewN);   // 매번 새로 로드(캐시·잔존 데이터 방지)
    }, 250);
    return;
    /* ===== 이하 구버전 인라인 미리보기 (미사용) ===== */
    var c = buildCar(), d = c.detail;
    var fee = d.maintenanceFee || 0;
    var rt = d.rentTable.length ? d.rentTable : [{ months: 72, price: 0 }];
    var vtypes = d.vehicleTypes.length ? d.vehicleTypes : [{ name: "", trims: d.trims }];
    if (pv.vtype >= vtypes.length) pv.vtype = 0;
    var selVt = vtypes[pv.vtype] || vtypes[0];
    var trims = (selVt.trims && selVt.trims.length) ? selVt.trims : (d.trims.length ? d.trims : [{ name: "기본", price: 0, features: [] }]);
    if (pv.trim >= trims.length) pv.trim = 0;

    var sub = selVt.name || "";
    var selTrim = trims[pv.trim] || trims[0];
    // 월 렌트료 자동 계산 (차량가·기간 기준, 미리보기는 보증금/선납금 0 기준)
    var months = ((d.rentTable && d.rentTable.length) ? d.rentTable.map(function (r) { return r.months; }) : [36, 48, 60, 72, 82]).slice().sort(function (a, b) { return b - a; });
    if (pv.term == null || pv.term >= months.length) { pv.term = 0; months.forEach(function (m, i) { if (m === 72) pv.term = i; }); }
    function mon(m) { return engMon(selTrim.price || 0, m, fee); }
    var aoList = [{ name: "선택 안 함", price: 0 }].concat(d.addOptions);
    var aoIdx = pv.addopt != null ? pv.addopt : 0; if (aoIdx >= aoList.length) aoIdx = 0;
    var pay = mon(months[pv.term] != null ? months[pv.term] : months[0]) + (aoList[aoIdx] ? aoList[aoIdx].price : 0);
    var badges = (c.popular ? '<span class="pb pb-hot">🔥 인기</span>' : "") + (c.recommend ? '<span class="pb pb-rec">추천</span>' : "");
    var join = function (a) { return (a && a.length) ? a.join(" · ") : "-"; };
    var pctOf = function (s) { var m = parseFloat(s); return isNaN(m) ? 0 : m / 100; };
    var amtAt = function (arr, idx) { var v = arr[idx] || arr[0] || "0%"; return Math.round((selTrim.price || 0) * pctOf(v) / 1000) * 1000; };
    var depIdx = pv.deposit != null ? pv.deposit : Math.max(0, DEPOSIT_OPTS.indexOf(d.deposit || "0%"));
    var preIdx = pv.prepay != null ? pv.prepay : Math.max(0, PREPAY_OPTS.indexOf(d.prepay || "0%"));
    function pctRow(label, key, arr, idx) {
      if (!arr.length) return "";
      var row = '<div class="prev__row prev__row--click" data-pv="' + key + '-toggle"><span>' + label + '</span><b>' + won(amtAt(arr, idx)) + "원 <i>›</i></b></div>";
      if (pv.open === key) {
        row += '<div class="prev__pcts">' + arr.map(function (v, i) {
          return '<div class="prev__pct' + (i === idx ? " on" : "") + '" data-pv="' + key + '-sel" data-i="' + i + '"><b>' + won(amtAt(arr, i)) + "원</b><span>" + v + "</span></div>";
        }).join("") + "</div>";
      }
      return row;
    }
    function selRow(label, key, opts, idx) {
      if (!opts || !opts.length) return '<div class="prev__row"><span>' + label + "</span><b>-</b></div>";
      if (idx == null || idx >= opts.length) idx = 0;
      var row = '<div class="prev__row prev__row--click" data-pv="' + key + '-toggle"><span>' + label + '</span><b>' + opts[idx] + " <i>›</i></b></div>";
      if (pv.open === key) {
        row += '<div class="prev__pcts">' + opts.map(function (v, i) {
          return '<div class="prev__pct' + (i === idx ? " on" : "") + '" data-pv="' + key + '-sel" data-i="' + i + '"><b>' + v + "</b></div>";
        }).join("") + "</div>";
      }
      return row;
    }
    function optRow() {
      if (!d.addOptions.length) return "";
      var opts = [{ name: "선택 안 함", price: 0 }].concat(d.addOptions);
      var idx = pv.addopt != null ? pv.addopt : 0; if (idx >= opts.length) idx = 0;
      var o = opts[idx];
      var disp = o.price ? (o.name + " · " + won(o.price) + "원") : o.name;
      var row = '<div class="prev__row prev__row--click" data-pv="addopt-toggle"><span>추가 옵션</span><b>' + disp + " <i>›</i></b></div>";
      if (pv.open === "addopt") {
        row += '<div class="prev__pcts">' + opts.map(function (o2, i) {
          return '<div class="prev__pct' + (i === idx ? " on" : "") + '" data-pv="addopt-sel" data-i="' + i + '"><b>' + o2.name + "</b><span>" + (o2.price ? "+" + won(o2.price) + "원" : "-") + "</span></div>";
        }).join("") + "</div>";
      }
      return row;
    }
    var mileIdx = pv.mileage != null ? pv.mileage : Math.max(0, MILEAGE_OPTS.indexOf(d.mileage || "10,000km"));
    var subSpan = sub ? '<span style="color:var(--gray)">' + sub + "</span>" : "";
    var featList = (selTrim.features && selTrim.features.length)
      ? '<div class="prev__sec"><b>트림 포함 사양</b>' + selTrim.features.map(function (x) { return '<div class="prev__li">' + x + "</div>"; }).join("") + "</div>" : "";

    $("#livePreview").innerHTML =
      '<div class="prev__img">' + photoCell(c) + "</div>" +
      '<div class="prev__head"><div class="prev__badges">' + badges + "</div>" +
        '<div class="prev__name"><span class="ie" data-edit="name" data-ph="차량명">' + (c.name || "") + "</span> " + subSpan +
          (selTrim.name ? ' <span style="color:var(--gray)">' + selTrim.name + "</span>" : "") + "</div>" +
        '<div class="prev__msrp">차량가 ' + won(selTrim.price) + "원</div></div>" +
      (vtypes.length && vtypes[0].name ? '<div class="prev__sec"><b>차량 유형</b><div class="prev__trims">' +
        vtypes.map(function (v, i) {
          var meta = (v.displacement ? won(v.displacement) + "cc" : "전기") + " · " + (v.seats || "-") + "인승";
          return '<div class="prev__trim' + (i === pv.vtype ? " on" : "") + '" data-pv="vtype" data-i="' + i + '">' +
            (v.name || "") + "<small>" + meta + "</small></div>";
        }).join("") + "</div></div>" : "") +
      '<div class="prev__sec"><b>트림</b><div class="prev__trims">' +
        trims.map(function (t, i) {
          return '<div class="prev__trim' + (i === pv.trim ? " on" : "") + '" data-pv="trim" data-i="' + i + '">' +
            (t.name || "트림") + "<small>" + won(t.price) + "원</small></div>";
        }).join("") + "</div></div>" + featList +
      '<div class="prev__sec"><b>차량정보</b>' +
        '<div class="prev__row"><span>제조사</span><b>' + c.brand + "</b></div>" +
        (sub ? '<div class="prev__row"><span>세부모델</span><b>' + sub + "</b></div>" : "") +
        '<div class="prev__row"><span>배기량</span><b>' + ((selVt.displacement != null ? selVt.displacement : d.displacement) ? won(selVt.displacement != null ? selVt.displacement : d.displacement) + "cc" : "전기차") + "</b></div>" +
        '<div class="prev__row"><span>승차정원</span><b>' + ((selVt.seats != null ? selVt.seats : d.seats) || "-") + "인승</b></div>" +
        '<div class="prev__row"><span>연료</span><b>' + c.fuel + "</b></div></div>" +
      '<div class="prev__sec"><b>정비 서비스</b>' +
        (d.maintenance.length ? d.maintenance.map(function (m) { return '<div class="prev__li">' + m + "</div>"; }).join("") : '<div class="prev__li" style="color:#9AA3B0">없음</div>') +
        (fee ? '<div class="prev__row" style="margin-top:6px"><span>추가요금</span><b style="color:#E65100">월 +' + won(fee) + "원</b></div>" : "") + "</div>" +
      '<div class="prev__sec"><b>계약 조건</b>' +
        '<div class="prev__row"><span>매입 옵션</span><b>' + d.buyOption + "</b></div>" +
        selRow("연간 약정거리", "mileage", MILEAGE_OPTS, mileIdx) +
        pctRow("보증금", "deposit", DEPOSIT_OPTS, depIdx) +
        pctRow("선납금", "prepay", PREPAY_OPTS, preIdx) +
        selRow("운전자 연령", "age", AGE_OPTS, pv.age != null ? pv.age : Math.max(0, AGE_OPTS.indexOf(d.driverAge || "만 26세 이상"))) +
        selRow("대물배상", "liab", LIAB_OPTS, pv.liab != null ? pv.liab : Math.max(0, LIAB_OPTS.indexOf(d.liability || "1억원"))) +
        selRow("자차 면책금", "ded", DED_OPTS, pv.ded != null ? pv.ded : Math.max(0, DED_OPTS.indexOf(d.deductible || "50만원"))) +
        (d.accessories ? '<div class="prev__row"><span>차량용품</span><b>' + d.accessories.replace(/\n/g, ", ") + "</b></div>" : "") +
        selRow("인도지역", "region", REGION_OPTS, pv.region != null ? pv.region : Math.max(0, REGION_OPTS.indexOf(d.region || "서울"))) +
        optRow() +
        "</div>" +
      '<div class="prev__sec"><b>계약 기간 / 월 렌트료(자동)</b>' +
        months.map(function (m, i) {
          return '<div class="prev__term' + (i === pv.term ? " on" : "") + '" data-pv="term" data-i="' + i + '"><span>' +
            m + "개월" + (m === 72 ? '<span class="prev__best">BEST</span>' : "") +
            "</span><span>월 " + won(mon(m)) + "원</span></div>";
        }).join("") + "</div>" +
      '<div class="prev__pay"><span>월 납입금</span><b>' + won(pay) + "원</b></div>";
    attachInline();
  }

  /* 미리보기에서 바로 입력 → 폼에 반영 (인라인 편집) */
  function attachInline() {
    $("#livePreview").querySelectorAll(".ie").forEach(function (el) {
      el.setAttribute("contenteditable", "true");
      el.addEventListener("input", function () {
        var t = el.getAttribute("data-edit"), txt = el.textContent;
        if (t === "name") setVal("c-name", txt);
      });
    });
  }

  /* ---------- 토스트 ---------- */
  var toastT = null;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.classList.add("show"); if (toastT) clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 1700); }

  /* ---------- 이벤트: 목록 ---------- */
  function selectedIds() { return [].map.call(document.querySelectorAll(".ccard__chk:checked"), function (x) { return +x.getAttribute("data-chk"); }); }
  function updateSelCount() {
    var n = document.querySelectorAll(".ccard__chk:checked").length;
    $("#selCount").textContent = n ? " (" + n + ")" : "";
    [].forEach.call(document.querySelectorAll(".ccard__chk"), function (x) { x.closest(".ccard").classList.toggle("sel", x.checked); });
  }
  $("#carGrid").addEventListener("click", function (e) {
    if (e.target.classList.contains("ccard__grip")) return;            // 그립 클릭은 무시(드래그용)
    if (cardDragged) { cardDragged = false; return; }                  // 드래그 직후 클릭 무시
    if (e.target.classList.contains("ccard__chk")) { e.stopPropagation(); updateSelCount(); return; }
    var del = e.target.closest(".ccard__del");
    if (del) { e.stopPropagation(); var di = +del.getAttribute("data-del"); if (confirm("‘" + CARS[di].name + "’ 삭제할까요?")) { deleteCar(di); renderList(); toast("삭제되었습니다"); } return; }
    if (e.target.closest("#addCard")) { openEdit(null, true); return; }
    var card = e.target.closest(".ccard"); if (card) openEdit(+card.getAttribute("data-id"));
  });
  $("#brandFilter").addEventListener("click", function (e) { var b = e.target.closest(".bchip"); if (!b) return; filterBrand = b.getAttribute("data-b"); renderList(); });
  $("#sortSel").addEventListener("change", function () { sortMode = $("#sortSel").value; renderList(); });

  /* ---------- 차량 순서 드래그 정렬 ('내 순서(드래그)' + 브랜드 전체일 때) ---------- */
  var cardDrag = null, cardXY = null, cardScroll = null, cardDragged = false;
  function cardReorder(x, y) {
    if (!cardDrag) return;
    var el = document.elementFromPoint(x, y);
    var over = el && el.closest(".ccard");
    if (!over || over === cardDrag || over.parentNode !== cardDrag.parentNode) return;
    var nodes = [].slice.call(cardDrag.parentNode.querySelectorAll(".ccard"));
    if (nodes.indexOf(cardDrag) > nodes.indexOf(over)) cardDrag.parentNode.insertBefore(cardDrag, over);
    else cardDrag.parentNode.insertBefore(cardDrag, over.nextSibling);
  }
  $("#carGrid").addEventListener("mousedown", function (e) {
    var h = e.target.closest(".ccard__grip"); if (!h) return;
    if (sortMode !== "manual") { toast("정렬을 '내 순서(드래그)'로 바꾸면 옮길 수 있어요"); return; }
    if (filterBrand !== "전체") { toast("브랜드 '전체'에서만 순서 변경 가능"); return; }
    cardDrag = h.closest(".ccard"); if (!cardDrag) return;
    e.preventDefault();
    cardDrag.classList.add("dragging");
    document.body.style.userSelect = "none";
    cardXY = { x: e.clientX, y: e.clientY };
    cardScroll = setInterval(function () {
      if (!cardDrag) return;
      var m = cardXY.y < 110 ? -24 : (cardXY.y > window.innerHeight - 110 ? 24 : 0);
      if (m) { window.scrollBy(0, m); cardReorder(cardXY.x, cardXY.y); }
    }, 16);
  });
  document.addEventListener("mousemove", function (e) {
    if (!cardDrag) return;
    cardXY = { x: e.clientX, y: e.clientY };
    cardReorder(e.clientX, e.clientY);
  });
  document.addEventListener("mouseup", function () {
    if (!cardDrag) return;
    if (cardScroll) { clearInterval(cardScroll); cardScroll = null; }
    cardDrag.classList.remove("dragging");
    document.body.style.userSelect = "";
    cardDrag = null; cardDragged = true;
    var order = [].slice.call($("#carGrid").querySelectorAll(".ccard")).map(function (c) { return +c.getAttribute("data-id"); });
    var newCars = order.map(function (id) { return CARS[id]; }).filter(Boolean);
    if (newCars.length === CARS.length) { CARS.length = 0; [].push.apply(CARS, newCars); saveCars(); }
    renderList();
    toast("순서를 저장했습니다");
  });
  $("#selectAllBtn").addEventListener("click", function () {
    var boxes = document.querySelectorAll(".ccard__chk");
    var allOn = selectedIds().length === boxes.length && boxes.length > 0;
    [].forEach.call(boxes, function (x) { x.checked = !allOn; }); updateSelCount();
    $("#selectAllBtn").textContent = allOn ? "전체 선택" : "선택 해제";
  });
  $("#bulkDelBtn").addEventListener("click", function () {
    var ids = selectedIds(); if (!ids.length) { toast("선택된 차량이 없습니다"); return; }
    if (!confirm("선택한 " + ids.length + "대를 삭제할까요?")) return;
    ids.sort(function (a, b) { return b - a; }).forEach(function (i) { CARS.splice(i, 1); });
    saveCars(); renderList(); $("#selectAllBtn").textContent = "전체 선택"; toast(ids.length + "대 삭제");
  });
  $("#deleteAllBtn").addEventListener("click", function () {
    if (!CARS.length) { toast("삭제할 차량이 없습니다"); return; }
    if (!confirm("전체 " + CARS.length + "대를 모두 삭제할까요?")) return;
    CARS.length = 0; saveCars(); renderList(); toast("전체 삭제되었습니다");
  });

  /* ---------- 이벤트: 편집 ---------- */
  // 편집 중 자동저장 (저장 버튼 안 눌러도 · 하나라도 입력돼 있으면 · 디바운스)
  var autoTimer = null;
  function scheduleAutosave() {
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () {
      if (!editView.classList.contains("hidden") && hasInput()) { saveData(creating ? true : undefined); }
    }, 800);
  }
  editView.addEventListener("input", function (e) {
    if (e.target.classList && e.target.classList.contains("ie")) return; // 미리보기 인라인 편집 중엔 재렌더 안 함(포커스 유지)
    renderPreview();
    scheduleAutosave();
  });
  editView.addEventListener("change", function () { renderPreview(); scheduleAutosave(); });
  editView.addEventListener("click", scheduleAutosave);   // 드롭다운·체크 등 선택도 자동저장
  function delegateRemove(containerId) {
    $("#" + containerId).addEventListener("click", function (e) { if (e.target.classList.contains("rm")) { e.target.closest(".row").remove(); renderPreview(); } });
  }
  // 커스텀 드롭다운 (인라인 펼침, 겹침 없음)
  document.addEventListener("click", function (e) {
    var opt = e.target.closest(".dd__opt");
    if (opt) {
      var dd = opt.closest(".dd");
      var hid = dd.querySelector("input[type=hidden]");
      hid.value = opt.getAttribute("data-v");
      dd.querySelector(".dd__btn").innerHTML = opt.textContent + '<i>▾</i>';
      [].forEach.call(dd.querySelectorAll(".dd__opt"), function (x) { x.classList.remove("on"); });
      opt.classList.add("on");
      dd.classList.remove("open");
      // 연료=전기 → 모든 차량유형 배기량 0으로 자동 설정
      if (hid.id === "c-fuel" && hid.value === "전기") {
        [].forEach.call(document.querySelectorAll(".vt-disp"), function (x) { x.value = "0"; });
      }
      renderPreview();
      return;
    }
    var btn = e.target.closest(".dd__btn");
    var openDd = btn ? btn.closest(".dd") : null;
    [].forEach.call(document.querySelectorAll(".dd.open"), function (x) { if (x !== openDd) x.classList.remove("open"); });
    if (btn) openDd.classList.toggle("open");
  });
  // 차량 유형(블록) + 유형별 트림(미니) + 유형별 추가옵션 추가/삭제
  $("#vtypeBlocks").addEventListener("click", function (e) {
    if (e.target.classList.contains("tm-toggle")) { e.target.closest(".tmini").classList.toggle("collapsed"); return; }
    var secHead = e.target.closest(".tmsec__head"); if (secHead) { secHead.closest(".tmsec").classList.toggle("collapsed"); return; }
    if (e.target.classList.contains("vrm")) { e.target.closest(".vblock").remove(); renderPreview(); return; }
    if (e.target.classList.contains("tm-rm")) { e.target.closest(".tmini").remove(); renderPreview(); return; }
    if (e.target.classList.contains("tm-copy")) { copyTrim(e.target.closest(".tmini")); return; }
    if (e.target.classList.contains("vtpaste")) { pasteTrim(e.target.closest(".vblock")); return; }
    if (e.target.classList.contains("vt-copy")) { copyVtype(e.target.closest(".vblock")); return; }
    if (e.target.classList.contains("vaddtrim")) {
      e.target.closest(".vblock").querySelector(".vtrims").insertAdjacentHTML("beforeend", trimMiniHTML({})); renderPreview(); return;
    }
    // 유형별 추가옵션
    if (e.target.classList.contains("vao-addgroup")) {
      e.target.closest(".vao").querySelector(".vaoGroups").insertAdjacentHTML("beforeend", aoGroupHTML({ title: "", items: [{}] })); renderPreview(); return;
    }
    if (e.target.classList.contains("ao-grm")) { e.target.closest(".aoGroup").remove(); renderPreview(); return; }
    if (e.target.classList.contains("ao-additem")) { e.target.closest(".aoGroup").querySelector(".aoItems").insertAdjacentHTML("beforeend", aoItemHTML({})); renderPreview(); return; }
    if (e.target.classList.contains("tm-addrate")) { e.target.closest(".tmrate").querySelector(".tmrateRows").insertAdjacentHTML("beforeend", tmRateRowHTML({})); renderPreview(); return; }
    if (e.target.classList.contains("rm") && e.target.closest(".tmRateRow")) { e.target.closest(".tmRateRow").remove(); renderPreview(); return; }
    if (e.target.classList.contains("rm") && e.target.closest(".aoItemRow")) { e.target.closest(".aoItemRow").remove(); renderPreview(); return; }
    var vb = e.target.closest(".ao-vis");
    if (vb) { vb.classList.toggle("is-off"); var off = vb.classList.contains("is-off"); vb.innerHTML = visIcon(off); vb.title = off ? "비노출(클릭 시 노출)" : "노출(클릭 시 비노출)"; renderPreview(); return; }
  });
  // 가격 입력 시 3자리 콤마 자동 표시
  $("#vtypeBlocks").addEventListener("input", function (e) {
    if (e.target.classList.contains("tm-price") || e.target.classList.contains("ao-price") || e.target.classList.contains("tr-p") || e.target.classList.contains("tm-makerdc")) {
      var d = e.target.value.replace(/[^0-9]/g, "");
      e.target.value = d ? Number(d).toLocaleString("ko-KR") : "";
    }
    // 차량가/제조사DC(만원) 변경 시 개소세 감면·과세표준·월렌트료 미리보기 자동 갱신
    if (e.target.classList.contains("tm-price") || e.target.classList.contains("tm-makerdc")) {
      var tm = e.target.closest(".tmini");
      if (tm) {
        var price = num($(".tm-price", tm).value) * 10000, mk = num($(".tm-makerdc", tm).value) * 10000;
        var td = $(".tm-taxcut-disp", tm); if (td) td.textContent = won(QE.calcTaxReduction(price)) + "원";
        var bd = $(".tm-base-disp", tm); if (bd) bd.textContent = won(QE.calcDepositBase(price, mk)) + "원";
        refreshTrimPreview(tm);
      }
    }
  });
  // 추가옵션 항목/그룹 드래그로 순서 이동
  var dragEl = null;
  $("#vtypeBlocks").addEventListener("dragstart", function (e) {
    var h = e.target.closest(".dragh"); if (!h) return;
    dragEl = h.closest(".aoItemRow") || h.closest(".aoGroup");
    if (!dragEl) return;
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", ""); } catch (err) { }
    dragEl.classList.add("dragging");
  });
  $("#vtypeBlocks").addEventListener("dragover", function (e) {
    if (!dragEl) return;
    var sel = dragEl.classList.contains("aoItemRow") ? ".aoItemRow" : ".aoGroup";
    var over = e.target.closest(sel);
    if (!over || over === dragEl || over.parentNode !== dragEl.parentNode) return;
    e.preventDefault();
    var rect = over.getBoundingClientRect();
    var after = (e.clientY - rect.top) > rect.height / 2;
    over.parentNode.insertBefore(dragEl, after ? over.nextSibling : over);
  });
  $("#vtypeBlocks").addEventListener("drop", function (e) { if (dragEl) e.preventDefault(); });
  $("#vtypeBlocks").addEventListener("dragend", function () {
    if (!dragEl) return;
    dragEl.classList.remove("dragging"); dragEl = null; renderPreview();
  });
  // 차량유형 순서 이동 — 포인터 기반 드래그 (HTML5 DnD보다 안정적)
  // 키 큰 블록도 옮길 수 있도록: 이웃에 진입 즉시 자리바꿈 + 화면 가장자리 자동 스크롤
  var vDrag = null, vLastY = 0, vScroll = null;
  function vReorder(clientY) {
    if (!vDrag) return;
    var cont = $("#vtypeBlocks");
    var blocks = [].filter.call(cont.children, function (x) { return x.classList.contains("vblock"); });
    for (var i = 0; i < blocks.length; i++) {
      var bl = blocks[i]; if (bl === vDrag) continue;
      var r = bl.getBoundingClientRect();
      if (clientY >= r.top && clientY <= r.bottom) {
        var nodes = [].slice.call(cont.children);
        if (nodes.indexOf(vDrag) > nodes.indexOf(bl)) cont.insertBefore(vDrag, bl);
        else cont.insertBefore(vDrag, bl.nextSibling);
        break;
      }
    }
  }
  $("#vtypeBlocks").addEventListener("mousedown", function (e) {
    var h = e.target.closest(".vt-dragh"); if (!h) return;
    vDrag = h.closest(".vblock"); if (!vDrag) return;
    e.preventDefault();
    vLastY = e.clientY;
    vDrag.classList.add("dragging");
    document.body.style.userSelect = "none";
    // 가장자리 근처에서 화면 자동 스크롤 (마우스를 멈춰도 계속 스크롤)
    vScroll = setInterval(function () {
      if (!vDrag) return;
      var m = vLastY < 100 ? -22 : (vLastY > window.innerHeight - 100 ? 22 : 0);
      if (m) { window.scrollBy(0, m); vReorder(vLastY); }
    }, 16);
  });
  document.addEventListener("mousemove", function (e) {
    if (!vDrag) return;
    vLastY = e.clientY;
    vReorder(vLastY);
  });
  document.addEventListener("mouseup", function () {
    if (!vDrag) return;
    if (vScroll) { clearInterval(vScroll); vScroll = null; }
    vDrag.classList.remove("dragging"); document.body.style.userSelect = "";
    vDrag = null; renderPreview();
  });
  $("#addVtype").addEventListener("click", function () { $("#vtypeBlocks").insertAdjacentHTML("beforeend", vtypeBlockHTML({ name: "", trims: [{}] })); renderPreview(); });
  $("#pasteVtype").addEventListener("click", pasteVtype);
  $("#c-photoFile").addEventListener("change", function (e) { var f = e.target.files && e.target.files[0]; if (!f) return; readImage(f, function (u) { setVal("c-photo", u); syncThumb(); renderPreview(); }); });
  $("#photoRemove").addEventListener("click", function () { setVal("c-photo", ""); $("#c-photoFile").value = ""; syncThumb(); renderPreview(); });
  $("#homeLink").addEventListener("click", backToList);
  $("#saveTempBtn").addEventListener("click", function () { saveData(true); toast("임시저장되었습니다 (메인 미노출)"); });
  $("#saveBtn").addEventListener("click", function () { saveData(false); renderPreview(); toast("저장되었습니다 ✓"); });
  $("#previewBtn").addEventListener("click", function () { saveData(); window.open("car.html?id=" + cur, "_blank"); });

  /* ---------- 가격 정책 설정 ---------- */
  function fillPolicyForm(pol) {
    $("#policyResidual").innerHTML = QE.PERIODS.map(function (n) {
      return '<label>' + n + '개월<input type="number" step="0.1" class="pol-res" data-n="' + n + '" value="' + +(pol.residualTable[n] * 100).toFixed(2) + '"></label>';
    }).join("");
    $("#policyRate").value = +(pol.annualRate * 100).toFixed(2);
    $("#policyMargin").value = +(pol.marginRate * 100).toFixed(2);
  }
  function openPolicy() { fillPolicyForm(QE.loadPricingPolicy()); $("#policyModal").classList.remove("hidden"); }
  function closePolicy() { $("#policyModal").classList.add("hidden"); }
  $("#policyBtn").addEventListener("click", openPolicy);
  $("#policyClose").addEventListener("click", closePolicy);
  $("#policyModal").addEventListener("click", function (e) { if (e.target.id === "policyModal") closePolicy(); });
  $("#policyReset").addEventListener("click", function () { QE.resetPricingPolicy(); fillPolicyForm(QE.loadPricingPolicy()); toast("기본값으로 복원했습니다"); });
  $("#policySave").addEventListener("click", function () {
    var rt = {};
    [].forEach.call(document.querySelectorAll(".pol-res"), function (inp) { rt[+inp.getAttribute("data-n")] = (parseFloat(inp.value) || 0) / 100; });
    var pol = QE.normalizePolicy({
      residualTable: rt,
      annualRate: (parseFloat($("#policyRate").value) || 0) / 100,
      marginRate: (parseFloat($("#policyMargin").value) || 0) / 100
    });
    QE.savePricingPolicy(pol);
    refreshAllPreviews();   // 편집 중 트림 미리보기 갱신
    if (typeof renderPreview === "function") renderPreview();   // 상세 미리보기 갱신
    closePolicy();
    toast("가격 정책을 저장했습니다 ✓");
  });


  history.replaceState({ mode: "list" }, "", location.pathname + location.search);
  renderList();

  /* ---------- Supabase: 게시된 카탈로그 불러오기 + 게시(공개 반영) ---------- */
  if (window.CARTREND_DB) {
    // 시작 시 DB(게시본)를 불러와 관리자에 표시 (어느 기기에서 열어도 동일)
    CARTREND_DB.fetchCatalog().then(function (remote) {
      if (remote && remote.length) {
        CARS.length = 0; [].push.apply(CARS, remote);
        saveCars();        // 로컬 작업본 동기화
        renderList();
      }
    });
    function ensureLogin() {
      if (CARTREND_DB.hasSession()) return Promise.resolve();
      var email = prompt("관리자 이메일을 입력하세요 (처음 한 번만):");
      if (!email) return Promise.reject(new Error("취소됨"));
      var pw = prompt("비밀번호를 입력하세요:");
      if (!pw) return Promise.reject(new Error("취소됨"));
      return CARTREND_DB.login(email.trim(), pw);
    }
    var pubBtn = $("#publishBtn");
    if (pubBtn) pubBtn.addEventListener("click", function () {
      pubBtn.disabled = true; var orig = pubBtn.textContent; pubBtn.textContent = "게시 중…";
      ensureLogin()
        .then(function () { return CARTREND_DB.saveCatalog(CARS); })
        .then(function (res) {
          if (res.ok) { toast("공개 사이트에 게시됐습니다 ✓ (손님에게 바로 반영)"); }
          else if (res.status === 401) { CARTREND_DB.logout(); toast("로그인 만료 — 게시 버튼을 다시 눌러 로그인하세요"); }
          else { toast("게시 실패 (코드 " + res.status + ")"); }
        })
        .catch(function (e) { toast(e && e.message ? e.message : "게시 취소"); })
        .then(function () { pubBtn.disabled = false; pubBtn.textContent = orig; });
    });
  }
})();
