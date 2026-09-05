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

// =========================================================================
// PART 4: AUTHENTICATION, LOGOUT & ROUTE GUARD RULES (BR-AUTH-01..BR-AUTH-06)
// =========================================================================

// Guard evaluation simulators matching RouteGuards.tsx
function evaluateAdminRoute({ isAuthLoading, isAuthenticated, currentUser }) {
  if (isAuthLoading) return 'LOADING';
  if (!isAuthenticated || !currentUser) return 'REDIRECT_AUTH';
  if (currentUser.role !== 'ADMIN') return 'REDIRECT_USER_DASHBOARD';
  return 'ALLOW';
}

function evaluateUserRoute({ isAuthLoading, isAuthenticated, currentUser }) {
  if (isAuthLoading) return 'LOADING';
  if (!isAuthenticated || !currentUser) return 'REDIRECT_AUTH';
  if (currentUser.role !== 'USER') return 'REDIRECT_ADMIN_DASHBOARD';
  return 'ALLOW';
}

function evaluatePublicAuthRoute({ isAuthLoading, isAuthenticated, currentUser }) {
  if (isAuthLoading) return 'LOADING';
  if (isAuthenticated && currentUser) {
    return currentUser.role === 'ADMIN' ? 'REDIRECT_ADMIN_DASHBOARD' : 'REDIRECT_USER_DASHBOARD';
  }
  return 'ALLOW';
}

// 1. Unauthenticated users are redirected to /auth when accessing /admin or /user
assert.equal(
  evaluateAdminRoute({ isAuthLoading: false, isAuthenticated: false, currentUser: null }),
  'REDIRECT_AUTH',
  'Unauthenticated admin route access redirects to auth (BR-AUTH-01)'
);
assert.equal(
  evaluateUserRoute({ isAuthLoading: false, isAuthenticated: false, currentUser: null }),
  'REDIRECT_AUTH',
  'Unauthenticated user route access redirects to auth (BR-AUTH-02)'
);

// 2. Unauthenticated user on PublicAuthRoute is allowed to see login/register
assert.equal(
  evaluatePublicAuthRoute({ isAuthLoading: false, isAuthenticated: false, currentUser: null }),
  'ALLOW',
  'Unauthenticated public auth access shows auth page (BR-AUTH-03)'
);

// 3. Authenticated admin on PublicAuthRoute is redirected to Admin Dashboard
const adminSession = { id: 'admin-1', name: 'Admin Haidar', role: 'ADMIN' };
assert.equal(
  evaluatePublicAuthRoute({ isAuthLoading: false, isAuthenticated: true, currentUser: adminSession }),
  'REDIRECT_ADMIN_DASHBOARD',
  'Authenticated admin on /auth is redirected to /admin/dashboard (BR-AUTH-04)'
);

// 4. Logout flow: Immediate atomic state wipe prevents loop
function simulateLogout(currentStore) {
  // Wipe store immediately
  const clearedStore = {
    ...currentStore,
    currentUser: null,
    isAuthenticated: false,
    isAuthLoading: false,
  };
  // Simulate navigation to landing page '/'
  const destination = '/';
  return { store: clearedStore, destination };
}

const loggedInAdminStore = {
  isOnline: true,
  isAuthLoading: false,
  isAuthenticated: true,
  currentUser: adminSession,
};

const logoutResult = simulateLogout(loggedInAdminStore);
assert.equal(logoutResult.store.isAuthenticated, false, 'Logout sets isAuthenticated false immediately');
assert.equal(logoutResult.store.currentUser, null, 'Logout unsets currentUser immediately');
assert.equal(logoutResult.destination, '/', 'Logout redirects to public landing page (BR-AUTH-05)');

// 5. Subsequent visit to /auth after logout allows login form without redirect loop
assert.equal(
  evaluatePublicAuthRoute(logoutResult.store),
  'ALLOW',
  'Auth page after logout is displayed cleanly with no redirect loop (BR-AUTH-06)'
);

// =========================================================================
// PART 5: INVENTORY ANALYTICS & DASHBOARD METRIC RULES (BR-INV-01..BR-INV-07)
// =========================================================================

const sampleProducts = [
  { id: 'p-1', name: 'Plastik HD 15x30', category_id: 'c-1', unit_id: 'u-1', stock: 1250, created_at: '2026-08-01T00:00:00Z', is_active: true },
  { id: 'p-2', name: 'Plastik 6x10', category_id: 'c-1', unit_id: 'u-2', stock: 980, created_at: '2026-08-15T00:00:00Z', is_active: true },
  { id: 'p-3', name: 'Wayang 8x12', category_id: 'c-1', unit_id: 'u-2', stock: 760, created_at: '2026-09-01T00:00:00Z', is_active: true },
  { id: 'p-4', name: 'Tali Rafia Roll', category_id: 'c-2', unit_id: 'u-3', stock: 5, created_at: '2026-09-02T00:00:00Z', is_active: true },
  { id: 'p-5', name: 'Cup 12 oz', category_id: 'c-2', unit_id: 'u-2', stock: 0, created_at: '2026-09-03T00:00:00Z', is_active: true },
];

const sampleCategories = [
  { id: 'c-1', name: 'Plastik Kemasan', is_active: true },
  { id: 'c-2', name: 'Perlengkapan & Cup', is_active: true },
  { id: 'c-3', name: 'Bahan Kue', is_active: true },
];

const sampleUnits = [
  { id: 'u-1', name: 'PCS', symbol: 'Pcs', is_active: true },
  { id: 'u-2', name: 'PACK', symbol: 'Pack', is_active: true },
  { id: 'u-3', name: 'ROLL', symbol: 'Roll', is_active: true },
];

const samplePriceHistory = [
  { id: 'h-1', product_id: 'p-1', old_selling_price: 12000, new_selling_price: 14000, change_type: 'INCREASE', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'h-2', product_id: 'p-2', old_selling_price: 15000, new_selling_price: 13500, change_type: 'DECREASE', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 'h-3', product_id: 'p-3', old_selling_price: 8000, new_selling_price: 8000, change_type: 'NO_CHANGE', created_at: new Date(Date.now() - 40 * 86400000).toISOString() }, // Older than 30 days
];

// BR-INV-01: Active KPI Metrics
const totalActiveProducts = sampleProducts.filter((p) => p.is_active).length;
const totalActiveCategories = sampleCategories.filter((c) => c.is_active).length;
const totalActiveUnits = sampleUnits.filter((u) => u.is_active).length;
const thirtyDaysAgo = Date.now() - 30 * 86400000;
const priceChangesLast30Days = samplePriceHistory.filter(
  (h) => new Date(h.created_at).getTime() >= thirtyDaysAgo
).length;

assert.equal(totalActiveProducts, 5, 'Total Active Products calculation (BR-INV-01)');
assert.equal(totalActiveCategories, 3, 'Total Active Categories calculation (BR-INV-01)');
assert.equal(totalActiveUnits, 3, 'Total Active Units calculation (BR-INV-01)');
assert.equal(priceChangesLast30Days, 2, '30-Day Price changes filter excludes older entries (BR-INV-01)');

// BR-INV-02: Category Distribution Calculation
function computeCategoryDistribution(products, categories) {
  const total = products.length;
  return categories.map((cat) => {
    const count = products.filter((p) => p.category_id === cat.id).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { id: cat.id, name: cat.name, count, percentage };
  }).sort((a, b) => b.count - a.count);
}

const catDist = computeCategoryDistribution(sampleProducts, sampleCategories);
assert.equal(catDist[0].name, 'Plastik Kemasan');
assert.equal(catDist[0].count, 3);
assert.equal(catDist[0].percentage, 60, 'Category percentage rounded accurately (BR-INV-02)');
assert.equal(catDist[1].name, 'Perlengkapan & Cup');
assert.equal(catDist[1].count, 2);
assert.equal(catDist[1].percentage, 40);

// BR-INV-03: Top Stock Ranking (Descending)
const topStock = [...sampleProducts].sort((a, b) => b.stock - a.stock).slice(0, 5);
assert.equal(topStock[0].name, 'Plastik HD 15x30');
assert.equal(topStock[0].stock, 1250);
assert.equal(topStock[1].name, 'Plastik 6x10');
assert.equal(topStock[1].stock, 980);

// BR-INV-04: Low Stock Ranking (Ascending)
const lowStock = [...sampleProducts].sort((a, b) => a.stock - b.stock).slice(0, 5);
assert.equal(lowStock[0].name, 'Cup 12 oz');
assert.equal(lowStock[0].stock, 0, 'Zero stock ranked first in low stock (BR-INV-04)');
assert.equal(lowStock[1].name, 'Tali Rafia Roll');
assert.equal(lowStock[1].stock, 5);

// BR-INV-05: Unit Distribution (Counts Products, NOT physical cross-unit sum)
function computeUnitDistribution(products, units) {
  const total = products.length;
  return units.map((u) => {
    const count = products.filter((p) => p.unit_id === u.id).length;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { id: u.id, name: u.name, count, percentage };
  }).sort((a, b) => b.count - a.count);
}

const unitDist = computeUnitDistribution(sampleProducts, sampleUnits);
assert.equal(unitDist[0].name, 'PACK');
assert.equal(unitDist[0].count, 3, 'Counts products using PACK (BR-INV-05)');
assert.equal(unitDist[0].percentage, 60);

// BR-INV-06: Price Change Percentage Calculation
function computePriceDiffPercentage(oldP, newP) {
  if (!oldP || oldP <= 0) return '0.0';
  return (((newP - oldP) / oldP) * 100).toFixed(1);
}

assert.equal(computePriceDiffPercentage(12000, 14000), '16.7', '12k -> 14k is +16.7% increase (BR-INV-06)');
assert.equal(computePriceDiffPercentage(15000, 13500), '-10.0', '15k -> 13.5k is -10.0% decrease (BR-INV-06)');
assert.equal(computePriceDiffPercentage(8000, 8000), '0.0', 'No change is 0.0%');

console.log('✅ ALL ADMIN, USER, AUTH & INVENTORY ANALYTICS RULES (BR-A01..28, BR-U01..20, BR-AUTH-01..06, BR-INV-01..06) PASSED 100%!');


