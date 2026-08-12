import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Target,
  BarChart2,
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [allOrders, setAllOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  
  // Filter States
  const [dateRange, setDateRange] = useState('6m'); // '7d', '30d', '6m', 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Display States
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [customerInsights, setCustomerInsights] = useState([]);

  useEffect(() => {
    fetchRawData();
  }, []);

  useEffect(() => {
    if (allOrders.length > 0 || !loading) {
      processData();
    }
  }, [allOrders, dateRange, customStart, customEnd, loading]);

  const fetchRawData = async () => {
    try {
      setLoading(true);
      
      const data = await api.analytics.get();

      const pMap = {};
      if (data.products) {
        data.products.forEach(p => {
          pMap[p.id] = p;
          pMap[p.name] = p; 
        });
      }

      setAllOrders(data.orders || []);
      setProductMap(pMap);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = () => {
    // 1. Filter Orders by Date
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(); 
    endDate.setHours(23, 59, 59, 999);
    let groupBy = 'day'; // 'day' or 'month'

    if (dateRange === '7d') {
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === '30d') {
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    } else if (dateRange === '6m') {
      startDate.setMonth(now.getMonth() - 6);
      startDate.setHours(0, 0, 0, 0);
      groupBy = 'month';
    } else if (dateRange === 'custom') {
      if (!customStart) {
        startDate = new Date(0); // Beginning of time if no start selected
      } else {
        startDate = new Date(customStart);
      }
      
      if (customEnd) {
        endDate = new Date(customEnd);
        endDate.setHours(23, 59, 59, 999);
      }
      
      // If range > 90 days, maybe group by month? Let's stick to day for custom unless very large range
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 60) groupBy = 'month';
    }

    const filteredOrders = allOrders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // 2. Calculate Stats
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const totalOrders = filteredOrders.length;
    const uniqueCustomers = new Set(filteredOrders.map(o => o.user_email).filter(Boolean)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers: uniqueCustomers,
      averageOrderValue
    });

    // 3. Revenue Chart Data
    let chartData = [];
    if (groupBy === 'day') {
      // Generate days between start and end (cap at last 30 if using 'custom' with huge range, or standard 7/30)
      const daysMap = {};
      
      // Initialize map with dates to ensure continuous axis
      // Simple loop from startDate to endDate
      let loopDate = new Date(startDate);
      // Avoid infinite loop if start date is invalid or too far back (safety cap 365 days for daily view)
      let safetyCounter = 0;
      while (loopDate <= endDate && safetyCounter < 365) { 
        const key = loopDate.toISOString().split('T')[0];
        daysMap[key] = 0;
        loopDate.setDate(loopDate.getDate() + 1);
        safetyCounter++;
      }
      
      // Fill data
      filteredOrders.forEach(o => {
        const key = new Date(o.created_at).toISOString().split('T')[0];
         // Only count if within our generated range 
         // (filteredOrders logic already ensures this, but safety check for edge cases)
        if (daysMap[key] !== undefined) {
           daysMap[key] += (parseFloat(o.total_amount) || 0);
        }
      });

      chartData = Object.keys(daysMap).map(date => ({
        label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: daysMap[date]
      }));
    } else {
      // Function to get Month-Year key
      const getMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthsMap = {};
      let loopDate = new Date(startDate);
      loopDate.setDate(1); // Start at beginning of month

      // Initialize months
      let safetyCounter = 0;
      while (loopDate <= endDate && safetyCounter < 60) {
         monthsMap[getMonthKey(loopDate)] = 0;
         loopDate.setMonth(loopDate.getMonth() + 1);
         safetyCounter++;
      }

      filteredOrders.forEach(o => {
         const d = new Date(o.created_at);
         const key = getMonthKey(d);
         if (monthsMap[key] !== undefined) {
            monthsMap[key] += (parseFloat(o.total_amount) || 0);
         }
      });

      chartData = Object.keys(monthsMap).map(key => {
         const [y, m] = key.split('-');
         const d = new Date(y, m - 1);
         return {
            label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            value: monthsMap[key]
         };
      });
    }
    setRevenueData(chartData);

    // 4. Products & Categories (Based on Filtered Orders)
    const productSales = {};
    const catSales = {};

    filteredOrders.forEach(order => {
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach(item => {
           const quantity = item.quantity || 0;
           const price = item.price || 0;
           const revenue = price * quantity;
           const productName = item.product_name || 'Unknown Product';
           
           if (!productSales[productName]) productSales[productName] = { name: productName, sold: 0, revenue: 0 };
           productSales[productName].sold += quantity;
           productSales[productName].revenue += revenue;

           let categoryName = 'Uncategorized';
           let productInfo = productMap[item.product_id] || productMap[productName];
           if (productInfo && productInfo.category) categoryName = productInfo.category.name || 'Uncategorized';

           if (!catSales[categoryName]) catSales[categoryName] = { name: categoryName, value: 0 };
           catSales[categoryName].value += revenue;
        });
      }
    });

    setTopProducts(Object.values(productSales).sort((a, b) => b.sold - a.sold).slice(0, 5));
    setCategorySales(Object.values(catSales).sort((a, b) => b.value - a.value));

    // 5. Customers
    const customerSpend = {};
    filteredOrders.forEach(order => {
      const email = order.user_email || 'Guest';
      if (!customerSpend[email]) customerSpend[email] = { email, totalSpent: 0, ordersCount: 0 };
      customerSpend[email].totalSpent += (parseFloat(order.total_amount) || 0);
      customerSpend[email].ordersCount += 1;
    });
    setCustomerInsights(Object.values(customerSpend).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5));
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500">Overview of your store's performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2">
           <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
             {['7d', '30d', '6m', 'custom'].map((range) => (
                <button
                   key={range}
                   onClick={() => setDateRange(range)}
                   className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      dateRange === range ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                   }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '6m' ? '6 Months' : 'Custom'}
                </button>
             ))}
           </div>
           
           {dateRange === 'custom' && (
             <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-xl border border-gray-100 shadow-sm">
                <input 
                  type="date" 
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="text-xs border-none outline-none text-gray-600 font-medium bg-transparent"
                />
                <span className="text-gray-300">-</span>
                <input 
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)} 
                  className="text-xs border-none outline-none text-gray-600 font-medium bg-transparent"
                />
             </div>
           )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={dateRange === '7d' ? "+-" : null} 
          trendUp={true}
          color="bg-emerald-50 dark:bg-emerald-955/20 text-emerald-650 dark:text-emerald-400"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          trend={null} 
          trendUp={true}
          color="bg-blue-50 dark:bg-blue-955/20 text-blue-600 dark:text-blue-400"
        />
         <StatCard 
          title="Avg. Order Value" 
          value={`₹${Math.round(stats.averageOrderValue).toLocaleString()}`} 
          icon={Target} 
          trend={null} 
          trendUp={false}
          color="bg-purple-50 dark:bg-purple-955/20 text-purple-650 dark:text-purple-400"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers} 
          icon={Users} 
          trend={null}
          trendUp={true}
          color="bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 size={18} className="text-gray-400" />
              Revenue Trend
            </h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto pb-2">
            {revenueData.length > 0 ? revenueData.map((data, i) => {
              const maxVal = Math.max(...revenueData.map(d => d.value), 1);
              const height = (data.value / maxVal) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[30px] w-full group">
                  <div className="relative w-full max-w-[40px] bg-gray-50 rounded-t-lg h-full flex items-end overflow-hidden group-hover:bg-gray-100 transition-colors">
                     <div 
                        className="w-full bg-primary/80 rounded-t-lg transition-all duration-500 group-hover:bg-primary"
                        style={{ height: `${height}%` }}
                     />
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        ₹{data.value.toLocaleString()}
                        <div className="text-[9px] text-gray-400">{data.label}</div>
                     </div>
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium whitespace-nowrap rotate-0 sm:rotate-0">
                    {data.label.split(',')[0]}
                  </span>
                </div>
              );
            }) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No revenue data for this period
              </div>
            )}
          </div>
        </div>

        {/* Product & Category Lists */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Package size={18} className="text-gray-400" />
            Sales by Category
          </h3>
          <div className="space-y-4">
             {categorySales.map((cat, i) => {
               const total = categorySales.reduce((sum, c) => sum + c.value, 0);
               const percent = total > 0 ? (cat.value / total) * 100 : 0;
               return (
                 <div key={i}>
                   <div className="flex items-center justify-between text-sm mb-1">
                     <span className="font-medium text-gray-700">{cat.name}</span>
                     <span className="text-gray-500">{Math.round(percent)}%</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                     />
                   </div>
                   <p className="text-[10px] text-gray-400 mt-1 text-right">₹{cat.value.toLocaleString()}</p>
                 </div>
               );
             })}
             {categorySales.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No sales data yet</p>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
             <TrendingUp size={18} className="text-gray-400" />
             Top Selling Products
           </h3>
           <div className="space-y-3">
             {topProducts.map((product, i) => (
               <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                 <div className="flex items-center gap-3">
                   <span className="w-6 h-6 flex items-center justify-center bg-gray-100 text-xs font-bold text-gray-500 rounded-full">
                     {i + 1}
                   </span>
                   <div>
                     <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                     <p className="text-[11px] text-gray-400">{product.sold} units sold</p>
                   </div>
                 </div>
                 <span className="text-sm font-bold text-gray-700">₹{product.revenue.toLocaleString()}</span>
               </div>
             ))}
              {topProducts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No product data available</p>
             )}
           </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
           <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
             <Users size={18} className="text-gray-400" />
             Top Customers
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm item-center text-left">
                <thead className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium text-center">Orders</th>
                    <th className="pb-2 font-medium text-right">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customerInsights.map((customer, i) => (
                    <tr key={i} className="group hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {customer.email.slice(0, 2)}
                          </div>
                          <div>
                             <p className="font-medium text-gray-800 truncate max-w-[140px]">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-center text-gray-600">{customer.ordersCount}</td>
                      <td className="py-3 text-right font-bold text-gray-700">₹{customer.totalSpent.toLocaleString()}</td>
                    </tr>
                  ))}
                   {customerInsights.length === 0 && (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-gray-400">No customer data yet</td>
                      </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => (
  <div className="bg-white dark:bg-zinc-955 p-6 rounded-3xl border border-gray-100 dark:border-neutral-900 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-305 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 ${color} shadow-sm`}>
        <Icon size={22} className="stroke-[2]" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm ${
          trendUp 
            ? 'bg-green-50 dark:bg-green-955/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
            : 'bg-red-50 dark:bg-red-955/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
        }`}>
          {trendUp ? <ArrowUpRight size={12} className="stroke-[2.5]" /> : <ArrowDownRight size={12} className="stroke-[2.5]" />}
          {trend}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-gray-400 dark:text-neutral-500 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
    </div>
  </div>
);

export default AnalyticsDashboard;
