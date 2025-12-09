import React, { useState, useEffect } from 'react';
import { 
  FileText, Github, Terminal, Search, Bot, Database, 
  Loader2, Sparkles, Building2, Calendar, Hash, AlertTriangle, CheckCircle2, 
  BookOpen, BarChart3, ToggleLeft, ToggleRight, Server, X, Copy, Check, 
  Table2, Layers, DollarSign, XCircle, Clock, Filter, PlayCircle, Code2, 
  Layout, Users, Play, Briefcase, Lock, ArrowRight, Download, Settings2, 
  HelpCircle, FileWarning, AlertOctagon, ClipboardList, ChevronRight, Building 
} from 'lucide-react';

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

export interface DartReportMeta {
  corp_name: string;
  corp_code: string;
  stock_code: string | null;
  bsns_year: number;
  rcept_no: string;
  report_nm: string;
  rcept_dt: string;
  is_correction: boolean;
}

export interface DartBusinessSection {
  corp_code: string;
  bsns_year: number;
  business_section: string;
}

export interface DartFsItem {
  item_name: string;
  raw_value: number;
  amount: number;
  source_row: string;
}

export interface DartFsTable {
  table_index: number;
  fs_type: string; // 'CONSOLIDATED' | 'SEPARATE' | 'UNKNOWN'
  unit_str: string;
  unit_multiplier: number;
  items: DartFsItem[];
}

export interface DartFsSummary {
  corp_code: string;
  bsns_year: number;
  tables: DartFsTable[];
}

export interface CorpEntry {
  corp_code: string;
  stock_code: string;
  corp_name: string;
  market: string; // 'KOSPI' | 'KOSDAQ' | 'OTHER'
  status: 'NOT_STARTED' | 'DONE' | 'FAILED';
  last_error?: string;
}

export interface ApiError {
  detail: string;
}

export interface SearchParams {
  corpName: string;
  year: number;
}

// Unit 6: PeerBot Interface Types

export interface PeerBotFsFlat {
  revenue?: number;
  operating_income?: number;
  net_income?: number;
  total_assets?: number;
  total_liabilities?: number;
  total_equity?: number;
  operating_cf?: number;
  fs_type?: string;
}

export interface PeerBotCompanyProfile {
  corp_code: string;
  stock_code: string;
  corp_name: string;
  market: string;
  bsns_year: number;
  business_section: string | null;
  fs_summary_flat: PeerBotFsFlat | null;
  fs_summary_raw: DartFsSummary | null;
  report_meta: DartReportMeta | null;
  is_virtual?: boolean; // Unit 9
}

export interface PeerBotSearchResult {
  corp_code: string;
  corp_name: string;
  market: string;
}

// Unit 7: Peer Search Engine Types

export interface PeerBotPeer {
  corp_code: string;
  corp_name: string;
  stock_code: string;
  market: string;
  similarity: number;
  scale_value: number;
  // Unit 10: Score Breakdown
  keyword_score?: number;
  cosine_score?: number;
}

// Unit 9: Virtual Peer Search Types
export interface VirtualCompanyInput {
  name: string;
  description: string;
  revenue?: number;
  total_assets?: number;
}

// Unit 11: Peer Exclusion Diagnostics
export interface PeerExclusionResult {
    corp_name: string;
    status: 'INCLUDED' | 'EXCLUDED';
    reason_code: 'SCALE_MISMATCH' | 'LOW_SIMILARITY' | 'DATA_PARSING_ERROR' | 'MARKET_MISMATCH' | 'NOT_FOUND';
    details: {
        metric_name?: string;
        target_value?: string; // e.g., "500B"
        company_value?: string; // e.g., "5000B"
        threshold_range?: string; // e.g., "100B - 1000B"
        score?: number;
        parsing_error_msg?: string;
    };
}

// Unit 12: Peer Explanation & Valuation Report Types
export interface PeerExplanation {
  corpCode: string;
  stockCode?: string;
  corpName: string;
  market?: string;

  // Scores & metrics used as basis
  similarity?: number;
  keywordScore?: number;
  cosineScore?: number;
  scaleMetric?: "revenue" | "totalAssets" | "totalEquity";
  scaleTarget?: number | null;   // e.g., target revenue
  scalePeer?: number | null;     // e.g., peer revenue

  // Generated text (Korean, full sentence)
  summary: string;        // “A사는 ~하기 때문에 피어로 선정되었습니다…”
  bulletPoints?: string[]; // optional, extra detail bullets
}

export interface PeerValuationReport {
  targetLabel: string;  // e.g. “삼성전자 (2024)” or “Virtual – 비상장 소비자금융사”
  year: number;

  // Tabular data used for tables / CSV export
  peersTable: Array<{
    corpCode: string;
    stockCode?: string;
    corpName: string;
    market?: string;

    similarity?: number;
    revenue?: number | null;
    operatingIncome?: number | null;
    netIncome?: number | null;
    totalAssets?: number | null;
    totalEquity?: number | null;
  }>;

  // Per-peer explanations
  peerExplanations: PeerExplanation[];

  // Text blocks for Word/Markdown
  rationaleText: string;        // 피어 셋 선정 사유 요약
  limitationsText: string;      // 한계 및 고려사항 (예: 데이터 누락/특수 케이스 등)
  notesText?: string;           // 추가 메모
}

// Unit 13: Peer Quality Lab Types

export interface GoldenPeerSet {
  id: string;                 // e.g. uuid
  targetCorpCode?: string;    // for listed target
  targetLabel: string;        // human-readable, e.g. "삼성전자 (2024)" or "Virtual – P2P 대출사"
  createdAt: string;          // ISO timestamp

  // Identifiers for peers considered "ground truth" for this target
  goldenPeers: Array<{
    corpCode: string;
    stockCode?: string;
    corpName?: string;
  }>;
}

export interface PeerQualityMetrics {
  k: number;

  // Basic
  precisionAtK: number;   // 0~1
  recallAtK: number;      // 0~1
  hitAtK: boolean;        // any golden peer in top-K?

  // Raw counts
  numGolden: number;
  numHits: number;
}

export interface PeerTuningParams {
  alpha: number;          // keyword weight (0~1)
  beta: number;           // cosine weight (0~1)
  sizeBandLow: number;    // e.g. 0.5
  sizeBandHigh: number;   // e.g. 2.0
  market?: "KOSPI" | "KOSDAQ" | "ALL";
  topK: number;           // e.g. 10
}

export interface PeerQualityEvalResult {
  targetLabel: string;
  targetCorpCode?: string;

  tuning: PeerTuningParams;

  golden: GoldenPeerSet;
  peers: PeerBotPeer[];
  metrics: PeerQualityMetrics;
}

// -----------------------------------------------------------------------------
// SERVICES & MOCK DATA
// -----------------------------------------------------------------------------

// Use Env Var or Default to Empty (Relative Path for Proxy)
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || ''; 

// --- MOCK DATA ---

const MOCK_META_DATA: Record<string, DartReportMeta> = {
  '삼성전자': {
    corp_name: "삼성전자",
    corp_code: "00126380",
    stock_code: "005930",
    bsns_year: 2024,
    rcept_no: "20250331001234",
    report_nm: "사업보고서(2024.01.01~2024.12.31)",
    rcept_dt: "2025-03-31",
    is_correction: false
  },
  '미래에셋증권': {
    corp_name: "미래에셋증권",
    corp_code: "00111754",
    stock_code: "006800",
    bsns_year: 2024,
    rcept_no: "20250330009999",
    report_nm: "사업보고서(2024.01.01~2024.12.31)",
    rcept_dt: "2025-03-30",
    is_correction: false
  },
  '카카오': {
    corp_name: "카카오",
    corp_code: "00258801",
    stock_code: "035720",
    bsns_year: 2024,
    rcept_no: "20250330005678",
    report_nm: "[기재정정]사업보고서(2024.01.01~2024.12.31)",
    rcept_dt: "2025-03-30",
    is_correction: true
  }
};

const MOCK_BUSINESS_SECTION: DartBusinessSection = {
  corp_code: "00126380",
  bsns_year: 2024,
  business_section: "II. 사업의 내용\n\n1. 사업의 개요\n삼성전자는 본사를 거점으로 한국과 DX부문(Device eXperience)의 산하 해외 9개 지역총괄 및 DS부문(Device Solutions)의 산하 해외 5개 지역총괄, SDC(Samsung Display), Harman 산하 종속기업 등 232개의 종속기업으로 구성되어 있습니다...\n(Full Text Simulation - No Truncation)"
};

const MOCK_FS_SUMMARY: DartFsSummary = {
  corp_code: "00126380",
  bsns_year: 2024,
  tables: [
    {
      table_index: 0,
      fs_type: "CONSOLIDATED",
      unit_str: "백만원",
      unit_multiplier: 1000000,
      items: [
        { item_name: "매출액", raw_value: 300000000, amount: 300000000000000, source_row: "Row 1" },
        { item_name: "영업이익", raw_value: 50000000, amount: 50000000000000, source_row: "Row 2" },
        { item_name: "당기순이익", raw_value: 40000000, amount: 40000000000000, source_row: "Row 3" },
        { item_name: "자산총계", raw_value: 450000000, amount: 450000000000000, source_row: "Row 4" }
      ]
    }
  ]
};

const MOCK_UNIVERSE: CorpEntry[] = [
  { corp_code: "00126380", corp_name: "삼성전자", stock_code: "005930", market: "KOSPI", status: "DONE" },
  { corp_code: "00111754", corp_name: "미래에셋증권", stock_code: "006800", market: "KOSPI", status: "DONE" },
  { corp_code: "00258801", corp_name: "카카오", stock_code: "035720", market: "KOSPI", status: "FAILED", last_error: "API Limit Exceeded" },
  { corp_code: "000660", corp_name: "SK하이닉스", stock_code: "000660", market: "KOSPI", status: "DONE" },
  { corp_code: "066570", corp_name: "LG전자", stock_code: "066570", market: "KOSPI", status: "DONE" },
];

const MOCK_PROFILE: PeerBotCompanyProfile = {
    corp_code: "00126380",
    stock_code: "005930",
    corp_name: "삼성전자",
    market: "KOSPI",
    bsns_year: 2024,
    business_section: "II. 사업의 내용\n\n1. 사업의 개요\n이 회사는 글로벌 전자 기업으로...",
    fs_summary_flat: {
        revenue: 300000000000000,
        operating_income: 50000000000000,
        net_income: 40000000000000,
        total_assets: 450000000000000
    },
    fs_summary_raw: null,
    report_meta: null,
    is_virtual: false
};

// --- UNIT 1: REPORT META ---

const fetchReportMeta = async (corpName: string, year: number, useMock: boolean): Promise<DartReportMeta> => {
  if (useMock) {
    await new Promise(r => setTimeout(r, 600));
    const result = MOCK_META_DATA[corpName];
    if (!result) throw new Error("Report not found (Mock). Try '삼성전자', '미래에셋증권' or '카카오'.");
    return result;
  }
  
  const response = await fetch(`${API_BASE_URL}/dart/report-meta?corp_name=${encodeURIComponent(corpName)}&year=${year}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch report meta.");
  }
  return response.json();
};

// --- UNIT 2: BUSINESS SECTION ---

const fetchBusinessSection = async (corpCode: string, rceptNo: string, year: number, useMock: boolean): Promise<DartBusinessSection> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 800));
        return { ...MOCK_BUSINESS_SECTION, corp_code: corpCode, bsns_year: year };
    }

    const response = await fetch(`${API_BASE_URL}/dart/business-section?corp_code=${corpCode}&rcept_no=${rceptNo}&year=${year}`);
    if (!response.ok) throw new Error("Failed to fetch business section.");
    return response.json();
};

// --- UNIT 3: FINANCIAL SUMMARY ---

const fetchFsSummary = async (corpCode: string, rceptNo: string, year: number, useMock: boolean): Promise<DartFsSummary> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 800));
        return { ...MOCK_FS_SUMMARY, corp_code: corpCode, bsns_year: year };
    }

    const response = await fetch(`${API_BASE_URL}/dart/fs-summary?corp_code=${corpCode}&rcept_no=${rceptNo}&year=${year}`);
    if (!response.ok) throw new Error("Failed to fetch financial summary.");
    return response.json();
};

// --- UNIT 5: UNIVERSE ---

const fetchUniverse = async (useMock: boolean): Promise<CorpEntry[]> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 500));
        return MOCK_UNIVERSE;
    }
    // Implement API call if backend exists
    return MOCK_UNIVERSE; 
};

// --- UNIT 6: PEERBOT INTERFACE (SEARCH & PROFILE) ---

const searchPeerBotCompanies = async (query: string, type: 'name' | 'business', useMock: boolean): Promise<PeerBotSearchResult[]> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 400));
        const q = query.toLowerCase();
        return MOCK_UNIVERSE
            .filter(c => type === 'name' ? c.corp_name.includes(q) : true) // Mock business search simplified
            .map(c => ({ corp_code: c.corp_code, corp_name: c.corp_name, market: c.market }));
    }
    
    const endpoint = type === 'name' ? '/peer/search/name' : '/peer/search/business';
    const param = type === 'name' ? `query=${query}` : `keyword=${query}`;
    const response = await fetch(`${API_BASE_URL}${endpoint}?${param}`);
    if (!response.ok) throw new Error("Search failed.");
    const data = await response.json();
    return data.results || [];
};

const fetchPeerBotProfile = async (identifier: string, year: number, useMock: boolean): Promise<PeerBotCompanyProfile> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 700));
        // Return Samsung mock profile for any ID for demo, but customize name if Mirae
        const isMirae = identifier === '00111754';
        return {
            ...MOCK_PROFILE,
            corp_code: identifier,
            corp_name: isMirae ? "미래에셋증권" : "삼성전자",
            business_section: isMirae 
                ? "II. 사업의 내용\n\n1. 사업의 개요\n금융투자업자로서..." 
                : MOCK_PROFILE.business_section,
            fs_summary_flat: isMirae
                ? { revenue: 20000000000000, operating_income: 1000000000000, net_income: 800000000000, total_assets: 100000000000000 }
                : MOCK_PROFILE.fs_summary_flat
        };
    }

    const response = await fetch(`${API_BASE_URL}/peer/company/${identifier}?year=${year}`);
    if (!response.ok) throw new Error("Profile not found.");
    return response.json();
};

// --- UNIT 7 & 9 & 10: PEER SEARCH ENGINE ---

const findPeersForCorp = async (corpCode: string, year: number, useMock: boolean, tuning?: PeerTuningParams): Promise<PeerBotPeer[]> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 800)); // Faster for tuning UI
        
        // Mock Logic based on Corp Code
        if (corpCode === '00126380') { // Samsung
            return [
                { corp_code: "000660", corp_name: "SK하이닉스", stock_code: "000660", market: "KOSPI", similarity: 0.92, scale_value: 150000000000000, keyword_score: 0.95, cosine_score: 0.91 },
                { corp_code: "066570", corp_name: "LG전자", stock_code: "066570", market: "KOSPI", similarity: 0.75, scale_value: 80000000000000, keyword_score: 0.60, cosine_score: 0.79 },
                { corp_code: "009150", corp_name: "삼성전기", stock_code: "009150", market: "KOSPI", similarity: 0.68, scale_value: 10000000000000, keyword_score: 0.50, cosine_score: 0.72 }
            ];
        } 
        if (corpCode === '00111754') { // Mirae Asset
             return [
                { corp_code: "005940", corp_name: "NH투자증권", stock_code: "005940", market: "KOSPI", similarity: 0.88, scale_value: 60000000000000, keyword_score: 0.90, cosine_score: 0.87 },
                { corp_code: "016360", corp_name: "삼성증권", stock_code: "016360", market: "KOSPI", similarity: 0.85, scale_value: 55000000000000, keyword_score: 0.88, cosine_score: 0.84 }
            ];
        }

        return [
             { corp_code: "999999", corp_name: "Generic Peer 1", stock_code: "999999", market: "KOSDAQ", similarity: 0.50, scale_value: 100000000000, keyword_score: 0.5, cosine_score: 0.5 }
        ];
    }

    // Pass tuning params to backend if available
    let qs = `year=${year}`;
    if (tuning) {
        qs += `&alpha=${tuning.alpha}&beta=${tuning.beta}&size_band_low=${tuning.sizeBandLow}&size_band_high=${tuning.sizeBandHigh}&top_k=${tuning.topK}`;
    }

    const response = await fetch(`${API_BASE_URL}/peer/peers/by-corp/${corpCode}?${qs}`);
    if (!response.ok) throw new Error("Failed to find peers.");
    const data = await response.json();
    return data.peers;
};

const findPeersForVirtual = async (input: VirtualCompanyInput, useMock: boolean, tuning?: PeerTuningParams): Promise<PeerBotPeer[]> => {
    if (useMock) {
        await new Promise(r => setTimeout(r, 600)); // Simulate processing time

        const desc = input.description.trim();
        const tokens = desc.split(/\s+/).filter(t => t.length > 0);
        const queryLen = tokens.length;
        
        // Default Unit 10 Weights or Tuning Override
        let alpha = tuning ? tuning.alpha : 0.5;
        let beta = tuning ? tuning.beta : 0.5;
        
        if (!tuning) {
            if (queryLen <= 2) {
                alpha = 0.8; 
                beta = 0.2;
            } else if (queryLen >= 8) {
                alpha = 0.2;
                beta = 0.8;
            }
        }

        const candidates = [
            { corp_code: "00126380", corp_name: "삼성전자", market: "KOSPI", stock_code: "005930", keywords: ["반도체", "semiconductor", "electronics", "mobile", "phone", "galaxy"], scale: 300000000000000 },
            { corp_code: "000660", corp_name: "SK하이닉스", market: "KOSPI", stock_code: "000660", keywords: ["반도체", "semiconductor", "memory", "chip", "nand", "dram"], scale: 150000000000000 },
            { corp_code: "00111754", corp_name: "미래에셋증권", market: "KOSPI", stock_code: "006800", keywords: ["증권", "securities", "finance", "investment", "투자", "asset", "wealth"], scale: 100000000000000 },
            { corp_code: "005940", corp_name: "NH투자증권", market: "KOSPI", stock_code: "005940", keywords: ["증권", "securities", "finance", "nh", "ib"], scale: 60000000000000 },
            { corp_code: "035420", corp_name: "NAVER", market: "KOSPI", stock_code: "035420", keywords: ["platform", "ai", "software", "portal", "search", "cloud", "internet"], scale: 9000000000000 },
            { corp_code: "035720", corp_name: "카카오", market: "KOSPI", stock_code: "035720", keywords: ["platform", "messenger", "ai", "software", "kakao", "content"], scale: 8000000000000 },
            { corp_code: "000270", corp_name: "기아", market: "KOSPI", stock_code: "000270", keywords: ["auto", "car", "vehicle", "mobility", "ev"], scale: 70000000000000 },
            { corp_code: "051910", corp_name: "LG화학", market: "KOSPI", stock_code: "051910", keywords: ["chemical", "battery", "energy", "petrochemical"], scale: 50000000000000 },
        ];

        const scoredPeers = candidates.map(cand => {
            let matchCount = 0;
            const uniqueTokens = new Set(tokens.map(t => t.toLowerCase()));
            
            cand.keywords.forEach(kw => {
                uniqueTokens.forEach(token => {
                    if (token.includes(kw) || kw.includes(token)) matchCount++;
                });
            });
            
            let keywordScore = 0.0;
            if (matchCount > 0) {
                 // Simple mock keyword score
                 keywordScore = Math.min(matchCount / Math.max(1, Math.min(queryLen, 3)), 1.0);
                 if (queryLen <= 2 && matchCount >= 1) keywordScore = 1.0;
            }

            let cosineScore = 0.1 + (Math.random() * 0.2); 
            if (keywordScore > 0.5) cosineScore += 0.4;
            if (queryLen > 5) {
                if (keywordScore > 0.2) cosineScore += 0.3;
            }
            cosineScore = Math.min(cosineScore, 0.95);

            const similarity = (alpha * keywordScore) + (beta * cosineScore);

            return {
                ...cand,
                similarity: Math.min(similarity, 0.99),
                keyword_score: keywordScore,
                cosine_score: cosineScore,
                scale_value: cand.scale
            } as PeerBotPeer;
        });

        let filteredPeers = scoredPeers;
        if (input.revenue) {
            const revenue = input.revenue;
            const bandLow = tuning ? tuning.sizeBandLow : 0.1; // Mock loose default
            const bandHigh = tuning ? tuning.sizeBandHigh : 10.0;

            filteredPeers = scoredPeers.filter(p => {
                return p.scale_value >= (revenue * bandLow) && p.scale_value <= (revenue * bandHigh);
            });
        }
        
        filteredPeers = filteredPeers.filter(p => p.similarity > 0.1);
        filteredPeers.sort((a, b) => b.similarity - a.similarity);
        
        const limit = tuning ? tuning.topK : 5;
        return filteredPeers.slice(0, limit); 
    }

    throw new Error("Backend API for virtual peer search not connected.");
};

// --- UNIT 11: PEER EXCLUSION DIAGNOSTICS ---
const checkPeerExclusion = async (targetCorpName: string, context: { targetScale?: number, description?: string }, useMock: boolean): Promise<PeerExclusionResult> => {
      // 👇 이 한 줄만 추가 (의미 없는 읽기)
  void context;
  // 나머지 기존 로직 그대로
    if (useMock) {
        await new Promise(r => setTimeout(r, 900));
        
        const q = targetCorpName.toLowerCase().trim();

        // Scenario 1: Data Parsing Error (Unit 3 Issue)
        if (q.includes("bad data") || q.includes("error")) {
            return {
                corp_name: targetCorpName,
                status: 'EXCLUDED',
                reason_code: 'DATA_PARSING_ERROR',
                details: {
                    parsing_error_msg: "Unit 3 failed to identify 'Operating Income' row. Table structure mismatch in K-IFRS Consolidated Statement."
                }
            };
        }

        // Scenario 2: Scale Mismatch
        if (q.includes("lg energy") || q.includes("energy")) {
            return {
                corp_name: "LG Energy Solution",
                status: 'EXCLUDED',
                reason_code: 'SCALE_MISMATCH',
                details: {
                    metric_name: "Revenue",
                    target_value: "100T (Approx)", // Context or lookup
                    company_value: "33T", 
                    threshold_range: "0.5x - 2.0x of Target"
                }
            };
        }

        // Scenario 3: Low Similarity
        if (q.includes("pay") || q.includes("bank")) {
             return {
                corp_name: "Kakao Pay",
                status: 'EXCLUDED',
                reason_code: 'LOW_SIMILARITY',
                details: {
                    score: 0.15,
                    threshold_range: "Minimum 0.3 for relevance"
                }
            };
        }

        // Default: Not found in universe
        return {
            corp_name: targetCorpName,
            status: 'EXCLUDED',
            reason_code: 'NOT_FOUND',
            details: {}
        };
    }
    
    // API Implementation would go here
     return {
            corp_name: targetCorpName,
            status: 'EXCLUDED',
            reason_code: 'NOT_FOUND',
            details: {}
    };
};

// --- UNIT 12: PEER EXPLANATION & VALUATION REPORT ---

// Helper for formatting large currency numbers
function formatCurrencyFn(amount: number) {
    if (Math.abs(amount) >= 1000000000000) return `₩${(amount / 1000000000000).toFixed(1)}조`;
    if (Math.abs(amount) >= 1000000000) return `₩${(amount / 1000000000).toFixed(1)}0억`;
    return `₩${amount.toLocaleString()}`;
}

function buildPeerExplanations(params: {
  target: PeerBotCompanyProfile;
  peers: PeerBotPeer[];
}): PeerExplanation[] {
    const targetRevenue = params.target.fs_summary_flat?.revenue || 0;
const isVirtual = params.target.is_virtual;
void isVirtual;  // 한 번 읽었다고 표시

    return params.peers.map(peer => {
        const ratio = targetRevenue > 0 ? (peer.scale_value / targetRevenue) : 0;
        let scaleDesc = "";
        
        if (targetRevenue > 0) {
            scaleDesc = `매출 규모는 타깃의 약 ${ratio.toFixed(1)}배 수준입니다.`;
        } else {
            scaleDesc = `매출 규모는 약 ${formatCurrencyFn(peer.scale_value)} 수준입니다.`;
        }

        const similarityDesc = peer.similarity > 0.8 
            ? "사업 내용이 매우 유사하며," 
            : peer.similarity > 0.6 
            ? "사업 내용에 공통점이 존재하며,"
            : "일부 사업 영역에서 유사성이 발견되며,";

        const keywordDesc = (peer.keyword_score && peer.keyword_score > 0.7)
            ? "주요 키워드(산업/제품)가 타깃과 일치하여 선정되었습니다."
            : "텍스트 문맥 유사도(Cosine)를 기반으로 선정되었습니다.";

        return {
            corpCode: peer.corp_code,
            stockCode: peer.stock_code,
            corpName: peer.corp_name,
            market: peer.market,
            similarity: peer.similarity,
            keywordScore: peer.keyword_score,
            cosineScore: peer.cosine_score,
            scaleMetric: "revenue",
            scaleTarget: targetRevenue,
            scalePeer: peer.scale_value,
            summary: `${peer.corp_name}은(는) ${similarityDesc} ${scaleDesc} ${keywordDesc}`,
            bulletPoints: [
                `Similarity Score: ${(peer.similarity * 100).toFixed(1)}%`,
                `Scale: ${formatCurrencyFn(peer.scale_value)} (Revenue)`
            ]
        };
    });
}

function buildPeerValuationReport(params: {
  target: PeerBotCompanyProfile;
  peers: PeerBotPeer[];
  year: number;
}): PeerValuationReport {
    const targetLabel = params.target.is_virtual 
        ? `Virtual – ${params.target.business_section?.substring(0, 20)}...` 
        : `${params.target.corp_name} (${params.year})`;

    // Generate Explanations
    const explanations = buildPeerExplanations({ target: params.target, peers: params.peers });

    // Mock/Estimate Peer Financials for Table
    const peersTable = params.peers.map(peer => ({
        corpCode: peer.corp_code,
        stockCode: peer.stock_code,
        corpName: peer.corp_name,
        market: peer.market,
        similarity: peer.similarity,
        revenue: peer.scale_value,
        // Mocking other metrics as % of revenue for demo visualization
        operatingIncome: peer.scale_value * 0.12, 
        netIncome: peer.scale_value * 0.08,
        totalAssets: peer.scale_value * 1.5,
        totalEquity: peer.scale_value * 0.8
    }));

    return {
        targetLabel,
        year: params.year,
        peersTable,
        peerExplanations: explanations,
        rationaleText: `본 피어 셋은 ① 사업 구조 유사성(사업보고서 텍스트 분석), ② ${params.year}년 기준 매출 규모의 유사성(0.5x~2.0x 범위), ③ 주요 산업 키워드 매칭 점수를 종합적으로 고려하여 선정하였습니다. 특히, Unit 10 하이브리드 스코어링을 통해 단순 키워드 매칭뿐만 아니라 문맥적 유사도를 함께 반영하였습니다.`,
        limitationsText: `다만, 일부 상장사의 요약재무제표 파싱 실패(Unit 3 한계), 연결범위 차이, 및 최근 시장 환경 변화(주가 변동 등)는 반영되지 않았을 수 있습니다. 또한 Virtual 분석의 경우 입력된 추정치에 의존하므로 실제 상장 요건과는 차이가 있을 수 있습니다.`,
        notesText: "본 보고서는 PeerBot AI가 자동 생성한 초안이며, 최종 투자 판단을 위해서는 전문가의 검토가 필요합니다."
    };
}

// --- UNIT 13: QUALITY LAB ---

// Mock In-Memory Store
const GOLDEN_PEER_SETS: GoldenPeerSet[] = [
    {
        id: 'golden-1',
        targetLabel: '삼성전자 (반도체/모바일)',
        targetCorpCode: '00126380',
        createdAt: new Date().toISOString(),
        goldenPeers: [
            { corpCode: '000660', corpName: 'SK하이닉스' },
            { corpCode: '066570', corpName: 'LG전자' }
        ]
    },
    {
        id: 'golden-2',
        targetLabel: 'Virtual - 증권사',
        createdAt: new Date().toISOString(),
        goldenPeers: [
            { corpCode: '00111754', corpName: '미래에셋증권' },
            { corpCode: '005940', corpName: 'NH투자증권' },
            { corpCode: '016360', corpName: '삼성증권' }
        ]
    }
];

function listGoldenPeerSets(): GoldenPeerSet[] {
    return GOLDEN_PEER_SETS;
}

const runPeerQualityEval = async (params: {
    target: PeerBotCompanyProfile;
    tuning: PeerTuningParams;
    golden: GoldenPeerSet;
    useMock: boolean;
}): Promise<PeerQualityEvalResult> => {
    let peers: PeerBotPeer[] = [];

    // 1. Run Search with Tuning Params
    if (params.target.is_virtual) {
        const input: VirtualCompanyInput = {
            name: params.target.corp_name,
            description: params.target.business_section || '',
            revenue: params.target.fs_summary_flat?.revenue,
            total_assets: params.target.fs_summary_flat?.total_assets
        };
        peers = await findPeersForVirtual(input, params.useMock, params.tuning);
    } else {
        peers = await findPeersForCorp(params.target.corp_code, 2024, params.useMock, params.tuning);
    }

    // 2. Compute Metrics
    const goldenCodes = new Set(params.golden.goldenPeers.map(p => p.corpCode));
    const k = params.tuning.topK;
    const topKPeers = peers.slice(0, k);
    
    let hits = 0;
    topKPeers.forEach(p => {
        if (goldenCodes.has(p.corp_code)) hits++;
    });

    const precision = k > 0 ? hits / k : 0;
    const recall = goldenCodes.size > 0 ? hits / goldenCodes.size : 0;

    return {
        targetLabel: params.golden.targetLabel,
        targetCorpCode: params.target.corp_code,
        tuning: params.tuning,
        golden: params.golden,
        peers: topKPeers,
        metrics: {
            k,
            precisionAtK: precision,
            recallAtK: recall,
            hitAtK: hits > 0,
            numGolden: goldenCodes.size,
            numHits: hits
        }
    };
}

// --- EXPORT HELPERS ---

function generateMarkdownReport(report: PeerValuationReport): string {
    let md = `# Valuation Report: ${report.targetLabel}\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Base Year:** ${report.year}\n\n`;
    
    md += `## 1. Selection Rationale\n${report.rationaleText}\n\n`;
    
    md += `## 2. Peer Summary Table\n`;
    md += `| Company | Code | Market | Similarity | Revenue | Op. Income | Net Income |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    report.peersTable.forEach(p => {
        md += `| ${p.corpName} | ${p.stockCode} | ${p.market} | ${(p.similarity! * 100).toFixed(1)}% | ${formatCurrencyFn(p.revenue!)} | ${formatCurrencyFn(p.operatingIncome!)} | ${formatCurrencyFn(p.netIncome!)} |\n`;
    });
    md += `\n`;

    md += `## 3. Peer Explanations\n`;
    report.peerExplanations.forEach(exp => {
        md += `### ${exp.corpName}\n`;
        md += `- **Similarity:** ${(exp.similarity! * 100).toFixed(1)}%\n`;
        md += `- ${exp.summary}\n\n`;
    });

    md += `## 4. Limitations\n${report.limitationsText}\n`;
    
    return md;
}

function generatePlainTextReport(report: PeerValuationReport): string {
    let txt = `VALUATION REPORT: ${report.targetLabel}\n`;
    txt += `================================================\n\n`;
    
    txt += `1. SELECTION RATIONALE\n`;
    txt += `${report.rationaleText}\n\n`;

    txt += `2. PEER LIST\n`;
    report.peersTable.forEach(p => {
        txt += `- ${p.corpName} (${p.stockCode}): Sim ${(p.similarity! * 100).toFixed(1)}%, Rev ${formatCurrencyFn(p.revenue!)}\n`;
    });
    txt += `\n`;

    txt += `3. DETAILS\n`;
    report.peerExplanations.forEach(exp => {
        txt += `[${exp.corpName}]\n${exp.summary}\n\n`;
    });

    txt += `4. LIMITATIONS\n${report.limitationsText}\n`;
    return txt;
}

function generateCsvReport(report: PeerValuationReport): string {
    const headers = ["CorpName", "StockCode", "Market", "Similarity", "Revenue", "OperatingIncome", "NetIncome", "TotalAssets"];
    const rows = report.peersTable.map(p => [
        p.corpName,
        p.stockCode,
        p.market,
        p.similarity,
        p.revenue,
        p.operatingIncome,
        p.netIncome,
        p.totalAssets
    ].join(","));
    
    return [headers.join(","), ...rows].join("\n");
}


// -----------------------------------------------------------------------------
// COMPONENTS
// -----------------------------------------------------------------------------

interface HeaderProps {
  activeView: 'search' | 'universe' | 'peerbot';
  onViewChange: (view: 'search' | 'universe' | 'peerbot') => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('peerbot')}>
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">피어봇 (PeerBot)</h1>
            <p className="text-xs text-slate-400 hidden sm:block">AI 피어 분석 솔루션</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-800 rounded-lg p-1 space-x-1">
            {/* Main App */}
            <button
                onClick={() => onViewChange('peerbot')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeView === 'peerbot' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
            >
                <Bot className="w-4 h-4" />
                <span className="hidden md:inline">피어봇 (메인)</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-600 mx-2"></div>

            {/* Ingest Tools */}
            <div className="flex space-x-1">
                <button
                    onClick={() => onViewChange('search')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeView === 'search' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">데이터 탐색기</span>
                </button>
                <button
                    onClick={() => onViewChange('universe')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeView === 'universe' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    <span className="hidden md:inline">수집 현황</span>
                </button>
            </div>
        </div>
        
        {/* External Links */}
        <div className="hidden lg:flex items-center space-x-4">
          <a href="#" className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors text-sm">
            <Terminal className="w-4 h-4" />
            <span>API 문서</span>
          </a>
          <a href="#" className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors text-sm">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

interface SearchFormProps {
  onSearch: (corpName: string, year: number) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [corpName, setCorpName] = useState('');
  const [year, setYear] = useState(2024);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (corpName.trim()) {
      onSearch(corpName.trim(), year);
    }
  };

  const handleSampleClick = (name: string) => {
    setCorpName(name);
    onSearch(name, year);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-fade-in">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">데이터 탐색기 (수집봇)</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="corpName" className="block text-sm font-medium text-slate-700 mb-1">
            회사명
          </label>
          <div className="relative">
            <input
              type="text"
              id="corpName"
              className="block w-full rounded-lg border-slate-300 border bg-slate-50 p-3 pl-10 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all"
              placeholder="예: 삼성전자"
              value={corpName}
              onChange={(e) => setCorpName(e.target.value)}
              required
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-slate-700 mb-1">
            사업연도
          </label>
          <select
            id="year"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="block w-full rounded-lg border-slate-300 border bg-slate-50 p-3 text-slate-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {[2024, 2023, 2022, 2021, 2020].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || !corpName.trim()}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
              DART 검색 중...
            </>
          ) : (
            '보고서 메타 조회'
          )}
        </button>
      </form>

      {/* Quick Samples for Unit 4 */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">빠른 샘플 (Unit 4)</p>
        <div className="grid grid-cols-2 gap-2">
            <button 
                type="button"
                onClick={() => handleSampleClick("삼성전자")}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors"
                disabled={isLoading}
            >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>삼성전자</span>
            </button>
            <button 
                type="button"
                onClick={() => handleSampleClick("미래에셋증권")}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors"
                disabled={isLoading}
            >
                <Sparkles className="w-3 h-3 text-orange-500" />
                <span>미래에셋증권</span>
            </button>
        </div>
      </div>
    </div>
  );
};

interface ReportResultProps {
  data: DartReportMeta | null;
  error: string | null;
  onViewBusiness: () => void;
  isBusinessLoading: boolean;
  onViewFsSummary: () => void;
  isFsLoading: boolean;
}

const ReportResult: React.FC<ReportResultProps> = ({ 
    data, 
    error, 
    onViewBusiness, 
    isBusinessLoading,
    onViewFsSummary,
    isFsLoading
}) => {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-fade-in">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">검색 실패</h3>
        <p className="text-red-600 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-400">
        <FileText className="h-16 w-16 mb-4 opacity-20" />
        <p className="text-lg font-medium text-slate-500">선택된 보고서 없음</p>
        <p className="text-sm">회사명과 연도를 입력하여 메타데이터를 조회하세요.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
      {/* Card Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            {data.corp_name}
          </h3>
          <p className="text-slate-500 text-sm mt-1">
            코드: <span className="font-mono text-slate-700">{data.corp_code}</span> 
            {data.stock_code && (
                <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">
                    {data.stock_code}
                </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">사업연도</span>
           <span className="text-2xl font-bold text-slate-800">{data.bsns_year}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Main Report Info */}
            <div className="col-span-1 md:col-span-2 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-1" />
                    <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">보고서명</p>
                        <p className="text-lg font-semibold text-slate-900 leading-snug">{data.report_nm}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Hash className="h-4 w-4" /> 접수번호
                </p>
                <p className="text-base font-mono text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
                    {data.rcept_no}
                </p>
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> 제출일자
                </p>
                <p className="text-base font-mono text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
                    {data.rcept_dt}
                </p>
            </div>

            <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">공시 상태</span>
                    {data.is_correction ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-4 h-4 mr-1.5" />
                            Correction (정정공시)
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Original (최초공시)
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="col-span-1 md:col-span-2 pt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                    onClick={onViewBusiness}
                    disabled={isBusinessLoading || isFsLoading}
                    className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isBusinessLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>추출 중...</span>
                        </>
                    ) : (
                        <>
                            <BookOpen className="w-5 h-5" />
                            <span>사업의 내용 (Unit 2)</span>
                        </>
                    )}
                </button>

                <button
                    onClick={onViewFsSummary}
                    disabled={isFsLoading || isBusinessLoading}
                    className="flex items-center justify-center space-x-2 bg-green-700 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isFsLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>추출 중...</span>
                        </>
                    ) : (
                        <>
                            <BarChart3 className="w-5 h-5" />
                            <span>요약재무제표 (Unit 3)</span>
                        </>
                    )}
                </button>
            </div>
            <p className="col-span-1 md:col-span-2 text-xs text-center text-slate-400 mt-0">
                Unit 2는 "II. 사업의 내용" 원문을 추출하며, Unit 3는 요약재무제표를 파싱합니다.
            </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between">
         <span>출처: DART (금융감독원)</span>
         <span>Units 1, 2, 3 활성화됨</span>
      </div>
    </div>
  );
};

interface BusinessSectionViewerProps {
  data: DartBusinessSection | null;
  isOpen: boolean;
  onClose: () => void;
}

const BusinessSectionViewer: React.FC<BusinessSectionViewerProps> = ({ data, isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.business_section);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Business Overview</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {data.corp_code} | {data.bsns_year} Business Report
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-white font-sans text-slate-800 leading-relaxed text-sm md:text-base">
          <pre className="whitespace-pre-wrap font-sans text-slate-700">
            {data.business_section}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 flex justify-between">
           <span>Unit 2: Business Section Parser</span>
           <span>Length: {data.business_section.length.toLocaleString()} chars</span>
        </div>
      </div>
    </div>
  );
};

interface FinancialSummaryViewerProps {
  data: DartFsSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

const FinancialSummaryViewer: React.FC<FinancialSummaryViewerProps> = ({ data, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen || !data) return null;

  const activeTable = data.tables[activeTab];

  const formatCurrency = (amount: number) => {
    // Format to Trillions (조), Billions (억), or Millions (백만)
    if (Math.abs(amount) >= 1000000000000) {
      return `₩${(amount / 1000000000000).toFixed(2)} T`; // Trillion
    }
    if (Math.abs(amount) >= 1000000000) {
      return `₩${(amount / 1000000000).toFixed(2)} B`; // Billion
    }
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Financial Summary
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {data.corp_code} | {data.bsns_year} Business Report
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Table Tabs */}
        {data.tables.length > 0 && (
          <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 space-x-2 pt-2">
            {data.tables.map((table, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                  activeTab === idx
                    ? 'bg-white text-blue-700 border-t border-x border-slate-200 -mb-px relative z-10'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {table.fs_type === 'CONSOLIDATED' ? (
                  <Layers className="w-4 h-4" />
                ) : (
                  <Table2 className="w-4 h-4" />
                )}
                <span>
                  {table.fs_type === 'CONSOLIDATED' ? 'Consolidated (연결)' : 'Separate (별도)'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="p-0 overflow-y-auto bg-white flex-grow">
          {activeTable ? (
            <div className="min-w-full">
              {/* Table Meta */}
              <div className="px-6 py-3 bg-blue-50/30 text-xs text-slate-500 flex justify-between items-center border-b border-slate-100">
                <span>Original Unit: <strong>{activeTable.unit_str}</strong> (Multiplier: {activeTable.unit_multiplier.toLocaleString()})</span>
                <span>Values converted to KRW</span>
              </div>

              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Raw Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Calculated Amount (KRW)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {activeTable.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                        {item.item_name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500 text-right font-mono">
                        {item.raw_value.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900 text-right font-mono font-semibold">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             <div className="p-12 text-center text-slate-400">
               No summary tables found in this report.
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-400 flex justify-between">
           <span>Unit 3: Financial Summary Parser</span>
           <span>Table Index: {activeTable?.table_index ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

interface UniverseViewerProps {
  useMockMode: boolean;
  onSelectCorp: (corpName: string) => void;
}

const UniverseViewer: React.FC<UniverseViewerProps> = ({ useMockMode, onSelectCorp }) => {
  const [data, setData] = useState<CorpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Filters
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'KOSPI' | 'KOSDAQ'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DONE' | 'FAILED' | 'NOT_STARTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await fetchUniverse(useMockMode);
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [useMockMode]);

  // Derived Data
  const filteredData = data.filter(item => {
    const matchesMarket = filterMarket === 'ALL' || item.market === filterMarket;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch = item.corp_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.corp_code.includes(searchTerm) || 
                          item.stock_code.includes(searchTerm);
    return matchesMarket && matchesStatus && matchesSearch;
  });

  const stats = {
    total: data.length,
    done: data.filter(i => i.status === 'DONE').length,
    failed: data.filter(i => i.status === 'FAILED').length,
    pending: data.filter(i => i.status === 'NOT_STARTED').length,
  };

  const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Batch Progress</p>
             <p className="text-2xl font-bold text-slate-800">{progress}%</p>
           </div>
           <div className="p-3 bg-blue-50 rounded-lg">
             <BarChart3 className="w-6 h-6 text-blue-600" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Completed</p>
             <p className="text-2xl font-bold text-green-600">{stats.done}</p>
           </div>
           <div className="p-3 bg-green-50 rounded-lg">
             <CheckCircle2 className="w-6 h-6 text-green-600" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Failed</p>
             <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
           </div>
           <div className="p-3 bg-red-50 rounded-lg">
             <XCircle className="w-6 h-6 text-red-600" />
           </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-sm text-slate-500 font-medium">Pending</p>
             <p className="text-2xl font-bold text-slate-600">{stats.pending}</p>
           </div>
           <div className="p-3 bg-slate-100 rounded-lg">
             <Clock className="w-6 h-6 text-slate-500" />
           </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search company..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
                    />
                </div>
                
                <div className="h-8 w-px bg-slate-300 mx-2 hidden md:block"></div>
                
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select 
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                        value={filterMarket}
                        onChange={(e) => setFilterMarket(e.target.value as any)}
                    >
                        <option value="ALL">All Markets</option>
                        <option value="KOSPI">KOSPI</option>
                        <option value="KOSDAQ">KOSDAQ</option>
                    </select>
                    <select 
                        className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="DONE">Done</option>
                        <option value="FAILED">Failed</option>
                        <option value="NOT_STARTED">Not Started</option>
                    </select>
                </div>
            </div>
            <div className="text-xs text-slate-500">
                Showing {filteredData.length} companies
            </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Market</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name / Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Error</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                    <span>Loading Universe Data...</span>
                                </div>
                            </td>
                        </tr>
                    ) : filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                No companies found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        filteredData.map((corp) => (
                            <tr key={corp.corp_code} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        corp.market === 'KOSPI' 
                                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                            : 'bg-green-50 text-green-700 border-green-200'
                                    }`}>
                                        {corp.market}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-slate-900">{corp.corp_name}</span>
                                        <span className="text-xs text-slate-500 font-mono">{corp.corp_code} ({corp.stock_code})</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {corp.status === 'DONE' && (
                                        <span className="inline-flex items-center text-xs font-medium text-green-700">
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Done
                                        </span>
                                    )}
                                    {corp.status === 'FAILED' && (
                                        <span className="inline-flex items-center text-xs font-medium text-red-700">
                                            <XCircle className="w-4 h-4 mr-1.5" /> Failed
                                        </span>
                                    )}
                                    {corp.status === 'NOT_STARTED' && (
                                        <span className="inline-flex items-center text-xs font-medium text-slate-400">
                                            <Clock className="w-4 h-4 mr-1.5" /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-red-500 max-w-xs truncate">
                                    {corp.last_error || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        onClick={() => onSelectCorp(corp.corp_name)}
                                        className="text-blue-600 hover:text-blue-900 text-sm font-medium inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        View Report <PlayCircle className="w-4 h-4 ml-1" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

interface PeerBotViewerProps {
  useMockMode: boolean;
}

const MetricCard = ({ label, value, isText = false }: { label: string, value: string | number | undefined, isText?: boolean }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`font-bold text-slate-800 ${isText ? 'text-sm' : 'text-lg'}`}>{value ?? '-'}</p>
    </div>
);

const PeerBotViewer: React.FC<PeerBotViewerProps> = ({ useMockMode }) => {
  // Mode State (Unit 9) - Default to 'virtual' as Main
  const [mode, setMode] = useState<'virtual' | 'listed'>('virtual');

  // Search State (Listed)
  const [searchType, setSearchType] = useState<'name' | 'business'>('name');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PeerBotSearchResult[]>([]);

  // Virtual Input State (Unit 9)
  const [virtualInput, setVirtualInput] = useState<VirtualCompanyInput>({
      name: '',
      description: '',
      revenue: undefined,
      total_assets: undefined
  });

  // Profile State
  const [selectedCorp, setSelectedCorp] = useState<PeerBotSearchResult | null>(null);
  const [profile, setProfile] = useState<PeerBotCompanyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'peers' | 'valuation' | 'lab'>('visual');

  // Peers State (Unit 7)
  const [peers, setPeers] = useState<PeerBotPeer[]>([]);
  const [isFindingPeers, setIsFindingPeers] = useState(false);

  // Unit 11: Exclusion Diagnostics State
  const [diagQuery, setDiagQuery] = useState('');
  const [isCheckingExclusion, setIsCheckingExclusion] = useState(false);
  const [exclusionResult, setExclusionResult] = useState<PeerExclusionResult | null>(null);

  // Unit 12: Valuation Report State
  const [valuationReport, setValuationReport] = useState<PeerValuationReport | null>(null);
  const [exportCopied, setExportCopied] = useState<string | null>(null);

  // Unit 13: Quality Lab State
  const [goldenSets, setGoldenSets] = useState<GoldenPeerSet[]>([]);
  const [selectedGoldenSetId, setSelectedGoldenSetId] = useState<string>('');
  const [tuningParams, setTuningParams] = useState<PeerTuningParams>({
      alpha: 0.5,
      beta: 0.5,
      sizeBandLow: 0.5,
      sizeBandHigh: 2.0,
      topK: 5
  });
  const [evalResult, setEvalResult] = useState<PeerQualityEvalResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
      setGoldenSets(listGoldenPeerSets());
  }, []);

  // Handlers for Listed Mode
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchPeerBotCompanies(query, searchType, useMockMode);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      alert("Search failed. See console.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCorp = async (corp: PeerBotSearchResult) => {
    setSelectedCorp(corp);
    setIsLoadingProfile(true);
    setProfile(null);
    setPeers([]); // Reset peers on new selection
    setExclusionResult(null); // Reset diagnostics
    setValuationReport(null); // Reset report
    setEvalResult(null); // Reset lab results
    setActiveTab('visual'); // Reset tab
    try {
      const data = await fetchPeerBotProfile(corp.corp_code, 2024, useMockMode);
      setProfile(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleFindPeers = async () => {
      if (!selectedCorp) return;
      setIsFindingPeers(true);
      setActiveTab('peers');
      try {
          const results = await findPeersForCorp(selectedCorp.corp_code, 2024, useMockMode);
          setPeers(results);
      } catch (err) {
          console.error(err);
          alert("Failed to find peers.");
      } finally {
          setIsFindingPeers(false);
      }
  };

  // Handlers for Virtual Mode (Unit 9)
  const handleVirtualAnalyze = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!virtualInput.description.trim()) return;

      setIsLoadingProfile(true);
      setProfile(null);
      setPeers([]);
      setExclusionResult(null);
      setValuationReport(null);
      setEvalResult(null);
      
      const virtCorp: PeerBotSearchResult = {
          corp_code: 'VIRTUAL',
          corp_name: virtualInput.name || 'Virtual Corp',
          market: 'PRIVATE'
      };
      setSelectedCorp(virtCorp);
      setActiveTab('peers'); 

      try {
          const virtProfile: PeerBotCompanyProfile = {
              corp_code: 'VIRTUAL',
              stock_code: 'N/A',
              corp_name: virtualInput.name || 'Virtual Corp',
              market: 'PRIVATE',
              bsns_year: 2024,
              business_section: virtualInput.description,
              fs_summary_flat: {
                  revenue: virtualInput.revenue,
                  total_assets: virtualInput.total_assets
              },
              fs_summary_raw: null,
              report_meta: null,
              is_virtual: true
          };
          setProfile(virtProfile);

          setIsFindingPeers(true);
          const results = await findPeersForVirtual(virtualInput, useMockMode);
          setPeers(results);

      } catch (err) {
          console.error(err);
          alert("Virtual analysis failed.");
      } finally {
          setIsFindingPeers(false);
          setIsLoadingProfile(false);
      }
  };

  // Unit 11: Diagnostic Handler
  const handleCheckExclusion = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!diagQuery.trim()) return;

      setIsCheckingExclusion(true);
      setExclusionResult(null);
      try {
          const result = await checkPeerExclusion(diagQuery, {
              targetScale: virtualInput.revenue || profile?.fs_summary_flat?.revenue
          }, useMockMode);
          setExclusionResult(result);
      } catch (err) {
          console.error(err);
      } finally {
          setIsCheckingExclusion(false);
      }
  };

  // Unit 12: Generate Report when tab is clicked
  const handleTabChange = (tab: 'visual' | 'json' | 'peers' | 'valuation' | 'lab') => {
      setActiveTab(tab);
      if (tab === 'valuation' && profile && peers.length > 0 && !valuationReport) {
          const report = buildPeerValuationReport({
              target: profile,
              peers: peers,
              year: 2024
          });
          setValuationReport(report);
      }
  };

  // Unit 12: Export Handlers
  const handleExport = (type: 'markdown' | 'text' | 'csv') => {
      if (!valuationReport) return;
      let content = "";
      if (type === 'markdown') content = generateMarkdownReport(valuationReport);
      if (type === 'text') content = generatePlainTextReport(valuationReport);
      if (type === 'csv') content = generateCsvReport(valuationReport);
      
      navigator.clipboard.writeText(content);
      setExportCopied(type);
      setTimeout(() => setExportCopied(null), 2000);
  };

  // Unit 13: Quality Lab Handlers
  const handleRunEvaluation = async () => {
      if (!selectedGoldenSetId || !profile) {
          alert("먼저 정답 피어 셋(Golden Set)을 선택하고 프로필이 로드되었는지 확인하세요.");
          return;
      }
      const golden = goldenSets.find(g => g.id === selectedGoldenSetId);
      if (!golden) return;

      setIsEvaluating(true);
      try {
          const result = await runPeerQualityEval({
              target: profile,
              tuning: tuningParams,
              golden: golden,
              useMock: useMockMode
          });
          setEvalResult(result);
      } catch (err) {
          console.error(err);
          alert("평가에 실패했습니다.");
      } finally {
          setIsEvaluating(false);
      }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '-';
    if (Math.abs(amount) >= 1000000000000) return `₩${(amount / 1000000000000).toFixed(1)}조`;
    if (Math.abs(amount) >= 1000000000) return `₩${(amount / 1000000000).toFixed(1)}0억`;
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-8rem)] animate-fade-in">
      
      {/* Left Pane: Search & Input */}
      <div className="lg:col-span-4 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full">
        {/* Mode Toggle - Priority Changed */}
        <div className="flex border-b border-slate-200">
            <button
                onClick={() => setMode('virtual')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    mode === 'virtual' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <Lock className="w-4 h-4" /> 비상장 기업 분석
            </button>
            <button
                onClick={() => setMode('listed')}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    mode === 'listed' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <Search className="w-4 h-4" /> 상장사 검색
            </button>
        </div>

        {mode === 'listed' ? (
            // Listed Search UI
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <form onSubmit={handleSearch} className="space-y-3">
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setSearchType('name')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${searchType === 'name' ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
                            >
                                이름 검색
                            </button>
                            <button
                                type="button"
                                onClick={() => setSearchType('business')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${searchType === 'business' ? 'bg-white border-slate-300 text-slate-800 shadow-sm' : 'border-transparent text-slate-500 hover:bg-slate-100'}`}
                            >
                                키워드 검색
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder={searchType === 'name' ? "이름으로 검색 (예: 삼성전자)..." : "사업 내용으로 검색 (예: AI)..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !query.trim()}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSearching ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '검색'}
                        </button>
                    </form>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {searchResults.length === 0 && !isSearching && (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            검색어를 입력하여 기업을 찾으세요.
                        </div>
                    )}
                    {searchResults.map((corp) => (
                        <button
                            key={corp.corp_code}
                            onClick={() => handleSelectCorp(corp)}
                            className={`w-full text-left p-3 rounded-lg flex items-center justify-between group transition-all ${
                                selectedCorp?.corp_code === corp.corp_code 
                                    ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                                    : 'hover:bg-slate-50 border border-transparent'
                            }`}
                        >
                            <div>
                                <p className={`text-sm font-medium ${selectedCorp?.corp_code === corp.corp_code ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {corp.corp_name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${corp.market === 'KOSPI' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {corp.market}
                                    </span>
                                    <span className="text-xs text-slate-400 font-mono">{corp.corp_code}</span>
                                </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${selectedCorp?.corp_code === corp.corp_code ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-400'}`} />
                        </button>
                    ))}
                </div>
            </div>
        ) : (
            // Virtual Analysis UI (Main Mode)
            <div className="flex flex-col h-full overflow-y-auto">
                <div className="p-6">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6">
                        <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> 비상장 기업 분석
                        </h4>
                        <p className="text-xs text-amber-700 mt-1">
                            메인 모드: 비상장 기업 정보를 입력하면 2024년 상장사 유니버스와 비교 분석합니다.
                        </p>
                    </div>

                    <form onSubmit={handleVirtualAnalyze} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">기업명</label>
                            <input 
                                type="text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                placeholder="예: 나의 AI 스타트업"
                                value={virtualInput.name}
                                onChange={(e) => setVirtualInput({...virtualInput, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">사업 개요 <span className="text-red-500">*</span></label>
                            <textarea 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 h-32"
                                placeholder="사업 모델, 제품, 산업군 등을 설명하세요 (예: AI 기반 의료 진단 플랫폼...)"
                                value={virtualInput.description}
                                onChange={(e) => setVirtualInput({...virtualInput, description: e.target.value})}
                                required
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                팁: "반도체", "증권" 같은 짧은 키워드를 입력하면 Unit 10 하이브리드 스코어링을 테스트할 수 있습니다.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">추정 매출액</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 text-xs">₩</span>
                                    <input 
                                        type="number"
                                        className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="선택 사항"
                                        value={virtualInput.revenue || ''}
                                        onChange={(e) => setVirtualInput({...virtualInput, revenue: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">추정 자산총계</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-400 text-xs">₩</span>
                                    <input 
                                        type="number"
                                        className="w-full pl-6 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                                        placeholder="선택 사항"
                                        value={virtualInput.total_assets || ''}
                                        onChange={(e) => setVirtualInput({...virtualInput, total_assets: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoadingProfile}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm mt-4 flex items-center justify-center gap-2"
                        >
                            {isLoadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            상장 피어 찾기
                        </button>
                    </form>
                </div>
            </div>
        )}
      </div>

      {/* Right Pane: Profile & Peers */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        {!selectedCorp ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                <Bot className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">피어봇 준비 완료</p>
                <p className="text-sm">좌측에서 기업을 검색하거나 정보를 입력하세요.</p>
            </div>
        ) : (
            <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {selectedCorp.market === 'PRIVATE' ? <Lock className="w-5 h-5 text-amber-600" /> : <Building className="w-5 h-5 text-indigo-600" />}
                                {selectedCorp.corp_name}
                            </h2>
                            {selectedCorp.market !== 'PRIVATE' && (
                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-mono">{selectedCorp.corp_code}</span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span>시장: <strong>{selectedCorp.market}</strong></span>
                            {profile?.bsns_year && <span>• 연도: {profile.bsns_year}</span>}
                        </p>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <button
                            onClick={() => handleTabChange('visual')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'visual' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Layout className="w-3.5 h-3.5 inline mr-1" /> 프로필
                        </button>
                        <button
                            onClick={() => handleTabChange('peers')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'peers' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Users className="w-3.5 h-3.5 inline mr-1" /> 피어 추천
                        </button>
                        <button
                            onClick={() => handleTabChange('valuation')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'valuation' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <ClipboardList className="w-3.5 h-3.5 inline mr-1" /> 보고서
                        </button>
                        <button
                            onClick={() => handleTabChange('lab')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'lab' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Settings2 className="w-3.5 h-3.5 inline mr-1" /> 품질 실험실
                        </button>
                        <button
                            onClick={() => handleTabChange('json')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'json' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Code2 className="w-3.5 h-3.5 inline mr-1" /> JSON
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50/30 relative">
                    {isLoadingProfile ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : !profile ? (
                         <div className="p-8 text-center text-slate-400">프로필을 불러오지 못했습니다.</div>
                    ) : (
                        <div className="p-6">
                            
                            {/* TAB: VISUAL PROFILE */}
                            {activeTab === 'visual' && (
                                <div className="space-y-6 animate-fade-in">
                                    {/* Key Metrics Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <MetricCard label="매출액" value={formatCurrency(profile.fs_summary_flat?.revenue)} />
                                        <MetricCard label="영업이익" value={formatCurrency(profile.fs_summary_flat?.operating_income)} />
                                        <MetricCard label="순이익" value={formatCurrency(profile.fs_summary_flat?.net_income)} />
                                        <MetricCard label="자산총계" value={formatCurrency(profile.fs_summary_flat?.total_assets)} />
                                    </div>
                                    
                                    {/* Business Text Preview */}
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                                <Briefcase className="w-4 h-4 text-slate-500" />
                                                사업의 내용
                                            </h3>
                                            <span className="text-xs text-slate-400 uppercase tracking-wider">Unit 2 추출</span>
                                        </div>
                                        <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 h-64 overflow-y-auto">
                                            {profile.business_section ? (
                                                <p className="whitespace-pre-wrap">{profile.business_section}</p>
                                            ) : (
                                                <p className="text-slate-400 italic">사업 내용 텍스트가 없습니다.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Call to Action: Find Peers */}
                                    {!profile.is_virtual && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleFindPeers}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                                            >
                                                <Users className="w-5 h-5" />
                                                유사 피어 찾기 (Unit 7)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: PEERS */}
                            {activeTab === 'peers' && (
                                <div className="animate-fade-in h-full flex flex-col">
                                    {isFindingPeers ? (
                                        <div className="flex-1 flex flex-col items-center justify-center text-indigo-600 py-12">
                                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                                            <p className="font-medium">피어 엔진 실행 중...</p>
                                            <p className="text-xs text-slate-500 mt-1">텍스트 유사도 및 재무 지표 거리 계산 중</p>
                                        </div>
                                    ) : peers.length === 0 ? (
                                        <div className="text-center py-12 text-slate-400">
                                            피어를 찾지 못했거나 아직 분석이 실행되지 않았습니다.
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Peer List */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-bold text-slate-800">유사도 랭킹</h3>
                                                    <div className="flex items-center gap-3">
                                                        {/* Unit 10 Legend */}
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> KW (키워드)</div>
                                                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Cos (문맥)</div>
                                                        </div>
                                                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                                            상위 {peers.length}개 추천
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {peers.map((peer, idx) => (
                                                        <div key={peer.corp_code} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 text-sm">
                                                                        {idx + 1}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-slate-800">{peer.corp_name}</p>
                                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                            <span>{peer.market}</span>
                                                                            <span className="text-slate-300">•</span>
                                                                            <span className="font-mono">{peer.corp_code}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">유사도</p>
                                                                    <p className={`text-lg font-bold ${
                                                                        peer.similarity > 0.8 ? 'text-green-600' : 
                                                                        peer.similarity > 0.5 ? 'text-blue-600' : 'text-slate-600'
                                                                    }`}>
                                                                        {(peer.similarity * 100).toFixed(1)}%
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Similarity Bar */}
                                                            <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                                                                <div 
                                                                    className={`h-2 rounded-full ${
                                                                        peer.similarity > 0.8 ? 'bg-green-500' : 
                                                                        peer.similarity > 0.5 ? 'bg-blue-500' : 'bg-slate-400'
                                                                    }`} 
                                                                    style={{ width: `${peer.similarity * 100}%` }}
                                                                ></div>
                                                            </div>

                                                            {/* Unit 10: Score Breakdown */}
                                                            <div className="flex justify-between text-[10px] text-slate-400 mb-3 px-1">
                                                                <span>KW: {(peer.keyword_score ? (peer.keyword_score * 100).toFixed(0) : 0)}%</span>
                                                                <span>Cos: {(peer.cosine_score ? (peer.cosine_score * 100).toFixed(0) : 0)}%</span>
                                                            </div>

                                                            {/* Comparison Stats */}
                                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                                                                <div>
                                                                    <p className="text-xs text-slate-400">규모 지표</p>
                                                                    <p className="text-sm font-medium text-slate-700">{formatCurrency(peer.scale_value)}</p>
                                                                </div>
                                                                <div className="flex items-center justify-end">
                                                                    <button 
                                                                        onClick={() => {
                                                                            // Fix: View Profile Interaction
                                                                            const target = {
                                                                                corp_code: peer.corp_code,
                                                                                corp_name: peer.corp_name,
                                                                                market: peer.market
                                                                            };
                                                                            handleSelectCorp(target);
                                                                        }}
                                                                        className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                                                    >
                                                                        프로필 보기 <ArrowRight className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Unit 11: Exclusion Diagnostics Tool */}
                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-8">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <HelpCircle className="w-4 h-4 text-slate-500" />
                                                    <h4 className="text-sm font-bold text-slate-700">찾는 기업이 없나요? (제외 진단 Unit 11)</h4>
                                                </div>
                                                <form onSubmit={handleCheckExclusion} className="flex gap-2 mb-3">
                                                    <input 
                                                        type="text" 
                                                        placeholder="기업명 입력 (예: 카카오페이)..." 
                                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
                                                        value={diagQuery}
                                                        onChange={(e) => setDiagQuery(e.target.value)}
                                                    />
                                                    <button 
                                                        type="submit" 
                                                        disabled={isCheckingExclusion || !diagQuery}
                                                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        {isCheckingExclusion ? <Loader2 className="w-4 h-4 animate-spin" /> : '진단'}
                                                    </button>
                                                </form>

                                                {exclusionResult && (
                                                    <div className={`p-3 rounded-lg text-sm border ${
                                                        exclusionResult.status === 'EXCLUDED' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'
                                                    }`}>
                                                        <div className="flex items-center gap-2 font-bold mb-1">
                                                            {exclusionResult.status === 'EXCLUDED' ? <AlertOctagon className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                            {exclusionResult.corp_name}: {exclusionResult.status}
                                                        </div>
                                                        <p className="mb-2">사유: <strong>{exclusionResult.reason_code}</strong></p>
                                                        
                                                        <div className="text-xs bg-white/50 p-2 rounded">
                                                            {exclusionResult.details.parsing_error_msg && (
                                                                <p className="text-red-600 flex items-center gap-1">
                                                                    <FileWarning className="w-3 h-3" /> {exclusionResult.details.parsing_error_msg}
                                                                </p>
                                                            )}
                                                            {exclusionResult.reason_code === 'SCALE_MISMATCH' && (
                                                                <p>규모 불일치: {exclusionResult.details.company_value} vs 타깃 {exclusionResult.details.target_value}</p>
                                                            )}
                                                            {exclusionResult.reason_code === 'LOW_SIMILARITY' && (
                                                                <p>유사도 {exclusionResult.details.score} 가 임계값 미만입니다.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: VALUATION NOTE (Unit 12) */}
                            {activeTab === 'valuation' && (
                                <div className="animate-fade-in h-full flex flex-col">
                                    {!valuationReport ? (
                                        <div className="text-center py-12 text-slate-400">
                                            보고서가 없습니다. 먼저 피어 추천을 실행하세요.
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Toolbar */}
                                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-green-600" />
                                                    가치평가 노트
                                                </h3>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleExport('markdown')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-colors" title="Copy Markdown">
                                                        {exportCopied === 'markdown' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Download className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => handleExport('text')} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition-colors" title="Copy Text">
                                                        {exportCopied === 'text' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Rationale Section */}
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-sm text-slate-700 leading-relaxed">
                                                <h4 className="font-bold text-blue-800 mb-2">1. 선정 사유</h4>
                                                <p>{valuationReport.rationaleText}</p>
                                            </div>

                                            {/* Peer Table */}
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-3 text-sm">2. 피어 요약표</h4>
                                                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                                                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                                                        <thead className="bg-slate-50">
                                                            <tr>
                                                                <th className="px-3 py-2 text-left font-medium text-slate-500">기업명</th>
                                                                <th className="px-3 py-2 text-right font-medium text-slate-500">유사도</th>
                                                                <th className="px-3 py-2 text-right font-medium text-slate-500">매출액</th>
                                                                <th className="px-3 py-2 text-right font-medium text-slate-500">영업이익</th>
                                                                <th className="px-3 py-2 text-right font-medium text-slate-500">순이익</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-slate-200">
                                                            {valuationReport.peersTable.map((p) => (
                                                                <tr key={p.corpCode}>
                                                                    <td className="px-3 py-2 font-medium text-slate-700">{p.corpName}</td>
                                                                    <td className="px-3 py-2 text-right">{(p.similarity! * 100).toFixed(1)}%</td>
                                                                    <td className="px-3 py-2 text-right">{formatCurrencyFn(p.revenue!)}</td>
                                                                    <td className="px-3 py-2 text-right">{formatCurrencyFn(p.operatingIncome!)}</td>
                                                                    <td className="px-3 py-2 text-right">{formatCurrencyFn(p.netIncome!)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Peer Details */}
                                            <div>
                                                <h4 className="font-bold text-slate-800 mb-3 text-sm">3. 피어 상세</h4>
                                                <div className="space-y-3">
                                                    {valuationReport.peerExplanations.map((exp) => (
                                                        <div key={exp.corpCode} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-sm text-slate-800">{exp.corpName}</span>
                                                                <span className="text-xs text-slate-400">유사도: {(exp.similarity! * 100).toFixed(0)}%</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 leading-relaxed">{exp.summary}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Limitations */}
                                            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs text-slate-600 leading-relaxed">
                                                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> 한계점
                                                </h4>
                                                <p>{valuationReport.limitationsText}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: QUALITY LAB (Unit 13) */}
                            {activeTab === 'lab' && (
                                <div className="animate-fade-in h-full flex flex-col space-y-6">
                                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                        <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-2">
                                            <Settings2 className="w-5 h-5" /> 품질 실험실 (Quality Lab)
                                        </h3>
                                        <p className="text-xs text-purple-700">
                                            정답셋(Ground Truth)을 기준으로 피어봇 엔진 성능을 테스트하고 튜닝합니다.
                                        </p>
                                    </div>

                                    {/* 1. Golden Set Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">골든 피어 셋 (정답지)</label>
                                        <select 
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                            value={selectedGoldenSetId}
                                            onChange={(e) => setSelectedGoldenSetId(e.target.value)}
                                        >
                                            <option value="">골든 셋 선택...</option>
                                            {goldenSets.map(g => (
                                                <option key={g.id} value={g.id}>{g.targetLabel} ({g.goldenPeers.length} peers)</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 2. Tuning Panel */}
                                    <div className="space-y-4 border-t border-slate-100 pt-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700">엔진 파라미터</label>
                                            <button 
                                                onClick={handleRunEvaluation}
                                                disabled={!selectedGoldenSetId || isEvaluating}
                                                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                                평가 실행
                                            </button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Alpha (키워드 가중치): {tuningParams.alpha}</label>
                                                <input 
                                                    type="range" min="0" max="1" step="0.1" 
                                                    value={tuningParams.alpha}
                                                    onChange={(e) => setTuningParams({...tuningParams, alpha: parseFloat(e.target.value)})}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">Beta (코사인 가중치): {tuningParams.beta}</label>
                                                <input 
                                                    type="range" min="0" max="1" step="0.1" 
                                                    value={tuningParams.beta}
                                                    onChange={(e) => setTuningParams({...tuningParams, beta: parseFloat(e.target.value)})}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">규모 범위 하한: {tuningParams.sizeBandLow}x</label>
                                                <input 
                                                    type="range" min="0.1" max="1.0" step="0.1" 
                                                    value={tuningParams.sizeBandLow}
                                                    onChange={(e) => setTuningParams({...tuningParams, sizeBandLow: parseFloat(e.target.value)})}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-slate-500 mb-1">규모 범위 상한: {tuningParams.sizeBandHigh}x</label>
                                                <input 
                                                    type="range" min="1.0" max="5.0" step="0.5" 
                                                    value={tuningParams.sizeBandHigh}
                                                    onChange={(e) => setTuningParams({...tuningParams, sizeBandHigh: parseFloat(e.target.value)})}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Results Dashboard */}
                                    {evalResult && (
                                        <div className="space-y-4 border-t border-slate-100 pt-4 animate-fade-in">
                                            <h4 className="font-bold text-slate-800 text-sm">평가 결과</h4>
                                            
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className={`p-3 rounded-lg border text-center ${evalResult.metrics.precisionAtK > 0.6 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                                    <p className="text-xs uppercase tracking-wider mb-1">정밀도@{evalResult.metrics.k}</p>
                                                    <p className="text-xl font-bold">{(evalResult.metrics.precisionAtK * 100).toFixed(0)}%</p>
                                                </div>
                                                <div className={`p-3 rounded-lg border text-center ${evalResult.metrics.recallAtK > 0.6 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                                    <p className="text-xs uppercase tracking-wider mb-1">재현율@{evalResult.metrics.k}</p>
                                                    <p className="text-xl font-bold">{(evalResult.metrics.recallAtK * 100).toFixed(0)}%</p>
                                                </div>
                                                <div className="p-3 rounded-lg border bg-slate-50 border-slate-200 text-center text-slate-700">
                                                    <p className="text-xs uppercase tracking-wider mb-1">적중 / 정답수</p>
                                                    <p className="text-xl font-bold">{evalResult.metrics.numHits} / {evalResult.metrics.numGolden}</p>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                                                <table className="w-full text-xs">
                                                    <thead>
                                                        <tr className="text-left text-slate-500 border-b border-slate-200">
                                                            <th className="pb-2">피어명</th>
                                                            <th className="pb-2 text-right">유사도</th>
                                                            <th className="pb-2 text-right">적중?</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {evalResult.peers.map((p, idx) => {
                                                            const isHit = evalResult.golden.goldenPeers.some(g => g.corpCode === p.corp_code);
                                                            return (
                                                                <tr key={idx} className={isHit ? "bg-green-50 font-medium" : ""}>
                                                                    <td className="py-1.5">{p.corp_name}</td>
                                                                    <td className="py-1.5 text-right">{(p.similarity * 100).toFixed(0)}%</td>
                                                                    <td className="py-1.5 text-right">
                                                                        {isHit ? <span className="text-green-600">✅</span> : <span className="text-slate-400">-</span>}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB: JSON */}
                            {activeTab === 'json' && (
                                <div className="relative">
                                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed">
                                        {JSON.stringify(profile, null, 2)}
                                    </pre>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// MAIN APP
// -----------------------------------------------------------------------------

export default function App() {
  // Unit 8: PeerBot is now the main view
  const [activeView, setActiveView] = useState<'search' | 'universe' | 'peerbot'>('peerbot');

  // Search View State
  const [reportData, setReportData] = useState<DartReportMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Unit 2 State
  const [businessData, setBusinessData] = useState<DartBusinessSection | null>(null);
  const [isBusinessLoading, setIsBusinessLoading] = useState(false);
  const [isBusinessViewerOpen, setIsBusinessViewerOpen] = useState(false);

  // Unit 3 State (Financial Summary)
  const [fsData, setFsData] = useState<DartFsSummary | null>(null);
  const [isFsLoading, setIsFsLoading] = useState(false);
  const [isFsViewerOpen, setIsFsViewerOpen] = useState(false);

  // Toggle for Demonstration purposes vs Real API
  const [useMockMode, setUseMockMode] = useState(true);

  const handleSearch = async (corpName: string, year: number) => {
    setIsLoading(true);
    setError(null);
    setReportData(null);
    // Reset child units state on new search
    setBusinessData(null);
    setIsBusinessViewerOpen(false);
    setFsData(null);
    setIsFsViewerOpen(false);

    try {
      const data = await fetchReportMeta(corpName, year, useMockMode);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBusiness = async () => {
    if (!reportData) return;

    if (businessData) {
        setIsBusinessViewerOpen(true);
        return;
    }

    setIsBusinessLoading(true);
    try {
        const data = await fetchBusinessSection(
            reportData.corp_code, 
            reportData.rcept_no, 
            reportData.bsns_year, 
            useMockMode
        );
        setBusinessData(data);
        setIsBusinessViewerOpen(true);
    } catch (err: any) {
        alert(err.message || "Failed to load Business Section.");
    } finally {
        setIsBusinessLoading(false);
    }
  };

  const handleViewFsSummary = async () => {
    if (!reportData) return;

    if (fsData) {
        setIsFsViewerOpen(true);
        return;
    }

    setIsFsLoading(true);
    try {
        const data = await fetchFsSummary(
            reportData.corp_code, 
            reportData.rcept_no, 
            reportData.bsns_year, 
            useMockMode
        );
        setFsData(data);
        setIsFsViewerOpen(true);
    } catch (err: any) {
        alert(err.message || "Failed to load Financial Summary.");
    } finally {
        setIsFsLoading(false);
    }
  };

  const handleSelectFromUniverse = (corpName: string) => {
    setActiveView('search');
    // Auto trigger search for the selected company
    handleSearch(corpName, 2024);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Header activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection Status Bar */}
        <div className="flex justify-between items-center mb-6">
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">
                     {activeView === 'peerbot' && '피어봇 워크스페이스'}
                     {activeView === 'search' && '데이터 탐색기 (수집봇)'}
                     {activeView === 'universe' && '수집 현황 대시보드'}
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">
                    {activeView === 'peerbot' && '메인 앱: 기업 분석 및 피어 탐색'}
                    {activeView === 'search' && '서브 도구: DART 원문 데이터 탐색 및 추출 로직 검증'}
                    {activeView === 'universe' && '서브 도구: 배치 수집 현황 모니터링'}
                 </p>
            </div>
            <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
                <span className={`text-xs font-bold uppercase tracking-wider ${useMockMode ? 'text-amber-600' : 'text-green-600'}`}>
                    {useMockMode ? '데모 모드' : '실시간 API 모드'}
                </span>
                <button 
                    onClick={() => setUseMockMode(!useMockMode)}
                    className="focus:outline-none transition-colors text-slate-400 hover:text-blue-600"
                    title={useMockMode ? "Switch to Real API" : "Switch to Demo Mock"}
                >
                    {useMockMode ? <ToggleLeft className="w-8 h-8" /> : <ToggleRight className="w-8 h-8 text-green-500" />}
                </button>
                <div className="h-4 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center text-xs text-slate-400">
                    <Server className="w-3 h-3 mr-1" />
                    {useMockMode ? 'Browser Mock' : ((import.meta as any).env?.VITE_API_URL || 'localhost:8000')}
                </div>
            </div>
        </div>

        {activeView === 'search' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
              {/* Left Column: Search */}
              <div className="lg:col-span-4 space-y-6">
                <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                
                {/* Helper Info */}
                <div className="bg-slate-200/50 rounded-lg p-4 text-sm text-slate-600 border border-slate-200">
                    <h4 className="font-semibold mb-2 text-slate-700">데이터 소스 (수집봇)</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>이 화면은 <strong>DART 인제스트 봇</strong> 레이어에 연결됩니다.</li>
                        <li>Unit 1: 보고서 메타데이터</li>
                        <li>Unit 2: 사업의 내용 텍스트 추출</li>
                        <li>Unit 3: 재무제표 테이블 파싱</li>
                    </ul>
                </div>
              </div>

              {/* Right Column: Result */}
              <div className="lg:col-span-8">
                 <ReportResult 
                    data={reportData} 
                    error={error} 
                    onViewBusiness={handleViewBusiness}
                    isBusinessLoading={isBusinessLoading}
                    onViewFsSummary={handleViewFsSummary}
                    isFsLoading={isFsLoading}
                 />
              </div>
            </div>
        )}

        {activeView === 'universe' && (
            <UniverseViewer 
                useMockMode={useMockMode} 
                onSelectCorp={handleSelectFromUniverse} 
            />
        )}

        {activeView === 'peerbot' && (
            <PeerBotViewer useMockMode={useMockMode} />
        )}

      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} PeerBot. Powered by DART-FSS & React.
            </p>
        </div>
      </footer>

      <BusinessSectionViewer 
        data={businessData}
        isOpen={isBusinessViewerOpen}
        onClose={() => setIsBusinessViewerOpen(false)}
      />

      <FinancialSummaryViewer
        data={fsData}
        isOpen={isFsViewerOpen}
        onClose={() => setIsFsViewerOpen(false)}
      />
    </div>
  );
}