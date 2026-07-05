import { Link } from 'react-router-dom';
import Container from './Container.jsx';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <div className="footer__grid">
          <div>
            <div className="footer__brand">
              Edgers <span>Men's Wear</span>
            </div>
            <p className="footer__tagline">Refined clothing for the modern Armenian man.</p>
          </div>

          <div>
            <h4 className="footer__heading">Shop</h4>
            <ul className="footer__list">
              <li><Link to="/products?category=shirts">Shirts</Link></li>
              <li><Link to="/products?category=pants">Pants</Link></li>
              <li><Link to="/products?category=jackets">Jackets</Link></li>
              <li><Link to="/products?category=suits">Suits</Link></li>
              <li><Link to="/products?category=accessories">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Account</h4>
            <ul className="footer__list">
              <li><Link to="/account">My Account</Link></li>
              <li><Link to="/account">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Contact</h4>
            <ul className="footer__list">
              <li><a href="mailto:info@edgers.am">info@edgers.am</a></li>
              <li><a href="tel:+37410000000">+374 10 000 000</a></li>
              <li>Yerevan, Armenia</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {year} Edgers Men's Wear. All rights reserved.</span>
          <span>Payments: ArCa · Idram · Telcell</span>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
