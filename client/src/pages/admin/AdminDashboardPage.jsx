import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService.js';
import Loader from '../../components/ui/Loader.jsx';
import PageWrapper from '../../components/layout/PageWrapper.jsx';

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getStats()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader page />;

  return (
    <PageWrapper>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="admin-sidebar__heading">Admin</p>
          <Link to="/admin" className="admin-sidebar__link admin-sidebar__link--active">
            Dashboard
          </Link>
          <Link to="/admin/products" className="admin-sidebar__link">
            Products
          </Link>
        </aside>

        <main className="admin-content">
          <h1 className="admin-content__title">Dashboard</h1>

          {error && <p className="form-error">{error}</p>}

          {data && (
            <>
              {/* Stat cards */}
              <div className="stat-cards">
                <div className="stat-card">
                  <span className="stat-card__label">Total Revenue</span>
                  <span className="stat-card__value">
                    {data.stats.totalRevenue.toLocaleString('hy-AM')} ֏
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-card__label">Total Orders</span>
                  <span className="stat-card__value">{data.stats.totalOrders}</span>
                </div>
                <div className="stat-card stat-card--success">
                  <span className="stat-card__label">Paid Orders</span>
                  <span className="stat-card__value">{data.stats.paidOrders}</span>
                </div>
                <div className="stat-card stat-card--warning">
                  <span className="stat-card__label">Pending Orders</span>
                  <span className="stat-card__value">{data.stats.pendingOrders}</span>
                </div>
              </div>

              {/* Monthly revenue bar chart */}
              <div className="admin-section">
                <h2 className="admin-section__title">Revenue — Last 6 Months</h2>
                <BarChart data={data.monthlyRevenue} />
              </div>

              {/* Top products */}
              {data.topProducts.length > 0 && (
                <div className="admin-section">
                  <h2 className="admin-section__title">Top Products by Revenue</h2>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topProducts.map((p, i) => (
                        <tr key={String(p._id)}>
                          <td>{i + 1}</td>
                          <td>{p.name}</td>
                          <td>{p.unitsSold}</td>
                          <td>{p.revenue.toLocaleString('hy-AM')} ֏</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </PageWrapper>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="bar-chart">
      {data.map((d) => (
        <div className="bar-chart__item" key={d.label}>
          <div className="bar-chart__bar-wrap">
            <div
              className="bar-chart__bar"
              style={{ height: `${Math.round((d.revenue / max) * 100)}%` }}
              title={`${d.revenue.toLocaleString('hy-AM')} ֏`}
            />
          </div>
          <span className="bar-chart__label">{d.label}</span>
          <span className="bar-chart__value">
            {d.revenue > 0 ? `${Math.round(d.revenue / 1000)}k` : '–'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboardPage;
