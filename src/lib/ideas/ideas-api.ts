import { fixtureComments, fixtureIdeaDetail, fixtureSurvey } from '@/lib/fixtures/ideas';
import type { IdeaComment, IdeaDetail, SurveyAggregate, SurveyQuestion } from './types';

/**
 * Idea reads. One swap point, same as the feed.
 *
 * Live equivalents, for when this flips: `GET /ideas/:id`, `GET /ideas/:id/survey`,
 * `GET /ideas/:id/comments`. Two of them cannot be used yet even though they exist — the idea response
 * carries no creator identity and the comments response carries a bare `userId`, so there is no author to
 * render (API gap backlog items 1 and 2).
 */
const USE_FIXTURES = true;

export async function getIdea(idOrSlug: string): Promise<IdeaDetail | null> {
  if (USE_FIXTURES) return fixtureIdeaDetail(idOrSlug);
  throw new Error(`Live idea read not wired (${idOrSlug}): API gap backlog items 1 and 5`);
}

export async function getSurvey(
  ideaId: string
): Promise<{ questions: SurveyQuestion[]; aggregates: SurveyAggregate[] }> {
  if (USE_FIXTURES) return fixtureSurvey();
  throw new Error(`Live survey read not wired (${ideaId})`);
}

export async function getComments(ideaId: string): Promise<IdeaComment[]> {
  if (USE_FIXTURES) return fixtureComments();
  throw new Error(`Live comments read not wired (${ideaId}): author projection missing (backlog item 2)`);
}
