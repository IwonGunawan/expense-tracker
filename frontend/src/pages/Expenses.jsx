import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useI18n } from '../i18n';
import { formatDateID, formatIDR, monthRange } from '../utils';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import ExpenseFormModal from '../components/ExpenseFormModal';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';

const LIMIT = 10;

function rangeFromMonth(monthValue) {
  if (!monthValue) return { from: '', to: '' };
  const [year, month] = monthValue.split('-').map(Number);
  return monthRange(year, month - 1);
}

export default function ExpensesPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [monthValue, setMonthValue] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);

  const sentinelRef = useRef(null);
  const fetchRef = useRef({ monthValue: '', filterCat: '' });
  const failedRef = useRef(false);

  const loadCategories = useCallback(async () => {
    const data = await api('/categories');
    setCategories(data);
  }, []);

  const fetchPage = useCallback(async (page, replace) => {
    const { from, to } = rangeFromMonth(fetchRef.current.monthValue);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(from && { from }),
      ...(to && { to }),
      ...(fetchRef.current.filterCat && { categoryId: fetchRef.current.filterCat }),
    });
    const data = await api(`/expenses?${params}`);
    setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
    setMeta({ total: data.total, page: data.page, pages: data.pages });
    return data;
  }, []);

  const resetAndLoad = useCallback(async () => {
    fetchRef.current = { monthValue, filterCat };
    setLoadingMore(false);
    failedRef.current = false;
    try {
      await fetchPage(1, true);
    } catch (e) {
      toast.error(e.message);
    }
  }, [monthValue, filterCat, fetchPage, toast]);

  useEffect(() => {
    (async () => {
      try {
        await loadCategories();
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadCategories, toast]);

  useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loading || loadingMore || failedRef.current || meta.page >= meta.pages) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        setLoadingMore(true);
        fetchPage(meta.page + 1, false)
          .catch((e) => {
            failedRef.current = true;
            toast.error(e.message);
          })
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: '240px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, loadingMore, meta.page, meta.pages, fetchPage, toast]);

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setShowForm(true);
  };

  const commitDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await api(`/expenses/${pendingDeleteId}`, { method: 'DELETE' });
      toast.success(t('expenses.deleted'));
      setPendingDeleteId(null);
      await resetAndLoad();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const resetFilters = () => {
    setMonthValue('');
    setFilterCat('');
  };

  const exportXls = async () => {
    setExporting(true);
    try {
      const { from, to } = rangeFromMonth(monthValue);
      const params = new URLSearchParams({
        limit: '100',
        ...(from && { from }),
        ...(to && { to }),
        ...(filterCat && { categoryId: filterCat }),
      });
      const data = await api(`/expenses?${params}`);
      if (data.items.length === 0) {
        toast.error(t('expenses.empty'));
        return;
      }
      const headers = [t('expenses.thDate'), t('expenses.thCategory'), t('expenses.thDescription'), t('expenses.thAmount')];
      const rowsHtml = data.items
        .map(
          (r) =>
            `<tr><td>${r.date}</td><td>${r.category?.name ?? ''}</td><td>${r.description ?? ''}</td><td>${r.amount}</td></tr>`,
        )
        .join('');
      const html = `<html><head><meta charset="utf-8" /></head><body><table border="1"><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `expenses-${new Date().toISOString().slice(0, 10)}.xls`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success(t('expenses.exported'));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setExporting(false);
    }
  };

  const grouped = useMemo(() => {
    const sorted = [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const groups = [];
    for (const row of sorted) {
      const key = String(row.date || '').slice(0, 10);
      const last = groups[groups.length - 1];
      if (!last || last.date !== key) {
        groups.push({ date: key, items: [row] });
      } else {
        last.items.push(row);
      }
    }
    return groups;
  }, [items]);

  if (loading) {
    return <p className="muted">{t('common.loading')}</p>;
  }

  const hasActiveFilter = monthValue || filterCat;

  return (
    <>
      {categories.length === 0 && (
        <div className="inline-note">
          <Icon name="alert" size={16} />
          <span>
            {t('expenses.noCategoryPre')}
            <Link to="/categories">{t('nav.categories')}</Link>
            {t('expenses.noCategoryPost')}
          </span>
        </div>
      )}

      <div className="filter-bar">
        <input
          type="month"
          aria-label={t('expenses.month')}
          value={monthValue}
          onChange={(e) => setMonthValue(e.target.value)}
        />

        <select
          aria-label={t('expenses.category')}
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">{t('expenses.filterAll')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {hasActiveFilter && (
          <button type="button" className="ghost small filter-reset" onClick={resetFilters}>
            {t('common.reset')}
          </button>
        )}
      </div>

      <div className="panel list-panel">
        {items.length === 0 ? (
          <EmptyState
            icon="wallet"
            title={t('expenses.empty')}
            hint={hasActiveFilter ? t('expenses.emptyHintFilter') : t('expenses.emptyHint')}
          />
        ) : (
          <div className="expense-list">
            {grouped.map((group) => (
              <section className="date-group" key={group.date}>
                <header className="date-group-head">
                  <span className="date-group-title">{formatDateID(group.date)}</span>
                  <span className="date-group-total mono">{formatIDR(group.items.reduce((sum, r) => sum + (Number(r.amount) || 0), 0))}</span>
                </header>
                <div className="date-group-items">
                  {group.items.map((row) => (
                    <button
                      type="button"
                      className="expense-item"
                      key={row.id}
                      onClick={() => setDetail(row)}
                      aria-label={`${row.description || t('expenses.thDescription')} ${formatIDR(row.amount)}`}
                    >
                      <span className="expense-item-desc">
                        {row.description || <span className="muted">—</span>}
                      </span>
                      <span className="expense-item-amount">{formatIDR(row.amount)}</span>
                      <Icon name="chevron-right" size={16} className="expense-item-chevron" />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <div ref={sentinelRef} className="scroll-sentinel" aria-hidden="true">
          {loadingMore && <span className="muted small">{t('common.loading')}</span>}
        </div>
      </div>

      <ExpenseFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        editing={editing}
        onSaved={resetAndLoad}
      />

      {detail && (
        <div className="sheet-backdrop" onMouseDown={() => setDetail(null)}>
          <div
            className="bottom-sheet expense-detail"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="sheet-handle" aria-hidden="true" />
            <div className="sheet-head">
              <h3>{t('expenses.detailTitle')}</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setDetail(null)}
                aria-label={t('common.close')}
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="detail-list">
              <div className="detail-row">
                <span className="detail-label">{t('expenses.thDate')}</span>
                <span className="detail-value">{formatDateID(detail.date)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('expenses.thCategory')}</span>
                <span className="detail-value">
                  <span className="pill">{detail.category?.name ?? '-'}</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('expenses.thDescription')}</span>
                <span className="detail-value">{detail.description || <span className="muted">—</span>}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('expenses.thAmount')}</span>
                <span className="detail-value mono strong">{formatIDR(detail.amount)}</span>
              </div>
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  const row = detail;
                  setDetail(null);
                  openEdit(row);
                }}
              >
                <Icon name="pencil" size={16} /> {t('common.edit')}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => {
                  const id = detail.id;
                  setDetail(null);
                  setPendingDeleteId(id);
                }}
              >
                <Icon name="trash" size={16} /> {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {(!detail && !showForm && pendingDeleteId === null) && (
        <div className="fab-group">
          <button
            type="button"
            className="fab fab-secondary"
            onClick={exportXls}
            disabled={exporting || meta.total === 0}
            aria-label={t('expenses.export')}
            title={t('expenses.export')}
          >
            <Icon name="download" size={18} />
          </button>
          <button
            type="button"
            className="fab fab-primary"
            onClick={openAdd}
            disabled={categories.length === 0}
            aria-label={t('expenses.add')}
            title={t('expenses.add')}
          >
            <Icon name="plus" size={22} />
          </button>
        </div>
      )}

    </>
  );
}