import { forwardNotificationAction } from "@/features/notifications/server/actions";

export async function POST(request: Request) {
  return forwardNotificationAction(
    request,
    "/me/notifications/read-all",
    "POST",
  );
}
