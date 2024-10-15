// script.js
let totalDana = 0;
let rowNumber = 1;

// Fungsi untuk memuat data dari localStorage
function loadData() {
    const storedData = JSON.parse(localStorage.getItem('data')) || [];
    // Reset total dana
    totalDana = 0;
    storedData.forEach((item, index) => {
        addRowToTable(item.keterangan, item.uangMasuk, item.uangKeluar, index);
        totalDana += item.uangMasuk - item.uangKeluar; // Hitung total dana
    });
    document.getElementById('totalDana').innerText = totalDana;
}

// Fungsi untuk menambahkan baris ke tabel
function addRowToTable(keterangan, uangMasuk, uangKeluar, index) {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    newRow.innerHTML = `
        <td>${rowNumber++}</td>
        <td>${keterangan}</td>
        <td>${uangMasuk}</td>
        <td>${uangKeluar}</td>
        <td><button class="deleteBtn" data-index="${index}">Hapus</button></td> <!-- Tombol hapus -->
    `;

    // Tambahkan event listener pada tombol hapus
    newRow.querySelector('.deleteBtn').addEventListener('click', function() {
        deleteRow(index);
    });
}

// Event listener untuk form submit
document.getElementById('dataForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const keterangan = document.getElementById('keterangan').value;
    const uangMasuk = parseFloat(document.getElementById('uangMasuk').value);
    const uangKeluar = parseFloat(document.getElementById('uangKeluar').value);

    // Update total dana
    totalDana += uangMasuk - uangKeluar;
    document.getElementById('totalDana').innerText = totalDana;

    // Tambah data ke tabel
    addRowToTable(keterangan, uangMasuk, uangKeluar, rowNumber - 1); // Indeks baru

    // Simpan data ke localStorage
    saveData(keterangan, uangMasuk, uangKeluar);

    // Reset form
    document.getElementById('dataForm').reset();
});

// Fungsi untuk menyimpan data ke localStorage
function saveData(keterangan, uangMasuk, uangKeluar) {
    const storedData = JSON.parse(localStorage.getItem('data')) || [];
    storedData.push({ keterangan, uangMasuk, uangKeluar });
    localStorage.setItem('data', JSON.stringify(storedData));
}

// Fungsi untuk menghapus baris dan data dari localStorage
function deleteRow(index) {
    // Ambil data dari localStorage
    const storedData = JSON.parse(localStorage.getItem('data')) || [];

    // Hitung total dana sebelum penghapusan
    const item = storedData[index];
    totalDana -= item.uangMasuk - item.uangKeluar;
    document.getElementById('totalDana').innerText = totalDana;

    // Hapus item dari array
    storedData.splice(index, 1);
    localStorage.setItem('data', JSON.stringify(storedData));

    // Hapus baris dari tabel
    loadTable();
}

// Fungsi untuk memuat tabel kembali setelah penghapusan
function loadTable() {
    const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Hapus semua baris
    rowNumber = 1; // Reset nomor baris
    loadData(); // Muat data dari localStorage
}

// Memuat data saat halaman dimuat
window.onload = function() {
    // Inisialisasi totalDana ke 0
    totalDana = 0;
    loadData();
};
