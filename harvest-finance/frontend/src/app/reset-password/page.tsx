'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { EyeIcon, EyeSlashIcon } from '@/components/icons';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const requirementChecks = (password: string) => [
  { test: password.length >= 8, label: 'At least 8 characters' },
  { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
  { test: /[0-9]/.test(password), label: 'One number' },
  { test: /[^A-Za-z0-9]/.test(password), label: 'One special character' },
];

export default function ResetPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });

  const onSubmit = async () => {
    setError(null);
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <AuthShell
      title={isSubmitted ? 'Password updated' : 'Choose a new password'}
      subtitle={
        isSubmitted
          ? 'Your password has been reset. Sign in again to continue managing orders and settlements.'
          : 'Create a strong password that keeps your financing activity and order data secure.'
      }
      footer={
        <p>
          Need to restart the flow?{' '}
          <Link href="/forgot-password" className="inline-link">
            Request another reset link
          </Link>
        </p>
      }
    >
      {isSubmitted ? (
        <div className="space-y-5">
          <div className="status-banner status-banner--success" role="status" aria-live="polite">
            <p>Your password has been updated successfully.</p>
          </div>
          <Link href="/login" className="btn-primary">
            Return to sign in
          </Link>
        </div>
      ) : (
        <>
          {error ? (
            <div className="status-banner status-banner--error mb-5" role="alert" aria-live="assertive">
              <p>{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <label htmlFor="password" className="field-label">
                New password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
                  disabled={isLoading}
                  placeholder="Create a secure password"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="password-toggle"
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              <div id="password-strength">
                <PasswordStrength password={password} />
              </div>
              {errors.password ? (
                <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="field-label">
                Confirm new password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                  disabled={isLoading}
                  placeholder="Repeat the new password"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  className="password-toggle"
                >
                  {showConfirm ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p id="confirm-error" className="mt-2 text-sm text-red-600" role="alert">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            <div className="rounded-[24px] border border-[rgba(47,122,66,0.12)] bg-[#f8fbf5] p-4">
              <p className="text-sm font-semibold text-slate-900">Password requirements</p>
              <ul className="mt-3 space-y-2" aria-label="Password requirements">
                {requirementChecks(password).map(({ test, label }) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        test ? 'bg-[var(--brand-soft)] text-[var(--brand-strong)]' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {test ? 'v' : '+'}
                    </span>
                    <span className={test ? 'text-slate-900' : 'text-slate-500'}>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button type="submit" disabled={isLoading} aria-busy={isLoading} className="btn-primary">
              {isLoading ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
