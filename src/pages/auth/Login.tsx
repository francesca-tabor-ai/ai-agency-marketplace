import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setMessage(null);

      if (authMethod === 'magic-link') {
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Check your email for the magic link!',
        });
      } else {
        if (!data.password) {
          setMessage({ type: 'error', text: 'Password is required' });
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        // Redirect to home page on success
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to sign in. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2 font-playfair">Welcome Back</h1>
          <p className="text-brand-dark/70">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Auth Method Toggle */}
          <div className="mb-6 flex gap-2 p-1 bg-brand-dark/5 rounded-lg">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMethod === 'password'
                  ? 'bg-brand-light text-white'
                  : 'text-brand-dark/70 hover:text-brand-dark'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('magic-link')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMethod === 'magic-link'
                  ? 'bg-brand-light text-white'
                  : 'text-brand-dark/70 hover:text-brand-dark'
              }`}
            >
              Magic Link
            </button>
          </div>

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {authMethod === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-brand-dark mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            )}

            {authMethod === 'magic-link' && (
              <p className="text-sm text-brand-dark/70">
                We'll send you a magic link to sign in. No password needed!
              </p>
            )}

            {authMethod === 'password' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-brand-dark/10 text-brand-light focus:ring-brand-light/20"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-brand-dark/70">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-brand-light hover:text-brand-light/80">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isSubmitting
                ? authMethod === 'magic-link'
                  ? 'Sending magic link...'
                  : 'Signing in...'
                : authMethod === 'magic-link'
                ? 'Send Magic Link'
                : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-dark/70">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-light hover:text-brand-light/80">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}