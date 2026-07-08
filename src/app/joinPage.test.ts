import { describe, expect, it } from 'vitest';
import { renderJoinPage } from './joinPage';

describe('renderJoinPage', () => {
  it('renders HTML with siteKey', () => {
    const html = renderJoinPage('my-site-key');
    expect(html).toContain('my-site-key');
    expect(html).toContain('cf-turnstile');
  });

  it('escapes & in siteKey', () => {
    const html = renderJoinPage('a&b');
    expect(html).toContain('a&amp;b');
    expect(html).not.toContain('a&b');
  });

  it('escapes < in siteKey', () => {
    const html = renderJoinPage('a<b');
    expect(html).toContain('a&lt;b');
  });

  it('escapes > in siteKey', () => {
    const html = renderJoinPage('a>b');
    expect(html).toContain('a&gt;b');
  });

  it('escapes " in siteKey', () => {
    const html = renderJoinPage('a"b');
    expect(html).toContain('a&quot;b');
  });
});
