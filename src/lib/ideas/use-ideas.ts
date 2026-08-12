'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIdea,
  getComments,
  getSurvey,
  supportIdea,
  unsupportIdea,
  prePledgeIdea,
  withdrawPrePledge,
  postComment,
  likeComment,
  unlikeComment,
} from './ideas-api';
import type { IdeaComment, IdeaDetail } from './types';

/** TanStack Query hook for an idea's detail */
export function useIdeaQuery(idOrSlug: string, initialData?: IdeaDetail | null) {
  return useQuery({
    queryKey: ['idea', idOrSlug],
    queryFn: () => getIdea(idOrSlug),
    initialData,
    staleTime: 30_000,
  });
}

/** TanStack Query hook for an idea's discussion comments */
export function useCommentsQuery(ideaId: string, initialData?: IdeaComment[]) {
  return useQuery({
    queryKey: ['comments', ideaId],
    queryFn: () => getComments(ideaId),
    initialData,
    staleTime: 15_000,
  });
}

/** TanStack Query hook for an idea's survey */
export function useSurveyQuery(ideaId: string) {
  return useQuery({
    queryKey: ['survey', ideaId],
    queryFn: () => getSurvey(ideaId),
    staleTime: 60_000,
  });
}

/** TanStack Query mutation hook for supporting an idea */
export function useSupportMutation(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ support }: { support: boolean }) => {
      if (support) {
        await supportIdea(ideaId);
      } else {
        await unsupportIdea(ideaId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/** TanStack Query mutation hook for pre-pledging an idea */
export function usePrePledgeMutation(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, withdraw }: { amount?: number; withdraw?: boolean }) => {
      if (withdraw) {
        await withdrawPrePledge(ideaId);
      } else if (amount) {
        await prePledgeIdea(ideaId, amount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

/** TanStack Query mutation hook for posting comments */
export function usePostCommentMutation(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, parentId }: { body: string; parentId?: string | null }) => {
      return postComment(ideaId, body, parentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
      queryClient.invalidateQueries({ queryKey: ['idea', ideaId] });
    },
  });
}

/** TanStack Query mutation hook for liking/unliking comments */
export function useLikeCommentMutation(ideaId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ commentId, like }: { commentId: string; like: boolean }) => {
      if (like) {
        await likeComment(ideaId, commentId);
      } else {
        await unlikeComment(ideaId, commentId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', ideaId] });
    },
  });
}
