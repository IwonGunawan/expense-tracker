import { useEffect, useState } from 'react';
import { api } from '../api';
import { currentMonthRange, formatIDR } from '../utils';
import CategoryBar from '../components/CategoryBar';
import ExpenseFormModal from '../components/ExpenseFormModal';
import Icon from '../components/Icon';
import MonthlyChart from '../components/MonthlyChart';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';

const MONTH_NAME = new Date().toLocaleDateString('id-ID', { month: 'long' });
const YEAR = new Date().getFullYear();

export default function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    const { from, to } = currentMonthRange();
    Promise.all([
      api(`/expenses/summary?from=${from}&to=${to}`),
      api(`/expenses/monthly?year=${YEAR}`),
      api('/categories'),
    ])
      .then(([summary, monthly, cats]) => {
        setData({ summary, monthly });
        setCategories(cats);
      })
      .catch((e) => toast.error(e.message));
  };

  useEffect(load, [toast]);

  if (!data) {
    return (
      <div className="page-head">
        <h1 className="page-title">Dashboard</h1>
        <p className="muted">Memuat data...</p>
      </div>
    );
  }

  const { summary, monthly } = data;
  const transactions = summary.categories.reduce((s, c) => s + c.count, 0);
  const avg = transactions ? summary.overall / transactions : 0;
  const yearTotal = monthly.months.reduce((s, m) => s + m.total, 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted">Ringkasan pengeluaran bulan ini.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={categories.length === 0}
        >
          <Icon name="plus" size={16} /> Tambah Pengeluaran
        </button>
      </div>

      {categories.length === 0 && (
        <div className="inline-note">
          <Icon name="alert" size={16} />
          <span>Buat kategori dulu sebelum mencatat pengeluaran.</span>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon="wallet"
          label="Bulan Ini"
          value={formatIDR(summary.overall)}
          hint={MONTH_NAME}
          tone="primary"
        />
        <StatCard
          icon="trend"
          label="Rata-rata"
          value={formatIDR(avg)}
          hint="per transaksi"
          tone="success"
        />
        <StatCard
          icon="calendar"
          label="Transaksi"
          value={String(transactions)}
          hint="bulan ini"
          tone="accent"
        />
        <StatCard
          icon="tag"
          label="Kategori"
          value={String(summary.categories.length)}
          hint="dipakai"
          tone="warn"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Pengeluaran per Bulan</h2>
          <span className="muted">{formatIDR(yearTotal)} · {YEAR}</span>
        </div>
        <MonthlyChart months={monthly.months} year={monthly.year} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Rekap Kategori Bulan Ini</h2>
          <span className="muted">{formatIDR(summary.overall)}</span>
        </div>
        <CategoryBar data={summary.categories} />
      </div>

      <ExpenseFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        categories={categories}
        onSaved={load}
      />
    </>
  );
}