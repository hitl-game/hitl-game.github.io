import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders a single main landmark', () => {
    render(<App />);

    expect(screen.getByRole('main')).toBeDefined();
  });
});
