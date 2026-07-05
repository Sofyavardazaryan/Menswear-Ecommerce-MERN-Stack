import { useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import * as adminService from '../../services/adminService.js';

const CATEGORIES = ['shirts', 'trousers', 'jackets', 'suits', 'accessories'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function AdminProductEditModal({ product, isNew, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: product.name || '',
    price: product.price ?? '',
    compareAtPrice: product.compareAtPrice ?? '',
    description: product.description || '',
    category: product.category || CATEGORIES[0],
    featured: product.featured ?? false,
    isActive: product.isActive ?? true,
    stock: SIZES.map((size) => {
      const existing = product.stock?.find((s) => s.size === size);
      return { size, quantity: existing?.quantity ?? 0 };
    }),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const setStock = (size, quantity) => {
    setForm((f) => ({
      ...f,
      stock: f.stock.map((s) => (s.size === size ? { ...s, quantity: Number(quantity) } : s)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice !== '' ? Number(form.compareAtPrice) : undefined,
      };
      if (isNew) {
        await adminService.createProduct(payload);
      } else {
        await adminService.updateProduct(product._id, payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isNew ? 'Add Product' : 'Edit Product'}>
      <form className="admin-edit-form" onSubmit={handleSubmit}>
        {error && <p className="form-error">{error}</p>}

        <div className="form-group">
          <label className="form-label">Name</label>
          <Input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            placeholder="Product name"
          />
        </div>

        <div className="admin-edit-form__row">
          <div className="form-group">
            <label className="form-label">Price (֏)</label>
            <Input
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              required
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Compare-at Price (֏)</label>
            <Input
              type="number"
              min="0"
              value={form.compareAtPrice}
              onChange={(e) => set('compareAtPrice', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Product description"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            className="input"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-edit-form__checkboxes">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => set('featured', e.target.checked)}
            />
            Featured
          </label>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set('isActive', e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Stock by Size</label>
          <div className="admin-edit-form__stock">
            {form.stock.map(({ size, quantity }) => (
              <div key={size} className="admin-edit-form__stock-row">
                <span className="admin-edit-form__stock-size">{size}</span>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setStock(size, e.target.value)}
                  style={{ width: 80 }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-edit-form__footer">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold" loading={saving}>
            {isNew ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AdminProductEditModal;
