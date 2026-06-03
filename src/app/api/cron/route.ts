import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { jobs } = await req.json();
    if (!Array.isArray(jobs)) {
      return NextResponse.json({ error: 'jobs array required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Clear old cron jobs and insert fresh
    await db.collection('cron_jobs').deleteMany({});
    if (jobs.length > 0) {
      await db.collection('cron_jobs').insertMany(
        jobs.map(j => ({ ...j, syncedAt: new Date() }))
      );
    }

    return NextResponse.json({ success: true, count: jobs.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const jobs = await db.collection('cron_jobs').find({}).sort({ name: 1 }).toArray();
    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
