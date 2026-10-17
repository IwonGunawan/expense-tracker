import { pageInfo } from './pagination';

describe('pageInfo', () => {
  it('computes pages and navigation flags', () => {
    expect(pageInfo(25, 1, 10)).toEqual({
      total: 25,
      page: 1,
      limit: 10,
      pages: 3,
      hasNext: true,
      hasPrev: false,
    });
  });

  it('marks last page without next', () => {
    expect(pageInfo(25, 3, 10)).toMatchObject({
      hasNext: false,
      hasPrev: true,
    });
  });

  it('clamps page above range', () => {
    expect(pageInfo(5, 99, 10).page).toBe(1);
  });

  it('always reports at least one page even when empty', () => {
    expect(pageInfo(0, 1, 10)).toEqual({
      total: 0,
      page: 1,
      limit: 10,
      pages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });
});
