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

// POST /api/projects — upsert single or batch projects
export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    const body = await req.json();

    // Accept single project or array
    const projects = Array.isArray(body) ? body : body.projects ? body.projects : [body];
    
    if (!projects.length) {
      return NextResponse.json({ error: 'No projects provided' }, { status: 400 });
    }

    let upserted = 0;
    for (const p of projects) {
      if (!p.project) continue;
      await db.collection('projects').updateOne(
        { project: p.project },
        {
          $set: {
            ...p,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
      upserted++;
    }

    // Recompute stats
    const allProjects = await db.collection('projects').find({}).toArray();
    await db.collection('stats').updateOne(
      {},
      {
        $set: {
          total_projects: allProjects.length,
          total_whitelist: allProjects.filter((p: any) => (p.type || '').includes('whitelist') || (p.type || '').includes('kol')).length,
          total_testnet: allProjects.filter((p: any) => p.type === 'testnet').length,
          total_nft_mints: allProjects.filter((p: any) => (p.type || '').includes('nft') || (p.type || '').includes('mint')).length,
          total_waitlist: allProjects.filter((p: any) => (p.type || '').includes('waitlist')).length,
          active_campaigns: allProjects.filter((p: any) => !["completed", "dropped", "expired", "failed", "closed"].includes(p.status)).length,
          submitted: allProjects.filter((p: any) => ["submitted", "success", "replied"].includes(p.status)).length,
          last_updated: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, upserted, total: allProjects.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
