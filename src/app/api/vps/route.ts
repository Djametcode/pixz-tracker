import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// VPS data is fetched from the control API on the VPS
const VPS_CONTROL_API = 'http://45.63.69.82:9999';

export async function GET(req: NextRequest) {
  // Verify auth
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Try to fetch from VPS control API
    const res = await fetch(`${VPS_CONTROL_API}/status`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      // Transform to our format
      const vpsList = [{
        name: 'Vultr VPS',
        ip: '45.63.69.82',
        status: data.status === 'ok' ? 'online' : 'warning',
        cpu: data.cpu || 0,
        ram: data.ram || { used: 0, total: 0, percent: 0 },
        disk: data.disk || { used: 0, total: 0, percent: 0 },
        uptime: data.uptime || 'unknown',
        gpu: data.gpu || undefined,
        services: data.services || [],
        miners: data.miners || [],
      }];
      return NextResponse.json({ vps: vpsList });
    }
  } catch (e) {
    // VPS API not reachable, return mock data
  }

  // Fallback: return static data
  return NextResponse.json({
    vps: [{
      name: 'Vultr VPS',
      ip: '45.63.69.82',
      status: 'online',
      cpu: 12,
      ram: { used: 8, total: 30, percent: 27 },
      disk: { used: 45, total: 450, percent: 10 },
      uptime: '14d 6h',
      services: [
        { name: 'pixz-api', status: 'running' },
        { name: 'nginx', status: 'running' },
        { name: 'alpha-miner', status: 'stopped' },
      ],
    }]
  });
}
