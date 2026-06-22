/* ============================================================
   cartrend — shared data & car illustration (index + detail)
   ============================================================ */

/* ---------- Car SVG illustrations (clean flat) ---------- */
function wheels(x1, x2, cy, r) {
  return [x1, x2].map(function (cx) {
    return (
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#1A2332"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r * 0.56 + '" fill="#E6E9EE"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r * 0.18 + '" fill="#9AA3B0"/>'
    );
  }).join("");
}
function glass(d) { return '<path d="' + d + '" fill="#C9DCEC"/>'; }
function shine() {
  return '<ellipse cx="150" cy="138" rx="150" ry="9" fill="#1A2332" opacity=".06"/>';
}
var BODIES = {
  compact: function (c) {
    return shine() +
      '<path d="M28 104 C28 86 40 82 52 80 L86 52 C96 44 110 41 128 41 L182 42 C208 44 224 54 234 78 L268 86 C282 90 282 104 280 106 L280 110 L28 110 Z" fill="' + c + '"/>' +
      glass("M94 54 C102 47 114 44 130 44 L150 44 L150 76 L86 76 Z") +
      glass("M158 44 L180 45 C200 47 214 56 222 76 L158 76 Z") +
      wheels(82, 226, 110, 22);
  },
  sedan: function (c) {
    return shine() +
      '<path d="M20 102 C20 84 34 80 48 78 L98 52 C110 44 126 41 150 41 L208 42 C242 44 262 54 276 78 L292 86 C298 89 298 100 296 104 L296 108 L20 108 Z" fill="' + c + '"/>' +
      glass("M104 54 C114 46 128 44 148 44 L166 44 L166 74 L96 74 Z") +
      glass("M174 44 L204 45 C232 47 250 58 260 74 L174 74 Z") +
      wheels(76, 244, 108, 23);
  },
  suv: function (c) {
    return shine() +
      '<path d="M22 100 C22 80 32 74 46 72 L70 40 C80 30 96 26 116 26 L214 27 C246 28 264 40 274 70 L290 80 C296 84 296 98 294 102 L294 108 L22 108 Z" fill="' + c + '"/>' +
      glass("M78 44 C86 36 100 32 118 32 L156 32 L156 70 L70 70 Z") +
      glass("M164 32 L210 33 C238 34 254 48 262 70 L164 70 Z") +
      wheels(78, 240, 108, 25);
  },
  van: function (c) {
    return shine() +
      '<path d="M22 100 C22 70 30 40 56 32 C72 27 96 25 150 25 L236 27 C266 28 282 44 286 74 L292 82 C297 86 296 100 294 104 L294 108 L22 108 Z" fill="' + c + '"/>' +
      glass("M44 44 C50 36 60 33 78 33 L150 33 L150 72 L40 72 Z") +
      glass("M158 33 L228 34 C254 36 268 50 274 72 L158 72 Z") +
      wheels(74, 246, 108, 24);
  },
  sport: function (c) {
    return shine() +
      '<path d="M16 102 C16 90 30 84 46 82 L104 60 C120 50 138 46 166 47 L220 49 C254 52 274 62 288 84 L294 90 C299 93 298 102 296 105 L296 108 L16 108 Z" fill="' + c + '"/>' +
      glass("M114 62 C124 54 140 51 162 52 L188 53 L196 80 L106 80 Z") +
      glass("M204 53 L222 54 C248 57 264 68 272 80 L210 80 Z") +
      wheels(74, 246, 108, 23);
  }
};
function carSVG(type, color, h) {
  return (
    '<svg viewBox="0 0 300 150" role="img" aria-label="차량 이미지" style="height:' + (h || 120) + 'px">' +
    (BODIES[type] || BODIES.sedan)(color) +
    "</svg>"
  );
}

/* ---------- Data ---------- */
// 신차 장기렌트 · price = 월 렌트료(원) 기준값 (계약기간/옵션에 따라 변동)
// CARS_DEFAULT = 기본 카탈로그. 실제 사용 배열 CARS 는 파일 하단에서 localStorage 와 병합해 생성.
var CARS_DEFAULT = [
  { brand: "현대", seg: "SUV",  body: "suv",     fuel: "하이브리드", color: "#1A2332", name: "디 올 뉴 팰리세이드 LX3 하이브리드", term: 72, km: "10,000km", price: 553080, badges: ["hot"] },
  { brand: "현대", seg: "대형", body: "sedan",   fuel: "하이브리드", color: "#11151F", name: "더 뉴 그랜저 GN7 하이브리드", term: 72, km: "10,000km", price: 566280, badges: ["hot","new"] },
  { brand: "현대", seg: "SUV",  body: "suv",     fuel: "하이브리드", color: "#37425C", name: "디 올 뉴 싼타페 MX5 하이브리드", term: 72, km: "10,000km", price: 498700, badges: [] },
  { brand: "현대", seg: "준중형", body: "sedan", fuel: "가솔린",     color: "#2A3650", name: "아반떼 CN7 가솔린", term: 60, km: "10,000km", price: 312400, badges: [] },
  { brand: "현대", seg: "전기", body: "compact", fuel: "전기",       color: "#F57C00", name: "캐스퍼 일렉트릭", term: 60, km: "10,000km", price: 339000, badges: ["new"] },

  { brand: "기아", seg: "승합", body: "van",      fuel: "하이브리드", color: "#5B6573", name: "더 뉴 카니발 KA4 하이브리드", term: 72, km: "10,000km", price: 479820, badges: ["hot"] },
  { brand: "기아", seg: "SUV",  body: "suv",      fuel: "하이브리드", color: "#1A2332", name: "더 뉴 쏘렌토 MQ4 하이브리드", term: 72, km: "10,000km", price: 444510, badges: ["hot"] },
  { brand: "기아", seg: "SUV",  body: "suv",      fuel: "하이브리드", color: "#E65100", name: "스포티지 NQ5 하이브리드", term: 72, km: "10,000km", price: 421000, badges: [] },
  { brand: "기아", seg: "중형", body: "sedan",    fuel: "가솔린",     color: "#3B2A1A", name: "더 뉴 K5 DL3 가솔린", term: 60, km: "10,000km", price: 358900, badges: [] },
  { brand: "기아", seg: "전기", body: "suv",      fuel: "전기",       color: "#11151F", name: "더 뉴 EV6 GT-Line", term: 72, km: "10,000km", price: 512000, badges: ["new"] },

  { brand: "제네시스", seg: "대형", body: "sedan", fuel: "가솔린", color: "#11151F", name: "G80 RG3 가솔린", term: 72, km: "10,000km", price: 812000, badges: ["hot"] },
  { brand: "제네시스", seg: "SUV",  body: "suv",   fuel: "가솔린", color: "#1A2332", name: "GV70 JK1 가솔린", term: 72, km: "10,000km", price: 798000, badges: [] },
  { brand: "제네시스", seg: "SUV",  body: "suv",   fuel: "가솔린", color: "#2A3650", name: "GV80 쿠페 JX1", term: 72, km: "10,000km", price: 1050000, badges: ["new"] },

  { brand: "쉐보레", seg: "SUV", body: "suv", fuel: "가솔린", color: "#37425C", name: "트랙스 크로스오버", term: 60, km: "10,000km", price: 298000, badges: [] },
  { brand: "쉐보레", seg: "SUV", body: "suv", fuel: "가솔린", color: "#5B6573", name: "트레일블레이저", term: 60, km: "10,000km", price: 359000, badges: [] },

  { brand: "KGM", seg: "SUV", body: "suv", fuel: "가솔린", color: "#1A2332", name: "토레스", term: 60, km: "10,000km", price: 389000, badges: [] },
  { brand: "KGM", seg: "SUV", body: "suv", fuel: "가솔린", color: "#F57C00", name: "액티언", term: 60, km: "10,000km", price: 419000, badges: ["new"] },

  { brand: "르노코리아", seg: "SUV", body: "suv", fuel: "하이브리드", color: "#2A3650", name: "그랑 콜레오스 하이브리드", term: 72, km: "10,000km", price: 469000, badges: ["new"] },

  { brand: "테슬라", seg: "전기", body: "sport", fuel: "전기", color: "#11151F", name: "모델3 RWD", term: 60, km: "10,000km", price: 612000, badges: ["hot"] },
  { brand: "테슬라", seg: "전기", body: "suv",   fuel: "전기", color: "#1A2332", name: "모델Y RWD", term: 60, km: "10,000km", price: 689000, badges: ["hot","new"] },

  { brand: "수입", seg: "대형", body: "sport", fuel: "가솔린", color: "#11151F", name: "벤츠 E250 아방가르드", term: 60, km: "10,000km", price: 1180000, badges: [] },

  { brand: "BMW", seg: "대형", body: "sport", fuel: "가솔린", color: "#1A2332", name: "BMW 520i M스포츠", term: 60, km: "10,000km", price: 1090000, badges: ["hot"] },
  { brand: "BMW", seg: "SUV", body: "suv", fuel: "가솔린", color: "#11151F", name: "BMW X3 xDrive20i", term: 60, km: "10,000km", price: 1150000, badges: [] },
  { brand: "볼보", seg: "SUV", body: "suv", fuel: "하이브리드", color: "#2A3650", name: "볼보 XC60 B5", term: 60, km: "10,000km", price: 990000, badges: [] },
  { brand: "아우디", seg: "대형", body: "sport", fuel: "가솔린", color: "#11151F", name: "아우디 A6 45 TFSI", term: 60, km: "10,000km", price: 1120000, badges: [] },
  { brand: "폭스바겐", seg: "SUV", body: "suv", fuel: "가솔린", color: "#1A2332", name: "폭스바겐 티구안 2.0 TDI", term: 60, km: "10,000km", price: 820000, badges: [] },
  { brand: "렉서스", seg: "대형", body: "sport", fuel: "하이브리드", color: "#11151F", name: "렉서스 ES300h", term: 60, km: "10,000km", price: 990000, badges: ["hot"] },
  { brand: "도요타", seg: "중형", body: "sedan", fuel: "하이브리드", color: "#2A3650", name: "도요타 캠리 하이브리드", term: 60, km: "10,000km", price: 720000, badges: [] },
  { brand: "BYD", seg: "전기", body: "suv", fuel: "전기", color: "#1A2332", name: "BYD ATTO 3", term: 60, km: "10,000km", price: 590000, badges: ["new"] }
];

/* 계약기간(개월)별 월 렌트료 배수 — 기준: 72개월 = 1.0 */
var TERM_OPTIONS = [
  { months: 36, factor: 1.181 },
  { months: 48, factor: 1.091 },
  { months: 60, factor: 1.039 },
  { months: 72, factor: 1.0, best: true },
  { months: 82, factor: 0.974 }
];

/* 트림 — 차량가/월렌트료 배수 (기준 트림 = 1.0) */
var TRIMS = [
  { name: "스탠다드", factor: 1.0 },
  { name: "프리미엄", factor: 1.09 },
  { name: "시그니처", factor: 1.18 }
];

/* 추가 옵션 — 월 추가금(원) */
var OPTIONS = [
  { name: "썬루프", price: 13000 },
  { name: "드라이브 와이즈", price: 8000 },
  { name: "2열 독립 시트", price: 7000 },
  { name: "후석 엔터테인먼트", price: 9000 }
];

/* ============================================================
   상세 페이지 데이터 (관리자 페이지에서 편집 → localStorage 저장)
   ============================================================ */
// 고객이 선택할 수 있는 표준 보증금/선납금 비율 (상세 페이지 바텀시트)
var DEPOSIT_OPTS = ["0%", "10%", "15%", "20%", "25%", "30%", "50%"];
var PREPAY_OPTS = ["0%", "5%", "10%", "15%", "20%", "25%", "30%"];
var MILEAGE_OPTS = ["10,000km", "15,000km", "20,000km", "25,000km", "30,000km", "35,000km", "40,000km"];
// 관리자 브랜드 필터에 항상 노출할 전체 브랜드
var BRANDS_ALL = ["현대", "기아", "제네시스", "쉐보레", "KGM", "르노코리아", "테슬라", "BMW", "볼보", "아우디", "폭스바겐", "렉서스", "도요타", "BYD", "수입"];
// 표준 계약조건 옵션 (상세 바텀시트에 전체 노출, 관리자는 기본값 1개 선택)
var AGE_OPTS = ["만 21세 이상", "만 26세 이상"];
var LIAB_OPTS = ["1억원", "2억원", "3억원", "5억원"];
var DED_OPTS = ["20만원", "30만원", "50만원"];
var REGION_OPTS = ["서울", "인천·경기", "강원", "대전·세종·충남·충북", "광주·전남·전북", "대구·경북", "부산·울산·경남", "제주"];

var MAINTENANCE_DEFAULT = [
  "교통사고 발생 시 사고처리 업무 대행",
  "사고대차서비스 (피해사고는 보험대차)",
  "차량 정비 관련 유선 상담서비스 상시 제공",
  "대여 개시 2개월 이내 무상 정비대차 제공 (24시간 이상 정비공장 입고시)",
  "대여 개시 2개월 이후 원가 수준의 유상 정비대차 제공 (단기 대여요금의 15~30% 수준, 탁송료 별도)"
];

function defaultSeats(car) {
  if (car.seg === "승합" || car.body === "van") return 9;
  return 5;
}

/* 차량별 상세 기본값 (관리자 미입력 시 사용) */
function carDetailDefaults(car) {
  var baseVehicle = Math.round(car.price * 85 / 10000) * 10000; // 차량가(원) 근사
  return {
    subModel: "",                                   // 세부모델명
    displacement: car.fuel === "전기" ? 0 : 1598,
    seats: defaultSeats(car),
    vehicleTypes: [],                               // 차량 유형(다중) → 트림 위 선택 버튼
    trims: [
      { name: "스탠다드", price: baseVehicle, seats: defaultSeats(car), features: [] },
      { name: "프리미엄", price: Math.round(baseVehicle * 1.09), seats: defaultSeats(car), features: [] },
      { name: "시그니처", price: Math.round(baseVehicle * 1.18), seats: defaultSeats(car), features: [] }
    ],
    maintenance: MAINTENANCE_DEFAULT.slice(),
    maintenanceFee: 0,                              // 정비 추가요금(월)
    buyOption: "있음",                              // 있음 / 없음
    mileage: "10,000km",                            // 연간 약정거리 (단일 선택, 기본값)
    deposit: "0%",                                   // 보증금 (관리자 단일 선택, 기본값)
    prepay: "0%",                                    // 선납금 (관리자 단일 선택, 기본값)
    driverAge: "만 26세 이상",                       // 운전자 연령 (기본값)
    liability: "1억원",                              // 대물배상 (기본값)
    deductible: "50만원",                            // 자차면책금 (기본값)
    accessories: "",                                // 차량용품
    region: "서울",                                  // 인도지역 (기본값)
    addOptions: [],                                  // 추가 옵션 [{name, price}]

    rentTable: TERM_OPTIONS.map(function (t) {       // 월 렌트료 테이블
      return { months: t.months, price: Math.round(car.price * t.factor / 10) * 10 };
    })
  };
}

/* ============================================================
   차량 카탈로그 저장소 (관리자에서 추가/수정/삭제 → localStorage)
   - CARS = 기본 카탈로그 + 관리자 변경분 (메인·상세 공통 사용)
   - 각 차량의 상세는 car.detail 에 내장 저장
   ============================================================ */
var CARS_KEY = "cartrend:cars";

function loadCars() {
  try {
    var raw = localStorage.getItem(CARS_KEY);
    if (raw !== null) {
      var a = JSON.parse(raw);
      if (Array.isArray(a)) return a; // 빈 배열([])도 그대로 유지 — 전체 삭제 반영
    }
  } catch (e) {}
  // 기본 카탈로그 복제
  return CARS_DEFAULT.map(function (c) {
    var o = {}; for (var k in c) o[k] = c[k];
    o.badges = (c.badges || []).slice();
    return o;
  });
}

var CARS = loadCars();

function saveCars() {
  try { localStorage.setItem(CARS_KEY, JSON.stringify(CARS)); return true; }
  catch (e) { return false; }
}
function resetCars() {
  try { localStorage.removeItem(CARS_KEY); } catch (e) {}
  CARS = loadCars();
}

/* 빈 차량(신규 등록용) */
function blankCar() {
  return {
    brand: "현대", seg: "SUV", body: "suv", fuel: "가솔린",
    color: "#1A2332", name: "새 차량", term: 72, km: "10,000km",
    price: 400000, badges: [],
    status: "판매중", popular: false, recommend: false
  };
}
function addCar(car) {
  CARS.push(car || blankCar());
  saveCars();
  return CARS.length - 1;
}
function deleteCar(id) {
  CARS.splice(id, 1);
  saveCars();
}

/* ---------- 개별소비세 감면액 자동 계산 ---------- */
// 개소세 30% 한시 인하(5%→3.5%) + 교육세 구조를 기반으로 하되,
// 아마존카 실제값(차량가 46,820,000 → 감면 710,000)에 맞도록 실효율 보정.
var TAX_REDUCTION_RATE = 0.015164;   // 차량가 대비 개소세 감면 실효율(보정값)
function calcTaxReduction(carPrice) {
  return Math.floor((carPrice || 0) * TAX_REDUCTION_RATE / 1000) * 1000;   // 천원 단위 내림
}
// 보증금 과세표준 = 차량가 - 개소세 감면 - 제조사 DC
function calcDepositBase(carPrice, makerDC) {
  return Math.max(0, (carPrice || 0) - calcTaxReduction(carPrice) - (makerDC || 0));
}

// 월 렌트료 계산은 lib/quote-engine.js(QuoteEngine) 로 일원화 — 옛 역산/보간 함수는 제거됨

/* 상세: 기본값 + car.detail 병합 */
function getCarDetail(id) { return carDetailOf(CARS[id]); }
function carDetailOf(car) {
  var d = carDetailDefaults(car);
  if (car && car.detail) {
    for (var k in car.detail) {
      if (Object.prototype.hasOwnProperty.call(car.detail, k) && car.detail[k] !== undefined && car.detail[k] !== null && car.detail[k] !== "") d[k] = car.detail[k];
    }
  }
  var def = carDetailDefaults(car);
  // 관리자가 만든 차량(detail.trims 존재)은 비어 있어도 기본 트림으로 채우지 않음(레거시·데모만 기본값)
  var adminTrims = car && car.detail && Array.isArray(car.detail.trims);
  var adminTypes = car && car.detail && Array.isArray(car.detail.vehicleTypes);
  if (!adminTrims && (!Array.isArray(d.trims) || !d.trims.length)) d.trims = def.trims;
  if (!Array.isArray(d.trims)) d.trims = [];
  if (!Array.isArray(d.rentTable) || !d.rentTable.length) d.rentTable = def.rentTable;
  ["vehicleTypes", "maintenance"].forEach(function (k) {
    if (!Array.isArray(d[k])) d[k] = [];
  });
  // 단일 값(문자열) 항목. 레거시(배열) 호환
  if (typeof d.deposit !== "string" || d.deposit === "") d.deposit = (Array.isArray(d.deposits) && d.deposits[0]) || "0%";
  if (typeof d.prepay !== "string" || d.prepay === "") d.prepay = (Array.isArray(d.prepays) && d.prepays[0]) || "0%";
  if (typeof d.mileage !== "string" || d.mileage === "") d.mileage = (Array.isArray(d.mileages) && d.mileages[0]) || "10,000km";
  if (typeof d.driverAge !== "string" || d.driverAge === "") d.driverAge = (Array.isArray(d.driverAges) && d.driverAges[0]) || "만 26세 이상";
  if (typeof d.liability !== "string" || d.liability === "") d.liability = (Array.isArray(d.liabilities) && d.liabilities[0]) || "1억원";
  if (typeof d.deductible !== "string" || d.deductible === "") d.deductible = (Array.isArray(d.deductibles) && d.deductibles[0]) || "50만원";
  if (typeof d.region !== "string" || d.region === "") d.region = (Array.isArray(d.regions) && d.regions[0]) || "서울";
  // 추가 옵션: 그룹(제목) + 항목 구조. 레거시(평면 {name,price} 배열)는 단일 그룹으로 변환
  var ao = Array.isArray(d.addOptions) ? d.addOptions : [];
  if (ao.length && ao[0] && ao[0].items === undefined) ao = [{ title: "추가 옵션", items: ao }];
  d.addOptions = ao.map(function (g) {
    return {
      title: (g && g.title) || "옵션",
      items: ((g && Array.isArray(g.items)) ? g.items : []).map(function (it) { var o = { name: it.name || "", price: it.price || 0 }; if (it.hidden) o.hidden = true; return o; }).filter(function (it) { return it.name; })
    };
  }).filter(function (g) { return g.items.length; });
  // 트림 정규화 {name, price, features}
  function normTrims(arr, fallback) {
    arr = (Array.isArray(arr) && arr.length) ? arr : fallback;
    return arr.map(function (t) {
      return {
        id: t.id || "",            // 트림 고유 id (견적 수집 키)
        amazoncarUrl: t.amazoncarUrl || "",
        name: t.name || "", price: t.price || 0,
        taxCut: t.taxCut || 0,     // 개별소비세 감면액
        makerDC: t.makerDC || 0,   // 제조사 DC(할인)
        seats: (t.seats != null && t.seats !== "") ? t.seats : d.seats,   // 트림별 승차정원
        features: Array.isArray(t.features) ? t.features : [],
        rentTable: Array.isArray(t.rentTable) ? t.rentTable : [],  // 트림별 월 렌트료(비우면 차량가 비례)
        amzPay: (t.amzPay && typeof t.amzPay === "object") ? t.amzPay : null,   // 입력한 기간별 월납입금
        fit: (t.fit && t.fit.base) ? t.fit : null,                 // 역산된 {base,slope,rate}
        addOptions: normAddOptions(t.addOptions, d.addOptions)     // 트림별 추가옵션
      };
    });
  }
  // 관리자 차량(detail.trims 존재)은 빈 배열을 기본 트림으로 채우지 않음
  d.trims = normTrims(d.trims, adminTrims ? [] : def.trims);
  // 추가옵션 그룹 정규화 (유형별). 레거시 차량공통 옵션(legacy)이 있으면 유형에 적용
  function normAddOptions(arr, legacy) {
    var a = Array.isArray(arr) ? arr : [];
    if (!a.length && legacy && legacy.length) a = legacy;
    return a.map(function (g) {
      return { title: (g && g.title) || "옵션", items: ((g && Array.isArray(g.items)) ? g.items : []).map(function (it) { var o = { name: it.name || "", price: it.price || 0 }; if (it.hidden) o.hidden = true; return o; }).filter(function (it) { return it.name; }) };
    }).filter(function (g) { return g.items.length; });
  }
  // 차량 유형: {name, trims, addOptions} 정규화 (레거시 호환)
  if (!d.vehicleTypes.length) {
    d.vehicleTypes = [{ name: "", displacement: d.displacement, seats: d.seats, trims: d.trims, addOptions: d.addOptions || [] }];
  } else {
    d.vehicleTypes = d.vehicleTypes.map(function (v) {
      if (typeof v === "string") return { name: v, displacement: d.displacement, seats: d.seats, trims: d.trims.slice(), addOptions: d.addOptions || [] };
      return {
        name: v.name || "",
        displacement: (v.displacement != null && v.displacement !== "") ? v.displacement : d.displacement,
        seats: (v.seats != null && v.seats !== "") ? v.seats : d.seats,
        adjRate: +v.adjRate || 0,   // 차량유형별 월렌트료 조정율 (예: 0.19 = +19%)
        trims: normTrims(v.trims, adminTrims ? [] : d.trims),
        addOptions: normAddOptions(v.addOptions, d.addOptions)
      };
    });
  }
  return d;
}
function saveCarDetail(id, obj) {
  if (!CARS[id]) return false;
  CARS[id].detail = obj;
  return saveCars();
}

/* 사진칸: car.photo 있으면 이미지, 없으면 "사진 준비중" */
function photoCell(car) {
  var b = (car && car.body) || "suv";
  return (car && car.photo)
    ? '<img class="ph-img ph-img--' + b + '" src="' + car.photo + '" alt="" />'
    : '<span class="ph-txt">사진 준비중</span>';
}

/* ============================================================
   공식자료 기반 시드 카탈로그 (현대/기아/제네시스/테슬라 공식 가격표 기준)
   - 기존 localStorage 차량(직접 세팅한 차량 포함)은 보존, 이름이 없는 차량만 1회 추가
   - 가격은 차량가(공시가)만 저장 → 월렌트료는 엔진(QuoteEngine)이 계산
   ============================================================ */
function _seedOpts(opts) {
  var it = (opts || []).filter(function (o) { return o && o.price != null && o.price > 0; })
    .map(function (o) { return { name: o.name, price: o.price }; });
  return it.length ? [{ title: "선택품목", items: it }] : [];
}
function _seedTrim(name, price, seats, opts) {
  return { name: name, price: price, makerDC: 0, seats: seats, features: [], addOptions: _seedOpts(opts) };
}
function _seedVT(name, disp, trims) {
  return { name: name, displacement: disp, trims: trims.filter(function (t) { return t.price != null; }) };
}
var SEED_CARS = [
  { brand: "기아", name: "더 뉴 쏘렌토 MQ4 하이브리드", fuel: "하이브리드", body: "suv", vehicleTypes: [
    _seedVT("1.6 터보 하이브리드 2WD", 1598, [
      _seedTrim("프레스티지", 40580000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }, { name: "드라이브 와이즈", price: 1290000 }, { name: "HUD+빌트인캠2", price: 1190000 }, { name: "파노라마 선루프", price: 1090000 }]),
      _seedTrim("노블레스", 43840000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }, { name: "드라이브 와이즈", price: 1290000 }, { name: "스마트 커넥트", price: 800000 }, { name: "파노라마 선루프", price: 1090000 }]),
      _seedTrim("시그니처", 46370000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }, { name: "컴포트 패키지", price: 1090000 }, { name: "파노라마 선루프", price: 1090000 }]),
      _seedTrim("X-Line", 47310000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }, { name: "파노라마 선루프", price: 1090000 }])
    ]),
    _seedVT("1.6 터보 하이브리드 4WD", 1598, [
      _seedTrim("프레스티지", 42900000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }]),
      _seedTrim("노블레스", 46160000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }]),
      _seedTrim("시그니처", 48690000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }]),
      _seedTrim("X-Line", 49630000, 5, [{ name: "6인승", price: 840000 }, { name: "7인승", price: 690000 }])
    ])
  ] },
  { brand: "현대", name: "팰리세이드 LX3 하이브리드", fuel: "하이브리드", body: "suv", accessories: "LED 도어 스팟 램프\nLED 테일게이트 램프\n러기지 스크린\n러기지 네트\n러기지 매트\n실내 V2L(하이브리드 전용)", vehicleTypes: [
    _seedVT("2.5 터보 하이브리드 9인승", 2497, [
      _seedTrim("익스클루시브", 49820000, 9, [{ name: "HTRAC·험로주행·경사로저속", price: 2280000 }, { name: "듀얼 와이드 선루프", price: 850000 }, { name: "현대 스마트센스", price: 1330000 }, { name: "컴포트", price: 1330000 }, { name: "컴포트 플러스(9인승)", price: 1850000 }, { name: "원격 스마트 주차보조", price: 660000 }, { name: "플래티넘", price: 1710000 }]),
      _seedTrim("프레스티지", 55360000, 9, [{ name: "HTRAC·험로주행·경사로저속", price: 2280000 }, { name: "듀얼 와이드 선루프", price: 850000 }, { name: "현대 스마트센스", price: 1330000 }, { name: "컴포트", price: 1330000 }, { name: "프리뷰 전자제어 서스펜션", price: 1230000 }]),
      _seedTrim("캘리그래피", 61860000, 9, [{ name: "HTRAC·험로주행·경사로저속", price: 2280000 }, { name: "듀얼 와이드 선루프", price: 850000 }, { name: "프리뷰 전자제어 서스펜션", price: 1230000 }])
    ]),
    _seedVT("2.5 터보 하이브리드 7인승", 2497, [
      _seedTrim("익스클루시브", 51460000, 7, [{ name: "HTRAC·험로주행·경사로저속", price: 2400000 }, { name: "듀얼 와이드 선루프", price: 900000 }, { name: "현대 스마트센스", price: 1400000 }, { name: "컴포트", price: 1400000 }, { name: "컴포트 플러스(7인승)", price: 2200000 }, { name: "원격 스마트 주차보조", price: 700000 }, { name: "플래티넘", price: 1800000 }]),
      _seedTrim("프레스티지", 57290000, 7, [{ name: "HTRAC·험로주행·경사로저속", price: 2400000 }, { name: "듀얼 와이드 선루프", price: 900000 }, { name: "현대 스마트센스", price: 1400000 }, { name: "컴포트", price: 1400000 }, { name: "프리뷰 전자제어 서스펜션", price: 1300000 }]),
      _seedTrim("캘리그래피", 64240000, 7, [{ name: "HTRAC·험로주행·경사로저속", price: 2400000 }, { name: "듀얼 와이드 선루프", price: 900000 }, { name: "프리뷰 전자제어 서스펜션", price: 1300000 }])
    ])
  ] },
  { brand: "현대", name: "더 뉴 그랜저 GN7 하이브리드", fuel: "하이브리드", body: "sedan", vehicleTypes: [
    _seedVT("1.6 터보 하이브리드", 1598, [
      _seedTrim("프리미엄", 40030000, 5, [{ name: "파노라마 선루프", price: 1100000 }, { name: "헤드업 디스플레이", price: 1000000 }, { name: "빌트인 캠(보조배터리 포함)", price: 650000 }, { name: "JBL 프리미엄 사운드 시스템", price: 700000 }, { name: "인테리어 디자인", price: 800000 }]),
      _seedTrim("익스클루시브", 44280000, 5, [{ name: "파노라마 선루프", price: 1100000 }, { name: "빌트인 캠(보조배터리 포함)", price: 650000 }]),
      _seedTrim("캘리그래피", 48380000, 5, [{ name: "파노라마 선루프", price: 1100000 }, { name: "빌트인 캠(보조배터리 포함)", price: 650000 }])
    ])
  ] },
  { brand: "테슬라", name: "테슬라 모델3", fuel: "전기", body: "sedan", vehicleTypes: [
    _seedVT("Model 3", 0, [
      _seedTrim("스탠다드 RWD", 41990000, 5, [{ name: "완전자율주행(FSD)", price: 9040000 }, { name: "유색 외장 페인트", price: 1500000 }, { name: "19인치 휠 업그레이드", price: 2000000 }]),
      _seedTrim("프리미엄 롱레인지 RWD", 52990000, 5, [{ name: "완전자율주행(FSD)", price: 9040000 }, { name: "유색 외장 페인트", price: 1500000 }, { name: "19인치 휠 업그레이드", price: 2000000 }]),
      _seedTrim("퍼포먼스 AWD", 59990000, 5, [{ name: "완전자율주행(FSD)", price: 9040000 }, { name: "유색 외장 페인트", price: 1500000 }])
    ])
  ] },
  { brand: "테슬라", name: "테슬라 모델Y", fuel: "전기", body: "suv", vehicleTypes: [
    _seedVT("Model Y", 0, [
      _seedTrim("프리미엄 RWD", 49990000, 5, [{ name: "FSD(완전자율주행)", price: 9043000 }, { name: "향상된 오토파일럿", price: 4522000 }, { name: "화이트 인테리어", price: 1500000 }]),
      _seedTrim("프리미엄 롱레인지 AWD", 59990000, 5, [{ name: "20인치 휠 업그레이드", price: 2571000 }, { name: "FSD(완전자율주행)", price: 9043000 }, { name: "향상된 오토파일럿", price: 4522000 }, { name: "화이트 인테리어", price: 1500000 }])
    ])
  ] },
  { brand: "기아", name: "EV3", fuel: "전기", body: "suv", vehicleTypes: [
    _seedVT("스탠다드", 0, [
      _seedTrim("에어", 42080000, 5, [{ name: "스타일", price: 940000 }, { name: "컴포트 I", price: 490000 }, { name: "컨비니언스", price: 1290000 }, { name: "드라이브 와이즈", price: 1090000 }, { name: "와이드 선루프", price: 640000 }, { name: "헤드업 디스플레이", price: 590000 }]),
      _seedTrim("어스", 46240000, 5, [{ name: "드라이브 와이즈", price: 1090000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 590000 }, { name: "헤드업 디스플레이", price: 590000 }]),
      _seedTrim("GT-Line", 47140000, 5, [{ name: "드라이브 와이즈", price: 1090000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 590000 }])
    ]),
    _seedVT("롱레인지", 0, [
      _seedTrim("에어", 46500000, 5, [{ name: "스타일", price: 940000 }, { name: "컴포트 I", price: 490000 }, { name: "컨비니언스", price: 1290000 }, { name: "드라이브 와이즈", price: 1090000 }, { name: "와이드 선루프", price: 640000 }, { name: "듀얼 모터 4WD", price: 2270000 }]),
      _seedTrim("어스", 50660000, 5, [{ name: "드라이브 와이즈", price: 1090000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 590000 }, { name: "듀얼 모터 4WD", price: 2270000 }]),
      _seedTrim("GT-Line", 51560000, 5, [{ name: "드라이브 와이즈", price: 1090000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 590000 }, { name: "듀얼 모터 4WD", price: 2270000 }])
    ])
  ] },
  { brand: "기아", name: "EV4", fuel: "전기", body: "sedan", vehicleTypes: [
    _seedVT("스탠다드", 0, [
      _seedTrim("에어", 42570000, 5, [{ name: "스타일 패키지", price: 740000 }, { name: "컴포트 패키지", price: 890000 }, { name: "드라이브 와이즈", price: 1280000 }, { name: "와이드 선루프", price: 640000 }, { name: "헤드업 디스플레이", price: 590000 }]),
      _seedTrim("어스", 47410000, 5, [{ name: "컴포트 패키지", price: 890000 }, { name: "드라이브 와이즈", price: 1280000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 640000 }]),
      _seedTrim("GT-Line", 48570000, 5, [{ name: "드라이브 와이즈", price: 1280000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 640000 }])
    ]),
    _seedVT("롱레인지", 0, [
      _seedTrim("에어", 47000000, 5, [{ name: "스타일 패키지", price: 740000 }, { name: "컴포트 패키지", price: 890000 }, { name: "드라이브 와이즈", price: 1280000 }, { name: "와이드 선루프", price: 640000 }]),
      _seedTrim("어스", 51830000, 5, [{ name: "컴포트 패키지", price: 890000 }, { name: "드라이브 와이즈", price: 1280000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 640000 }]),
      _seedTrim("GT-Line", 52990000, 5, [{ name: "드라이브 와이즈", price: 1280000 }, { name: "와이드 선루프", price: 640000 }, { name: "하만카돈 프리미엄 사운드", price: 640000 }])
    ])
  ] },
  { brand: "제네시스", name: "제네시스 G80 (RG3 F/L)", fuel: "가솔린", body: "sedan", vehicleTypes: [
    _seedVT("2.5 터보", 2497, [
      _seedTrim("2.5 터보 2WD", 60700000, 5, [{ name: "파퓰러 패키지", price: 3500000 }, { name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "2열 컴포트 패키지", price: 2700000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }, { name: "20인치 휠", price: 3000000 }]),
      _seedTrim("2.5 터보 AWD", 63500000, 5, [{ name: "파퓰러 패키지", price: 3500000 }, { name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "2열 컴포트 패키지", price: 2700000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }]),
      _seedTrim("2.5 터보 스포츠 2WD", 64700000, 5, [{ name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }]),
      _seedTrim("2.5 터보 스포츠 AWD", 67500000, 5, [{ name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }])
    ]),
    _seedVT("3.5 터보", 3470, [
      _seedTrim("3.5 터보 2WD", 67300000, 5, [{ name: "파퓰러 패키지", price: 3500000 }, { name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "2열 컴포트 패키지", price: 2700000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }, { name: "20인치 휠", price: 3000000 }]),
      _seedTrim("3.5 터보 AWD", 70100000, 5, [{ name: "파퓰러 패키지", price: 3500000 }, { name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "2열 컴포트 패키지", price: 2700000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }]),
      _seedTrim("3.5 터보 스포츠 AWD", 75700000, 5, [{ name: "드라이빙 어시스턴스 패키지", price: 2000000 }, { name: "뱅앤올룹슨 사운드", price: 1900000 }, { name: "파노라마 선루프", price: 1400000 }])
    ])
  ] },
  { brand: "현대", name: "더 뉴 그랜저 GN7", fuel: "가솔린", body: "sedan", vehicleTypes: [
    _seedVT("2.5 가솔린", 2497, [
      _seedTrim("프리미엄", 38570000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "헤드업 디스플레이", price: 990000 }, { name: "플래티넘", price: 1290000 }, { name: "파킹 어시스트", price: 1430000 }, { name: "BOSE 프리미엄 사운드", price: 1190000 }]),
      _seedTrim("익스클루시브", 43530000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "헤드업 디스플레이", price: 990000 }, { name: "플래티넘", price: 1290000 }, { name: "BOSE 프리미엄 사운드", price: 1190000 }]),
      _seedTrim("아너스", 45830000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "BOSE 프리미엄 사운드", price: 1190000 }]),
      _seedTrim("캘리그래피", 47830000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "프리뷰 전자제어 서스펜션", price: 1290000 }, { name: "2열 VIP 패키지", price: 1480000 }]),
      _seedTrim("블랙 익스테리어", 47830000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "2열 VIP 패키지", price: 1480000 }]),
      _seedTrim("블랙 잉크", 49120000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "2열 VIP 패키지", price: 1480000 }])
    ]),
    _seedVT("3.5 가솔린", 3470, [
      _seedTrim("프리미엄", 41040000, 5, [{ name: "HTRAC(4WD)", price: 2180000 }, { name: "파노라마 선루프", price: 1190000 }, { name: "헤드업 디스플레이", price: 990000 }, { name: "플래티넘", price: 1290000 }, { name: "BOSE 프리미엄 사운드", price: 1190000 }]),
      _seedTrim("익스클루시브", 46000000, 5, [{ name: "HTRAC(4WD)", price: 2180000 }, { name: "파노라마 선루프", price: 1190000 }, { name: "헤드업 디스플레이", price: 990000 }, { name: "플래티넘", price: 1290000 }, { name: "BOSE 프리미엄 사운드", price: 1190000 }]),
      _seedTrim("아너스", 48300000, 5, [{ name: "HTRAC(4WD)", price: 2180000 }, { name: "파노라마 선루프", price: 1190000 }, { name: "BOSE 프리미엄 사운드", price: 1190000 }]),
      _seedTrim("캘리그래피", 50300000, 5, [{ name: "HTRAC(4WD)", price: 2180000 }, { name: "파노라마 선루프", price: 1190000 }, { name: "2열 VIP 패키지", price: 1480000 }]),
      _seedTrim("블랙 익스테리어", 50300000, 5, [{ name: "HTRAC(4WD)", price: 2180000 }, { name: "파노라마 선루프", price: 1190000 }, { name: "2열 VIP 패키지", price: 1480000 }]),
      _seedTrim("블랙 잉크", 51590000, 5, [{ name: "HTRAC(4WD)", price: 2180000 }, { name: "파노라마 선루프", price: 1190000 }, { name: "2열 VIP 패키지", price: 1480000 }])
    ]),
    _seedVT("3.5 LPG", 3470, [
      _seedTrim("프리미엄", 39250000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "헤드업 디스플레이", price: 990000 }, { name: "플래티넘", price: 1290000 }, { name: "파킹 어시스트", price: 1430000 }]),
      _seedTrim("익스클루시브", 44150000, 5, [{ name: "파노라마 선루프", price: 1190000 }, { name: "헤드업 디스플레이", price: 990000 }, { name: "플래티넘", price: 1290000 }, { name: "파킹 어시스트", price: 1430000 }])
    ])
  ] },
  { brand: "기아", name: "셀토스 SP3", fuel: "가솔린", body: "suv", vehicleTypes: [
    _seedVT("1.6 터보 가솔린", 1598, [
      _seedTrim("트렌디", 25150000, 5, [{ name: "전자식 4WD", price: 1980000 }, { name: "스타일", price: 1090000 }, { name: "컨비니언스", price: 640000 }, { name: "12.3인치 내비게이션", price: 1090000 }, { name: "빌트인 캠 2 플러스", price: 450000 }, { name: "12.3인치 클러스터", price: 400000 }, { name: "스마트 커넥트", price: 690000 }, { name: "드라이브 와이즈", price: 1190000 }]),
      _seedTrim("프레스티지", 28840000, 5, [{ name: "전자식 4WD", price: 1980000 }, { name: "스타일", price: 890000 }, { name: "빌트인 캠 2 플러스", price: 450000 }, { name: "12.3인치 클러스터", price: 400000 }, { name: "스마트 커넥트", price: 690000 }, { name: "드라이브 와이즈", price: 1190000 }, { name: "모니터링", price: 1040000 }, { name: "헤드업 디스플레이", price: 590000 }, { name: "컴포트", price: 1040000 }, { name: "파노라마 선루프", price: 1090000 }]),
      _seedTrim("시그니처", 31490000, 5, [{ name: "전자식 4WD", price: 1980000 }, { name: "스타일", price: 890000 }, { name: "빌트인 캠 2 플러스", price: 450000 }, { name: "드라이브 와이즈", price: 790000 }, { name: "모니터링", price: 1040000 }, { name: "헤드업 디스플레이", price: 590000 }, { name: "컴포트", price: 450000 }, { name: "하만카돈 프리미엄 사운드", price: 890000 }, { name: "파노라마 선루프", price: 1090000 }, { name: "투톤 루프", price: 300000 }]),
      _seedTrim("X-Line", 32670000, 5, [{ name: "전자식 4WD", price: 1980000 }, { name: "빌트인 캠 2 플러스", price: 450000 }, { name: "드라이브 와이즈", price: 790000 }, { name: "모니터링", price: 1040000 }, { name: "헤드업 디스플레이", price: 590000 }, { name: "컴포트", price: 450000 }, { name: "하만카돈 프리미엄 사운드", price: 890000 }, { name: "파노라마 선루프", price: 1090000 }, { name: "투톤 루프", price: 300000 }])
    ])
  ] },
  { brand: "기아", name: "셀토스 SP3 하이브리드", fuel: "하이브리드", body: "suv", vehicleTypes: [
    _seedVT("1.6 하이브리드", 1580, [
      _seedTrim("트렌디", 30440000, 5, [{ name: "컨비니언스", price: 640000 }, { name: "12.3인치 내비게이션", price: 540000 }]),
      _seedTrim("프레스티지", 33590000, 5, [{ name: "스타일", price: 890000 }, { name: "빌트인 캠 2 플러스", price: 450000 }, { name: "파노라마 선루프", price: 1090000 }]),
      _seedTrim("시그니처", 36240000, 5, [{ name: "파노라마 선루프", price: 1090000 }, { name: "하만카돈 프리미엄 사운드", price: 890000 }]),
      _seedTrim("X-Line", 37410000, 5, [{ name: "파노라마 선루프", price: 1090000 }, { name: "하만카돈 프리미엄 사운드", price: 890000 }])
    ])
  ] },
  { brand: "기아", name: "더 뉴 니로 SG2 하이브리드", fuel: "하이브리드", body: "suv", vehicleTypes: [
    _seedVT("1.6 하이브리드", 1580, [
      _seedTrim("트렌디", 30310000, 5, [{ name: "컨비니언스", price: 650000 }, { name: "18인치 휠", price: 490000 }, { name: "12.3인치 클러스터 팩", price: 1150000 }]),
      _seedTrim("프레스티지", 33460000, 5, [{ name: "프리미엄", price: 1240000 }, { name: "드라이브 와이즈 II", price: 990000 }, { name: "HUD", price: 590000 }, { name: "컴포트", price: 750000 }]),
      _seedTrim("시그니처", 36190000, 5, [{ name: "드라이브 와이즈 II", price: 990000 }, { name: "HUD", price: 590000 }, { name: "컴포트", price: 550000 }])
    ])
  ] },
  { brand: "기아", name: "The new 모닝", fuel: "가솔린", body: "compact", vehicleTypes: [
    _seedVT("1.0 가솔린", 998, [
      _seedTrim("트렌디", 14210000, 5, [{ name: "버튼 스타트 팩", price: 500000 }, { name: "전동식 선루프", price: 400000 }]),
      _seedTrim("프레스티지", 16010000, 5, [{ name: "전동식 선루프", price: 400000 }]),
      _seedTrim("시그니처", 18160000, 5, [{ name: "전동식 선루프", price: 400000 }]),
      _seedTrim("GT-라인", 19110000, 5, [{ name: "전동식 선루프", price: 400000 }])
    ])
  ] },
  { brand: "기아", name: "레이", fuel: "가솔린", body: "compact", vehicleTypes: [
    _seedVT("1.0 가솔린", 998, [
      _seedTrim("트렌디", 14900000, 5, [{ name: "버튼시동 스마트키", price: 300000 }, { name: "스타일", price: 950000 }, { name: "컴포트 Ⅰ", price: 600000 }, { name: "8인치 내비게이션", price: 1450000 }]),
      _seedTrim("프레스티지", 17600000, 5, [{ name: "스타일", price: 850000 }, { name: "드라이브 와이즈", price: 300000 }, { name: "8인치 내비게이션", price: 750000 }]),
      _seedTrim("시그니처", 19030000, 5, [{ name: "스타일", price: 500000 }, { name: "8인치 내비게이션", price: 500000 }]),
      _seedTrim("X-Line", 20030000, 5, [{ name: "스타일", price: 500000 }, { name: "8인치 내비게이션", price: 500000 }])
    ])
  ] },
  { brand: "기아", name: "레이 EV", fuel: "전기", body: "compact", vehicleTypes: [
    _seedVT("4인승 승용", 0, [
      _seedTrim("라이트", 28350000, 4, [{ name: "스타일", price: 600000 }, { name: "컴포트 Ⅰ", price: 600000 }, { name: "컴포트 Ⅱ", price: 450000 }, { name: "드라이브 와이즈", price: 300000 }]),
      _seedTrim("에어", 30350000, 4, [])
    ])
  ] },
  { brand: "현대", name: "아반떼 CN7", fuel: "가솔린", body: "sedan", vehicleTypes: [
    _seedVT("1.6 가솔린", 1598, [
      _seedTrim("스마트", 20650000, 5, [{ name: "컨비니언스", price: 380000 }, { name: "인포테인먼트 내비(컨비니언스 추가)", price: 790000 }, { name: "하이패스", price: 200000 }, { name: "현대 스마트센스", price: 690000 }, { name: "17인치 알로이 휠&타이어", price: 490000 }]),
      _seedTrim("모던", 23910000, 5, [{ name: "선루프", price: 450000 }, { name: "파킹 어시스트 플러스", price: 1290000 }, { name: "엑스테리어 디자인", price: 450000 }, { name: "현대 스마트센스", price: 690000 }, { name: "컴포트 I", price: 1060000 }, { name: "17인치 알로이 휠&타이어", price: 300000 }, { name: "세이지 그린 인테리어 컬러", price: 150000 }]),
      _seedTrim("인스퍼레이션", 27590000, 5, [{ name: "선루프", price: 450000 }, { name: "빌트인 캠(보조배터리 포함)", price: 690000 }, { name: "세이지 그린 인테리어 컬러", price: 150000 }]),
      _seedTrim("N Line", 28490000, 5, [{ name: "선루프", price: 450000 }, { name: "빌트인 캠(보조배터리 포함)", price: 690000 }])
    ])
  ] },
  { brand: "현대", name: "아반떼 CN7 LPG", fuel: "LPG", body: "sedan", vehicleTypes: [
    _seedVT("1.6 LPi", 1598, [
      _seedTrim("스마트", 22050000, 5, [{ name: "컨비니언스", price: 380000 }, { name: "인포테인먼트 내비(컨비니언스 추가)", price: 790000 }, { name: "하이패스", price: 200000 }, { name: "현대 스마트센스", price: 690000 }, { name: "17인치 알로이 휠&타이어", price: 490000 }]),
      _seedTrim("모던", 25300000, 5, [{ name: "선루프", price: 450000 }, { name: "파킹 어시스트 플러스", price: 1290000 }, { name: "익스테리어 디자인", price: 450000 }, { name: "현대 스마트센스", price: 690000 }, { name: "컴포트 II", price: 910000 }, { name: "17인치 알로이 휠&타이어", price: 300000 }, { name: "세이지 그린 인테리어 컬러", price: 150000 }]),
      _seedTrim("인스퍼레이션", 28860000, 5, [{ name: "선루프", price: 450000 }, { name: "세이지 그린 인테리어 컬러", price: 150000 }])
    ])
  ] }
];
function buildSeedCar(s) {
  var vts = (s.vehicleTypes || []).filter(function (v) { return v.trims && v.trims.length; });
  var trims0 = (vts[0] && vts[0].trims) || [];
  var firstPrice = (trims0[0] && trims0[0].price) || 0;
  var monthly = 0;
  try { if (typeof QuoteEngine !== "undefined") monthly = QuoteEngine.quoteMonthly(firstPrice, 0, 72, QuoteEngine.loadPricingPolicy()); } catch (e) {}
  return {
    brand: s.brand, name: s.name, seg: "", fuel: s.fuel, photo: "",
    price: monthly, km: "10,000km", badges: [], body: s.body || "suv", color: "#1A2332",
    term: 72, status: "판매중", popular: false, recommend: false,
    detail: {
      subModel: "", displacement: (vts[0] && vts[0].displacement) || 0,
      seats: (trims0[0] && trims0[0].seats) || 5,
      vehicleTypes: vts, trims: trims0,
      maintenance: [], maintenanceFee: 0, buyOption: "있음",
      mileage: "10,000km", deposit: "15%", prepay: "0%",
      driverAge: "만 26세 이상", liability: "1억원", deductible: "30만원",
      accessories: s.accessories || "", region: "서울", rentTable: []
    }
  };
}
// 시드: 공식 가격표 기준으로 차량 갱신 (비시드 차량 보존, 중복 제거, 사진·상태 유지)
(function seedCatalog() {
  var SEED_VERSION = 10, SEED_FLAG = "cartrend:seeded";
  var done = 0; try { done = +(localStorage.getItem(SEED_FLAG) || 0); } catch (e) {}
  if (done >= SEED_VERSION) return;
  // v1→v2 이름 정정 (구 이름으로 시드된 경우)
  if (done < 2) {
    var RENAME = {
      "더 뉴 쏘렌토 하이브리드": "더 뉴 쏘렌토 MQ4 하이브리드",
      "디 올 뉴 팰리세이드 하이브리드": "팰리세이드 LX3 하이브리드",
      "더 뉴 그랜저 하이브리드": "더 뉴 그랜저 GN7 하이브리드",
      "모델 3": "테슬라 모델3", "모델 Y": "테슬라 모델Y",
      "G80": "제네시스 G80 (RG3 F/L)", "더 뉴 그랜저": "더 뉴 그랜저 GN7",
      "셀토스": "셀토스 SP3", "셀토스 하이브리드": "셀토스 SP3 하이브리드",
      "더 뉴 니로 하이브리드": "더 뉴 니로 SG2 하이브리드", "모닝": "The new 모닝"
    };
    CARS.forEach(function (c) { if (RENAME[c.name]) c.name = RENAME[c.name]; });
  }
  // ★ 사장님이 직접 요청한 신규 차량만 추가한다.
  //   - 기존 차량은 절대 변경하지 않음(덮어쓰기 없음)
  //   - 요청하지 않은 차량(테슬라 등 초기 데모 포함)은 추가/복구하지 않음
  //   - 사장님이 삭제한 차량이 다시 살아나지 않음
  var ADD_NAMES = ["레이 EV", "아반떼 CN7"];   // 요청 시 여기에만 차량명을 추가
  var existing = {}; CARS.forEach(function (c) { existing[c.name] = true; });
  SEED_CARS.forEach(function (s) {
    if (ADD_NAMES.indexOf(s.name) !== -1 && !existing[s.name]) { CARS.push(buildSeedCar(s)); existing[s.name] = true; }
  });
  saveCars();
  try { localStorage.setItem(SEED_FLAG, String(SEED_VERSION)); } catch (e) {}
})();
