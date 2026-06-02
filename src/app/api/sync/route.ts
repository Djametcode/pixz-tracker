import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projects, stats } = await req.json();
    const { db } = await connectToDatabase();

    if (projects && Array.isArray(projects)) {
      // Upsert each project
      for (const p of projects) {
        await db.collection('projects').updateOne(
          { project: p.project },
          { $set: { ...p, updatedAt: new Date() } },
          { upsert: true }
        );
      }
    }

    if (stats) {
      await db.collection('stats').updateOne(
        {},
        { $set: { ...stats, last_updated: new Date().toISOString() } },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, synced: projects?.length || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
