import { useEffect, useState } from 'react';
import { api } from '../api';
import { formatNumberID, parseNumberID, todayID } from '../utils';
import Icon from './Icon';
import { useToast } from './Toast';

export default function ExpenseFormModal({ open, onClose, categories, editing, onSaved }) {
  const toast = useToast();
  const [amountDisplay, setAmountDisplay] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayID());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setAmountDisplay(formatNumberID(String(Number(editing.amount))));
      setCategoryId(String(editing.categoryId));
      setDescription(editing.description ?? '');
      setDate(editing.date.slice(0, 10));
    } else {
      setAmountDisplay('');
      setDescription('');
      setDate(todayID());
      const fallback = categories[0] ? String(categories[0].id) : '';
      setCategoryId((prev) => prev || fallback);
    }
  }, [open, editing, categories]);

  useEffect(() => {
    if (open && !editing && categories.length > 0 && !categoryId) {
      setCategoryId(String(categories[0].id));
    }
  }, [open, editing, categories, categoryId]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    const rawAmount = parseNumberID(amountDisplay);
    if (!rawAmount || rawAmount <= 0) return toast.error('Masukkan jumlah yang valid');
    if (!categoryId) return toast.error('Pilih kategori dulu');
    if (!categories.length) return toast.error('Buat kategori dulu agar bisa menambah pengeluaran');
    setSaving(true);
    try {
      const body = {
        amount: rawAmount,
        categoryId: Number(categoryId),
        description,
        date,
      };
      if (editing) {
        await api(`/expenses/${editing.id}`, { method: 'PATCH', body });
      } else {
        await api('/expenses', { method: 'POST', body });
      }
      toast.success(editing ? 'Pengeluaran diperbarui' : 'Pengeluaran ditambahkan');
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal modal-large"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-head">
          <h3>{editing ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup">
            <Icon name="close" />
          </button>
        </div>

        <div className="modal-fields">
          <label className="field">
            <span className="field-label">Jumlah (Rp)</span>
            <input
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={(e) => setAmountDisplay(formatNumberID(e.target.value))}
              placeholder="mis: 25.000"
              autoComplete="off"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Kategori</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field-label">Deskripsi</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="mis: makan siang"
            />
          </label>

          <label className="field">
            <span className="field-label">Tanggal</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah'}
          </button>
        </div>
      </form>
    </div>
  );
}