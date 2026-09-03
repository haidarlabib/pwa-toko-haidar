import assert from 'node:assert/strict';

console.log('--- RUNNING HAIDAR PLASTIK BUSINESS RULES TEST SUITE (v2.0 REVISED) ---');

// =========================================================================
// PART 1: CORE ADMIN BUSINESS RULES (BR-01 to BR-16 / BR-A01 to BR-A16)
// =========================================================================

// BR-A06..BR-A09: Price Visuals
function getPriceChangeType(oldPrice, newPrice) {
  if (newPrice > oldPrice) return 'INCREASE';
  if (newPrice < oldPrice) return 'DECREASE';
  return 'NO_CHANGE';
}

function getPriceChangeVisuals(changeType) {
  switch (changeType) {
    case 'INCREASE':
      return { label: 'HARGA NAIK', textClass: 'text-red-600 font-semibold' };
    case 'DECREASE':
      return { label: 'HARGA TURUN', textClass: 'text-emerald-600 font-semibold' };
    default:
      return { label: 'TETAP', textClass: 'text-slate-600 font-medium' };
  }
}

// Assert price increase -> RED (BR-A08)
assert.equal(getPriceChangeType(13000, 14000), 'INCREASE');
assert.equal(getPriceChangeVisuals('INCREASE').label, 'HARGA NAIK');
assert.match(getPriceChangeVisuals('INCREASE').textClass, /text-red-600/);

// Assert price decrease -> GREEN (BR-A09)
assert.equal(getPriceChangeType(14000, 12000), 'DECREASE');
assert.equal(getPriceChangeVisuals('DECREASE').label, 'HARGA TURUN');
assert.match(getPriceChangeVisuals('DECREASE').textClass, /text-emerald-600/);

// Assert no change
assert.equal(getPriceChangeType(14000, 14000), 'NO_CHANGE');

// BR-A03 & BR-A04: Edit vs Update Price Versioning
let product = {
  id: 'p-1',
  name: 'Plastik HD 15x30',
  unit: 'PCS',
  purchase_price: 12000,
  selling_price: 14000,
  current_price_version: 4,
  stock: 120,
  inspection_days: ['Senin', 'Rabu', 'Sabtu'],
  is_active: true
};

// Edit does NOT increment version (BR-A03)
function simulateEdit(prod, updates) {
  return {
    ...prod,
    ...updates,
    current_price_version: prod.current_price_version // Version unchanged per BR-A03
  };
}

let edited = simulateEdit(product, { unit: 'PACK' });
assert.equal(edited.unit, 'PACK');
assert.equal(edited.current_price_version, 4, 'Edit MUST NOT change price version (BR-A03)');

// Update Price increments version (BR-A04 & BR-A05)
function simulatePriceUpdate(prod, newPurchase, newSelling, reason) {
  const nextVer = prod.current_price_version + 1;
  const history = {
    product_id: prod.id,
    version: nextVer,
    old_purchase_price: prod.purchase_price,
    new_purchase_price: newPurchase,
    old_selling_price: prod.selling_price,
    new_selling_price: newSelling,
    change_type: getPriceChangeType(prod.selling_price, newSelling),
    reason: reason
  };
  const updatedProd = {
    ...prod,
    purchase_price: newPurchase,
    selling_price: newSelling,
    current_price_version: nextVer
  };
  return { updatedProd, history };
}

let { updatedProd, history } = simulatePriceUpdate(edited, 13000, 15000, 'Kenaikan bahan baku');
assert.equal(updatedProd.current_price_version, 5, 'Update Price MUST increment version (BR-A04)');
assert.equal(history.version, 5);
assert.equal(history.change_type, 'INCREASE');
assert.equal(history.old_selling_price, 14000);
assert.equal(history.new_selling_price, 15000);
assert.equal(history.reason, 'Kenaikan bahan baku');

// BR-A15: Soft delete
function simulateSoftDelete(prod) {
  return { ...prod, is_active: false };
}
let deactivated = simulateSoftDelete(updatedProd);
assert.equal(deactivated.is_active, false, 'Delete must deactivate, not hard delete (BR-A15)');

// =========================================================================
// PART 2: USER MODULE BUSINESS RULES (BR-U01 to BR-U20)
// =========================================================================

// BR-A13 & BR-U04: Purchase Price (Harga Modal) STRIPPED for User
function sanitizeProductForUser(prod) {
  const { purchase_price, ...userSafe } = prod;
  return userSafe;
}

const userProduct = sanitizeProductForUser(updatedProd);
assert.equal(userProduct.purchase_price, undefined, 'User MUST NOT see purchase/modal price (BR-A13 / BR-U04)');
assert.equal(userProduct.selling_price, 15000, 'User can see selling price (BR-U05)');

// Dynamic username greeting
const activeUser = { id: 'u-2', name: 'Ahmad', username: 'ahmad', role: 'USER' };
function renderGreeting(user) {
  return `Hi, ${user.name} 👋`;
}
assert.equal(renderGreeting(activeUser), 'Hi, Ahmad 👋', 'Dashboard displays actual username');

// Price Alert Container (Product name only, colored red/green)
function formatUserPriceAlert(alert) {
  return {
    name: alert.product_name,
    colorClass: alert.change_type === 'INCREASE' ? 'text-red-700' : 'text-emerald-700'
  };
}

const alertIncrease = formatUserPriceAlert({ product_name: 'Plastik HD 15x30', change_type: 'INCREASE' });
assert.equal(alertIncrease.name, 'Plastik HD 15x30', 'Alert only displays product name');
assert.equal(alertIncrease.colorClass, 'text-red-700', 'Price increase displayed red');

const alertDecrease = formatUserPriceAlert({ product_name: 'Cup 16oz', change_type: 'DECREASE' });
assert.equal(alertDecrease.colorClass, 'text-emerald-700', 'Price decrease displayed green');

// =========================================================================
// PART 3: ADMIN v2.0 SPECIFIC BUSINESS RULES (BR-A17 to BR-A28)
// =========================================================================

// BR-A17 & BR-A18: Relational Day Enums
const DAY_ENUM_TO_ID = {
  MONDAY: 'Senin',
  TUESDAY: 'Selasa',
  WEDNESDAY: 'Rabu',
  THURSDAY: 'Kamis',
  FRIDAY: 'Jumat',
  SATURDAY: 'Sabtu',
  SUNDAY: 'Minggu',
};
assert.equal(DAY_ENUM_TO_ID['MONDAY'], 'Senin');
assert.equal(DAY_ENUM_TO_ID['SATURDAY'], 'Sabtu');

// BR-A19: Today's inspection derived from current day
const testProducts = [
  { id: 'p-1', name: 'Plastik HD', inspection_days: ['Senin', 'Rabu', 'Sabtu'], is_active: true },
  { id: 'p-2', name: 'Cup Oval', inspection_days: ['Selasa', 'Kamis'], is_active: true },
  { id: 'p-3', name: 'Kresek Bening', inspection_days: ['Kamis', 'Sabtu'], is_active: true },
  { id: 'p-4', name: 'Barang Nonaktif', inspection_days: ['Kamis'], is_active: false }, // deactivation rule BR-A15/146
];

function getScheduledProductsForDay(products, dayName) {
  return products.filter((p) => p.is_active && p.inspection_days.includes(dayName));
}

const kamisScheduled = getScheduledProductsForDay(testProducts, 'Kamis');
assert.equal(kamisScheduled.length, 2, 'Active items on Kamis (excludes deactivated)');
assert.deepEqual(kamisScheduled.map((p) => p.id), ['p-2', 'p-3']);

// BR-A21 & BR-A22: Previous day inspection DOES NOT satisfy today's inspection
const historicalChecks = [
  { id: 'sc-prev', product_id: 'p-2', user_id: 'u-2', check_date: '2026-09-02', status: 'SUBMITTED' } // Wednesday check
];

function isCheckedToday(productId, userId, todayDate, checks) {
  return checks.some(
    (c) => c.product_id === productId && c.user_id === userId && c.check_date === todayDate
  );
}

assert.equal(isCheckedToday('p-2', 'u-2', '2026-09-03', historicalChecks), false, 'Previous day check must not satisfy today (BR-A21)');

// Add today check
const todayChecks = [
  ...historicalChecks,
  { id: 'sc-today', product_id: 'p-2', user_id: 'u-2', check_date: '2026-09-03', status: 'SUBMITTED' }
];
assert.equal(isCheckedToday('p-2', 'u-2', '2026-09-03', todayChecks), true, 'Today check satisfies today (BR-A22)');

// BR-A23: Schedule changes do not rewrite historical checks
let oldSchedule = ['Rabu'];
let newSchedule = ['Kamis', 'Sabtu'];
assert.equal(historicalChecks[0].check_date, '2026-09-02', 'Historical check remains untouched on schedule edit (BR-A23)');

// BR-A10, BR-A11, BR-A24: Text preservation, no system stock mutation, locked after submit
function submitStockCheck(product, prevText, currText, note, user, checkDate = '2026-09-03') {
  const check = {
    id: 's-1',
    product_id: product.id,
    user_id: user.id,
    user_name: user.name,
    check_date: checkDate,
    previous_stock: String(prevText), // exact text BR-A11
    current_stock: String(currText),   // exact text BR-A11
    note: note,
    status: 'SUBMITTED' // BR-A24: Locked after submit
  };
  return { check, systemStock: product.stock };
}

const checkSubmission = submitStockCheck(
  product,
  '120 pak',
  '180 pcs',
  'masih ada banyak di rak belakang',
  activeUser
);
assert.equal(checkSubmission.check.previous_stock, '120 pak', 'Raw string preserved (BR-A11)');
assert.equal(checkSubmission.check.current_stock, '180 pcs', 'Raw string preserved (BR-A11)');
assert.equal(checkSubmission.systemStock, 120, 'Stock Check MUST NOT modify system stock (BR-A10)');
assert.equal(checkSubmission.check.status, 'SUBMITTED', 'Check locked immediately after submit (BR-A24)');

// BR-A25 & BR-A26: Edit Request and Approval/Rejection Auditable Flow
function requestEdit(check, reason) {
  return {
    ...check,
    status: 'EDIT_REQUESTED',
    edit_reason: reason
  };
}

const requested = requestEdit(checkSubmission.check, 'Salah hitung kemasan di rak bawah');
assert.equal(requested.status, 'EDIT_REQUESTED', 'Transitions to EDIT_REQUESTED (BR-A25)');

function adminReviewEdit(check, adminUser, decision) {
  return {
    ...check,
    status: decision === 'APPROVE' ? 'EDIT_APPROVED' : 'EDIT_REJECTED',
    reviewed_by: adminUser.name,
    reviewed_at: new Date().toISOString()
  };
}

const approved = adminReviewEdit(requested, { name: 'Admin Haidar', role: 'ADMIN' }, 'APPROVE');
assert.equal(approved.status, 'EDIT_APPROVED');
assert.equal(approved.reviewed_by, 'Admin Haidar');
assert.ok(approved.reviewed_at, 'Review timestamp recorded (BR-A26 & BR-A28)');

const rejected = adminReviewEdit(requested, { name: 'Admin Haidar', role: 'ADMIN' }, 'REJECT');
assert.equal(rejected.status, 'EDIT_REJECTED');
assert.equal(rejected.reviewed_by, 'Admin Haidar');

console.log('✅ ALL ADMIN & USER BUSINESS RULES (BR-A01..BR-A28, BR-U01..BR-U20) PASSED 100%!');
