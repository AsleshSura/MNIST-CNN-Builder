import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders MNIST CNN Builder heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/MNIST CNN Builder/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders feature map link', () => {
  render(<App />);
  const linkElement = screen.getByText(/Explore Feature Maps/i);
  expect(linkElement).toBeInTheDocument();
});
