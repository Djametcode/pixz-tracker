import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, verifyToken } from '@/lib/auth';

const SEED_PROJECTS = [
  { project: "UniponsNFT", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "CimengTheCat, JametNak", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "2/5 submitted, 1 already registered, 2 rate-limited IP", url: "https://unipons.art/early-access?ref=scan0601" },
  { project: "Lapinoz NFT KOL Giveaway", type: "whitelist_kol", status: "replied", chain: "Ethereum", accounts: "5/5 active accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "6x GTD + 5x GTD spots, 2 KOL tweets", url: "https://x.com/GGibertoni58226/status/2061298934044066153" },
  { project: "Gemso", type: "whitelist_form", status: "success", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "auto-scan", url: "http://gemso.art/whitelist" },
  { project: "Symbiote Lab", type: "email_waitlist", status: "success", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "auto-scan", url: "https://www.thesymbiotelab.com" },
  { project: "Yellowcatz", type: "whitelist_form", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "auto-scan", url: "https://www.yellowcatz.io/whitelist" },
  { project: "TurcNFT", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "5/5 accounts, KOL giveaway via @Benefactor_345", url: "https://x.com/Benefactor_345/status/2061447092283822535" },
  { project: "TheGoth", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "5/5 accounts, KOL giveaway, ETH chain, FREE", url: "https://x.com/Andramichael5/status/2061395461085200750" },
  { project: "CryptoArias_LapinozNFT", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "5/5 accounts, KOL giveaway, 5x GTD, 24hrs deadline", url: "https://x.com/i/status/2061505530737160690" },
  { project: "NiyoNFT", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "5/5 accounts, KOL giveaway, 3 WL spots, 5hrs deadline", url: "https://x.com/i/status/2061517831359836667" },
  { project: "ReAnimatedDead", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "5/5 accounts, wallet drop, 7222 supply ETH", url: "https://x.com/i/status/2061482328958930955" },
  { project: "MonkuZombie", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-01", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "5/5 accounts, giveaway, 1000 WL spots, mint June 3", url: "https://x.com/i/status/2061494783403778165" },
  { project: "Ecodex (X1 EcoChain)", type: "testnet", status: "success", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "airdropfind", mint_date: "N/A", mint_price: "N/A", notes: "DeFi layer of X1 EcoChain, token swap testnet", url: "http://testnet.x1ecochain.com/" },
  { project: "ACI Testnet", type: "testnet", status: "closed", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "airdropfind", mint_date: "N/A", mint_price: "N/A", notes: "30,000,000 $ACI allocated for testnet", url: "https://aci-token.net/testnet" },
  { project: "Teqoin", type: "testnet", status: "success", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "airdropfind", mint_date: "N/A", mint_price: "N/A", notes: "TGE Q2 2026, 100M supply, faucet", url: "http://teqoin.io/faucet" },
  { project: "Variational Omni", type: "waitlist", status: "failed", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "airdropfind", mint_date: "TBA", mint_price: "Free", notes: "No visible form on site", url: "https://omni.variational.io/" },
  { project: "Symbiote Lab WL", type: "waitlist", status: "success", chain: "Ethereum", accounts: "", date: "2026-06-01", source: "bangpateng_airdrop", mint_date: "TBA", mint_price: "Free", notes: "Register + claim ref", url: "https://www.thesymbiotelab.com/?ref=UJORJXJC" },
  { project: "Trenchers AI", type: "waitlist", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "cron_batch", url: "https://trenchers.ai/" },
  { project: "Blockchain Brats", type: "waitlist", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "cron_batch", url: "https://www.blockchainbrats.com" },
  { project: "Edel Finance", type: "airdrop_form", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Google Form submission", url: "https://forms.gle/CeU9UvUruh2z818m6" },
  { project: "Serein NFT", type: "nft_waitlist", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "NFT waitlist", url: "http://sereinxyz.fun/" },
  { project: "Flxeth", type: "whitelist", status: "submitted", chain: "Base", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Base chain whitelist", url: "https://flxeth.xyz/" },
  { project: "KAOMOJI", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Whitelist form", url: "https://kaomoji.world/whitelist/" },
  { project: "Unipons", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Early access form", url: "https://www.unipons.art/early-access" },
  { project: "Pic2cells", type: "whitelist", status: "failed", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Site has no visible form", url: "https://pic2cells.com/" },
  { project: "JRNY Club", type: "airdrop", status: "failed", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Site down", url: "https://earn.jrny.club/loyalty" },
  { project: "T-Rex", type: "claim_checker", status: "pending", chain: "Ethereum", accounts: "", date: "2026-06-02", source: "telegram", mint_date: "TBA", mint_price: "Free", notes: "Claim closes June 10, needs wallet", url: "https://www.trex.xyz/portal/grandTrader/claim" },
  { project: "stacksnft", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-02", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "3/4 tasks verified, 5/5 active accounts", url: "https://stacksnft.com/whitelist" },
  { project: "morkie", type: "whitelist", status: "submitted", chain: "Ethereum", accounts: "5/5 accounts", date: "2026-06-02", source: "twitter", mint_date: "TBA", mint_price: "Free", notes: "Robinhood Testnet free mint, 5/5 accounts", url: "https://x.com/_morkie/status/2061718669651259870" },
];

const UPCOMING_MINTS = [
  { name: "UniponsNFT", chain: "Ethereum", price: "Free", date: "Juni 2026", image: "https://unavatar.io/twitter/UniponsNFT", twitter: "https://x.com/UniponsNFT" },
  { name: "Yellowcatz", chain: "Ethereum", price: "Free", date: "Juni 2026", image: "https://unavatar.io/twitter/Yellowcatz", twitter: "https://x.com/Yellowcatz" },
  { name: "TurcNFT", chain: "Ethereum", price: "Free", date: "Juni 2026", image: "https://unavatar.io/twitter/TurcNFT", twitter: "https://x.com/TurcNFT" },
  { name: "TheGoth", chain: "Ethereum", price: "Free", date: "Juni 2026", image: "https://unavatar.io/twitter/TheGoth", twitter: "https://x.com/TheGoth" },
  { name: "NiyoNFT", chain: "Ethereum", price: "Free", date: "Juni 2026", image: "https://unavatar.io/twitter/NiyoNFT", twitter: "https://x.com/NiyoNFT" },
  { name: "ReAnimatedDead", chain: "Ethereum", price: "Free", date: "Juni 2026", image: "https://unavatar.io/twitter/ReAnimatedDead", twitter: "https://x.com/ReAnimatedDead" },
  { name: "MonkuZombie", chain: "Ethereum", price: "Free", date: "Juni 3, 2026", image: "https://unavatar.io/twitter/MonkuZombie", twitter: "https://x.com/MonkuZombie" },
  { name: "CPUNKS", chain: "Cronos", price: "TBA", date: "TBA", image: "https://unavatar.io/twitter/CPunks_NFT", twitter: "https://x.com/CPunks_NFT" },
  { name: "Serein NFT", chain: "Ethereum", price: "Free", date: "TBA", image: "https://unavatar.io/twitter/sereinxyz", twitter: "https://x.com/sereinxyz" },
  { name: "Flxeth", chain: "Base", price: "Free", date: "TBA", image: "https://unavatar.io/twitter/flxeth", twitter: "https://x.com/flxeth" },
  { name: "stacksnft", chain: "Ethereum", price: "Free", date: "TBA", image: "https://unavatar.io/twitter/stacksnft", twitter: "https://x.com/stacksnft" },
  { name: "morkie", chain: "Ethereum", price: "Free", date: "TBA", image: "https://unavatar.io/twitter/_morkie", twitter: "https://x.com/_morkie" },
];

export async function POST(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { db } = await connectToDatabase();

    // Create user if not exists
    const existingUser = await db.collection('users').findOne({ username: process.env.AUTH_USERNAME || 'admin' });
    if (!existingUser) {
      const passwordHash = await hashPassword(process.env.AUTH_PASSWORD || '');
      await db.collection('users').insertOne({
        username: process.env.AUTH_USERNAME || 'admin',
        passwordHash,
        role: 'admin',
        createdAt: new Date(),
      });
    }

    // Accept dynamic projects from request body, fallback to hardcoded
    let projectsToSeed = SEED_PROJECTS;
    let mintsToSeed = UPCOMING_MINTS;
    let cleanOld = true;

    try {
      const body = await req.json();
      if (body.projects && Array.isArray(body.projects) && body.projects.length > 0) {
        projectsToSeed = body.projects;
        cleanOld = body.cleanOld !== false; // default true unless explicitly false
      }
      if (body.upcoming_mints && Array.isArray(body.upcoming_mints)) {
        mintsToSeed = body.upcoming_mints;
      }
    } catch {
      // No body or invalid JSON — use hardcoded defaults
    }

    // Upsert all projects (always overwrite)
    for (const p of projectsToSeed) {
      await db.collection('projects').updateOne(
        { project: p.project },
        { $set: { ...p, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );
    }

    // Clean up old projects not in seed (only if cleanOld=true)
    if (cleanOld) {
      const seedNames = projectsToSeed.map((p: any) => p.project);
      await db.collection('projects').deleteMany({ project: { $nin: seedNames } });
    }

    // Upsert upcoming mints
    await db.collection('upcoming_mints').deleteMany({});
    if (mintsToSeed.length > 0) {
      await db.collection('upcoming_mints').insertMany(
        mintsToSeed.map((m: any) => ({ ...m, createdAt: new Date() }))
      );
    }

    // Update stats
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
          upcoming_mints: mintsToSeed.length,
          active_campaigns: allProjects.filter((p: any) => !["completed", "dropped", "expired", "failed", "closed"].includes(p.status)).length,
          submitted: allProjects.filter((p: any) => ["submitted", "success", "replied"].includes(p.status)).length,
          last_updated: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      projectsSeeded: projectsToSeed.length,
      totalInDb: allProjects.length,
      upcomingMints: mintsToSeed.length,
      oldProjectsRemoved: cleanOld
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
