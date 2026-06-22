/* ============================================================
 * cartrend 자체 견적 엔진 (quote-engine)
 * - 타사 스크래핑 폐기 → cartrend 자체 가격 정책으로 견적 산출
 * - 순수 계산 함수만 (Node·브라우저 공용). 부수효과 없음.
 * - 계산식(공개된 표준 리스/렌트 잔가 모델):
 *     보증금 = floor(depositBase × 비율 / 1000) × 1000
 *     depositBase = 차량가 − 개별소비세감면 − 제조사DC
 *     월렌트료(n) = (depositBase − 잔가(n)×(1+i)^-n) / 연금계수(i,n),  i = 연요율/12
 *     잔가(n) = depositBase × 잔가율(n)
 *     옵션 가산 = 옵션 증가분만:  기본월렌트료 + [월렌트료(차량가+옵션) − 월렌트료(차량가)]
 * ============================================================ */
(function (root) {
  "use strict";

  var TAX_REDUCTION_RATE = 0.015164; // 차량가 대비 개소세 감면 실효율(세법 공식 근사)

  // 기간(개월) 표준 목록 — 높은 개월이 위로 표시
  var PERIODS = [82, 72, 60, 48, 36, 24];

  // cartrend 기본 가격 정책 (관리자 조정 가능 — 시장 통용 범위 참고해 cartrend가 결정)
  var DEFAULT_PRICING_POLICY = {
    residualTable: { 24: 0.808, 36: 0.79, 48: 0.77, 60: 0.755, 72: 0.738, 82: 0.723 }, // 기간별 잔가율
    annualRate: 0.1085, // 연 요율 10.85%
    marginRate: 0.0,    // 마진(0이면 영향 없음). 최종 = 엔진값 × (1+marginRate)
    // 선형 근사 fallback (테이블에 없는 기간용): 잔가율(n) = base − slope×(n−24)/12
    base: 0.808,
    slope: 0.018
  };

  /* ---------- 보증금 과세표준 ---------- */
  function calcTaxReduction(carPrice) {
    return Math.floor((carPrice || 0) * TAX_REDUCTION_RATE / 1000) * 1000; // 천원 단위 내림
  }
  function calcDepositBase(carPrice, makerDC) {
    return Math.max(0, (carPrice || 0) - calcTaxReduction(carPrice) - (makerDC || 0));
  }

  /* ---------- 잔가 모델 ---------- */
  function annuityFactor(i, n) { return i === 0 ? n : (1 - Math.pow(1 + i, -n)) / i; }

  // 기간별 잔가율: 정책 테이블 우선, 없으면 선형 근사
  function residualRate(n, policy) {
    var p = policy || DEFAULT_PRICING_POLICY;
    var t = p.residualTable;
    if (t && t[n] != null) return t[n];
    var base = p.base != null ? p.base : DEFAULT_PRICING_POLICY.base;
    var slope = p.slope != null ? p.slope : DEFAULT_PRICING_POLICY.slope;
    return base - slope * (n - 24) / 12;
  }

  // 기간별 월렌트료 (마진 적용). 보증금·선납금 반영.
  //  - 선납금: 비환불 → 원금 전액 차감
  //  - 보증금: 환불 → 기간 동안의 효과만 차감 (보증금×(1−(1+i)^-n))
  function monthlyFromPolicy(carPrice, n, policy, deposit, prepay) {
    var p = policy || DEFAULT_PRICING_POLICY;
    var db = calcDepositBase(carPrice, 0);
    var i = (p.annualRate != null ? p.annualRate : DEFAULT_PRICING_POLICY.annualRate) / 12;
    var disc = Math.pow(1 + i, -n);
    var resid = db * residualRate(n, p);
    var pv = db - (prepay || 0) - (deposit || 0) * (1 - disc) - resid * disc;
    if (pv < 0) pv = 0;
    var m = pv / annuityFactor(i, n);
    var margin = p.marginRate || 0;
    return m * (1 + margin);
  }

  // 옵션 증가분만: 월렌트료(차량가+옵션) − 월렌트료(차량가)  (보증금/선납금은 옵션과 무관 → 상쇄)
  function optionDelta(carPrice, optionSum, n, policy) {
    if (!optionSum) return 0;
    return monthlyFromPolicy((carPrice || 0) + optionSum, n, policy) - monthlyFromPolicy(carPrice, n, policy);
  }

  // 최종 기간별 월렌트료 (옵션 증가분 가산 + 보증금/선납금 반영 + 10원 단위 반올림)
  function quoteMonthly(carPrice, optionSum, n, policy, deposit, prepay) {
    var v = monthlyFromPolicy(carPrice, n, policy, deposit, prepay) + optionDelta(carPrice, optionSum || 0, n, policy);
    return Math.round(Math.max(0, v) / 10) * 10;
  }

  // 6기간 일괄 계산 → { 82:.., 72:.., ... }
  function quoteAllPeriods(carPrice, optionSum, policy, periods, deposit, prepay) {
    var out = {};
    (periods || PERIODS).forEach(function (n) { out[n] = quoteMonthly(carPrice, optionSum || 0, n, policy, deposit, prepay); });
    return out;
  }

  // 보증금 = floor((차량가 − 제조사DC) × 비율 / 1000) × 1000.  pct는 퍼센트 숫자(0,10,15,...)
  function quoteDeposit(carPrice, pct, makerDC) {
    return Math.floor(Math.max(0, (carPrice || 0) - (makerDC || 0)) * (pct / 100) / 1000) * 1000;
  }

  /* ---------- 정책값 정규화/로드/저장 ---------- */
  function normalizePolicy(p) {
    var d = DEFAULT_PRICING_POLICY;
    p = p || {};
    var rt = {};
    PERIODS.forEach(function (n) {
      var v = p.residualTable && p.residualTable[n] != null ? p.residualTable[n] : d.residualTable[n];
      rt[n] = v;
    });
    return {
      residualTable: rt,
      annualRate: p.annualRate != null ? p.annualRate : d.annualRate,
      marginRate: p.marginRate != null ? p.marginRate : d.marginRate,
      base: p.base != null ? p.base : d.base,
      slope: p.slope != null ? p.slope : d.slope
    };
  }
  var PRICING_POLICY_KEY = "cartrend_pricing_policy";
  function loadPricingPolicy() {
    try {
      if (typeof localStorage !== "undefined") {
        var raw = localStorage.getItem(PRICING_POLICY_KEY);
        if (raw) return normalizePolicy(JSON.parse(raw));
      }
    } catch (e) {}
    return normalizePolicy(DEFAULT_PRICING_POLICY);
  }
  function savePricingPolicy(p) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(PRICING_POLICY_KEY, JSON.stringify(normalizePolicy(p)));
        return true;
      }
    } catch (e) {}
    return false;
  }
  function resetPricingPolicy() {
    try { if (typeof localStorage !== "undefined") localStorage.removeItem(PRICING_POLICY_KEY); } catch (e) {}
  }

  var API = {
    TAX_REDUCTION_RATE: TAX_REDUCTION_RATE,
    PERIODS: PERIODS,
    DEFAULT_PRICING_POLICY: DEFAULT_PRICING_POLICY,
    PRICING_POLICY_KEY: PRICING_POLICY_KEY,
    calcTaxReduction: calcTaxReduction,
    calcDepositBase: calcDepositBase,
    annuityFactor: annuityFactor,
    residualRate: residualRate,
    monthlyFromPolicy: monthlyFromPolicy,
    optionDelta: optionDelta,
    quoteMonthly: quoteMonthly,
    quoteAllPeriods: quoteAllPeriods,
    quoteDeposit: quoteDeposit,
    normalizePolicy: normalizePolicy,
    loadPricingPolicy: loadPricingPolicy,
    savePricingPolicy: savePricingPolicy,
    resetPricingPolicy: resetPricingPolicy
  };

  // Node: module.exports / 브라우저: window.QuoteEngine 전역
  if (typeof module !== "undefined" && module.exports) module.exports = API;
  if (root) { root.QuoteEngine = API; for (var k in API) if (!(k in root)) root[k] = API[k]; }

})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : this));
