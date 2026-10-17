import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import { currentMonthRange, formatIDR } from '../utils';
import CategoryBar from '../components/CategoryBar';
import ExpenseFormModal from '../components/ExpenseFormModal';
import Icon from '../components/Icon';
import MonthlyChart from '../components/MonthlyChart';
import StatCard from '../components/StatCard';
import { useToast } from '../components/Toast';

const YEAR = new Date().getFullYear();

export default function Dashboard() {
  const toast = useToast();
  const { t, locale } = useI18n();
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
        <h1 className="page-title">{t('nav.dashboard')}</h1>
        <p className="muted">{t('dashboard.loading')}</p>
      </div>
    );
  }

  const { summary, monthly } = data;
  const transactions = summary.categories.reduce((s, c) => s + c.count, 0);
  const avg = transactions ? summary.overall / transactions : 0;
  const yearTotal = monthly.months.reduce((s, m) => s + m.total, 0);
  const monthName = new Date().toLocaleDateString(locale, { month: 'long' });

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('nav.dashboard')}</h1>
          <p className="muted">{t('dashboard.subtitle')}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          disabled={categories.length === 0}
        >
          <Icon name="plus" size={16} /> {t('dashboard.add')}
        </button>
      </div>

      {categories.length === 0 && (
        <div className="inline-note">
          <Icon name="alert" size={16} />
          <span>{t('dashboard.noCategory')}</span>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          icon="wallet"
          label={t('dashboard.thisMonth')}
          value={formatIDR(summary.overall)}
          hint={monthName}
          tone="primary"
        />
        <StatCard
          icon="trend"
          label={t('dashboard.average')}
          value={formatIDR(avg)}
          hint={t('dashboard.perTransaction')}
          tone="success"
        />
        <StatCard
          icon="calendar"
          label={t('dashboard.transactions')}
          value={String(transactions)}
          hint={t('dashboard.thisMonthHint')}
          tone="accent"
        />
        <StatCard
          icon="tag"
          label={t('dashboard.categories')}
          value={String(summary.categories.length)}
          hint={t('dashboard.used')}
          tone="warn"
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>{t('dashboard.monthlyTitle')}</h2>
          <span className="muted">
            {formatIDR(yearTotal)} · {YEAR}
          </span>
        </div>
        <MonthlyChart months={monthly.months} year={monthly.year} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>{t('dashboard.recapTitle')}</h2>
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