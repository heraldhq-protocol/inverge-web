import { fixtureComments, fixtureIdeaDetail, fixtureSurvey } from '@/lib/fixtures/ideas';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';
import type { IdeaComment, IdeaDetail, SurveyAggregate, SurveyQuestion } from './types';
import type { FeedItem } from '@/lib/feed/types';

function getAuthHeaders(token?: string): Record<string, string> {
  const authToken = token ?? getSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

async function handleApiError(res: Response, fallbackPrefix: string): Promise<never> {
  let detail = '';
  try {
    const errData = await res.json();
    if (Array.isArray(errData.message)) {
      detail = errData.message.join('; ');
    } else if (typeof errData.message === 'string') {
      detail = errData.message;
    } else if (errData.error) {
      detail = errData.error;
    }
  } catch {
    // Response body was not JSON
  }
  const fullMsg = detail ? `${fallbackPrefix}: ${detail}` : `${fallbackPrefix} (${res.status})`;
  throw new Error(fullMsg);
}

function normalizeIdeaDetail(raw: any): IdeaDetail {
  return {
    objectType: 'idea',
    id: raw.id,
    slug: raw.slug ?? raw.id,
    title: raw.title,
    problem: raw.problem,
    solution: raw.solution,
    solutionDoc: raw.solutionDoc ?? null,
    problemDoc: raw.problemDoc ?? null,
    targetUser: raw.targetUser ?? null,
    currentAlternative: raw.currentAlternative ?? null,
    askBreakdown: raw.askBreakdown ?? null,
    roadmapSteps: raw.roadmapSteps ?? null,
    risks: raw.risks ?? null,
    category: raw.category ?? 'software',
    region: raw.region ?? null,
    askAmount: String(raw.askAmount ?? '0'),
    status: raw.status ?? 'VALIDATING',
    discoverabilityTier: raw.discoverabilityTier ?? 'DISCOVERABLE',
    supporterCount: raw.supporterCount ?? 0,
    weightedPrePledgeTotal: String(raw.weightedPrePledgeTotal ?? '0'),
    feedbackScore: String(raw.feedbackScore ?? '0'),
    feedbackCount: raw.feedbackCount ?? 0,
    commentCount: raw.commentCount ?? 0,
    qualityScore: raw.qualityScore ? String(raw.qualityScore) : null,
    creatorId: raw.creatorId ?? raw.creator?.id,
    roadmap: raw.roadmap ?? '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date(raw.createdAt).toISOString(),
    publishedAt: raw.publishedAt
      ? typeof raw.publishedAt === 'string'
        ? raw.publishedAt
        : new Date(raw.publishedAt).toISOString()
      : null,
    creator: raw.creator
      ? {
          id: raw.creator.id ?? raw.creatorId,
          username: raw.creator.username ?? raw.creator.id ?? raw.creatorId,
          displayName: raw.creator.displayName ?? 'Anonymous',
          avatarUrl: raw.creator.avatarUrl ?? null,
          identityVerified: Boolean(raw.creator.identityVerified),
          bio: raw.creator.bio ?? null,
          tier: raw.creator.tier ?? 'STARTER',
          completedCampaigns: raw.creator.completedCampaigns ?? 0,
          ideasPublished: raw.creator.ideasPublished ?? 0,
          memberSince: raw.creator.memberSince ?? new Date().toISOString(),
        }
      : {
          id: raw.creatorId ?? 'unknown',
          username: raw.creatorId ?? 'unknown',
          displayName: 'Anonymous',
          avatarUrl: null,
          identityVerified: false,
          bio: null,
          tier: 'STARTER',
          completedCampaigns: 0,
          ideasPublished: 0,
          memberSince: new Date().toISOString(),
        },
  };
}

function normalizeComment(c: any): IdeaComment {
  return {
    id: c.id,
    parentId: c.parentId ?? null,
    body: c.body,
    likeCount: c.likeCount ?? 0,
    likedByMe: Boolean(c.likedByMe),
    highlighted: Boolean(c.highlighted),
    removed: Boolean(c.removed),
    createdAt: typeof c.createdAt === 'string' ? c.createdAt : new Date(c.createdAt).toISOString(),
    author: {
      id: c.author?.id ?? c.userId ?? 'unknown',
      displayName: c.author?.displayName || 'Creator',
      avatarUrl: c.author?.avatarUrl ?? null,
      identityVerified: Boolean(c.author?.identityVerified),
      isCreator: Boolean(c.author?.isCreator),
    },
  };
}

const createdIdeasCache = new Map<string, IdeaDetail>();

export function cacheCreatedIdea(idea: IdeaDetail): void {
  if (!idea) return;
  if (idea.id) createdIdeasCache.set(idea.id, idea);
  if (idea.slug) createdIdeasCache.set(idea.slug, idea);
}

export async function getIdea(idOrSlug: string, token?: string): Promise<IdeaDetail | null> {
  const cached = createdIdeasCache.get(idOrSlug);
  if (cached) return cached;

  if (env.useFixtures) return fixtureIdeaDetail(idOrSlug);

  try {
    const res = await fetch(`${env.apiUrl}/ideas/${idOrSlug}`, {
      headers: getAuthHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[ideas-api] getIdea returned ${res.status}, falling back to fixture`);
      return fixtureIdeaDetail(idOrSlug);
    }
    const raw = await res.json();
    const detail = normalizeIdeaDetail(raw);
    cacheCreatedIdea(detail);
    return detail;
  } catch (err) {
    console.warn(`[ideas-api] getIdea failed (${idOrSlug}), falling back to fixture:`, err);
    return fixtureIdeaDetail(idOrSlug);
  }
}

export async function getSurvey(
  ideaId: string,
  token?: string
): Promise<{ questions: SurveyQuestion[]; aggregates: SurveyAggregate[] }> {
  if (env.useFixtures) return fixtureSurvey();

  try {
    const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/survey`, {
      headers: getAuthHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[ideas-api] getSurvey returned ${res.status}, falling back to fixture`);
      return fixtureSurvey();
    }
    return await res.json();
  } catch (err) {
    console.warn(`[ideas-api] getSurvey failed (${ideaId}), falling back to fixture:`, err);
    return fixtureSurvey();
  }
}

export async function getComments(ideaId: string, token?: string): Promise<IdeaComment[]> {
  if (env.useFixtures) return fixtureComments();

  try {
    const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments`, {
      headers: getAuthHeaders(token),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[ideas-api] getComments returned ${res.status}, falling back to fixture`);
      return fixtureComments();
    }
    const rawList = await res.json();
    if (!Array.isArray(rawList)) return fixtureComments();
    return rawList.map(normalizeComment);
  } catch (err) {
    console.warn(`[ideas-api] getComments failed (${ideaId}), falling back to fixture:`, err);
    return fixtureComments();
  }
}

/** Validation signal: support an idea */
export async function supportIdea(ideaId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/support`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Support request failed');
}

/** Validation signal: remove support */
export async function unsupportIdea(ideaId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/support`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Unsupport request failed');
}

/** Validation signal: pre-pledge intent amount */
export async function prePledgeIdea(
  ideaId: string,
  amount: number,
  currency: string = 'USD',
  token?: string
): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/pre-pledge`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount, currency }),
  });
  if (!res.ok) await handleApiError(res, 'Pre-pledge failed');
}

/** Validation signal: withdraw pre-pledge */
export async function withdrawPrePledge(ideaId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/pre-pledge`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Withdraw pre-pledge failed');
}

/** Post a new comment */
export async function postComment(
  ideaId: string,
  body: string,
  parentId?: string | null,
  token?: string
): Promise<IdeaComment> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ body, parentId: parentId ?? undefined }),
  });
  if (!res.ok) await handleApiError(res, 'Post comment failed');
  const raw = await res.json();
  return normalizeComment(raw);
}

/** Like a comment */
export async function likeComment(ideaId: string, commentId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments/${commentId}/like`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Like comment failed');
}

/** Unlike a comment */
export async function unlikeComment(ideaId: string, commentId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments/${commentId}/like`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Unlike comment failed');
}

/** Remove a comment (author or creator) */
export async function removeComment(ideaId: string, commentId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments/${commentId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Delete comment failed');
}

/** Highlight a comment (creator only) */
export async function highlightComment(
  ideaId: string,
  commentId: string,
  highlighted: boolean,
  token?: string
): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments/${commentId}/highlight`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ highlighted }),
  });
  if (!res.ok) await handleApiError(res, 'Highlight comment failed');
}

/** Submit survey feedback responses */
export async function submitSurveyResponses(
  ideaId: string,
  responses: Array<{ questionId: string; rating?: number; text?: string; selectedOptions?: string[] }>,
  token?: string
): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/survey/responses`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ responses }),
  });
  if (!res.ok) await handleApiError(res, 'Survey submission failed');
}

/** Submit quick feedback (rating + optional body) */
export async function submitFeedback(
  ideaId: string,
  rating: number,
  body?: string,
  token?: string
): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/feedback`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ rating, body }),
  });
  if (!res.ok) await handleApiError(res, 'Feedback submission failed');
}

/** Create a new idea draft */
export async function createIdea(
  data: {
    title: string;
    problem: string;
    solution: string;
    problemDoc?: any;
    solutionDoc?: any;
    targetUser?: string;
    currentAlternative?: string;
    askBreakdown?: any;
    roadmapSteps?: any[];
    category: string;
    region?: string;
    coverImageUrl?: string;
    risks?: string;
    roadmap?: string;
    askAmount: number;
  },
  token?: string
): Promise<IdeaDetail> {
  const headers = getAuthHeaders(token);
  const payload = {
    ...data,
    askBreakdown: data.askBreakdown ?? {},
  };
  const res = await fetch(`${env.apiUrl}/ideas`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) await handleApiError(res, 'Create idea failed');
  const raw = await res.json();
  const detail = normalizeIdeaDetail(raw);
  cacheCreatedIdea(detail);
  return detail;
}

/** Publish a draft idea */
export async function publishIdea(id: string, token?: string): Promise<IdeaDetail> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${id}/publish`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) await handleApiError(res, 'Publish idea failed');
  const raw = await res.json();
  const detail = normalizeIdeaDetail(raw);
  cacheCreatedIdea(detail);
  return detail;
}

/** Convert a validated idea to a campaign draft */
export async function convertIdea(id: string, data: any, token?: string): Promise<any> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${id}/convert`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) await handleApiError(res, 'Convert idea failed');
  return res.json();
}

/** Fetch creator analytics & insights for an idea */
export async function getIdeaInsights(ideaId: string, token?: string): Promise<any> {
  try {
    const headers = getAuthHeaders(token);
    const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/insights`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[ideas-api] getIdeaInsights returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[ideas-api] getIdeaInsights failed for ${ideaId}:`, err);
    return null;
  }
}

export type CreatorPublicProfile = {
  creator: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    tier: string;
    completedCampaigns: number;
    ideasPublished: number;
    identityVerified: boolean;
    memberSince: string;
  };
  ideasPublished: FeedItem[];
  ideasSupported: FeedItem[];
};

/** Map a raw DB-shaped idea (from the creator profile endpoint) to a FeedItem */
function normalizeCreatorIdea(raw: any): FeedItem {
  const creator = raw.creator;
  return {
    objectType: 'idea',
    id: raw.id,
    slug: raw.slug ?? raw.id,
    title: raw.title ?? 'Untitled',
    problem: raw.problem ?? '',
    solution: raw.solution ?? '',
    category: raw.category ?? 'other',
    region: raw.region ?? null,
    askAmount: String(raw.askAmount ?? '0'),
    status: raw.status ?? 'VALIDATING',
    discoverabilityTier: raw.discoverabilityTier ?? 'DISCOVERABLE',
    supporterCount: raw.supporterCount ?? 0,
    weightedPrePledgeTotal: String(raw.weightedPrePledgeTotal ?? '0'),
    feedbackScore: String(raw.feedbackScore ?? '0'),
    feedbackCount: raw.feedbackCount ?? 0,
    commentCount: raw.commentCount ?? 0,
    qualityScore: raw.qualityScore ? String(raw.qualityScore) : null,
    creatorId: raw.creatorId ?? creator?.id ?? 'unknown',
    creator: creator
      ? {
          id: creator.id,
          username: creator.username ?? creator.id,
          displayName: creator.displayName ?? 'Creator',
          avatarUrl: creator.avatarUrl ?? null,
          identityVerified: Boolean(creator.identityVerified),
        }
      : undefined,
    promoted: Boolean(raw.promoted),
    boostTier: raw.boostTier ?? null,
    exploration: Boolean(raw.exploration),
    // Creator profile ideas have no feed ranking reason — omit the chip gracefully
    reason: raw.reason ?? undefined,
    creatorPrePledgeTarget: raw.creatorPrePledgeTarget ?? null,
    validatingSince: raw.validatingSince ?? null,
    topics: raw.topics ?? [],
    coverImageUrl: raw.coverImageUrl ?? null,
  } as FeedItem;
}

/** Fetch public creator profile and their published + supported projects */
export async function getCreatorProfile(idOrUsername: string): Promise<CreatorPublicProfile | null> {
  try {
    const res = await fetch(`${env.apiUrl}/auth/creators/${encodeURIComponent(idOrUsername)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      creator: data.creator,
      ideasPublished: (data.ideasPublished ?? []).map(normalizeCreatorIdea),
      ideasSupported: (data.ideasSupported ?? []).map(normalizeCreatorIdea),
    };
  } catch (err) {
    console.warn(`[ideas-api] getCreatorProfile failed for ${idOrUsername}:`, err);
    return null;
  }
}


