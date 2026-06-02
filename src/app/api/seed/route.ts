import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, verifyToken } from '@/lib/auth';

const SEED_PROJECTS = [
  { project: "SaintsMelting", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "9/9", date: "2026-05-27", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "Simple form, no captcha" },
  { project: "MOCHI", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "9/9", date: "2026-05-26", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "Intent URLs, batch pattern" },
  { project: "Rootlings", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "9/9", date: "2026-05-27", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "Wallet drop pattern" },
  { project: "PondSyndicate", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "9/9", date: "2026-05-27", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "JS dialog crash handled" },
  { project: "UniponsNFT", type: "whitelist", status: "partial", chain: "Ethereum", accounts: "2/5", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "API-first, IP rate limit" },
  { project: "Aztec", type: "testnet", status: "logged", chain: "Ethereum", accounts: "auto", date: "2026-06-01", source: "telegram", mint_date: "N/A", mint_price: "N/A", notes: "Privacy L2" },
  { project: "MegaETH", type: "testnet", status: "logged", chain: "Ethereum", accounts: "auto", date: "2026-06-01", source: "telegram", mint_date: "N/A", mint_price: "N/A", notes: "Real-time L2" },
  { project: "Abstract", type: "testnet", status: "logged", chain: "Ethereum", accounts: "auto", date: "2026-06-01", source: "telegram", mint_date: "N/A", mint_price: "N/A", notes: "Consumer chain" },
  { project: "Arbitrum", type: "quest", status: "logged", chain: "Arbitrum", accounts: "auto", date: "2026-06-01", source: "telegram", mint_date: "N/A", mint_price: "N/A", notes: "Quest campaign" },
  { project: "CPUNKS", type: "nft_mint", status: "hunting", chain: "Solana", accounts: "auto", date: "2026-06-01", source: "skill", mint_date: "TBA", mint_price: "TBA", notes: "Hunt valid timestamp" },
];

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();
    
    // Create user if not exists
    const existingUser = await db.collection('users').findOne({ username: 'djamet' });
    if (!existingUser) {
      const passwordHash = await hashPassword('Aerdrop123!');
      await db.collection('users').insertOne({
        username: 'djamet',
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
      });
    }

    // Seed projects
    const existingCount = await db.collection('projects').countDocuments();
    if (existingCount === 0) {
      await db.collection('projects').insertMany(
        SEED_PROJECTS.map(p => ({ ...p, createdAt: new Date() }))
      );
    }

    // Seed stats
    await db.collection('stats').updateOne(
      {},
      {
        $set: {
          total_projects: SEED_PROJECTS.length,
          total_whitelist: SEED_PROJECTS.filter(p => p.type.includes('whitelist')).length,
          total_testnet: SEED_PROJECTS.filter(p => p.type === 'testnet').length,
          total_nft_mints: SEED_PROJECTS.filter(p => p.type === 'nft_mint').length,
          last_updated: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, projectsSeeded: SEED_PROJECTS.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
