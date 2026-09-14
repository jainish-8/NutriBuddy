import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dock } from './dock';

describe('Dock Component', () => {
  const items = [
    { icon: '🌐', label: 'Browser', href: 'https://example.com' },
    { icon: '📁', label: 'Files', onClick: jest.fn() },
    { icon: <span data-testid="custom-svg">📊</span>, label: 'Analytics', onClick: jest.fn() }
  ];

  test('renders all dock items with labels and icons', () => {
    render(<Dock items={items} />);
    expect(screen.getByText('🌐')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
    expect(screen.getByTestId('custom-svg')).toBeInTheDocument();
    expect(screen.getAllByText('Browser').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Files').length).toBeGreaterThan(0);
  });

  test('renders anchor tag when href is specified', () => {
    render(<Dock items={items} />);
    const link = screen.getByRole('link', { name: /browser/i });
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  test('triggers onClick when clicked', () => {
    render(<Dock items={items} />);
    const button = screen.getByRole('button', { name: /files/i });
    fireEvent.click(button);
    expect(items[1].onClick).toHaveBeenCalled();
  });

  test('renders labels beneath icons when alwaysShowLabels is true', () => {
    render(<Dock items={items} alwaysShowLabels={true} />);
    const label = screen.getByText('Browser');
    expect(label).toHaveClass('unlumen-dock-bottom-label');
  });

  test('handles mouse move and leave events gracefully', () => {
    const { container } = render(<Dock items={items} magnification={2.5} distance={120} />);
    const nav = container.querySelector('.unlumen-dock-container');
    
    fireEvent.mouseMove(nav, { clientX: 100 });
    fireEvent.mouseLeave(nav);
  });
});
