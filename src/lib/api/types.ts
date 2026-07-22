// Response shapes for the endpoints we read. openapi-fetch types request paths, params
// and bodies from the spec; response bodies are loosely typed until the API adds
// @ApiOkResponse decorators, so we declare the read shapes here.
export type IdeaListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  askAmount: string;
  supporterCount: number;
  prePledgeTotal: string;
  feedbackScore: string;
  feedbackCount: number;
  promoted?: boolean;
  boostTier?: string | null;
};

export type IdeaDetail = IdeaListItem & {
  problem: string;
  solution: string;
  roadmap: string;
  createdAt: string;
};
