import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyPassword, signToken, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Auto-create admin user if not exists
    let user = await db.collection('users').findOne({ username });
    if (!user && username === process.env.AUTH_USERNAME) {
      const passwordHash = await hashPassword(process.env.AUTH_PASSWORD || '');
      const result = await db.collection('users').insertOne({
        username: process.env.AUTH_USERNAME || 'admin',
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
      });
      user = await db.collection('users').findOne({ _id: result.insertedId });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ username: user.username, role: user.role || 'admin' });

    const response = NextResponse.json({ success: true, username: user.username });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
