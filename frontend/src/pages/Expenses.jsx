import { useCallback, useEffect, useRef, useState } from 'react';
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

  if (loading) {
    return (
      <>
        <div className="page-head">
          <h1 className="page-title">{t('expenses.title')}</h1>
          <p className="muted">{t('common.loading')}</p>
        </div>
      </>
    );
  }

  const hasActiveFilter = monthValue || filterCat;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('expenses.title')}</h1>
          <p className="muted">{t('expenses.meta', { total: meta.total })}</p>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn ghost"
            onClick={exportXls}
            disabled={exporting || meta.total === 0}
          >
            <Icon name="download" size={16} /> {exporting ? t('common.processing') : t('expenses.export')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAdd}
            disabled={categories.length === 0}
          >
            <Icon name="plus" size={16} /> {t('expenses.add')}
          </button>
        </div>
      </div>

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

      <div className="toolbar">
        <label className="filter-field">
          <span className="filter-label">{t('expenses.month')}</span>
          <input
            type="month"
            value={monthValue}
            onChange={(e) => setMonthValue(e.target.value)}
          />
        </label>

        <label className="filter-field">
          <span className="filter-label">{t('expenses.category')}</span>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">{t('expenses.filterAll')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilter && (
          <button type="button" className="ghost small filter-reset" onClick={resetFilters}>
            {t('common.reset')}
          </button>
        )}
      </div>

      <div className="panel table-panel">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t('expenses.thDate')}</th>
                <th>{t('expenses.thCategory')}</th>
                <th>{t('expenses.thDescription')}</th>
                <th className="right">{t('expenses.thAmount')}</th>
                <th className="right">{t('expenses.thActions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="center">
                    <EmptyState
                      icon="wallet"
                      title={t('expenses.empty')}
                      hint={hasActiveFilter ? t('expenses.emptyHintFilter') : t('expenses.emptyHint')}
                    />
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id}>
                    <td className="mono small">{formatDateID(row.date)}</td>
                    <td>
                      <span className="pill">{row.category?.name ?? '-'}</span>
                    </td>
                    <td>{row.description || <span className="muted">—</span>}</td>
                    <td className="right mono strong">{formatIDR(row.amount)}</td>
                    <td className="right">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => openEdit(row)}
                        title={t('common.edit')}
                      >
                        <Icon name="pencil" size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => setPendingDeleteId(row.id)}
                        title={t('common.delete')}
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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

      <ConfirmModal
        open={pendingDeleteId !== null}
        title={t('expenses.confirmTitle')}
        message={t('expenses.confirmMsg')}
        confirmLabel={t('common.delete')}
        danger
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={commitDelete}
      />
    </>
  );
}