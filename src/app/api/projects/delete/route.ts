import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { projectName } = await req.json();
    if (!projectName) {
      return NextResponse.json({ error: 'projectName required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection('projects').deleteOne({ project: projectName });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Update stats
    const remaining = await db.collection('projects').countDocuments();
    await db.collection('stats').updateOne({}, {
      $set: { total_projects: remaining, last_updated: new Date().toISOString() }
    });

    return NextResponse.json({ success: true, deleted: projectName, remaining });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
