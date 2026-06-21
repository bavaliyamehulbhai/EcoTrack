import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Routing', () => {
  it('renders loading state initially due to React.lazy/Suspense', () => {
    render(<App />);
    expect(screen.getByText(/Loading EcoTrack/i)).toBeInTheDocument();
  });
});
