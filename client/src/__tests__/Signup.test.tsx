import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../apolloClient';
import { Signup } from '../pages/Signup';

describe('Signup', () => {
  it('renders email and password fields', () => {
    render(
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <Signup />
        </ApolloProvider>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getAllByLabelText(/password/i)).toHaveLength(2);
  });

  it('renders sign up button', () => {
    render(
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <Signup />
        </ApolloProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /sign up/i })).toBeTruthy();
  });

  it('renders link to signin', () => {
    render(
      <BrowserRouter>
        <ApolloProvider client={apolloClient}>
          <Signup />
        </ApolloProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('link', { name: /sign in/i })).toBeTruthy();
  });
});
