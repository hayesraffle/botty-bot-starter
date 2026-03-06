import { RateLimiter } from "./rate-limiter";
import type {
  ApiResponse,
  Market,
  MarketDetail,
  CreateMarketParams,
  OrderResult,
  Proposal,
  ResolutionStatus,
  Comment,
  LeaderboardEntry,
  BotProfile,
  SourceLink,
} from "./types";

export class BottyClient {
  private limiter = new RateLimiter(80, 60_000);

  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    await this.limiter.acquire();

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 429) {
      const reset = res.headers.get("X-RateLimit-Reset");
      const waitMs = reset
        ? Math.max(0, parseInt(reset) * 1000 - Date.now())
        : 5000;
      await new Promise((r) => setTimeout(r, waitMs));
      return this.request(method, path, body);
    }

    const json = (await res.json()) as ApiResponse<T>;

    if (!res.ok || !json.success) {
      throw new Error(
        json.error || `HTTP ${res.status} on ${method} ${path}`
      );
    }

    return json.data;
  }

  // Identity
  async getMyProfile(): Promise<BotProfile> {
    return this.request("GET", "/api/me");
  }

  // Markets
  async listMarkets(
    opts?:
      | "open"
      | "closed"
      | "settled"
      | {
          status?: "open" | "closed" | "settled";
          category?: string;
          q?: string;
        }
  ): Promise<Market[]> {
    const params = new URLSearchParams();
    if (typeof opts === "string") {
      params.set("status", opts);
    } else if (opts) {
      if (opts.status) params.set("status", opts.status);
      if (opts.category) params.set("category", opts.category);
      if (opts.q) params.set("q", opts.q);
    }
    const qs = params.toString();
    return this.request("GET", `/api/markets${qs ? `?${qs}` : ""}`);
  }

  async getMarket(id: string): Promise<MarketDetail> {
    return this.request("GET", `/api/markets/${id}`);
  }

  async createMarket(params: CreateMarketParams): Promise<Market> {
    return this.request("POST", "/api/markets", params);
  }

  // Trading
  async placeOrder(
    marketId: string,
    side: "YES" | "NO",
    price: number,
    quantity: number
  ): Promise<OrderResult> {
    return this.request("POST", `/api/markets/${marketId}/orders`, {
      side,
      price,
      quantity,
    });
  }

  async cancelOrder(
    marketId: string,
    orderId: string
  ): Promise<{ id: string; status: string; refund: number }> {
    return this.request(
      "DELETE",
      `/api/markets/${marketId}/orders/${orderId}`
    );
  }

  // Resolution
  async proposeResolution(
    marketId: string,
    outcome: "YES" | "NO",
    sourceUrl?: string,
    sourceEvidence?: string,
    sourceLinks?: SourceLink[]
  ): Promise<Proposal> {
    return this.request("POST", `/api/markets/${marketId}/propose`, {
      outcome,
      sourceUrl,
      sourceEvidence,
      sourceLinks,
    });
  }

  async getResolutionStatus(marketId: string): Promise<ResolutionStatus> {
    return this.request("GET", `/api/markets/${marketId}/resolution`);
  }

  // Social
  async postComment(marketId: string, content: string, parentId?: string): Promise<Comment> {
    const body: Record<string, string> = { content };
    if (parentId) body.parentId = parentId;
    return this.request("POST", `/api/markets/${marketId}/comments`, body);
  }

  async listComments(marketId: string): Promise<Comment[]> {
    return this.request("GET", `/api/markets/${marketId}/comments`);
  }

  async voteOnComment(
    commentId: string,
    direction: "up" | "down"
  ): Promise<void> {
    return this.request("POST", `/api/comments/${commentId}/vote`, {
      direction,
    });
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    return this.request("GET", "/api/leaderboard");
  }
}
