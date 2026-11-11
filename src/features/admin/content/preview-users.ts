import type { AdminUser } from "@/features/admin/lib/users";

/**
 * Sample accounts for preview authentication.
 *
 * These are fabricated addresses on `example.com`, not seeds or exports of real
 * accounts. Preview mode exists so the directory can be inspected without an
 * API; it never represents a role change as saved.
 */
export const previewAdminUsers: readonly AdminUser[] = [
  {
    id: "usr_preview_amara",
    email: "amara.okonkwo@example.com",
    providerUserId: "did:privy:preview-amara",
    role: "ADMIN",
    kycStatus: "VERIFIED",
    bannedAt: null,
    createdAt: "2025-03-14T09:12:00.000Z",
  },
  {
    id: "usr_preview_tunde",
    email: "tunde.adebayo@example.com",
    providerUserId: "did:privy:preview-tunde",
    role: "COMPLIANCE_REVIEWER",
    kycStatus: "VERIFIED",
    bannedAt: null,
    createdAt: "2025-05-02T14:40:00.000Z",
  },
  {
    id: "usr_preview_zainab",
    email: "zainab.bello@example.com",
    providerUserId: "did:privy:preview-zainab",
    role: "USER",
    kycStatus: "PENDING",
    bannedAt: null,
    createdAt: "2025-07-21T11:05:00.000Z",
  },
  {
    id: "usr_preview_kofi",
    email: "kofi.mensah@example.com",
    providerUserId: "did:privy:preview-kofi",
    role: "USER",
    kycStatus: "NOT_REQUIRED",
    bannedAt: null,
    createdAt: "2025-09-09T07:30:00.000Z",
  },
  {
    id: "usr_preview_chidi",
    email: "chidi.eze@example.com",
    providerUserId: "did:privy:preview-chidi",
    role: "USER",
    kycStatus: "REJECTED",
    bannedAt: null,
    createdAt: "2025-10-18T16:22:00.000Z",
  },
  {
    id: "usr_preview_fatima",
    email: "fatima.yusuf@example.com",
    providerUserId: "did:privy:preview-fatima",
    role: "USER",
    kycStatus: "VERIFIED",
    bannedAt: null,
    createdAt: "2025-12-01T08:45:00.000Z",
  },
  {
    id: "usr_preview_lerato",
    email: "lerato.mokoena@example.com",
    providerUserId: "did:privy:preview-lerato",
    role: "USER",
    kycStatus: "PENDING",
    bannedAt: "2026-01-19T12:00:00.000Z",
    createdAt: "2026-01-06T10:10:00.000Z",
  },
  {
    id: "usr_preview_ibrahim",
    email: "ibrahim.diallo@example.com",
    providerUserId: "did:privy:preview-ibrahim",
    role: "ADMIN",
    kycStatus: "VERIFIED",
    bannedAt: null,
    createdAt: "2026-02-11T13:35:00.000Z",
  },
  {
    id: "usr_preview_nneka",
    email: "nneka.obi@example.com",
    providerUserId: "did:privy:preview-nneka",
    role: "USER",
    kycStatus: "NOT_REQUIRED",
    bannedAt: null,
    createdAt: "2026-03-02T06:55:00.000Z",
  },
];
