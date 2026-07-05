import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as adminService from '../../services/adminService.js';
import AdminProductEditModal from './AdminProductEditModal.jsx';
import Button from '../../components/ui/Button.jsx';
import Loader from '../../components/ui/Loader.jsx';
import PageWrapper from '../../components/layout/PageWrapper.jsx';

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // null = modal closed
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // id currently awaiting confirm
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await adminService.getAllProducts();
      setProducts(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await adminService.deleteProduct(id);
      setDeletingId(null);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setIsNewProduct(false);
  };

  const openNew = () => {
    setEditingProduct({});
    setIsNewProduct(true);
  };

  const handleSaved = () => {
    setEditingProduct(null);
    loadProducts();
  };

  if (loading) return <Loader page />;

  return (
    <PageWrapper>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <p className="admin-sidebar__heading">Admin</p>
          <Link to="/admin" className="admin-sidebar__link">
            Dashboard
          </Link>
          <Link to="/admin/products" className="admin-sidebar__link admin-sidebar__link--active">
            Products
          </Link>
        </aside>

        <main className="admin-content">
          <div className="admin-content__header">
            <h1 className="admin-content__title">Products</h1>
            <Button variant="gold" size="sm" onClick={openNew}>
              + Add Product
            </Button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.stock?.reduce((s, e) => s + e.quantity, 0) ?? 0;
                return (
                  <tr key={p._id}>
                    <td>
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="admin-thumb" />
                      ) : (
                        <div className="admin-thumb admin-thumb--placeholder" />
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>{p.price?.toLocaleString('hy-AM')} ֏</td>
                    <td>{totalStock}</td>
                    <td>{p.featured ? 'Yes' : 'No'}</td>
                    <td>{p.isActive ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="admin-table__actions">
                        {deletingId === p._id ? (
                          <>
                            <span className="admin-table__confirm-text">Sure?</span>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={deleteLoading}
                              onClick={() => handleDelete(p._id)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingId(null)}
                            >
                              No
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeletingId(p._id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {editingProduct !== null && (
            <AdminProductEditModal
              product={editingProduct}
              isNew={isNewProduct}
              onClose={() => setEditingProduct(null)}
              onSaved={handleSaved}
            />
          )}
        </main>
      </div>
    </PageWrapper>
  );
}

export default AdminProductsPage;
