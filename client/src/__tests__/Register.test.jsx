import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthContext } from '../context/AuthContext';

const renderWithContext = (ui) => {
  return render(
    <AuthContext.Provider value={{ register: vi.fn(), loading: false, error: null }}>
      <BrowserRouter>{ui}</BrowserRouter>
    </AuthContext.Provider>
  );
};

test('renders register form', () => {
  renderWithContext(<Register />);
  expect(screen.getByPlaceholderText(/Name/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
});
