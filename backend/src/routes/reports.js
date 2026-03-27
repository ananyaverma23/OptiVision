const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/sales', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const dateFrom = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate()-30));
    const dateTo = to ? new Date(to+'T23:59:59') : new Date();
    const [sales, summary] = await Promise.all([
      prisma.$queryRaw`SELECT DATE(created_at) as date, COUNT(*)::int as orders, COALESCE(SUM(total_amount),0)::float as revenue, COALESCE(SUM(discount_amount),0)::float as discounts, COALESCE(SUM(tax_amount),0)::float as tax FROM orders WHERE store_id=${req.storeId}::uuid AND status!='CANCELLED' AND created_at BETWEEN ${dateFrom} AND ${dateTo} GROUP BY DATE(created_at) ORDER BY date ASC`,
      prisma.order.aggregate({ where: { storeId: req.storeId, status: { not: 'CANCELLED' }, createdAt: { gte: dateFrom, lte: dateTo } }, _sum: { totalAmount: true, discountAmount: true, taxAmount: true }, _count: true, _avg: { totalAmount: true } })
    ]);
    res.json({ success: true, data: { sales, summary } });
  } catch (e) { next(e); }
});

router.get('/frames', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const dateFrom = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate()-30));
    const dateTo = to ? new Date(to+'T23:59:59') : new Date();
    const data = await prisma.$queryRaw`SELECT f.brand, f.model, f.frame_code as "frameCode", f.selling_price as price, SUM(oi.quantity)::int as "unitsSold", SUM(oi.total_price)::float as revenue, SUM(oi.total_price - oi.quantity*f.purchase_price)::float as profit FROM order_items oi JOIN frames f ON oi.frame_id=f.id JOIN orders o ON oi.order_id=o.id WHERE o.store_id=${req.storeId}::uuid AND o.status!='CANCELLED' AND o.created_at BETWEEN ${dateFrom} AND ${dateTo} GROUP BY f.id,f.brand,f.model,f.frame_code,f.selling_price,f.purchase_price ORDER BY "unitsSold" DESC`;
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/customers', async (req, res, next) => {
  try {
    const data = await prisma.$queryRaw`SELECT c.id, c.name, c.phone, c.email, COUNT(o.id)::int as "totalOrders", COALESCE(SUM(o.total_amount),0)::float as "totalSpent", MAX(o.created_at) as "lastOrder" FROM customers c LEFT JOIN orders o ON c.id=o.customer_id AND o.status!='CANCELLED' WHERE c.store_id=${req.storeId}::uuid GROUP BY c.id,c.name,c.phone,c.email ORDER BY "totalSpent" DESC NULLS LAST LIMIT 20`;
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

router.get('/profit', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const dateFrom = from ? new Date(from) : new Date(new Date().setDate(new Date().getDate()-30));
    const dateTo = to ? new Date(to+'T23:59:59') : new Date();
    const data = await prisma.$queryRaw`SELECT COALESCE(SUM(o.total_amount),0)::float as "totalRevenue", COALESCE(SUM(o.tax_amount),0)::float as "totalTax", COALESCE(SUM(o.discount_amount),0)::float as "totalDiscounts", COALESCE(SUM(CASE WHEN oi.frame_id IS NOT NULL THEN oi.quantity*(oi.unit_price-f.purchase_price) WHEN oi.lens_id IS NOT NULL THEN oi.quantity*(oi.unit_price-l.purchase_price) ELSE oi.total_price END),0)::float as "grossProfit" FROM orders o JOIN order_items oi ON o.id=oi.order_id LEFT JOIN frames f ON oi.frame_id=f.id LEFT JOIN lenses l ON oi.lens_id=l.id WHERE o.store_id=${req.storeId}::uuid AND o.status!='CANCELLED' AND o.created_at BETWEEN ${dateFrom} AND ${dateTo}`;
    res.json({ success: true, data: data[0] });
  } catch (e) { next(e); }
});

module.exports = router;
