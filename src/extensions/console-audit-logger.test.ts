import { describe, expect, it, vi } from 'vitest';
import type { AuditLogger } from '../core/ports';
import { ConsoleAuditLogger } from './console-audit-logger';

describe('ConsoleAuditLogger', () => {
  it('implements AuditLogger port', () => {
    const logger = new ConsoleAuditLogger();
    expect(logger).toSatisfy((v: AuditLogger) => typeof v.log === 'function');
  });

  it('calls console.log with event and data', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const logger = new ConsoleAuditLogger();

    logger.log('test_event', { key: 'value' });

    expect(spy).toHaveBeenCalledWith('test_event', { key: 'value' });
    spy.mockRestore();
  });
});
