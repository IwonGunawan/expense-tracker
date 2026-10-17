import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
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
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [monthValue, setMonthValue] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    const data = await api('/categories');
    setCategories(data);
  }, []);

  const loadExpenses = useCallback(async () => {
    const { from, to } = rangeFromMonth(monthValue);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(from && { from }),
      ...(to && { to }),
      ...(filterCat && { categoryId: filterCat }),
    });
    const data = await api(`/expenses?${params}`);
    setItems(data.items);
    setMeta({ total: data.total, page: data.page, pages: data.pages });
  }, [page, monthValue, filterCat]);

  const refresh = useCallback(async () => {
    try {
      await loadExpenses();
    } catch (e) {
      toast.error(e.message);
    }
  }, [loadExpenses, toast]);

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
    refresh();
  }, [refresh]);

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
      toast.success('Pengeluaran dihapus');
      setPendingDeleteId(null);
      await loadExpenses();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const resetFilters = () => {
    setMonthValue('');
    setFilterCat('');
    setPage(1);
  };

  if (loading) {
    return (
      <>
        <div className="page-head">
          <h1 className="page-title">Pengeluaran</h1>
          <p className="muted">Memuat...</p>
        </div>
      </>
    );
  }

  const hasActiveFilter = monthValue || filterCat;

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Pengeluaran</h1>
          <p className="muted">
            {meta.total} transaksi · Halaman {meta.page} dari {meta.pages}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={openAdd}
          disabled={categories.length === 0}
        >
          <Icon name="plus" size={16} /> Tambah
        </button>
      </div>

      {categories.length === 0 && (
        <div className="inline-note">
          <Icon name="alert" size={16} />
          <span>
            Buat kategori dulu di menu <Link to="/categories">Kategori</Link> agar bisa menambah pengeluaran.
          </span>
        </div>
      )}

      <div className="toolbar">
        <label className="filter-field">
          <span className="filter-label">Bulan</span>
          <input
            type="month"
            value={monthValue}
            onChange={(e) => {
              setMonthValue(e.target.value);
              setPage(1);
            }}
          />
        </label>

        <label className="filter-field">
          <span className="filter-label">Kategori</span>
          <select
            value={filterCat}
            onChange={(e) => {
              setFilterCat(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilter && (
          <button type="button" className="ghost small filter-reset" onClick={resetFilters}>
            Reset
          </button>
        )}
      </div>

      <div className="panel table-panel">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th className="right">Jumlah</th>
                <th className="right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="center">
                    <EmptyState
                      icon="wallet"
                      title="Tidak ada data"
                      hint={hasActiveFilter ? 'Coba filter lain.' : 'Mulai dengan tambah pengeluaran.'}
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
                    <td>
                      {row.description || <span className="muted">—</span>}
                    </td>
                    <td className="right mono strong">{formatIDR(row.amount)}</td>
                    <td className="right">
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => openEdit(row)}
                        title="Edit"
                      >
                        <Icon name="pencil" size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => setPendingDeleteId(row.id)}
                        title="Hapus"
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

        {meta.total > LIMIT && (
          <div className="pagination">
            <button type="button" className="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <Icon name="chevron-left" size={16} /> Prev
            </button>
            <span className="muted">
              Halaman {meta.page} dari {meta.pages}
            </span>
            <button
              type="button"
              className="ghost"
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <Icon name="chevron-right" size={16} />
            </button>
          </div>
        )}
      </div>

      <ExpenseFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        editing={editing}
        onSaved={loadExpenses}
      />

      <ConfirmModal
        open={pendingDeleteId !== null}
        title="Hapus pengeluaran?"
        message="Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        danger
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={commitDelete}
      />
    </>
  );
}