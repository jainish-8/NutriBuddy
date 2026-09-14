import { render, screen } from '@testing-library/react';
import App from './App';

test('renders NutriBuddy application', () => {
  render(<App />);
  const logoElements = screen.getAllByText(/Nutri/i);
  expect(logoElements.length).toBeGreaterThan(0);
});

