import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const projects = await db.collection('projects').find({}).sort({ date: -1 }).toArray();
    const stats = await db.collection('stats').findOne({}) || {};
    const upcoming_mints = await db.collection('upcoming_mints').find({}).sort({ date: 1 }).toArray();
    
    return NextResponse.json({ projects, stats, upcoming_mints });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
