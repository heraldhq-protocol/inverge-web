import { forwardNotificationAction } from "@/features/notifications/server/actions";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return forwardNotificationAction(
    request,
    `/me/notifications/${encodeURIComponent(id)}/read`,
    "PATCH",
  );
}
