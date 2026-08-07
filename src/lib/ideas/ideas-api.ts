import { fixtureComments, fixtureIdeaDetail, fixtureSurvey } from '@/lib/fixtures/ideas';
import { getSessionToken } from '@/lib/api/client';
import { env } from '@/lib/env';
import type { IdeaComment, IdeaDetail, SurveyAggregate, SurveyQuestion } from './types';

function getAuthHeaders(token?: string): Record<string, string> {
  const authToken = token ?? getSessionToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
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
      displayName: c.author?.displayName ?? 'Anonymous',
      avatarUrl: c.author?.avatarUrl ?? null,
      identityVerified: Boolean(c.author?.identityVerified),
      isCreator: Boolean(c.author?.isCreator),
    },
  };
}

export async function getIdea(idOrSlug: string, token?: string): Promise<IdeaDetail | null> {
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
    return normalizeIdeaDetail(raw);
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
  if (!res.ok) throw new Error(`Support request failed (${res.status})`);
}

/** Validation signal: remove support */
export async function unsupportIdea(ideaId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/support`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Unsupport request failed (${res.status})`);
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
  if (!res.ok) throw new Error(`Pre-pledge failed (${res.status})`);
}

/** Validation signal: withdraw pre-pledge */
export async function withdrawPrePledge(ideaId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/pre-pledge`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Withdraw pre-pledge failed (${res.status})`);
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
  if (!res.ok) throw new Error(`Post comment failed (${res.status})`);
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
  if (!res.ok) throw new Error(`Like comment failed (${res.status})`);
}

/** Unlike a comment */
export async function unlikeComment(ideaId: string, commentId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments/${commentId}/like`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Unlike comment failed (${res.status})`);
}

/** Remove a comment (author or creator) */
export async function removeComment(ideaId: string, commentId: string, token?: string): Promise<void> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${ideaId}/comments/${commentId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error(`Delete comment failed (${res.status})`);
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
  if (!res.ok) throw new Error(`Highlight comment failed (${res.status})`);
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
  if (!res.ok) throw new Error(`Survey submission failed (${res.status})`);
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
  if (!res.ok) throw new Error(`Feedback submission failed (${res.status})`);
}

/** Create a new idea draft */
export async function createIdea(
  data: {
    title: string;
    problem: string;
    solution: string;
    targetUser?: string;
    currentAlternative?: string;
    askBreakdown?: any[];
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
  const res = await fetch(`${env.apiUrl}/ideas`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create idea failed (${res.status})`);
  const raw = await res.json();
  return normalizeIdeaDetail(raw);
}

/** Publish a draft idea */
export async function publishIdea(id: string, token?: string): Promise<IdeaDetail> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${id}/publish`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error(`Publish idea failed (${res.status})`);
  const raw = await res.json();
  return normalizeIdeaDetail(raw);
}

/** Convert a validated idea to a campaign draft */
export async function convertIdea(id: string, data: any, token?: string): Promise<any> {
  const headers = getAuthHeaders(token);
  const res = await fetch(`${env.apiUrl}/ideas/${id}/convert`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Convert idea failed (${res.status})`);
  return res.json();
}
