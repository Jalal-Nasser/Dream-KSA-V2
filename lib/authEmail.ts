import { supabase } from '@/lib/supabase';
import type { AuthApiError, User } from '@supabase/supabase-js';

// Basic email validator suitable for UI checks (server still validates).
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

// Map Supabase auth errors to Arabic strings for the UI.
export function toArabicAuthMessage(err: unknown): string {
  const api = err as AuthApiError | undefined;
  const status = (api?.status ?? 0) as number;
  const msg = (api?.message ?? '').toLowerCase();

  if (status === 400 && msg.includes('invalid login credentials')) {
    return 'بيانات الدخول غير صحيحة.';
  }
  if (status === 400 && msg.includes('email not confirmed')) {
    return 'لم يتم تفعيل البريد الإلكتروني. يرجى التحقق من بريدك لتفعيل الحساب.';
  }
  if (status === 422 && msg.includes('password')) {
    return 'كلمة المرور غير صالحة أو ضعيفة.';
  }
  if (status === 429) {
    return 'محاولات كثيرة. الرجاء المحاولة لاحقاً.';
  }
  return 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.';
}

// Ensure a profile row exists after successful sign-in/up.
async function ensureProfile(user: User, defaults?: Partial<Record<string, unknown>>) {
  try {
    await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          display_name: (defaults?.display_name as string) ?? user.email?.split('@')[0] ?? '',
          gender: defaults?.gender ?? null,
          birthday: defaults?.birthday ?? null,
          country: defaults?.country ?? null,
          title: defaults?.title ?? null,
          signature: defaults?.signature ?? null,
        },
        { onConflict: 'id' }
      );
  } catch {
    // silent — RLS will still protect; not fatal to sign-in flow
  }
}

/**
 * Sign in with email/password.
 * Throws an Error with user-facing Arabic message on failure.
 */
export async function signInWithEmailPassword(email: string, password: string) {
  const e = String(email || '').trim();
  const p = String(password || '');
  if (!isValidEmail(e)) throw new Error('أدخل بريدًا إلكترونيًا صالحًا.');
  if (!p) throw new Error('أدخل كلمة المرور.');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: e, password: p });
    if (error) throw error;
    if (!data?.user) throw new Error('تعذر تسجيل الدخول.');
    await ensureProfile(data.user);
    return data;
  } catch (err) {
    throw new Error(toArabicAuthMessage(err));
  }
}

/**
 * Sign up with email/password.
 * If email confirmations are enabled in Supabase, this will return without a session.
 * The UI should show a "تحقق من بريدك" message in that case.
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  profileDefaults?: Partial<Record<string, unknown>>
) {
  const e = String(email || '').trim();
  const p = String(password || '');
  if (!isValidEmail(e)) throw new Error('أدخل بريدًا إلكترونيًا صالحًا.');
  if (p.length < 6) throw new Error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');

  try {
    const { data, error } = await supabase.auth.signUp({
      email: e,
      password: p,
      options: {
        // Keep native scheme so the magic link (if enabled) can open the app
        emailRedirectTo: 'dream-ksa://auth-callback',
      },
    });
    if (error) throw error;
    // If a session exists immediately (email confirm disabled), ensure profile now
    if (data?.user) await ensureProfile(data.user, profileDefaults);
    return data;
  } catch (err) {
    throw new Error(toArabicAuthMessage(err));
  }
}

/**
 * Utility for your login screen to show/hide spinner & errors.
 * Example usage in a component:
 *   try {
 *     setLoading(true);
 *     await signInWithEmailPassword(email, password);
 *     // Your auth guard should navigate to tabs automatically,
 *     // or you can router.replace('/(tabs)/rooms')
 *   } catch (e) {
 *     setError(String(e.message || e));
 *   } finally {
 *     setLoading(false);
 *   }
 */
export const emailAuth = {
  signInWithEmailPassword,
  signUpWithEmailPassword,
};
