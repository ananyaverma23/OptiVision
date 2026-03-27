const router = require('express').Router();
const prisma = require('../utils/prisma');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const sid = req.storeId;
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth()-1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const [todayCount, todayRev, pending, totalCust, monthRev, lastMonthRev, lowStock, recentOrders, statusBreakdown, weekSales, topFrames, payBreakdown] = await Promise.all([
      prisma.order.count({ where: { storeId: sid, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } } }),
      prisma.order.aggregate({ where: { storeId: sid, createdAt: { gte: today, lt: tomorrow }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
      prisma.order.count({ where: { storeId: sid, status: { in: ['CREATED','LENS_ORDERED','GRINDING','FITTING','READY'] } } }),
      prisma.customer.count({ where: { storeId: sid } }),
      prisma.order.aggregate({ where: { storeId: sid, createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({ where: { storeId: sid, createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, status: { not: 'CANCELLED' } }, _sum: { totalAmount: true } }),
      prisma.$queryRaw`SELECT id, brand, model, frame_code as "frameCode", stock_qty as "stockQty", low_stock_alert as "lowStockAlert" FROM frames WHERE store_id = ${sid}::uuid AND is_active = true AND stock_qty <= low_stock_alert ORDER BY stock_qty ASC LIMIT 8`,
      prisma.order.findMany({ where: { storeId: sid }, orderBy: { createdAt: 'desc' }, take: 6, include: { customer: { select: { name: true, phone: true } } } }),
      prisma.order.groupBy({ by: ['status'], where: { storeId: sid }, _count: true }),
      prisma.$queryRaw`SELECT DATE(created_at) as date, COUNT(*)::int as orders, COALESCE(SUM(total_amount),0)::float as revenue FROM orders WHERE store_id=${sid}::uuid AND status!='CANCELLED' AND created_at>=NOW()-INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date ASC`,
      prisma.$queryRaw`SELECT f.brand, f.model, f.frame_code as "frameCode", SUM(oi.quantity)::int as "unitsSold", SUM(oi.total_price)::float as revenue FROM order_items oi JOIN frames f ON oi.frame_id=f.id JOIN orders o ON oi.order_id=o.id WHERE o.store_id=${sid}::uuid AND o.status!='CANCELLED' AND o.created_at>=NOW()-INTERVAL '30 days' GROUP BY f.id,f.brand,f.model,f.frame_code ORDER BY "unitsSold" DESC LIMIT 5`,
      prisma.order.groupBy({ by: ['paymentMethod'], where: { storeId: sid, status: { not: 'CANCELLED' }, createdAt: { gte: monthStart } }, _sum: { totalAmount: true }, _count: true }),
    ]);

    const thisMonth = monthRev._sum.totalAmount || 0;
    const lastMonth = lastMonthRev._sum.totalAmount || 0;
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1) : 0;

    res.json({ success: true, data: {
      stats: { todayOrders: todayCount, todayRevenue: todayRev._sum.totalAmount||0, pendingOrders: pending, totalCustomers: totalCust, monthRevenue: thisMonth, growth: Number(growth) },
      lowStock, recentOrders,
      ordersByStatus: statusBreakdown.reduce((a,s) => ({...a,[s.status]:s._count}),{}),
      weekSales, topFrames,
      paymentBreakdown: payBreakdown.map(p => ({ method: p.paymentMethod, total: p._sum.totalAmount||0, count: p._count }))
    }});
  } catch (e) { next(e); }
});

module.exports = router;
