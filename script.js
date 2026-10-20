// Kompatibel dengan data lama: localStorage key 'data' dan format item tetap sama.
const STORAGE_KEY = 'data';
let editIndex = null;
const form = document.getElementById('dataForm');
const tbody = document.querySelector('#dataTable tbody');
const formatUang = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
function readData() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch (err) {
    console.error('Data lama tidak dapat dibaca; tidak ditimpa.', err);
    return null;
  }
}
function writeData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function nominal(value) {
  const n = Number(String(value ?? 0).replace(/\./g, '').replace(/,/g, '.'));
  return Number.isFinite(n) ? n : 0;
}
function resetEdit() {
  editIndex = null;
  form.reset();
  document.getElementById('uangMasuk').value = 0;
  document.getElementById('uangKeluar').value = 0;
  document.getElementById('formTitle').textContent = 'Tambah Transaksi';
  document.getElementById('modeLabel').textContent = 'Mode tambah';
  document.getElementById('submitBtn').textContent = '+ Tambah Data';
  document.getElementById('cancelBtn').hidden = true;
}
function render() {
  const data = readData();
  if (data === null) {
    document.getElementById('emptyState').textContent = 'Data tersimpan tidak dapat dibaca. Periksa penyimpanan browser sebelum menambah transaksi.';
    document.getElementById('emptyState').hidden = false;
    return;
  }
  tbody.replaceChildren();
  let masuk = 0, keluar = 0;
  data.forEach((item, index) => {
    const inVal = nominal(item.uangMasuk), outVal = nominal(item.uangKeluar);
    masuk += inVal; keluar += outVal;
    const tr = document.createElement('tr');
    const values = [index + 1, item.keterangan ?? '', inVal ? formatUang(inVal) : '—', outVal ? formatUang(outVal) : '—'];
    values.forEach((value, i) => {
      const td = document.createElement('td');
      td.textContent = value;
      if (i === 2 && inVal) td.className = 'income';
      if (i === 3 && outVal) td.className = 'expense';
      tr.appendChild(td);
    });
    const actionCell = document.createElement('td');
    const actions = document.createElement('div'); actions.className = 'actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'editBtn'; edit.textContent = 'Edit';
    edit.addEventListener('click', () => startEdit(index));
    const del = document.createElement('button'); del.type = 'button'; del.className = 'deleteBtn'; del.textContent = 'Hapus';
    del.addEventListener('click', () => deleteRow(index));
    actions.append(edit, del); actionCell.appendChild(actions); tr.appendChild(actionCell); tbody.appendChild(tr);
  });
  document.getElementById('totalMasuk').textContent = formatUang(masuk);
  document.getElementById('totalKeluar').textContent = formatUang(keluar);
  document.getElementById('totalDana').textContent = formatUang(masuk - keluar);
  document.getElementById('countText').textContent = `${data.length} transaksi tercatat`;
  document.getElementById('emptyState').hidden = data.length !== 0;
}
function startEdit(index) {
  const data = readData(); if (!data || !data[index]) return;
  editIndex = index;
  document.getElementById('keterangan').value = data[index].keterangan ?? '';
  document.getElementById('uangMasuk').value = nominal(data[index].uangMasuk);
  document.getElementById('uangKeluar').value = nominal(data[index].uangKeluar);
  document.getElementById('formTitle').textContent = 'Edit Transaksi';
  document.getElementById('modeLabel').textContent = 'Mode edit';
  document.getElementById('submitBtn').textContent = 'Simpan Perubahan';
  document.getElementById('cancelBtn').hidden = false;
  form.scrollIntoView({behavior:'smooth',block:'start'});
  document.getElementById('keterangan').focus({preventScroll:true});
}
function deleteRow(index) {
  const data = readData(); if (!data || !data[index]) return;
  if (!confirm(`Hapus transaksi "${data[index].keterangan ?? ''}"?`)) return;
  data.splice(index, 1);
  try { writeData(data); } catch (err) { alert('Gagal menyimpan perubahan.'); return; }
  resetEdit(); render();
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = readData(); if (!data) { alert('Data lama tidak dapat dibaca. Penyimpanan tidak diubah.'); return; }
  const keterangan = document.getElementById('keterangan').value.trim();
  const uangMasuk = Number(document.getElementById('uangMasuk').value);
  const uangKeluar = Number(document.getElementById('uangKeluar').value);
  if (!keterangan || !Number.isSafeInteger(uangMasuk) || !Number.isSafeInteger(uangKeluar) || uangMasuk < 0 || uangKeluar < 0) {
    alert('Isi keterangan dan nominal positif yang valid.'); return;
  }
  if (uangMasuk === 0 && uangKeluar === 0) { alert('Isi minimal satu nominal transaksi.'); return; }
  if (uangMasuk > 0 && uangKeluar > 0) { alert('Isi uang masuk atau uang keluar saja untuk satu transaksi.'); return; }
  const item = { keterangan, uangMasuk, uangKeluar };
  if (editIndex !== null && data[editIndex]) data[editIndex] = {...data[editIndex], ...item};
  else data.push(item);
  try { writeData(data); } catch (err) { alert('Gagal menyimpan data. Periksa penyimpanan browser.'); return; }
  resetEdit(); render();
});
document.getElementById('cancelBtn').addEventListener('click', resetEdit);
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY) { resetEdit(); render(); } });
render();
