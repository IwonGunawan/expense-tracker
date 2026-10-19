import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setLocale } from './utils';

const en = {
  'api.sessionExpired': 'Session expired, please log in again',

  'common.close': 'Close',
  'common.cancel': 'Cancel',
  'common.save': 'Save',
  'common.saving': 'Saving...',
  'common.processing': 'Processing...',
  'common.add': 'Add',
  'common.reset': 'Reset',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.loading': 'Loading...',

  'lang.switch': 'Switch language',

  'nav.dashboard': 'Dashboard',
  'nav.expenses': 'Expenses',
  'nav.categories': 'Categories',
  'nav.settings': 'Settings',
  'nav.groups': 'Group',
  'nav.aria': 'Navigation',
  'nav.bottomAria': 'Bottom navigation',
  'logo.tagline': 'Track your expenses',
  'profile.aria': 'Profile menu',
  'logout': 'Log out',

  'login.point1': 'Record daily expenses in seconds',
  'login.point2': 'Automatic recap by category and month',
  'login.point3': '12-month trend chart to monitor your habits',
  'login.asideTitle': 'Manage your spending, neatly and measurably.',
  'login.asideText': 'All your money records in one clean dashboard.',
  'login.signInTitle': 'Sign in to your account',
  'login.signInSub': 'Continue tracking your expenses.',
  'login.registerTitle': 'Create your account',
  'login.registerSub': 'Start tracking your expenses in seconds.',
  'login.register': 'Register',
  'login.noAccount': 'Don\'t have an account?',
  'login.haveAccount': 'Already have an account?',
  'login.confirmPassword': 'Confirm password',
  'register.usernameMinError': 'Username must be at least 3 characters',
  'register.passwordMinError': 'Password must be at least 6 characters',
  'register.passwordMismatchError': 'Password confirmation does not match',
  'login.username': 'Username',
  'login.usernamePlaceholder': 'e.g. johndoe',
  'login.password': 'Password',
  'login.pwPlaceholder': 'At least 6 characters',
  'login.showPw': 'Show password',
  'login.hidePw': 'Hide password',
  'login.signIn': 'Sign in',
  'login.processing': 'Processing...',
  'login.trust': 'Your data stays safely on your own server',
  'login.error': 'Username must be at least 3 characters, password at least 6 characters.',
  'login.illustrationAria': 'Expense summary illustration',

  'dashboard.loading': 'Loading data...',
  'dashboard.subtitle': 'This month spending summary.',
  'dashboard.add': 'Add Expense',
  'dashboard.noCategory': 'Create a category before recording expenses.',
  'dashboard.thisMonth': 'This Month',
  'dashboard.average': 'Average',
  'dashboard.perTransaction': 'per transaction',
  'dashboard.transactions': 'Transactions',
  'dashboard.thisMonthHint': 'this month',
  'dashboard.categories': 'Categories',
  'dashboard.used': 'used',
  'dashboard.monthlyTitle': 'Spending per Month',
  'dashboard.recapTitle': 'Category Recap This Month',
  'chart.empty': 'No expenses yet',
  'chart.emptyHint': 'Add an expense to see the recap.',

  'expenses.title': 'Expenses',
  'expenses.meta': '{total} transactions',
  'expenses.add': 'Add',
  'expenses.noCategoryPre': 'Create a category first in the ',
  'expenses.noCategoryPost': ' menu to add expenses.',
  'expenses.month': 'Month',
  'expenses.category': 'Category',
  'expenses.filterAll': 'All',
  'expenses.thDate': 'Date',
  'expenses.thCategory': 'Category',
  'expenses.thDescription': 'Description',
  'expenses.thAmount': 'Amount',
  'expenses.thActions': 'Actions',
  'expenses.empty': 'No data',
  'expenses.emptyHintFilter': 'Try another filter.',
  'expenses.emptyHint': 'Start by adding an expense.',
  'expenses.confirmTitle': 'Delete this expense?',
  'expenses.confirmMsg': 'This action cannot be undone.',
  'expenses.deleted': 'Expense deleted',
  'expenses.export': 'Export XLS',
  'expenses.exported': 'File downloaded',

  'categories.title': 'Categories',
  'categories.subtitle': 'Manage your expense categories.',
  'categories.placeholder': 'New category name, e.g. Transport',
  'categories.empty': 'No categories yet',
  'categories.emptyHint': 'Add a category to start recording expenses.',
  'categories.saved': 'Category added',
  'categories.updated': 'Category updated',
  'categories.deleted': 'Category deleted',
  'categories.count': '{count} transactions',
  'categories.confirmTitle': 'Delete category "{name}"?',
  'categories.confirmMsg': 'Categories still used by expenses cannot be deleted.',

  'settings.title': 'Settings',
  'settings.subtitle': 'Manage your account and security.',
  'settings.account': 'Account',
  'settings.accountNote': 'Username registered to this account.',
  'settings.changePassword': 'Change Password',
  'settings.currentPassword': 'Current password',
  'settings.newPassword': 'New password',
  'settings.confirmNewPassword': 'Confirm new password',
  'settings.pwMinError': 'New password must be at least 6 characters',
  'settings.pwMismatchError': 'Password confirmation does not match',
  'settings.pwChanged': 'Password changed',
  'settings.dangerZone': 'Danger Zone',
  'settings.dangerNote': 'Permanently delete your account and all data.',
  'settings.deleteAccount': 'Delete Account',
  'settings.confirmTitle': 'Delete account?',
  'settings.confirmMsg':
    'All your expenses and categories will be permanently deleted. Enter your password to confirm.',
  'settings.password': 'Password',

  'form.editTitle': 'Edit Expense',
  'form.addTitle': 'Add Expense',
  'form.amount': 'Amount (Rp)',
  'form.amountPlaceholder': 'e.g. 25,000',
  'form.category': 'Category',
  'form.description': 'Description',
  'form.descPlaceholder': 'e.g. lunch',
  'form.date': 'Date',
  'form.invalidAmount': 'Enter a valid amount',
  'form.pickCategory': 'Select a category first',
  'form.needCategory': 'Create a category first to add expenses',
  'form.updated': 'Expense updated',
  'form.added': 'Expense added',
  'form.saveChanges': 'Save Changes',
  'form.add': 'Add',

  'toast.close': 'Close',
};

const id = {
  'api.sessionExpired': 'Sesi berakhir, login ulang',

  'common.close': 'Tutup',
  'common.cancel': 'Batal',
  'common.save': 'Simpan',
  'common.saving': 'Menyimpan...',
  'common.processing': 'Proses...',
  'common.add': 'Tambah',
  'common.reset': 'Reset',
  'common.edit': 'Ubah',
  'common.delete': 'Hapus',
  'common.loading': 'Memuat...',

  'lang.switch': 'Ganti bahasa',

  'nav.dashboard': 'Dashboard',
  'nav.expenses': 'Pengeluaran',
  'nav.categories': 'Kategori',
  'nav.settings': 'Pengaturan',
  'nav.groups': 'Grup',
  'nav.aria': 'Navigasi',
  'nav.bottomAria': 'Navigasi bawah',
  'logo.tagline': 'Kelola pengeluaran',
  'profile.aria': 'Menu profil',
  'logout': 'Keluar',

  'login.point1': 'Catat pengeluaran harian dalam hitungan detik',
  'login.point2': 'Rekap otomatis per kategori dan per bulan',
  'login.point3': 'Grafik tren 12 bulan untuk pantau kebiasaanmu',
  'login.asideTitle': 'Kelola pengeluaran dengan rapi dan terukur.',
  'login.asideText': 'Semua catatan keuanganmu dalam satu dashboard yang bersih.',
  'login.signInTitle': 'Masuk ke akunmu',
  'login.signInSub': 'Lanjutkan catat pengeluaranmu.',
  'login.registerTitle': 'Buat akunmu',
  'login.registerSub': 'Mulai catat pengeluaran dalam hitungan detik.',
  'login.register': 'Daftar',
  'login.noAccount': 'Belum punya akun?',
  'login.haveAccount': 'Sudah punya akun?',
  'login.confirmPassword': 'Konfirmasi password',
  'register.usernameMinError': 'Username minimal 3 karakter',
  'register.passwordMinError': 'Password minimal 6 karakter',
  'register.passwordMismatchError': 'Konfirmasi password tidak cocok',
  'login.username': 'Username',
  'login.usernamePlaceholder': 'mis. johndoe',
  'login.password': 'Password',
  'login.pwPlaceholder': 'Minimal 6 karakter',
  'login.showPw': 'Tampilkan password',
  'login.hidePw': 'Sembunyikan password',
  'login.signIn': 'Masuk',
  'login.processing': 'Memproses...',
  'login.trust': 'Data tersimpan aman di server kamu sendiri',
  'login.error': 'Username minimal 3 karakter, password minimal 6 karakter.',
  'login.illustrationAria': 'Ilustrasi ringkasan pengeluaran',

  'dashboard.loading': 'Memuat data...',
  'dashboard.subtitle': 'Ringkasan pengeluaran bulan ini.',
  'dashboard.add': 'Tambah Pengeluaran',
  'dashboard.noCategory': 'Buat kategori dulu sebelum mencatat pengeluaran.',
  'dashboard.thisMonth': 'Bulan Ini',
  'dashboard.average': 'Rata-rata',
  'dashboard.perTransaction': 'per transaksi',
  'dashboard.transactions': 'Transaksi',
  'dashboard.thisMonthHint': 'bulan ini',
  'dashboard.categories': 'Kategori',
  'dashboard.used': 'dipakai',
  'dashboard.monthlyTitle': 'Pengeluaran per Bulan',
  'dashboard.recapTitle': 'Rekap Kategori Bulan Ini',
  'chart.empty': 'Belum ada pengeluaran',
  'chart.emptyHint': 'Tambahkan pengeluaran untuk melihat rekap.',

  'expenses.title': 'Pengeluaran',
  'expenses.meta': '{total} transaksi',
  'expenses.add': 'Tambah',
  'expenses.noCategoryPre': 'Buat kategori dulu di menu ',
  'expenses.noCategoryPost': ' agar bisa menambah pengeluaran.',
  'expenses.month': 'Bulan',
  'expenses.category': 'Kategori',
  'expenses.filterAll': 'Semua',
  'expenses.thDate': 'Tanggal',
  'expenses.thCategory': 'Kategori',
  'expenses.thDescription': 'Deskripsi',
  'expenses.thAmount': 'Jumlah',
  'expenses.thActions': 'Aksi',
  'expenses.empty': 'Tidak ada data',
  'expenses.emptyHintFilter': 'Coba filter lain.',
  'expenses.emptyHint': 'Mulai dengan tambah pengeluaran.',
  'expenses.confirmTitle': 'Hapus pengeluaran?',
  'expenses.confirmMsg': 'Tindakan ini tidak bisa dibatalkan.',
  'expenses.deleted': 'Pengeluaran dihapus',
  'expenses.export': 'Export XLS',
  'expenses.exported': 'File diunduh',

  'categories.title': 'Kategori',
  'categories.subtitle': 'Kelola kategori pengeluaranmu.',
  'categories.placeholder': 'Nama kategori baru, mis: Transport',
  'categories.empty': 'Belum ada kategori',
  'categories.emptyHint': 'Tambahkan kategori untuk mulai mencatat pengeluaran.',
  'categories.saved': 'Kategori ditambahkan',
  'categories.updated': 'Kategori diperbarui',
  'categories.deleted': 'Kategori dihapus',
  'categories.count': '{count} transaksi',
  'categories.confirmTitle': 'Hapus kategori "{name}"?',
  'categories.confirmMsg': 'Kategori yang masih dipakai pengeluaran tidak bisa dihapus.',

  'settings.title': 'Pengaturan',
  'settings.subtitle': 'Kelola akun dan keamanan.',
  'settings.account': 'Akun',
  'settings.accountNote': 'Username terdaftar akun ini.',
  'settings.changePassword': 'Ganti Password',
  'settings.currentPassword': 'Password saat ini',
  'settings.newPassword': 'Password baru',
  'settings.confirmNewPassword': 'Konfirmasi password baru',
  'settings.pwMinError': 'Password baru minimal 6 karakter',
  'settings.pwMismatchError': 'Konfirmasi password tidak cocok',
  'settings.pwChanged': 'Password diganti',
  'settings.dangerZone': 'Danger Zone',
  'settings.dangerNote': 'Hapus akun beserta seluruh data secara permanen.',
  'settings.deleteAccount': 'Hapus Akun',
  'settings.confirmTitle': 'Hapus akun?',
  'settings.confirmMsg':
    'Semua pengeluaran dan kategori akan hilang permanen. Masukkan password untuk konfirmasi.',
  'settings.password': 'Password',

  'form.editTitle': 'Edit Pengeluaran',
  'form.addTitle': 'Tambah Pengeluaran',
  'form.amount': 'Jumlah (Rp)',
  'form.amountPlaceholder': 'mis: 25.000',
  'form.category': 'Kategori',
  'form.description': 'Deskripsi',
  'form.descPlaceholder': 'mis: makan siang',
  'form.date': 'Tanggal',
  'form.invalidAmount': 'Masukkan jumlah yang valid',
  'form.pickCategory': 'Pilih kategori dulu',
  'form.needCategory': 'Buat kategori dulu agar bisa menambah pengeluaran',
  'form.updated': 'Pengeluaran diperbarui',
  'form.added': 'Pengeluaran ditambahkan',
  'form.saveChanges': 'Simpan Perubahan',
  'form.add': 'Tambah',

  'toast.close': 'Tutup',
};

const DICTS = { en, id };
const LOCALES = { en: 'en-US', id: 'id-ID' };

let currentLang = 'en';

export function tr(key, vars) {
  const raw = DICTS[currentLang]?.[key] ?? DICTS.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

const I18nCtx = createContext(null);

export function useI18n() {
  return useContext(I18nCtx);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('lang');
    currentLang = saved === 'id' ? 'id' : 'en';
    return currentLang;
  });

  setLocale(LOCALES[lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next) => {
    currentLang = next === 'id' ? 'id' : 'en';
    localStorage.setItem('lang', currentLang);
    setLangState(currentLang);
  };

  const value = useMemo(
    () => ({ lang, setLang, locale: LOCALES[lang], t: tr }),
    [lang],
  );

  return <I18nCtx.Provider value={value}>{children}</I18nCtx.Provider>;
}

export function LangSwitch({ className = '' }) {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      className={`ghost small lang-btn ${className}`.trim()}
      onClick={() => setLang(lang === 'en' ? 'id' : 'en')}
      aria-label={t('lang.switch')}
      title={t('lang.switch')}
    >
      {lang === 'en' ? 'EN' : 'ID'}
    </button>
  );
}
