/**
 * Remap orphaned product IDs in JSON line items (sales, orders, returns, purchases)
 * after products were deleted and re-imported with new UUIDs.
 *
 * Matching order (first wins):
 *   1. SKU (case-insensitive, trimmed) — products & product_variants
 *   2. Barcode — products & product_variants
 *   3. Normalized product name — only when exactly one live product OR variant matches
 *
 * Usage (from backend/):
 *   DRY_RUN=true node scripts/remapOrphanedProductReferences.js    # default: preview only
 *   DRY_RUN=false node scripts/remapOrphanedProductReferences.js  # apply updates
 *
 * Env:
 *   DRY_RUN — default true
 *   MATCH_BY_NAME — default true (set false to only use SKU/barcode)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/postgres');
const logger = require('../utils/logger');

const DRY_RUN = String(process.env.DRY_RUN ?? 'true').toLowerCase() !== 'false';
const MATCH_BY_NAME = String(process.env.MATCH_BY_NAME ?? 'true').toLowerCase() !== 'false';

function normalizeName(s) {
  if (s == null || s === '') return '';
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function extractId(item) {
  const p = item.product ?? item.product_id;
  if (p == null || p === '') return null;
  if (typeof p === 'object') {
    const id = p._id ?? p.id;
    return id != null ? String(id).trim() : null;
  }
  return String(p).trim();
}

function extractSku(item) {
  const s =
    item.sku ??
    item.productSku ??
    item.product_sku ??
    (typeof item.product === 'object' && item.product ? item.product.sku : null);
  if (s == null || String(s).trim() === '') return null;
  return String(s).trim();
}

function extractBarcode(item) {
  const b =
    item.barcode ??
    item.productBarcode ??
    item.product_barcode ??
    (typeof item.product === 'object' && item.product ? item.product.barcode : null);
  if (b == null || String(b).trim() === '') return null;
  return String(b).trim();
}

function extractDisplayName(item) {
  const n =
    item.name ??
    item.productName ??
    item.product_name ??
    (typeof item.product === 'object' && item.product ? item.product.name : null);
  if (n == null || String(n).trim() === '') return null;
  return String(n).trim();
}

async function loadExistingIds() {
  const [prow, vrow] = await Promise.all([
    query(`SELECT id::text FROM products`),
    query(`SELECT id::text FROM product_variants`)
  ]);
  const set = new Set();
  for (const r of prow.rows || []) set.add(r.id);
  for (const r of vrow.rows || []) set.add(r.id);
  return set;
}

/**
 * Build lookup maps for current catalog (live products and variants).
 */
async function buildLookupMaps() {
  const skuMap = new Map();
  const barcodeMap = new Map();

  const pRes = await query(`
    SELECT id::text AS id, name, sku, barcode
    FROM products
    WHERE (is_deleted = FALSE OR is_deleted IS NULL)
  `);
  const vRes = await query(`
    SELECT id::text AS id,
           COALESCE(NULLIF(TRIM(display_name), ''), NULLIF(TRIM(variant_name), ''), '') AS name,
           sku, barcode
    FROM product_variants
    WHERE deleted_at IS NULL
  `);

  const register = (row, kind) => {
    const id = row.id;
    const display = row.name || '';

    if (row.sku && String(row.sku).trim()) {
      const key = String(row.sku).trim().toLowerCase();
      if (!skuMap.has(key)) skuMap.set(key, { id, name: display, sku: row.sku, kind });
    }
    if (row.barcode && String(row.barcode).trim()) {
      const bk = String(row.barcode).trim().toLowerCase();
      if (!barcodeMap.has(bk)) barcodeMap.set(bk, { id, name: display, sku: row.sku, kind });
    }
  };

  for (const row of pRes.rows || []) register(row, 'product');
  for (const row of vRes.rows || []) register(row, 'variant');

  const allRows = [
    ...(pRes.rows || []).map((r) => ({ ...r, _kind: 'product' })),
    ...(vRes.rows || []).map((r) => ({ ...r, _kind: 'variant' }))
  ];
  const nameCount = new Map();
  for (const r of allRows) {
    const nn = normalizeName(r.name || '');
    if (!nn) continue;
    nameCount.set(nn, (nameCount.get(nn) || 0) + 1);
  }
  const uniqueNames = new Map();
  for (const r of allRows) {
    const nn = normalizeName(r.name || '');
    if (!nn || nameCount.get(nn) !== 1) continue;
    uniqueNames.set(nn, {
      id: r.id,
      name: r.name,
      sku: r.sku,
      kind: r._kind
    });
  }

  return { skuMap, barcodeMap, uniqueNames };
}

function resolveMatch(item, maps) {
  const sku = extractSku(item);
  if (sku) {
    const m = maps.skuMap.get(sku.toLowerCase());
    if (m) return { ...m, via: 'sku' };
  }
  const bc = extractBarcode(item);
  if (bc) {
    const m = maps.barcodeMap.get(bc.toLowerCase());
    if (m) return { ...m, via: 'barcode' };
  }
  if (MATCH_BY_NAME) {
    const raw = extractDisplayName(item);
    if (raw && raw.toUpperCase() !== 'UNKNOWN PRODUCT') {
      const nn = normalizeName(raw);
      const m = maps.uniqueNames.get(nn);
      if (m) return { ...m, via: 'name' };
    }
  }
  return null;
}

function applyRemapToItem(item, newId, meta) {
  const next = { ...item };
  next.product = newId;
  if (next.product_id != null) next.product_id = newId;
  if (typeof next.product === 'object') {
    next.product = newId;
  }
  if (meta.name) next.name = meta.name;
  if (meta.sku != null) next.sku = meta.sku;
  return next;
}

function remapItemsArray(items, existingIds, maps, logPrefix) {
  if (!Array.isArray(items)) return { changed: false, items, reports: [] };
  const reports = [];
  let changed = false;
  const next = items.map((item, idx) => {
    const oldId = extractId(item);
    if (!oldId) return item;
    if (existingIds.has(oldId)) return item;

    const match = resolveMatch(item, maps);
    if (!match) {
      reports.push({
        index: idx,
        oldId,
        ok: false,
        reason: 'no match (need sku, barcode, or unique name in catalog)'
      });
      return item;
    }

    reports.push({
      index: idx,
      oldId,
      newId: match.id,
      via: match.via,
      kind: match.kind
    });
    changed = true;
    return applyRemapToItem(item, match.id, { name: match.name, sku: match.sku });
  });

  return { changed, items: next, reports };
}

const TABLES = [
  { table: 'sales', idCol: 'id', labelCol: 'order_number', itemsCol: 'items' },
  { table: 'sales_orders', idCol: 'id', labelCol: 'so_number', itemsCol: 'items' },
  { table: 'returns', idCol: 'id', labelCol: 'return_number', itemsCol: 'items' },
  { table: 'purchase_invoices', idCol: 'id', labelCol: 'invoice_number', itemsCol: 'items' },
  { table: 'purchase_orders', idCol: 'id', labelCol: 'po_number', itemsCol: 'items' }
];

async function run() {
  logger.info(`remapOrphanedProductReferences: DRY_RUN=${DRY_RUN} MATCH_BY_NAME=${MATCH_BY_NAME}`);

  const existingIds = await loadExistingIds();
  const maps = await buildLookupMaps();

  let totalRows = 0;
  let totalUpdates = 0;

  for (const def of TABLES) {
    const res = await query(`SELECT ${def.idCol} AS row_id, ${def.labelCol} AS label, ${def.itemsCol} AS items FROM ${def.table}`);
    for (const row of res.rows || []) {
      totalRows++;
      let items = row.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch {
          logger.warn(`Skip ${def.table} ${row.label}: invalid JSON items`);
          continue;
        }
      }
      const { changed, items: newItems, reports } = remapItemsArray(
        items,
        existingIds,
        maps,
        `${def.table}:${row.label}`
      );

      const failures = reports.filter((r) => r && r.ok === false);
      const successes = reports.filter((r) => r && r.newId);

      for (const s of successes) {
        logger.info(
          `[${def.table}] ${row.label} item[${s.index}] ${s.oldId} -> ${s.newId} (${s.via}, ${s.kind})`
        );
      }
      for (const f of failures) {
        logger.warn(
          `[${def.table}] ${row.label} item[${f.index}] orphan id ${f.oldId}: ${f.reason}`
        );
      }

      if (changed) {
        totalUpdates++;
        if (!DRY_RUN) {
          await query(`UPDATE ${def.table} SET ${def.itemsCol} = $1, updated_at = CURRENT_TIMESTAMP WHERE ${def.idCol} = $2`, [
            JSON.stringify(newItems),
            row.row_id
          ]);
        }
      }
    }
  }

  logger.info(
    `Done. Rows scanned: ${totalRows}. Rows ${DRY_RUN ? 'to update (dry run)' : 'updated'}: ${totalUpdates}.`
  );
  if (DRY_RUN) {
    logger.info('Set DRY_RUN=false to apply changes.');
  }
  process.exit(0);
}

run().catch((err) => {
  logger.error('remapOrphanedProductReferences failed:', err);
  process.exit(1);
});
