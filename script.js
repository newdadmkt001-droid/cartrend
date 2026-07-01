/* ============================================================
   cartrend — interactions & content rendering
   ============================================================ */
(function () {
  "use strict";

  /* Car illustrations(carSVG/BODIES) & CARS data are defined in data.js (shared with detail page). */

  // 브랜드 목록은 차량 데이터에서 자동 생성 (관리자 추가 브랜드도 노출)
  var BRANDS = ["전체"].concat(CARS.map(function (c) { return c.brand; })
    .filter(function (b, i, a) { return a.indexOf(b) === i; }));
  // 빠른 필터 칩 — 아마존카 상단 칩 구성 참고
  var CHIPS = [
    { label: "전체", test: null },
    { label: "전기차", test: function (c) { return c.fuel === "전기"; } },
    { label: "하이브리드차", test: function (c) { return c.fuel === "하이브리드"; } },
    { label: "테슬라", test: function (c) { return c.brand === "테슬라"; } },
    { label: "SUV", test: function (c) { return c.seg === "SUV"; } },
    { label: "카니발", test: function (c) { return c.name.indexOf("카니발") !== -1; } },
    { label: "수입차", test: function (c) { return c.brand === "수입" || c.brand === "테슬라"; } }
  ];

  var RECOMMEND = [
    { label: "패밀리 SUV", body: "suv", color: "#F57C00", name: "더 뉴 쏘렌토 MQ4 HEV", desc: "온 가족이 넉넉한 하이브리드 SUV", price: 444510 },
    { label: "패밀리카", body: "van", color: "#FFB74D", name: "더 뉴 카니발 KA4 HEV", desc: "짐도 사람도 여유로운 9인승", price: 479820 },
    { label: "전기차 추천", body: "suv", color: "#FFB74D", name: "테슬라 모델Y RWD", desc: "충전비 절감, 미래형 드라이빙", price: 689000 },
    { label: "사회초년생", body: "compact", color: "#F57C00", name: "캐스퍼 일렉트릭", desc: "초기비용 0원으로 시작하는 첫 차", price: 339000 },
    { label: "출퇴근 추천", body: "sedan", color: "#FFB74D", name: "아반떼 CN7 가솔린", desc: "유지비 걱정 없는 베스트셀러", price: 312400 },
    { label: "법인·비즈니스", body: "sedan", color: "#F57C00", name: "더 뉴 그랜저 GN7 HEV", desc: "비용처리에 유리한 법인 추천", price: 566280 }
  ];

  var REVIEWS = [
    { name: "김민준", meta: "쏘렌토 · 48개월", stars: 5, text: "목돈 없이 새 SUV를 타게 됐어요. 초기비용 0원으로 시작했는데 매달 나가는 금액도 생각보다 합리적이라 만족합니다." },
    { name: "이서연", meta: "그랜저 · 60개월", stars: 5, text: "보험·정비·자동차세까지 다 포함이라 신경 쓸 게 없어요. 견적이 투명해서 숨은 비용 걱정도 없었습니다." },
    { name: "박도윤", meta: "카니발 · 48개월", stars: 5, text: "법인으로 9인승 장기렌트 진행했는데 비용처리도 편하고 상담이 정말 꼼꼼했어요. 출고도 빨랐습니다." },
    { name: "최지우", meta: "아반떼 · 36개월", stars: 4, text: "사회초년생이라 차 살 목돈이 부담이었는데 월 렌트료로 새 차를 타니 좋네요. 비대면 계약도 간편했어요." },
    { name: "정하준", meta: "벤츠 E-Class · 48개월", stars: 5, text: "수입차도 장기렌트가 이렇게 합리적인 줄 몰랐어요. 만기 때 인수도 가능하다고 해서 더 마음이 놓입니다." },
    { name: "한소율", meta: "캐스퍼 · 36개월", stars: 5, text: "원하는 색상으로 신차 출고받아 집까지 무료 탁송해 주셨어요. 처음부터 끝까지 친절해서 추천합니다." }
  ];

  var FAQ = [
    { q: "신차장기렌트가 뭔가요?", a: "차량을 구매하지 않고, 원하는 신차를 일정 기간(보통 12~72개월) 동안 월 렌트료를 내며 이용하는 서비스입니다. 보험·정비·자동차세가 월 렌트료에 포함되어 한 번에 관리할 수 있습니다." },
    { q: "초기비용이 정말 0원인가요?", a: "네. 차량 구매 시 발생하는 취득세·등록비·공채 등 초기 목돈 없이 시작할 수 있습니다. 선납금(보증금)을 0%로 설정하면 출고 시 부담이 거의 없으며, 선납 비율을 높이면 월 렌트료가 낮아집니다." },
    { q: "계약 만기 후에는 어떻게 되나요?", a: "만기 시 ① 잔존가치로 차량을 인수, ② 차량을 반납, ③ 새 차량으로 재계약 중 원하는 방식을 자유롭게 선택하실 수 있습니다." },
    { q: "보험과 자동차세는 누가 부담하나요?", a: "자동차종합보험·정비·자동차세 모두 월 렌트료에 포함되어 회사가 처리합니다. 별도로 신경 쓰실 필요가 없으며, 보험료 할증 부담도 없습니다." },
    { q: "신용조회나 자격 조건이 있나요?", a: "만 21세 이상·운전경력 1년 이상이면 신청 가능하며, 계약 시 간단한 심사가 진행됩니다. 개인·개인사업자·법인 모두 이용할 수 있고 법인은 비용처리에 유리합니다." },
    { q: "약정 주행거리를 초과하면 어떻게 되나요?", a: "계약 시 연 1만~3만km 또는 무제한 중 선택하며, 약정 거리를 초과하면 만기 시 km당 정산이 발생합니다. 주행거리가 많다면 무제한 옵션을 추천드립니다." }
  ];

  /* ---------- Helpers ---------- */
  var won = function (n) { return n.toLocaleString("ko-KR"); };
  var $ = function (s, el) { return (el || document).querySelector(s); };

  /* ---------- [1] Main promotion slider (peek carousel) ---------- */
  var SLIDES = [
    { kicker: "테슬라 전기 SUV 특가", title: "모델Y 충전비 절감 월 렌트", body: "suv", color: "#FFB74D", grad: "linear-gradient(135deg,#11151F,#2A3650)", img: "main/main1.jpg" },
    { kicker: "기아 패밀리 패키지", title: "카니발 9인승 초기비용 0원", body: "van", color: "#FFE0BF", grad: "linear-gradient(135deg,#E65100,#F57C00)", img: "main/main2.jpg" },
    { kicker: "수입 프리미엄 전기차", title: "BMW i4 M60 합리적인 월 렌트", body: "sport", color: "#BFF0D6", grad: "linear-gradient(135deg,#0E2A22,#14503A)", img: "main/main3.jpg" }
  ];

  var heroTrack = $("#heroTrack");
  if (heroTrack) {
    heroTrack.innerHTML = SLIDES.map(function (s) {
      return (
        '<a class="pslide" href="#cars" style="background:' + s.grad + '">' +
          '<img class="pslide__bg" src="' + s.img + '" alt="">' +
          '<div class="pslide__shade"></div>' +
          '<div class="pslide__top"><div class="pslide__kicker">' + s.kicker + "</div>" +
            '<div class="pslide__title">' + s.title + "</div></div>" +
          '<div class="pslide__foot"><span>상세 견적 보기</span><span>›</span></div>' +
        "</a>"
      );
    }).join("");

    // 이미지가 아직 없는 슬라이드는 그라데이션 배경으로 자동 대체
    heroTrack.querySelectorAll(".pslide__bg").forEach(function (img) {
      img.addEventListener("error", function () { img.style.display = "none"; });
    });

    var pslides = heroTrack.querySelectorAll(".pslide");
    var total = pslides.length;
    var cur = 0;
    $("#heroTotal").textContent = total;
    var curEl = $("#heroCur");
    var GAP = 14;

    // PC 전폭 배너용 — 점 인디케이터 생성
    var dotsWrap = $("#heroDots");
    if (dotsWrap) {
      dotsWrap.innerHTML = Array.prototype.map.call(pslides, function (_, i) {
        return '<button class="promo__dot" data-i="' + i + '" aria-label="' + (i + 1) + '번 슬라이드"></button>';
      }).join("");
    }

    // center the active card exactly, measured in pixels
    function center() {
      var vw = heroTrack.parentElement.clientWidth;   // .promo__viewport width
      var cw = pslides[0].offsetWidth;                 // layout width (ignores scale)
      var off = (vw - cw) / 2;
      heroTrack.style.transform = "translateX(" + (off - cur * (cw + GAP)) + "px)";
    }
    function go(n) {
      cur = (n + total) % total;
      pslides.forEach(function (s, i) { s.classList.toggle("is-active", i === cur); });
      curEl.textContent = cur + 1;
      if (dotsWrap) {
        var dots = dotsWrap.children;
        for (var di = 0; di < dots.length; di++) dots[di].classList.toggle("is-on", di === cur);
      }
      center();
    }
    go(0);
    window.addEventListener("resize", center, { passive: true });
    $("#heroNext").addEventListener("click", function () { go(cur + 1); resetAuto(); });
    $("#heroPrev").addEventListener("click", function () { go(cur - 1); resetAuto(); });

    // PC 전폭 배너 — 오버레이 화살표 + 점 클릭
    var overNext = $("#heroNextOver"), overPrev = $("#heroPrevOver");
    if (overNext) overNext.addEventListener("click", function () { go(cur + 1); resetAuto(); });
    if (overPrev) overPrev.addEventListener("click", function () { go(cur - 1); resetAuto(); });
    if (dotsWrap) dotsWrap.addEventListener("click", function (e) {
      var d = e.target.closest(".promo__dot");
      if (!d) return;
      go(parseInt(d.getAttribute("data-i"), 10)); resetAuto();
    });

    var timer = null;
    function startAuto() { timer = setInterval(function () { go(cur + 1); }, 5500); }
    function resetAuto() { if (timer) clearInterval(timer); startAuto(); }
    var promoEl = heroTrack.closest(".promo");
    promoEl.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
    promoEl.addEventListener("mouseleave", startAuto);
    startAuto();

    // 터치 스와이프
    var x0 = null;
    heroTrack.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    heroTrack.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { go(dx < 0 ? cur + 1 : cur - 1); resetAuto(); }
      x0 = null;
    });

    // 마우스로 끌어서 넘기기 (PC)
    var px = null, pmoved = false;
    heroTrack.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse") return;
      px = e.clientX; pmoved = false; heroTrack.classList.add("is-grabbing");
    });
    heroTrack.addEventListener("pointermove", function (e) {
      if (px === null) return;
      if (Math.abs(e.clientX - px) > 4) pmoved = true;
    });
    function pend(e) {
      if (px === null) return;
      var dx = e.clientX - px;
      if (Math.abs(dx) > 45) { go(dx < 0 ? cur + 1 : cur - 1); resetAuto(); }
      px = null; heroTrack.classList.remove("is-grabbing");
    }
    heroTrack.addEventListener("pointerup", pend);
    heroTrack.addEventListener("pointerleave", pend);
    // 드래그한 경우 카드 링크 이동 방지
    heroTrack.addEventListener("click", function (e) {
      if (pmoved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------- [3] 제조사 별 차량 (brand row + list) ---------- */
  var bestTabs = $("#bestTabs");
  var bestCards = $("#bestCards");

  // 찜(하트) 토글 — 카드는 <a>라 기본 이동을 막고 상태만 전환
  if (bestCards) {
    bestCards.addEventListener("click", function (e) {
      var like = e.target.closest(".lrow__like");
      if (!like) return;
      e.preventDefault();
      e.stopPropagation();
      like.classList.toggle("is-liked");
    });
  }
  var BADGE = { hot: '<span class="card__badge card__badge--hot">🔥 인기</span>', "new": '<span class="card__badge card__badge--new">NEW</span>', rec: '<span class="card__badge card__badge--rec">추천</span>' };
  // 브랜드별 로고 마크 (currentColor 사용 → 활성 시 오렌지)
  var LOGO = {
    "전체": '<b class="brand__txt">ALL</b>',
    "현대": '<svg viewBox="0 0 52 30"><ellipse cx="26" cy="15" rx="24" ry="12.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M18 8 C13 11 13 19 20 22 M34 8 C39 11 39 19 32 22 M19 15 H33" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>',
    "기아": '<svg viewBox="0 0 64 24"><text x="32" y="18.5" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-style="italic" font-size="20" letter-spacing="1" fill="currentColor">KIA</text></svg>',
    "제네시스": '<svg viewBox="0 0 64 28"><g stroke="currentColor" stroke-width="2.1" stroke-linecap="round" fill="none"><path d="M29 8 L7 11 M30 14 L4 16 M29 20 L9 22"/><path d="M35 8 L57 11 M34 14 L60 16 M35 20 L55 22"/></g><path d="M32 5 l4.5 8 -4.5 9 -4.5 -9 z" fill="currentColor"/></svg>',
    "쉐보레": '<svg viewBox="0 0 64 26"><path d="M4 9 H25 L31 3 H40 V9 H60 V17 H40 V23 H31 L25 17 H4 Z" fill="currentColor"/></svg>',
    "KGM": '<svg viewBox="0 0 72 24"><text x="36" y="18" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="17" letter-spacing="1" fill="currentColor">KGM</text></svg>',
    "르노코리아": '<svg viewBox="0 0 34 42"><path d="M17 2 L31 21 L17 40 L3 21 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M17 11 L24 21 L17 31 L10 21 Z" fill="none" stroke="currentColor" stroke-width="3"/></svg>',
    "테슬라": '<svg viewBox="0 0 40 34"><path d="M20 5 C12 5 5.5 7 5.5 7 L7.5 13 C7.5 13 12 11 16 11 L16 31 H24 V11 C28 11 32.5 13 32.5 13 L34.5 7 C34.5 7 28 5 20 5 Z" fill="currentColor"/></svg>',
    "수입": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9.4"/><path d="M2.6 12h18.8M12 2.6c4.2 4 4.2 14.8 0 18.8M12 2.6c-4.2 4-4.2 14.8 0 18.8" stroke-width="1.5"/></svg>'
  };

  var state = { brand: "전체", chip: 0, kw: "", shown: 6, sort: "recommend" };
  var STEP = 6;
  var lastListCount = 0;   // 현재 필터 결과 총 대수 (무한 스크롤 판단용)

  function sortList(list) {
    var has = function (c, b) { return (c.badges || []).indexOf(b) !== -1; };
    if (state.sort === "latest") return list.slice().sort(function (a, b) { return CARS.indexOf(b) - CARS.indexOf(a); });
    if (state.sort === "priceAsc") return list.slice().sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "priceDesc") return list.slice().sort(function (a, b) { return b.price - a.price; });
    if (state.sort === "popular") return list.slice().sort(function (a, b) {
      return (has(b, "hot") ? 2 : 0) + (has(b, "new") ? 1 : 0) - ((has(a, "hot") ? 2 : 0) + (has(a, "new") ? 1 : 0));
    });
    return list; // recommend = 기본 순서
  }

  // "더 뉴 쏘렌토 MQ4 하이브리드" → "더 뉴 쏘렌토<br>MQ4 하이브리드"
  function splitName(name) {
    var t = name.split(" ");
    var idx = -1;
    for (var i = 1; i < t.length; i++) { if (/\d/.test(t[i])) { idx = i; break; } }
    if (idx <= 0) return name;
    return t.slice(0, idx).join(" ") + "<br>" + t.slice(idx).join(" ");
  }

  function lrowHTML(c) {
    var badges = c.badges.map(function (b) { return BADGE[b]; }).join("");
    // 메인 카드 제목 = 차량명 + 연료
    var fullName = c.name + (c.fuel ? " " + c.fuel : "");
    return (
      '<a class="lrow" href="car.html?id=' + CARS.indexOf(c) + '">' +
        '<div class="lrow__thumb">' + photoCell(c) + "</div>" +
        '<div class="lrow__info">' +
          '<span class="lrow__brand">' + c.brand + "</span>" +
          '<span class="lrow__name">' + splitName(fullName) + "</span>" +
          '<span class="lrow__meta">' + c.term + "개월 · " + c.km + " · " + c.fuel + "</span>" +
          '<span class="lrow__price">월 ' + won(c.price) + "원</span>" +
        "</div>" +
        '<div class="lrow__side">' + badges + "</div>" +
        '<span class="lrow__like" role="button" aria-label="찜하기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20.3l-1.45-1.32C5.4 14.36 2 11.28 2 7.5 2 4.42 4.42 2 7.5 2c1.74 0 3.41.81 4.5 2.09C13.09 2.81 14.76 2 16.5 2 19.58 2 22 4.42 22 7.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg></span>' +
      "</a>"
    );
  }

  function renderBest() {
    var chip = CHIPS[state.chip];
    var kw = state.kw.replace(/\s/g, "");
    var list = CARS.filter(function (c) {
      if (c.draft) return false;                     // 임시저장 차량은 메인 미노출
      if (c.status === "판매중지") return false;     // 판매중지 차량만 숨김 (판매중이면 노출)
      var okBrand = state.brand === "전체" || c.brand === state.brand;
      var okChip = !chip.test || chip.test(c);
      var hay = (c.name + c.brand).replace(/\s/g, "");
      var okKw = !kw || hay.indexOf(kw) !== -1;
      return okBrand && okChip && okKw;
    });
    list = sortList(list);
    lastListCount = list.length;
    var countEl = $("#carsCount");
    if (countEl) countEl.textContent = "총 " + list.length + "대";
    var visible = list.slice(0, state.shown);
    bestCards.innerHTML = visible.length
      ? visible.map(lrowHTML).join("")
      : '<p style="text-align:center;color:var(--gray-400);padding:48px 0">조건에 맞는 차량이 없습니다. 다른 제조사나 검색어를 시도해 보세요.</p>';
    var moreWrap = $("#moreWrap");
    if (moreWrap) moreWrap.style.display = list.length > state.shown ? "flex" : "none";
  }

  function setBrandActive() {
    if (!bestTabs) return;
    bestTabs.querySelectorAll(".brand").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-brand") === state.brand);
    });
  }

  if (bestTabs) {
    // 브랜드별 노출 대수 (메인 미노출 차량 제외) — PC 사이드바에 표시
    function brandCount(b) {
      return CARS.filter(function (c) {
        if (c.draft || c.status === "판매중지") return false;
        return b === "전체" || c.brand === b;
      }).length;
    }
    bestTabs.innerHTML = BRANDS.map(function (b) {
      var mark = b === "전체"
        ? LOGO["전체"]
        : '<img class="brand__img" src="logo/' + encodeURIComponent(b) + '.png" alt="' + b + '">';
      return (
        '<button class="brand' + (b === "전체" ? " is-active" : "") + '" data-brand="' + b + '">' +
          '<span class="brand__logo">' + mark + "</span>" +
          '<span class="brand__name">' + b + "</span>" +
          '<span class="brand__cnt">' + brandCount(b) + "</span>" +
        "</button>"
      );
    }).join("");
    // 이미지가 아직 없는 브랜드는 기본 마크(인라인 SVG)로 자동 대체
    bestTabs.querySelectorAll(".brand__img").forEach(function (img) {
      img.addEventListener("error", function () {
        var b = img.getAttribute("alt");
        img.parentElement.innerHTML = LOGO[b] || b;
      });
    });
    bestTabs.addEventListener("click", function (e) {
      var btn = e.target.closest(".brand");
      if (!btn) return;
      state.brand = btn.getAttribute("data-brand");
      state.kw = ""; state.shown = STEP;
      setBrandActive();
      renderBest();
    });

    // 마우스로 끌어서 가로 스크롤 (PC) — 터치 스와이프는 기본 동작
    (function () {
      var down = false, sx = 0, sl = 0, moved = false;
      bestTabs.addEventListener("pointerdown", function (e) {
        down = true; moved = false; sx = e.clientX; sl = bestTabs.scrollLeft;
        bestTabs.classList.add("is-grabbing");
      });
      bestTabs.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 4) moved = true;
        bestTabs.scrollLeft = sl - dx;
      });
      function end() { down = false; bestTabs.classList.remove("is-grabbing"); }
      bestTabs.addEventListener("pointerup", end);
      bestTabs.addEventListener("pointerleave", end);
      // 드래그한 경우 브랜드 선택 클릭 방지
      bestTabs.addEventListener("click", function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); }
      }, true);
    })();

    renderBest();
  }

  /* 전체보기 */
  var brandAll = $("#brandAll");
  if (brandAll) brandAll.addEventListener("click", function () {
    state.brand = "전체"; state.chip = 0; state.kw = ""; state.shown = STEP;
    setBrandActive(); renderBest();
  });

  /* 정렬 선택 */
  var sortSel = $("#sortSel");
  if (sortSel) sortSel.addEventListener("change", function () {
    state.sort = sortSel.value; state.shown = STEP; renderBest();
  });

  /* 보기 방식 토글 (2열 / 3열 / 리스트) — CSS만 전환, 재렌더 불필요 */
  var viewToggle = $("#viewToggle");
  var carsMain = document.querySelector(".carsmain");
  if (viewToggle && carsMain) viewToggle.addEventListener("click", function (e) {
    var btn = e.target.closest(".viewtoggle__btn");
    if (!btn) return;
    carsMain.setAttribute("data-view", btn.getAttribute("data-view"));
    viewToggle.querySelectorAll(".viewtoggle__btn").forEach(function (b) {
      b.classList.toggle("is-on", b === btn);
    });
  });

  /* 견적문의 폼 (PC 히어로) — 백엔드 미연동, 접수 확인만 */
  var quoteForm = document.getElementById("quoteForm");
  if (quoteForm) quoteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.");
    quoteForm.reset();
  });

  /* 차량 더 보기 */
  var moreBtn = $("#moreBtn");
  if (moreBtn) moreBtn.addEventListener("click", function () {
    state.shown += STEP;
    renderBest();
  });

  /* ---------- Quick menu tiles → filter + scroll ---------- */
  function scrollToCars() {
    var el = $("#cars");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
  var quickMenu = $("#quickMenu");
  if (quickMenu) {
    quickMenu.addEventListener("click", function (e) {
      var tile = e.target.closest(".qtile");
      if (!tile) return;
      var label = tile.getAttribute("data-chip") || "";
      var idx = 0;
      CHIPS.forEach(function (c, i) { if (c.label === label) idx = i; });
      state.chip = idx; state.brand = "전체"; state.kw = "";
      setBrandActive(); renderBest(); scrollToCars();
    });
  }

  /* ---------- Top search bar ---------- */
  var searchBar = $("#searchBar");
  if (searchBar) {
    searchBar.addEventListener("submit", function (e) {
      e.preventDefault();
      state.kw = ($("#searchInput").value || "").trim();
      state.brand = "전체"; state.chip = 0; state.shown = STEP;
      setBrandActive(); renderBest(); scrollToCars();
    });
  }

  /* ---------- Render: recommend slider ---------- */
  var slider = $("#recSlider");
  if (slider) {
    slider.innerHTML = RECOMMEND.map(function (r) {
      return (
        '<article class="rec-card">' +
          '<div class="rec-card__media"><div class="rec-card__label">' + r.label + "</div>" + carSVG(r.body, r.color, 110) + "</div>" +
          '<div class="rec-card__body">' +
            "<h3>" + r.name + "</h3><p>" + r.desc + "</p>" +
            '<div class="rec-card__price"><small>월</small> ' + won(r.price) + "원~</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    var step = 320;
    $("#slideNext").addEventListener("click", function () { slider.scrollBy({ left: step, behavior: "smooth" }); });
    $("#slidePrev").addEventListener("click", function () { slider.scrollBy({ left: -step, behavior: "smooth" }); });
  }

  /* ---------- Render: reviews ---------- */
  var reviewsEl = $("#reviews");
  if (reviewsEl) {
    reviewsEl.innerHTML = REVIEWS.map(function (r) {
      var stars = "★★★★★".slice(0, r.stars) + "☆☆☆☆☆".slice(0, 5 - r.stars);
      return (
        '<article class="review reveal">' +
          '<div class="review__stars">' + stars + "</div>" +
          '<p class="review__text">“' + r.text + '”</p>' +
          '<div class="review__user">' +
            '<div class="review__avatar">' + r.name.charAt(0) + "</div>" +
            '<div class="review__meta"><b>' + r.name + "</b><span>" + r.meta + "</span></div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  /* ---------- Render: FAQ accordion ---------- */
  var faqList = $("#faqList");
  if (faqList) {
    faqList.innerHTML = FAQ.map(function (f) {
      return (
        '<div class="faq__item">' +
          '<button class="faq__q">' + f.q + '<span class="faq__icon"></span></button>' +
          '<div class="faq__a"><p>' + f.a + "</p></div>" +
        "</div>"
      );
    }).join("");
    faqList.addEventListener("click", function (e) {
      var q = e.target.closest(".faq__q");
      if (!q) return;
      var item = q.parentElement;
      var ans = item.querySelector(".faq__a");
      var open = item.classList.contains("is-open");
      faqList.querySelectorAll(".faq__item").forEach(function (it) {
        it.classList.remove("is-open");
        it.querySelector(".faq__a").style.maxHeight = null;
      });
      if (!open) {
        item.classList.add("is-open");
        ans.style.maxHeight = ans.scrollHeight + "px";
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var io = "IntersectionObserver" in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var d = en.target.getAttribute("data-delay");
            if (d) en.target.style.transitionDelay = d + "ms";
            en.target.classList.add("is-in");
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;

  function observeReveals(scope) {
    var els = (scope || document).querySelectorAll(".reveal:not(.is-in)");
    if (!io) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    els.forEach(function (el) { io.observe(el); });
  }
  observeReveals();

  /* ---------- Header scroll state + TOP 버튼 + 무한 스크롤 ---------- */
  var header = $("#header");
  var fab = $("#fab");
  var goTop = $("#goTop");

  // TOP 버튼 → 맨 위로
  if (goTop) goTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 8);
    if (fab) fab.classList.toggle("is-visible", y > 560);
    if (goTop) goTop.classList.toggle("is-visible", y > 560);

    // PC 무한 스크롤: 목록 하단 근처면 6대씩 추가 로드 (더보기 버튼 대체)
    if (window.innerWidth >= 1025 && bestCards && state.shown < lastListCount) {
      var rect = bestCards.getBoundingClientRect();
      if (rect.bottom < window.innerHeight + 600) {
        state.shown += STEP;
        renderBest();
      }
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = $("#navToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $("#nav").addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        header.classList.remove("is-open");
        toggle.classList.remove("is-open");
      }
    });
  }

  /* Supabase 최신 카탈로그 자동 반영 — 관리자가 등록/수정하면 손님 메인에 자동 노출 */
  if (window.CARTREND_DB) {
    window.CARTREND_DB.fetchCatalog().then(function (remote) {
      if (remote && remote.length) {
        CARS.length = 0; [].push.apply(CARS, remote);
        renderBest();
      }
    });
  }

})();
