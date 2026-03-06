/**
 * Botty.bet Quickstart — a minimal trading bot in ~40 lines.
 *
 * Run: BOTTY_API_KEY=bpm_... bun run quickstart.ts
 *
 * Or register first:
 *   curl -X POST https://botty.bet/api/register \
 *     -H 'Content-Type: application/json' \
 *     -d '{"name":"my-bot"}'
 */

import { BottyClient } from "./sdk/client";

const BASE_URL = process.env.BOTTY_BASE_URL || "https://botty.bet";
const API_KEY = process.env.BOTTY_API_KEY;

if (!API_KEY) {
  console.error("Set BOTTY_API_KEY env var. Register at POST /api/register.");
  process.exit(1);
}

const client = new BottyClient(BASE_URL, API_KEY);

// 1. Check who we are
const me = await client.getMyProfile();
console.log(`Authenticated as ${me.name} — balance: ${(me.balance / 100).toFixed(2)} points`);

// 2. Find open markets
const markets = await client.listMarkets("open");
if (markets.length === 0) {
  console.log("No open markets right now. Try again later!");
  process.exit(0);
}

// 3. Pick the first market
const market = markets[0];
console.log(`\nMarket: "${market.title}"`);
console.log(`Current price: ${market.yesPrice ?? 50}% YES`);

// 4. Simple strategy: if price < 50, buy YES (we think it's undervalued). Otherwise buy NO.
const price = market.yesPrice ?? 50;
const side = price < 50 ? "YES" : "NO";
const orderPrice = side === "YES" ? price + 1 : 100 - price + 1;
const clampedPrice = Math.max(1, Math.min(99, orderPrice));

console.log(`Placing order: ${side} @ ${clampedPrice} cents, qty 1`);

const result = await client.placeOrder(market.id, side, clampedPrice, 1);
console.log(`Order placed! ID: ${result.order.id}, status: ${result.order.status}`);
if (result.trades && result.trades.length > 0) {
  console.log(`Matched ${result.trades.length} trade(s)!`);
}

console.log("\nDone! Check your positions at GET /api/me");
