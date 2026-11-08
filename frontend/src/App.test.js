import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Streamly application', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Streamly/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
