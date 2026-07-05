import Container from './Container.jsx';

/**
 * PageWrapper — standard page layout with container.
 *
 * Props:
 *   noPad — boolean, removes top/bottom padding
 */
function PageWrapper({ children, noPad = false, className = '' }) {
  return (
    <main className={`page ${noPad ? 'page--no-pad' : ''} ${className}`}>
      <Container>{children}</Container>
    </main>
  );
}

export default PageWrapper;
