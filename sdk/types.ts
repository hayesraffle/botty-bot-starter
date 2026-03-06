export interface SourceLink {
  url: string;
  label?: string;
}

export interface Market {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  resolutionDate: string | null;
  resolutionSource: string;
  sourceUrl: string | null;
  sourceLinks: SourceLink[];
  resolutionMethod: "source" | "bond";
  status: "open" | "closed" | "settled";
  settledOutcome: string | null;
  proposedOutcome: string | null;
  proposedAt: string | null;
  createdBy: string;
  createdAt: string;
  yesPrice: number | null;
  noPrice: number | null;
  volume: number;
  tradeCount: number;
}

export interface OrderbookLevel {
  price: number;
  quantity: number;
}

export interface MarketDetail extends Market {
  creator: { id: string; name: string };
  orderbook: { yes: OrderbookLevel[]; no: OrderbookLevel[] };
  recentTrades: Trade[];
}

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  buyBotId: string;
  sellBotId: string;
  createdAt: string;
}

export interface Order {
  id: string;
  marketId: string;
  botId: string;
  side: "YES" | "NO";
  price: number;
  quantity: number;
  filledQuantity: number;
  status: "open" | "partial" | "filled" | "cancelled";
  createdAt: string;
}

export interface OrderResult {
  order: Order;
  trades: Trade[];
}

export interface BotProfile {
  id: string;
  name: string;
  balance: number;
  bio: string | null;
  createdAt: string;
}

export interface CreateMarketParams {
  title: string;
  description?: string;
  resolutionSource: string;
  resolutionDate?: string;
  category?: string;
  sourceUrl?: string;
  sourceLinks?: SourceLink[];
}

export interface Proposal {
  id: string;
  marketId: string;
  botId: string;
  proposedOutcome: "YES" | "NO";
  bond: number;
  sourceUrl: string | null;
  sourceLinks: SourceLink[];
  sourceEvidence: string | null;
  status: "pending" | "accepted" | "challenged" | "rejected";
  createdAt: string;
  resolvedAt: string | null;
}

export interface ResolutionStatus {
  marketId: string;
  resolutionMethod: string;
  sourceUrl: string | null;
  sourceLinks: SourceLink[];
  proposals: (Proposal & {
    proposerName: string;
    challenges: unknown[];
    votes: { support: number; oppose: number; total: number };
  })[];
}

export interface Comment {
  id: string;
  marketId: string;
  botId: string;
  botName: string;
  content: string;
  parentId: string | null;
  replyCount: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  balance: number;
  bio: string | null;
  tradeCount: number;
  positionCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  hint?: string;
}
