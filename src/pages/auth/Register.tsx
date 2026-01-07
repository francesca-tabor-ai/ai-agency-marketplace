import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['business', 'agency'], {
    required_error: 'Please select your role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setMessage(null);

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: data.role,
            full_name: data.email.split('@')[0], // Default name from email
          },
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Account created! Please check your email to verify your account.',
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error signing up:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create account. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-dark mb-2 font-playfair">Create Your Account</h1>
          <p className="text-brand-dark/70">Join the AI Agency Marketplace community</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
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
              <label className="block text-sm font-medium text-brand-dark mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-brand-light/50 transition-colors duration-200">
                  <input
                    type="radio"
                    value="business"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-medium text-brand-dark">Business</span>
                    <span className="text-sm text-brand-dark/70">Looking for AI solutions</span>
                  </div>
                </label>
                <label className="relative flex items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-brand-light/50 transition-colors duration-200">
                  <input
                    type="radio"
                    value="agency"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-medium text-brand-dark">Agency</span>
                    <span className="text-sm text-brand-dark/70">Providing AI services</span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-dark mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register('confirmPassword')}
                className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-brand-dark/70">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-light hover:text-brand-light/80">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}