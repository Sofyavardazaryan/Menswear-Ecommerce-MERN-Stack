import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useCart } from '../../hooks/useCart.js';
import Container from './Container.jsx';
import Modal from '../ui/Modal.jsx';
import LoginForm from '../auth/LoginForm.jsx';
import RegisterForm from '../auth/RegisterForm.jsx';
import CartDrawer from '../cart/CartDrawer.jsx';

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="navbar">
        <Container>
          <div className="navbar__inner">
            {/* Brand */}
            <Link to="/" className="navbar__logo">
              Edgers <span>Men's Wear</span>
            </Link>

            {/* Navigation */}
            <nav className="navbar__nav" aria-label="Main navigation">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              >
                Home
              </NavLink>
              <NavLink
                to="/products"
                className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              >
                Shop
              </NavLink>
            </nav>

            {/* Actions */}
            <div className="navbar__actions">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
                    >
                      Admin
                    </NavLink>
                  )}
                  <NavLink
                    to="/account"
                    className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
                  >
                    {user.name.split(' ')[0]}
                  </NavLink>
                  <button className="navbar__link" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <button className="navbar__link" onClick={() => setAuthModal('login')}>
                  Sign In
                </button>
              )}

              <button
                className="navbar__cart-btn"
                onClick={() => setCartOpen(true)}
                aria-label={`Cart — ${itemCount} items`}
              >
                <span>Bag</span>
                {itemCount > 0 && (
                  <span className="navbar__cart-count" aria-hidden="true">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </Container>
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Auth Modal */}
      <Modal
        isOpen={authModal !== null}
        onClose={() => setAuthModal(null)}
        title={authModal === 'login' ? 'Sign In' : 'Create Account'}
      >
        {authModal === 'login' ? (
          <LoginForm
            onSuccess={() => setAuthModal(null)}
            onSwitchToRegister={() => setAuthModal('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={() => setAuthModal(null)}
            onSwitchToLogin={() => setAuthModal('login')}
          />
        )}
      </Modal>
    </>
  );
}

export default Navbar;
