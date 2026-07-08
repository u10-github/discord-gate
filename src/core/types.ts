export type InviteError = 'human_verification_failed' | 'rate_limited' | 'invite_issuance_failed';

export type InviteResult = { success: true; inviteUrl: string } | { success: false; error: InviteError };
