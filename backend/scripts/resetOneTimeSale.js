const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../config/postgres');

async function resetOneTimeSaleCustomer() {
  try {
    console.log('Starting reset of "One Time Sale" customer...');

    // 1. Find the customer
    const customers = await query(
      `SELECT * FROM customers WHERE business_name ILIKE $1 AND is_deleted = FALSE`,
      ['%One Time Sale%']
    );

    if (customers.rows.length === 0) {
      console.log('No customer found with business name matching "One Time Sale"');
      return;
    }

    const customer = customers.rows[0];
    const customerId = customer.id;
    console.log(`Found customer: ${customer.business_name} (ID: ${customerId})`);

    // 2. Find associated Sales to link to Payments
    const salesResult = await query(
      `SELECT id FROM sales WHERE customer_id = $1`,
      [customerId]
    );
    const salesIds = salesResult.rows.map(row => row.id);
    console.log(`Found ${salesIds.length} sales.`);

    // 3. Delete Payments linked to these sales
    if (salesIds.length > 0) {
      const deletePaymentsQuery = `DELETE FROM payments WHERE order_id = ANY($1::uuid[])`;
      const paymentResult = await query(deletePaymentsQuery, [salesIds]);
      console.log(`Deleted ${paymentResult.rowCount} payments.`);
    }

    // 4. Remove account ledger entries for this customer (affects ledger balances)
    const ledgerAccountCodesResult = await query(
      `SELECT DISTINCT account_code
       FROM account_ledger
       WHERE customer_id = $1
          OR order_id = ANY($2::uuid[])
          OR reference_id = ANY($2::uuid[])`,
      [customerId, salesIds]
    );
    const ledgerAccountCodes = ledgerAccountCodesResult.rows.map(r => r.account_code).filter(Boolean);

    const deleteLedgerQuery = `
      DELETE FROM account_ledger
      WHERE customer_id = $1
         OR order_id = ANY($2::uuid[])
         OR reference_id = ANY($2::uuid[])
    `;
    const ledgerDeleteResult = await query(deleteLedgerQuery, [customerId, salesIds]);
    console.log(`Deleted ${ledgerDeleteResult.rowCount} ledger entries.`);

    // Recalculate account balances for affected accounts
    for (const accountCode of ledgerAccountCodes) {
      await query(
        `UPDATE chart_of_accounts 
         SET current_balance = (
           SELECT opening_balance + COALESCE(SUM(
             CASE 
               WHEN normal_balance = 'debit' THEN (ledger.debit_amount - ledger.credit_amount)
               ELSE (ledger.credit_amount - ledger.debit_amount)
             END
           ), 0)
           FROM account_ledger ledger
           WHERE ledger.account_code = chart_of_accounts.account_code
             AND ledger.status = 'completed'
             AND ledger.reversed_at IS NULL
         )
         WHERE account_code = $1`,
        [accountCode]
      );
    }

    // 5. Soft Delete Sales
    const deleteSalesQuery = `UPDATE sales SET deleted_at = CURRENT_TIMESTAMP WHERE customer_id = $1 AND deleted_at IS NULL`;
    const salesDeleteResult = await query(deleteSalesQuery, [customerId]);
    console.log(`Soft deleted ${salesDeleteResult.rowCount} sales.`);

    // 6. Soft Delete Sales Orders
    const deleteSOQuery = `UPDATE sales_orders SET deleted_at = CURRENT_TIMESTAMP WHERE customer_id = $1 AND deleted_at IS NULL`;
    const soDeleteResult = await query(deleteSOQuery, [customerId]);
    console.log(`Soft deleted ${soDeleteResult.rowCount} sales orders.`);

    // 7. Soft Delete Returns
    const deleteReturnsQuery = `UPDATE returns SET deleted_at = CURRENT_TIMESTAMP WHERE customer_id = $1 AND deleted_at IS NULL`;
    const returnsDeleteResult = await query(deleteReturnsQuery, [customerId]);
    console.log(`Soft deleted ${returnsDeleteResult.rowCount} returns.`);

    // 8. Hard Delete Customer Transactions
    const deleteTxnQuery = `DELETE FROM customer_transactions WHERE customer_id = $1`;
    const txnDeleteResult = await query(deleteTxnQuery, [customerId]);
    console.log(`Deleted ${txnDeleteResult.rowCount} customer transactions.`);

    // 9. Reset Customer Balances
    const updateCustomerQuery = `
      UPDATE customers 
      SET 
        opening_balance = 0,
        current_balance = 0,
        pending_balance = 0,
        advance_balance = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const updateResult = await query(updateCustomerQuery, [customerId]);
    const updatedCustomer = updateResult.rows[0];

    console.log('Customer balances reset successfully:');
    console.log({
      id: updatedCustomer.id,
      business_name: updatedCustomer.business_name,
      opening_balance: updatedCustomer.opening_balance,
      current_balance: updatedCustomer.current_balance,
      pending_balance: updatedCustomer.pending_balance,
      advance_balance: updatedCustomer.advance_balance
    });

    console.log('Reset complete.');

  } catch (error) {
    console.error('Error resetting customer:', error);
  } finally {
    process.exit();
  }
}

resetOneTimeSaleCustomer();
