export type FeeRow = { min: number; max: number; fee?: number; feePercentage?: number };

export const COPART_BUYER_FEES: FeeRow[] = [
  { min: 0, max: 49, fee: 1 },
  { min: 50, max: 99, fee: 25 },
  { min: 100, max: 199, fee: 50 },
  { min: 200, max: 299, fee: 75 },
  { min: 300, max: 349, fee: 90 },
  { min: 350, max: 399, fee: 100 },
  { min: 400, max: 449, fee: 110 },
  { min: 450, max: 499, fee: 115 },
  { min: 500, max: 549, fee: 120 },
  { min: 550, max: 599, fee: 130 },
  { min: 600, max: 699, fee: 140 },
  { min: 700, max: 799, fee: 150 },
  { min: 800, max: 899, fee: 160 },
  { min: 900, max: 999, fee: 170 },
  { min: 1000, max: 1199, fee: 185 },
  { min: 1200, max: 1299, fee: 195 },
  { min: 1300, max: 1399, fee: 205 },
  { min: 1400, max: 1499, fee: 215 },
  { min: 1500, max: 1599, fee: 225 },
  { min: 1600, max: 1699, fee: 235 },
  { min: 1700, max: 1799, fee: 245 },
  { min: 1800, max: 1999, fee: 255 },
  { min: 2000, max: 2399, fee: 265 },
  { min: 2400, max: 2499, fee: 275 },
  { min: 2500, max: 2999, fee: 290 },
  { min: 3000, max: 3499, fee: 305 },
  { min: 3500, max: 3999, fee: 320 },
  { min: 4000, max: 4499, fee: 340 },
  { min: 4500, max: 4999, fee: 355 },
  { min: 5000, max: 5999, fee: 390 },
  { min: 6000, max: 6999, fee: 420 },
  { min: 7000, max: 7999, fee: 455 },
  { min: 8000, max: 9999, fee: 490 },
  { min: 10000, max: 11999, fee: 550 },
  { min: 12000, max: 13999, fee: 615 },
  { min: 14000, max: 14999, fee: 680 },
  // Percentage tiers
  { min: 15000, max: 19999, fee: 780 },
  { min: 20000, max: 29999, fee: 895 },
  { min: 30000, max: 49999, fee: 1025 },
  { min: 50000, max: Infinity, feePercentage: 0.075 },
];

export const COPART_PROXY_FEES: FeeRow[] = [
  { min: 0, max: 499, fee: 0 },
  { min: 500, max: 999, fee: 59 },
  { min: 1000, max: 1499, fee: 79 },
  { min: 1500, max: 1999, fee: 89 },
  { min: 2000, max: 3999, fee: 99 },
  { min: 4000, max: 5999, fee: 119 },
  { min: 6000, max: 7999, fee: 149 },
  { min: 8000, max: 9999, fee: 179 },
  { min: 10000, max: Infinity, fee: 199 },
];

export const IAAI_BUYER_FEES: FeeRow[] = [
  { min: 0, max: 49, fee: 1 },
  { min: 50, max: 99, fee: 39 },
  { min: 100, max: 199, fee: 59 },
  { min: 200, max: 299, fee: 79 },
  { min: 300, max: 349, fee: 99 },
  { min: 350, max: 399, fee: 109 },
  { min: 400, max: 449, fee: 119 },
  { min: 450, max: 499, fee: 129 },
  { min: 500, max: 549, fee: 139 },
  { min: 550, max: 599, fee: 149 },
  { min: 600, max: 699, fee: 159 },
  { min: 700, max: 799, fee: 169 },
  { min: 800, max: 899, fee: 189 },
  { min: 900, max: 999, fee: 199 },
  { min: 1000, max: 1199, fee: 219 },
  { min: 1200, max: 1299, fee: 229 },
  { min: 1300, max: 1399, fee: 239 },
  { min: 1400, max: 1499, fee: 249 },
  { min: 1500, max: 1599, fee: 259 },
  { min: 1600, max: 1699, fee: 269 },
  { min: 1700, max: 1799, fee: 279 },
  { min: 1800, max: 1999, fee: 289 },
  { min: 2000, max: 2399, fee: 309 },
  { min: 2400, max: 2499, fee: 319 },
  { min: 2500, max: 2999, fee: 339 },
  { min: 3000, max: 3499, fee: 359 },
  { min: 3500, max: 3999, fee: 379 },
  { min: 4000, max: 4499, fee: 399 },
  { min: 4500, max: 4999, fee: 419 },
  { min: 5000, max: 5999, fee: 449 },
  { min: 6000, max: 6999, fee: 479 },
  { min: 7000, max: 7999, fee: 519 },
  { min: 8000, max: 9999, fee: 569 },
  { min: 10000, max: 11999, fee: 639 },
  { min: 12000, max: 14999, fee: 719 },
  { min: 15000, max: Infinity, feePercentage: 0.06 },
];

export const IAAI_PROXY_FEES: FeeRow[] = [
  { min: 0, max: 499, fee: 0 },
  { min: 500, max: 999, fee: 49 },
  { min: 1000, max: 1499, fee: 69 },
  { min: 1500, max: 1999, fee: 79 },
  { min: 2000, max: 3999, fee: 89 },
  { min: 4000, max: 5999, fee: 109 },
  { min: 6000, max: 7999, fee: 139 },
  { min: 8000, max: 9999, fee: 169 },
  { min: 10000, max: Infinity, fee: 189 },
];

export const COPART_FIXED_FEES = {
  internetBidFee: 95,
  gatePass: 15,
  latePayment: 15,
  environmentalFee: 69,
};

export const IAAI_FIXED_FEES = {
  processingFee: 79,
  destinationFee: 10,
  gatePass: 15,
  environmentalFee: 20,
};

export const SEA_LOGISTIC = {
  CHI: { small: 900, big: 1166 },
  HOU: { small: 950, big: 1233 },
  LA: { small: 1450, big: 1900 },
  MIA: { small: 775, big: 1000 },
  NY: { small: 775, big: 1000 },
  SAV: { small: 750, big: 966 },
  SEATLE: { small: 1900, big: 2300 },
};

export const UKRAINE_DELIVERY = {
  expeditor: 500,
  deliveryToUA: 850,
  terminalFees: 50,
  brokerFee: 150,
  deliveryToSTO: 150,
};

export const COMPANY_FEE = {
  serviceFee: 500,
  seaMarkup: 500,
};

export const REGISTRATION = {
  certification: 150,
  mreo: 30,
};

export const PENSION_FUND_THRESHOLDS = {
  low: { maxUAH: 549120, rate: 0.03 },
  mid: { maxUAH: 965120, rate: 0.04 },
  high: { rate: 0.05 },
};
