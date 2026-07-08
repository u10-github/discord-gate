import type { AuditLogger } from '../core/ports';

export class ConsoleAuditLogger implements AuditLogger {
  log(event: string, data?: Record<string, unknown>): void {
    console.log(event, data);
  }
}
