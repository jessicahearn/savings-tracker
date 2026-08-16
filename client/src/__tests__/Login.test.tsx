import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../apolloClient';
import { Login } from '../pages/Login';

describe('Login', () => {
  it('renders email and password fields', () => {
    render(
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <Login />
        </ApolloProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
  });

  it('renders sign in button', () => {
    render(
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <Login />
        </ApolloProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('renders link to signup', () => {
    render(
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <Login />
        </ApolloProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /sign up/i })).toBeTruthy();
  });
});
