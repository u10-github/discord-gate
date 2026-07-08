export interface InvitePolicy {
  readonly maxUses: number;
  readonly maxAgeSeconds: number;
}

export const DEFAULT_INVITE_POLICY: InvitePolicy = {
  maxUses: 1,
  maxAgeSeconds: 900,
};
