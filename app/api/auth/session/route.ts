import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, authRateLimiter } from '@/lib/rateLimit';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const rateLimit = checkRateLimit(request, authRateLimiter);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        {
          status: 429,
          headers: rateLimit.headers,
        }
      );
    }

    const supabase = createClient();
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      // Only expose detailed errors in development (not production or staging)
      // This prevents information disclosure in any deployed environment
      // For staging debugging, check server logs instead
      const isDevelopment = process.env.NODE_ENV === 'development';
      const errorDetails = isDevelopment ? validation.error.issues : undefined;
      
      // Always log detailed validation errors server-side for debugging
      console.error('Login validation failed:', validation.error.issues);
      
      return NextResponse.json(
        { 
          error: 'Invalid input',
          ...(errorDetails && { details: errorDetails })
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }

    return NextResponse.json(
      { message: 'Login successful' },
      { status: 200, headers: rateLimit.headers }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
