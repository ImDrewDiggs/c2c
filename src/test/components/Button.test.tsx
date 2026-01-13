import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '@/components/ui/button';

// Helper function to get by role from container
const getByRole = (container: HTMLElement, role: string) => container.querySelector(`[role="${role}"]`) || container.querySelector('button');
const getByText = (container: HTMLElement, text: string) => Array.from(container.querySelectorAll('*')).find(el => el.textContent === text);

describe('Button Component', () => {
  it('renders with default variant', () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.textContent).toBe('Click me');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    const { container } = render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = container.querySelector('button');
    button?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with different variants', () => {
    const { container, rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
    
    rerender(<Button variant="outline">Outline</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
    
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    expect(container.querySelector('button')).toBeDisabled();
  });

  it('renders with different sizes', () => {
    const { container, rerender } = render(<Button size="sm">Small</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
    
    rerender(<Button size="lg">Large</Button>);
    expect(container.querySelector('button')).toBeInTheDocument();
  });
});
