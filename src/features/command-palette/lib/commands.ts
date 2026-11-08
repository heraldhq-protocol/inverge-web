import {
  Analytics01Icon,
  ArrowLeft02Icon,
  Bookmark01Icon,
  BookmarkCheck02Icon,
  BookOpen01Icon,
  CheckListIcon,
  Compass01Icon,
  HandCoinsIcon,
  HelpCircleIcon,
  Home01Icon,
  Idea01Icon,
  IdentityCardIcon,
  Invoice01Icon,
  Megaphone01Icon,
  Note01Icon,
  Notification01Icon,
  PlusSignIcon,
  SecurityCheckIcon,
  Settings01Icon,
  TrophyIcon,
  UserCircleIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons";

import {
  AUTH_PATH,
  SIGN_OUT_PATH,
  authHref,
} from "@/features/auth/lib/auth-routes";
import type {
  PaletteCommand,
  PaletteContext,
} from "@/features/command-palette/types";

/**
 * The local command set for each shell. Content results are added by the
 * palette from the search API; everything here is navigation the server layout
 * has already made reachable.
 *
 * Admin commands are built only after `getProgrammeAdminAccess()` allowed the
 * render. Hiding them is not the gate — the API re-authorises every privileged
 * call — but the palette never advertises a surface the viewer cannot open.
 */
export function commandsFor(input: {
  context: PaletteContext;
  signedIn: boolean;
  unreadCount?: number;
}): PaletteCommand[] {
  return input.context === "admin"
    ? adminCommands()
    : input.context === "product"
      ? productCommands(input.unreadCount ?? 0)
      : publicCommands(input.signedIn);
}

function command(
  id: string,
  label: string,
  href: string,
  icon: PaletteCommand["icon"],
  group: string,
  keywords: string[],
  description?: string,
): PaletteCommand {
  return { description, group, href, icon, id, keywords, label };
}

function publicCommands(signedIn: boolean): PaletteCommand[] {
  const explore = [
    command(
      "public-ideas",
      "Discover ideas",
      "/ideas",
      Compass01Icon,
      "Explore",
      ["ideas", "validation", "browse ideas", "discovery"],
      "Browse public validation signals",
    ),
    command(
      "public-campaigns",
      "Browse campaigns",
      "/campaigns",
      Megaphone01Icon,
      "Explore",
      ["campaigns", "back a campaign", "funding", "projects"],
      "Milestone-escrowed campaigns",
    ),
    command("public-ideathon", "Ideathon", "/ideathon", TrophyIcon, "Explore", [
      "challenge",
      "competition",
      "programme",
    ]),
    command(
      "public-guides",
      "Guides & journal",
      "/guides",
      BookOpen01Icon,
      "Explore",
      ["learn", "articles", "resources", "journal"],
    ),
    command(
      "public-about",
      "About Inverge",
      "/about",
      HelpCircleIcon,
      "Explore",
      ["company", "story", "team", "mission"],
    ),
  ];

  if (!signedIn) {
    return [
      ...explore,
      command(
        "public-sign-in",
        "Sign in",
        AUTH_PATH,
        UserCircleIcon,
        "Account",
        ["login", "account", "session"],
      ),
      command(
        "public-start",
        "Start building",
        authHref(undefined, "creator"),
        Idea01Icon,
        "Account",
        ["create", "new idea", "submit", "creator"],
      ),
    ];
  }

  return [
    ...explore,
    command("public-dashboard", "Your dashboard", "/d", Home01Icon, "Account", [
      "home",
      "dashboard",
      "account",
    ]),
    command(
      "public-studio",
      "Creator Studio",
      "/d/creator",
      Analytics01Icon,
      "Account",
      ["studio", "creator", "analytics"],
    ),
    command(
      "public-saved",
      "Saved campaigns",
      "/d/saved",
      BookmarkCheck02Icon,
      "Account",
      ["saved", "bookmarks", "watchlist"],
    ),
    command(
      "public-sign-out",
      "Sign out",
      SIGN_OUT_PATH,
      ArrowLeft02Icon,
      "Account",
      ["log out", "logout", "end session"],
    ),
  ];
}

function productCommands(unreadCount: number): PaletteCommand[] {
  return [
    command("product-home", "Home", "/d", Home01Icon, "Your space", [
      "dashboard",
      "overview",
    ]),
    command(
      "product-discover",
      "Discover",
      "/d/discover",
      Compass01Icon,
      "Your space",
      ["ideas", "explore", "browse"],
    ),
    command(
      "product-backing",
      "Backing",
      "/d/backing",
      HandCoinsIcon,
      "Your space",
      ["backed", "contributions", "campaigns you back"],
    ),
    command(
      "product-saved",
      "Saved",
      "/d/saved",
      BookmarkCheck02Icon,
      "Your space",
      ["saved", "bookmarks", "watchlist"],
    ),
    command(
      "product-prepledges",
      "Pre-pledges",
      "/d/pre-pledges",
      Bookmark01Icon,
      "Your space",
      ["pledges", "my pre pledges", "interest"],
    ),
    command(
      "product-studio",
      "Creator Studio",
      "/d/creator",
      Analytics01Icon,
      "Create",
      ["studio", "creator dashboard", "analytics"],
    ),
    command(
      "product-my-ideas",
      "My ideas",
      "/d/creator/ideas",
      Idea01Icon,
      "Create",
      ["my ideas", "drafts", "idea list"],
    ),
    command(
      "product-my-campaigns",
      "My campaigns",
      "/d/creator/campaigns",
      Megaphone01Icon,
      "Create",
      ["my campaigns", "creator campaigns", "campaign drafts"],
    ),
    command(
      "product-new-idea",
      "Start an idea",
      "/d/creator/ideas/new",
      PlusSignIcon,
      "Create",
      ["new idea", "create idea", "submit idea"],
    ),
    command(
      "product-new-campaign",
      "Create a campaign",
      "/d/creator/campaigns/new",
      PlusSignIcon,
      "Create",
      ["new campaign", "campaign draft", "launch campaign"],
    ),
    command(
      "product-ideathons",
      "Ideathons",
      "/d/ideathons",
      TrophyIcon,
      "Create",
      ["challenges", "competitions", "programmes"],
    ),
    command(
      "product-guides",
      "Guides & journal",
      "/guides",
      BookOpen01Icon,
      "Create",
      ["learn", "articles", "resources"],
    ),
    command("product-wallet", "Wallet", "/d/wallet", Wallet01Icon, "Account", [
      "balance",
      "usdc",
      "payments",
    ]),
    command(
      "product-notifications",
      "Notifications",
      "/d/notifications",
      Notification01Icon,
      "Account",
      [
        "inbox",
        "alerts",
        ...(unreadCount > 0 ? [`${unreadCount} unread`] : []),
      ],
      unreadCount > 0 ? `${unreadCount} unread` : undefined,
    ),
    command(
      "product-profile",
      "Your profile",
      "/d/profile",
      UserCircleIcon,
      "Account",
      ["account", "public profile", "handle"],
    ),
    command(
      "product-settings",
      "Settings",
      "/d/settings",
      Settings01Icon,
      "Account",
      ["preferences", "account settings", "email"],
    ),
    command(
      "product-help",
      "Help and guides",
      "/help",
      HelpCircleIcon,
      "Account",
      ["support", "faq", "contact"],
    ),
    command(
      "product-sign-out",
      "Sign out",
      SIGN_OUT_PATH,
      ArrowLeft02Icon,
      "Account",
      ["log out", "logout", "end session"],
    ),
  ];
}

function adminCommands(): PaletteCommand[] {
  return [
    command("admin-overview", "Overview", "/admin", Home01Icon, "Admin", [
      "home",
      "admin dashboard",
    ]),
    command(
      "admin-campaigns",
      "Campaign review",
      "/admin/campaigns",
      CheckListIcon,
      "Admin",
      ["review", "queue", "campaigns"],
    ),
    command(
      "admin-verification",
      "Verification",
      "/admin/verification",
      IdentityCardIcon,
      "Admin",
      ["kyc", "aml", "identity", "compliance"],
    ),
    command(
      "admin-advertising",
      "Advertising",
      "/admin/advertising",
      Megaphone01Icon,
      "Admin",
      ["ads", "placements", "sponsorship"],
    ),
    command(
      "admin-programmes",
      "Programmes",
      "/admin/programmes",
      TrophyIcon,
      "Admin",
      ["ideathon", "challenge", "showcase"],
    ),
    command(
      "admin-payments",
      "Payments",
      "/admin/payments",
      Invoice01Icon,
      "Admin",
      ["payouts", "invoices", "billing"],
    ),
    command("admin-audit", "Audit log", "/admin/audit", Note01Icon, "Admin", [
      "history",
      "events",
      "security",
    ]),
    command("admin-back", "Back to product", "/d", ArrowLeft02Icon, "Product", [
      "dashboard",
      "leave admin",
    ]),
    command(
      "admin-ideas",
      "Discover ideas",
      "/ideas",
      Compass01Icon,
      "Product",
      ["public ideas", "browse"],
    ),
    command(
      "admin-public-campaigns",
      "Public campaigns",
      "/campaigns",
      Megaphone01Icon,
      "Product",
      ["public campaigns", "browse", "catalogue"],
    ),
    command(
      "admin-security",
      "Admin access",
      "/admin/verification",
      SecurityCheckIcon,
      "Product",
      ["authorised", "permissions", "security"],
    ),
  ];
}
