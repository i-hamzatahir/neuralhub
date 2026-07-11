import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  listNotifications,
} from "@/lib/services/engagement/engagement.service";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsReadAction,
  markNotificationReadFormAction,
} from "@/lib/actions/engagement";
import { cn } from "@/lib/utils/cn";

export const metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/notifications");

  const notifications = await listNotifications(session.user.id, 50);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-display text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Activity on your articles and profile
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Mark all read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-6 py-16 text-center text-muted-foreground">
          No notifications yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={cn(
                "flex items-start justify-between gap-4 px-5 py-4",
                !notification.isRead && "bg-primary/5",
              )}
            >
              <div className="min-w-0 flex-1">
                {notification.link ? (
                  <Link href={notification.link} className="block hover:text-primary">
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </Link>
                ) : (
                  <>
                    <p className="font-medium">{notification.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                  </>
                )}
                <time className="mt-2 block text-xs text-muted-foreground">
                  {notification.createdAt.toLocaleString()}
                </time>
              </div>
              {!notification.isRead && (
                <form action={markNotificationReadFormAction}>
                  <input type="hidden" name="id" value={notification.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Mark read
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
