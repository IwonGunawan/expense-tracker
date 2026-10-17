import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import { formatIDR } from '../utils';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';

export default function CategoriesPage() {
  const toast = useToast();
  const { t } = useI18n();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(async () => {
    const [cats, summary] = await Promise.all([
      api('/categories'),
      api('/expenses/summary'),
    ]);
    setCategories(cats);
    const map = {};
    summary.categories.forEach((c) => {
      map[c.category] = { total: c.total, count: c.count };
    });
    setStats(map);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        toast.error(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [load, toast]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api('/categories', { method: 'POST', body: { name: name.trim() } });
      setName('');
      toast.success(t('categories.saved'));
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    try {
      await api(`/categories/${editingId}`, {
        method: 'PATCH',
        body: { name: editName.trim() },
      });
      toast.success(t('categories.updated'));
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const commitDelete = async () => {
    if (!pendingDelete) return;
    try {
      await api(`/categories/${pendingDelete.id}`, { method: 'DELETE' });
      toast.success(t('categories.deleted'));
      setPendingDelete(null);
      await load();
    } catch (err) {
      toast.error(err.message);
      setPendingDelete(null);
    }
  };

  if (loading) {
    return (
      <>
        <div className="page-head">
          <h1 className="page-title">{t('categories.title')}</h1>
          <p className="muted">{t('common.loading')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t('categories.title')}</h1>
          <p className="muted">{t('categories.subtitle')}</p>
        </div>
      </div>

      <form className="panel add-form" onSubmit={create}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('categories.placeholder')}
          maxLength={50}
        />
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <Icon name="plus" size={16} /> {t('common.add')}
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="tag"
            title={t('categories.empty')}
            hint={t('categories.emptyHint')}
          />
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map((cat) => {
            const stat = stats[cat.name] || { total: 0, count: 0 };
            const isEditing = editingId === cat.id;
            return (
              <div key={cat.id} className="cat-card">
                {isEditing ? (
                  <div className="cat-edit">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <button type="button" className="btn btn-primary small" onClick={saveEdit}>
                      {t('common.save')}
                    </button>
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => setEditingId(null)}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cat-card-head">
                      <span className="cat-card-name">{cat.name}</span>
                      <div className="cat-actions">
                        <button
                          type="button"
                          className="icon-btn"
                          title={t('common.edit')}
                          onClick={() => startEdit(cat)}
                        >
                          <Icon name="pencil" size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title={t('common.delete')}
                          onClick={() => setPendingDelete(cat)}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="cat-card-stat">
                      <span className="cat-total mono">{formatIDR(stat.total)}</span>
                      <span className="muted">{t('categories.count', { count: stat.count })}</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={pendingDelete !== null}
        title={t('categories.confirmTitle', { name: pendingDelete?.name ?? '' })}
        message={t('categories.confirmMsg')}
        confirmLabel={t('common.delete')}
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={commitDelete}
      />
    </>
  );
}