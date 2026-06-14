/**
 * Comprehensive API Route Tester v2
 * Tests every backend route in sequence and reports results.
 * Run: node test-routes.js
 */

const BASE = 'http://localhost:5000/api';
let ADMIN_TOKEN = '';
let RIDER_TOKEN = '';
let TEST_USER_ID = '';
let TEST_RIDER_ID = '';
let TEST_ORDER_ID = '';
let RIDER_DOC_ID = '';

const results = [];

async function request(method, path, body = null, token = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function log(label, pass, detail = '') {
  const icon = pass ? '✅' : '❌';
  const line = `${icon} ${label}${detail ? ' — ' + detail : ''}`;
  console.log(line);
  results.push({ label, pass, detail });
}

async function run() {
  console.log('\n══════════════════════════════════════════');
  console.log('  HYPER-LOCAL DELIVERY — API ROUTE TESTS');
  console.log('══════════════════════════════════════════\n');

  // ─── 1. Health Check ──────────────────────────────────────────────────
  console.log('── 1. Health ──');
  try {
    const { status, data } = await request('GET', '/health');
    log('GET /api/health', status === 200 && data.success, `status=${status}`);
  } catch (e) {
    log('GET /api/health', false, e.message);
  }

  // ─── 2. Auth: Login with seeded admin ─────────────────────────────────
  console.log('\n── 2. Auth: Login ──');
  try {
    const { status, data } = await request('POST', '/auth/login', {
      email: 'admin@store.com',
      password: 'admin123',
    });
    const pass = (status === 200 && data.success && data.token);
    log('POST /auth/login (seeded admin)', pass, `status=${status}, role=${data.user?.role}`);
    if (pass) {
      ADMIN_TOKEN = data.token;
      TEST_USER_ID = data.user._id;
    }
  } catch (e) {
    log('POST /auth/login (seeded admin)', false, e.message);
  }

  // 2b. Login with bad credentials
  try {
    const { status, data } = await request('POST', '/auth/login', {
      email: 'nonexistent@test.com',
      password: 'wrong',
    });
    log('POST /auth/login (bad creds → 401)', status === 401, `status=${status}`);
  } catch (e) {
    log('POST /auth/login (bad creds → 401)', false, e.message);
  }

  // 2c. Login with missing fields
  try {
    const { status } = await request('POST', '/auth/login', {});
    log('POST /auth/login (empty → 400)', status === 400, `status=${status}`);
  } catch (e) {
    log('POST /auth/login (empty → 400)', false, e.message);
  }

  // ─── 3. Auth: Register ────────────────────────────────────────────────
  console.log('\n── 3. Auth: Register ──');
  const ts = Date.now();

  // 3a. Register admin
  try {
    const { status, data } = await request('POST', '/auth/register', {
      name: 'Test Admin',
      email: `testadmin_${ts}@test.com`,
      password: 'password123',
      role: 'admin',
    });
    log('POST /auth/register (admin)', status === 201 && data.success && data.token, `status=${status}`);
  } catch (e) {
    log('POST /auth/register (admin)', false, e.message);
  }

  // 3b. Register rider with phone
  try {
    const { status, data } = await request('POST', '/auth/register', {
      name: 'Test Rider2',
      email: `testrider2_${ts}@test.com`,
      password: 'password123',
      role: 'rider',
      phone: '9876543210',
      vehicleType: 'bike',
    });
    const pass = status === 201 && data.success && data.rider;
    log('POST /auth/register (rider+phone)', pass, `status=${status}`);
    if (pass) RIDER_TOKEN = data.token;
  } catch (e) {
    log('POST /auth/register (rider+phone)', false, e.message);
  }

  // 3c. Register rider WITHOUT phone (should fail)
  try {
    const { status, data } = await request('POST', '/auth/register', {
      name: 'No Phone Rider',
      email: `nophone_${ts}@test.com`,
      password: 'password123',
      role: 'rider',
    });
    log('POST /auth/register (rider no phone → 400)', status === 400, `status=${status}, msg=${data.message}`);
  } catch (e) {
    log('POST /auth/register (rider no phone → 400)', false, e.message);
  }

  // 3d. Register with missing fields
  try {
    const { status } = await request('POST', '/auth/register', { email: 'x@y.com' });
    log('POST /auth/register (missing fields → 400)', status === 400, `status=${status}`);
  } catch (e) {
    log('POST /auth/register (missing fields → 400)', false, e.message);
  }

  // ─── 4. Auth: Get Me ──────────────────────────────────────────────────
  console.log('\n── 4. Auth: Get Me ──');
  try {
    const { status } = await request('GET', '/auth/me');
    log('GET /auth/me (no token → 401)', status === 401, `status=${status}`);
  } catch (e) {
    log('GET /auth/me (no token → 401)', false, e.message);
  }
  try {
    const { status, data } = await request('GET', '/auth/me', null, ADMIN_TOKEN);
    log('GET /auth/me (with token)', status === 200 && data.success && data.user, `status=${status}, email=${data.user?.email}`);
  } catch (e) {
    log('GET /auth/me (with token)', false, e.message);
  }

  // ─── 5. Riders ────────────────────────────────────────────────────────
  console.log('\n── 5. Riders ──');

  try {
    const { status, data } = await request('GET', '/riders', null, ADMIN_TOKEN);
    const pass = status === 200 && data.success && Array.isArray(data.riders);
    log('GET /riders', pass, `status=${status}, count=${data.count}`);
    if (pass && data.riders.length > 0) RIDER_DOC_ID = data.riders[0]._id;
  } catch (e) {
    log('GET /riders', false, e.message);
  }

  if (RIDER_DOC_ID) {
    try {
      const { status, data } = await request('GET', `/riders/${RIDER_DOC_ID}`, null, ADMIN_TOKEN);
      log('GET /riders/:id', status === 200 && data.success, `status=${status}, name=${data.rider?.name}`);
    } catch (e) {
      log('GET /riders/:id', false, e.message);
    }

    try {
      const { status, data } = await request('PUT', `/riders/${RIDER_DOC_ID}/location`, { lat: 28.6139, lng: 77.2090 }, ADMIN_TOKEN);
      log('PUT /riders/:id/location', status === 200 && data.success, `status=${status}`);
    } catch (e) {
      log('PUT /riders/:id/location', false, e.message);
    }

    try {
      const { status, data } = await request('PUT', `/riders/${RIDER_DOC_ID}/toggle-online`, {}, ADMIN_TOKEN);
      log('PUT /riders/:id/toggle-online', status === 200 && data.success, `status=${status}, isOnline=${data.rider?.isOnline}`);
    } catch (e) {
      log('PUT /riders/:id/toggle-online', false, e.message);
    }

    try {
      const { status, data } = await request('GET', `/riders/${RIDER_DOC_ID}/earnings`, null, ADMIN_TOKEN);
      log('GET /riders/:id/earnings', status === 200 && data.success, `status=${status}, total=${data.earnings?.totalEarnings}`);
    } catch (e) {
      log('GET /riders/:id/earnings', false, e.message);
    }
  }

  // ─── 6. Orders ────────────────────────────────────────────────────────
  console.log('\n── 6. Orders ──');

  // 6a. Create order (with proper items objects matching orderItemSchema)
  try {
    const { status, data } = await request('POST', '/orders', {
      customerName: 'John Doe',
      customerPhone: '9876543210',
      deliveryAddress: '123 Test Street, Delhi',
      deliveryLat: 28.6139,
      deliveryLng: 77.2090,
      items: [
        { name: 'Milk', quantity: 2, price: 60 },
        { name: 'Bread', quantity: 1, price: 45 },
      ],
      amount: 165,
      notes: 'Ring doorbell twice',
    }, ADMIN_TOKEN);
    const pass = status === 201 && data.success && data.order;
    log('POST /orders (create)', pass, `status=${status}, orderNumber=${data.order?.orderNumber}`);
    if (pass) TEST_ORDER_ID = data.order._id;
  } catch (e) {
    log('POST /orders (create)', false, e.message);
  }

  // 6b. Create order with missing required fields (should fail)
  try {
    const { status } = await request('POST', '/orders', { customerName: 'Half' }, ADMIN_TOKEN);
    log('POST /orders (missing fields → 400)', status === 400, `status=${status}`);
  } catch (e) {
    log('POST /orders (missing fields → 400)', false, e.message);
  }

  // 6c. Create order as rider (should fail - admin only)
  if (RIDER_TOKEN) {
    try {
      const { status } = await request('POST', '/orders', {
        customerName: 'X', customerPhone: '123', deliveryAddress: 'Y', amount: 1
      }, RIDER_TOKEN);
      log('POST /orders (rider → 403)', status === 403, `status=${status}`);
    } catch (e) {
      log('POST /orders (rider → 403)', false, e.message);
    }
  }

  // 6d. List orders
  try {
    const { status, data } = await request('GET', '/orders', null, ADMIN_TOKEN);
    const pass = status === 200 && data.success && Array.isArray(data.orders);
    log('GET /orders', pass, `status=${status}, count=${data.count}`);
    if (!TEST_ORDER_ID && data.orders?.length > 0) TEST_ORDER_ID = data.orders[0]._id;
  } catch (e) {
    log('GET /orders', false, e.message);
  }

  // 6e. Get order stats
  try {
    const { status, data } = await request('GET', '/orders/stats', null, ADMIN_TOKEN);
    const pass = status === 200 && data.success && data.stats;
    log('GET /orders/stats', pass, `status=${status}, totalOrders=${data.stats?.totalOrders}, revenue=${data.stats?.totalRevenue}`);
  } catch (e) {
    log('GET /orders/stats', false, e.message);
  }

  // 6f. Get single order
  if (TEST_ORDER_ID) {
    try {
      const { status, data } = await request('GET', `/orders/${TEST_ORDER_ID}`, null, ADMIN_TOKEN);
      log('GET /orders/:id', status === 200 && data.success, `status=${status}`);
    } catch (e) {
      log('GET /orders/:id', false, e.message);
    }
  }

  // 6g. Assign rider to order
  if (TEST_ORDER_ID && RIDER_DOC_ID) {
    try {
      const { status, data } = await request('PUT', `/orders/${TEST_ORDER_ID}/assign`, { riderId: RIDER_DOC_ID }, ADMIN_TOKEN);
      log('PUT /orders/:id/assign', status === 200 && data.success, `status=${status}, riderName=${data.order?.assignedRider?.name}`);
    } catch (e) {
      log('PUT /orders/:id/assign', false, e.message);
    }
  }

  // 6h-j. Status lifecycle: dispatched → in-transit → delivered
  if (TEST_ORDER_ID) {
    for (const s of ['dispatched', 'in-transit', 'delivered']) {
      try {
        const { status, data } = await request('PUT', `/orders/${TEST_ORDER_ID}/status`, { status: s }, ADMIN_TOKEN);
        log(`PUT /orders/:id/status (${s})`, status === 200 && data.success, `status=${status}`);
      } catch (e) {
        log(`PUT /orders/:id/status (${s})`, false, e.message);
      }
    }
  }

  // 6k. Invalid status
  if (TEST_ORDER_ID) {
    try {
      const { status } = await request('PUT', `/orders/${TEST_ORDER_ID}/status`, { status: 'flying' }, ADMIN_TOKEN);
      log('PUT /orders/:id/status (invalid → 400)', status === 400, `status=${status}`);
    } catch (e) {
      log('PUT /orders/:id/status (invalid → 400)', false, e.message);
    }
  }

  // 6l. Filter by status
  try {
    const { status, data } = await request('GET', '/orders?status=pending', null, ADMIN_TOKEN);
    log('GET /orders?status=pending', status === 200 && data.success, `status=${status}, count=${data.count}`);
  } catch (e) {
    log('GET /orders?status=pending', false, e.message);
  }

  // ─── 7. 404 handling ──────────────────────────────────────────────────
  console.log('\n── 7. Edge Cases ──');
  try {
    const { status, data } = await request('GET', '/nonexistent');
    log('GET /api/nonexistent (→ 404)', status === 404, `status=${status}, msg=${data.message}`);
  } catch (e) {
    log('GET /api/nonexistent (→ 404)', false, e.message);
  }

  // Protected routes without auth
  try {
    const { status } = await request('GET', '/orders');
    log('GET /orders (no token → 401)', status === 401, `status=${status}`);
  } catch (e) {
    log('GET /orders (no token → 401)', false, e.message);
  }

  try {
    const { status } = await request('GET', '/riders');
    log('GET /riders (no token → 401)', status === 401, `status=${status}`);
  } catch (e) {
    log('GET /riders (no token → 401)', false, e.message);
  }

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;
  console.log(`  RESULTS: ${passed} passed, ${failed} failed out of ${results.length} tests`);
  if (failed > 0) {
    console.log('\n  FAILURES:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`    ❌ ${r.label}: ${r.detail}`);
    });
  } else {
    console.log('  🎉 ALL TESTS PASSED!');
  }
  console.log('══════════════════════════════════════════\n');

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
