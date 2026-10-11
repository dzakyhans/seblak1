"use strict";

const HARGA_DASAR = 8000;

const NOMOR_WA = "625871229879";

const KUNCI_ULASAN = "seblakMantulUlasan";

const toppingInputs = document.querySelectorAll('input[name="topping"]');
const kuahInputs = document.querySelectorAll('input[name="kuah"]');
const levelInputs = document.querySelectorAll('input[name="level"]');
const penyajianInputs = document.querySelectorAll('input[name="penyajian"]');

const namaInput = document.getElementById("nama");
const jumlahInput = document.getElementById("jumlah");
const catatanInput = document.getElementById("catatan");

const detailPesanan = document.getElementById("detailPesanan");
const hargaPerPorsi = document.getElementById("hargaPerPorsi");
const jumlahRingkasan = document.getElementById("jumlahRingkasan");
const subtotalRacikan = document.getElementById("subtotalRacikan");
const totalHarga = document.getElementById("totalHarga");
const teksPedas = document.getElementById("teksPedas");
const daftarKeranjang = document.getElementById("daftarKeranjang");
const jumlahItem = document.getElementById("jumlahItem");

const keranjang = [];
const MAKS_RACIKAN = 20;

function rupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}

function ambilPilihan(nama) {
  const pilihan = document.querySelector(`input[name="${nama}"]:checked`);
  return pilihan ? pilihan.value : "";
}

function ambilTopping() {
  return [...toppingInputs]
    .filter(input => input.checked)
    .map(input => ({
      nama: input.value,
      harga: Number(input.dataset.harga)
    }));
}

function ambilJumlah() {
  const nilai = Number(jumlahInput.value);
  if (!Number.isFinite(nilai) || nilai < 1) return 1;
  return Math.min(Math.floor(nilai), 99);
}

function totalKeranjang() {
  return keranjang.reduce((total, item) => total + item.total, 0);
}


function hitungPesanan() {
  const topping = ambilTopping();
  const totalTopping = topping.reduce((t, item) => t + item.harga, 0);
  const hargaPorsi = HARGA_DASAR + totalTopping;
  const jumlah = ambilJumlah();

  return {
    kuah: ambilPilihan("kuah"),
    level: ambilPilihan("level"),
    penyajian: ambilPilihan("penyajian"),
    topping,
    totalTopping,
    hargaPorsi,
    jumlah,
    total: hargaPorsi * jumlah,
    catatan: catatanInput.value.trim()
  };
}

function perbaruiPratinjau() {
  const pesanan = hitungPesanan();

  detailPesanan.replaceChildren();

  const rincian = [
    { label: "Jenis kuah", nilai: pesanan.kuah },
    { label: "Level pedas", nilai: `Level ${pesanan.level}` },
    {
      label: "Topping",
      nilai: pesanan.topping.length
        ? pesanan.topping.map(item => item.nama).join(", ")
        : "Belum dipilih"
    },
    { label: "Penyajian", nilai: pesanan.penyajian }
  ];

  rincian.forEach(item => {
    const baris = document.createElement("div");
    baris.className = "cart-detail-row";

    const label = document.createElement("span");
    label.textContent = item.label;

    const nilai = document.createElement("strong");
    nilai.textContent = item.nilai;

    baris.append(label, nilai);
    detailPesanan.appendChild(baris);
  });

  hargaPerPorsi.textContent = rupiah(pesanan.hargaPorsi);
  jumlahRingkasan.textContent = `${pesanan.jumlah} porsi`;
  subtotalRacikan.textContent = rupiah(pesanan.total);

  const deskripsiPedas = {
    0: "😊 Level 0 — tidak pedas.",
    1: "🌶️ Level 1 — pedas ringan.",
    2: "🌶️ Level 2 — pedas sedang.",
    3: "🌶️🌶️ Level 3 — cukup pedas.",
    4: "🔥 Level 4 — ekstra pedas.",
    5: "🔥🔥 Level 5 — pedas maksimal."
  };

  teksPedas.textContent =
    deskripsiPedas[pesanan.level] || deskripsiPedas[0];

  return pesanan;
}

function renderKeranjang() {
  daftarKeranjang.replaceChildren();

  jumlahItem.textContent = `${keranjang.length} racikan`;
  totalHarga.textContent = rupiah(totalKeranjang());

  if (keranjang.length === 0) {
    const kosong = document.createElement("div");
    kosong.className = "cart-empty";
    kosong.textContent =
      "Keranjang masih kosong. Klik “Tambah ke Keranjang” setelah meracik.";
    daftarKeranjang.appendChild(kosong);
    return;
  }

  keranjang.forEach((item, index) => {
    const kartu = document.createElement("div");
    kartu.className = "cart-item";

    const atas = document.createElement("div");
    atas.className = "cart-item-top";

    const judul = document.createElement("strong");
    judul.textContent =
      `${index + 1}. Seblak ${item.kuah} × ${item.jumlah}`;

    atas.appendChild(judul);

    const detail = document.createElement("div");
    detail.className = "cart-item-detail";

    const topping = item.topping.length
      ? item.topping.map(t => t.nama).join(", ")
      : "Tanpa topping tambahan";

    detail.textContent =
      `Level ${item.level} • ${item.penyajian} • ${topping}` +
      (item.catatan ? ` • Catatan: ${item.catatan}` : "");

    const bawah = document.createElement("div");
    bawah.className = "cart-item-bottom";

    const subtotal = document.createElement("strong");
    subtotal.textContent = rupiah(item.total);

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "remove-item";
    hapus.textContent = "Hapus";
    hapus.addEventListener("click", () => {
      keranjang.splice(index, 1);
      renderKeranjang();
    });

    bawah.append(subtotal, hapus);
    kartu.append(atas, detail, bawah);
    daftarKeranjang.appendChild(kartu);
  });
}

[
  ...toppingInputs,
  ...kuahInputs,
  ...levelInputs,
  ...penyajianInputs
].forEach(input => {
  input.addEventListener("change", perbaruiPratinjau);
});

jumlahInput.addEventListener("change", () => {
  jumlahInput.value = ambilJumlah();
  perbaruiPratinjau();
});

jumlahInput.addEventListener("input", () => {
  if (jumlahInput.value !== "") perbaruiPratinjau();
});

catatanInput.addEventListener("input", perbaruiPratinjau);


document.getElementById("tambahJumlah").addEventListener("click", () => {
  jumlahInput.value = Math.min(99, ambilJumlah() + 1);
  perbaruiPratinjau();
});

document.getElementById("kurangiJumlah").addEventListener("click", () => {
  jumlahInput.value = Math.max(1, ambilJumlah() - 1);
  perbaruiPratinjau();
});


function resetRacikan() {
  document.querySelector('input[name="kuah"][value="Nyemek"]').checked = true;
  document.querySelector('input[name="level"][value="0"]').checked = true;
  document.querySelector(
    'input[name="penyajian"][value="Makan di tempat"]'
  ).checked = true;

  toppingInputs.forEach(input => { input.checked = false; });

  jumlahInput.value = 1;
  catatanInput.value = "";
  perbaruiPratinjau();
}

function tambahKeKeranjang() {
  if (keranjang.length >= MAKS_RACIKAN) {
    alert(`Maksimal ${MAKS_RACIKAN} racikan per pesanan.`);
    return false;
  }

  keranjang.push(hitungPesanan());
  renderKeranjang();
  resetRacikan(); 
  return true;
}

document.getElementById("tombolTambah").addEventListener("click", () => {
  if (tambahKeKeranjang()) {
    document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
  }
});

document.getElementById("tombolReset").addEventListener("click", () => {
  if (keranjang.length &&
      !confirm("Kosongkan keranjang dan reset semua pilihan?")) {
    return;
  }

  keranjang.length = 0;
  namaInput.value = "";
  resetRacikan();
  renderKeranjang();

  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});


document.getElementById("tombolPesan").addEventListener("click", () => {
  const nama = namaInput.value.trim();

  if (!nama) {
    alert("Silakan isi nama pemesan terlebih dahulu.");
    namaInput.focus();
    return;
  }

  if (!/^[0-9]{8,15}$/.test(NOMOR_WA)) {
    alert("Periksa kembali nomor WhatsApp penjual.");
    return;
  }

  if (keranjang.length === 0) {
    tambahKeKeranjang();
  }

  const blokRacikan = keranjang.map((item, i) => {
    const topping = item.topping.length
      ? item.topping.map(t => `${t.nama} (${rupiah(t.harga)})`).join(", ")
      : "Tanpa topping tambahan";

    return [
      `*${i + 1}. Seblak ${item.kuah}*`,
      `   Level pedas: ${item.level}`,
      `   Penyajian: ${item.penyajian}`,
      `   Topping: ${topping}`,
      `   ${rupiah(item.hargaPorsi)} × ${item.jumlah} porsi = ${rupiah(item.total)}`,
      `   Catatan: ${item.catatan || "-"}`
    ].join("\n");
  });

  const totalPorsi = keranjang.reduce((t, item) => t + item.jumlah, 0);

  const pesan = [
    "🌶️ *PESANAN SEBLAK MANTUL*",
    "",
    `Nama: ${nama}`,
    "",
    blokRacikan.join("\n\n"),
    "",
    `Total porsi: ${totalPorsi}`,
    `*TOTAL BAYAR: ${rupiah(totalKeranjang())}*`,
    "",
    "Mohon konfirmasi pesanan saya. Terima kasih!"
  ].join("\n");

  const url = `https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesan)}`;

  window.open(url, "_blank", "noopener,noreferrer");
});

function ambilUlasan() {
  try {
    const data = localStorage.getItem(KUNCI_ULASAN);

    if (!data) {
      return [];
    }

    const ulasan = JSON.parse(data);

    if (!Array.isArray(ulasan)) {
      return [];
    }

    return ulasan.filter(item =>
      item &&
      typeof item.nama === "string" &&
      typeof item.komentar === "string" &&
      Number.isInteger(item.rating) &&
      item.rating >= 1 &&
      item.rating <= 5 &&
      typeof item.tanggal === "string"
    );
  } catch (error) {
    console.warn("Data ulasan tidak dapat dibaca.", error);
    return [];
  }
}

function simpanUlasan(data) {
  try {
    localStorage.setItem(
      KUNCI_ULASAN,
      JSON.stringify(data)
    );

    return true;
  } catch (error) {
    console.warn("Data ulasan tidak dapat disimpan.", error);
    return false;
  }
}

function tampilkanUlasan() {
  const ulasan = ambilUlasan();

  const daftarUlasan = document.getElementById("daftarUlasan");
  const rataRating = document.getElementById("rataRating");
  const bintangRata = document.getElementById("bintangRata");
  const jumlahUlasan = document.getElementById("jumlahUlasan");
  const labelJumlahReview = document.getElementById(
    "labelJumlahReview"
  );

  daftarUlasan.replaceChildren();

  labelJumlahReview.textContent =
    `${ulasan.length} ulasan`;

  jumlahUlasan.textContent = ulasan.length
    ? `Dari ${ulasan.length} ulasan pelanggan`
    : "Belum ada ulasan";

  if (ulasan.length === 0) {
    rataRating.textContent = "—";
    bintangRata.textContent = "☆☆☆☆☆";

    const kosong = document.createElement("p");
    kosong.className = "empty-reviews";
    kosong.textContent =
      "Belum ada ulasan. Jadilah yang pertama berbagi pengalaman!";

    daftarUlasan.appendChild(kosong);
    return;
  }

  const jumlahRating = ulasan.reduce(
    (total, item) => total + item.rating,
    0
  );

  const rataRata = jumlahRating / ulasan.length;

  rataRating.textContent = rataRata.toFixed(1);

  bintangRata.textContent =
    "★".repeat(Math.round(rataRata)) +
    "☆".repeat(5 - Math.round(rataRata));

  ulasan.slice().reverse().forEach(item => {
    const kartu = document.createElement("article");
    kartu.className = "review-card";

    const header = document.createElement("div");
    header.className = "review-card-header";

    const avatar = document.createElement("div");
    avatar.className = "review-avatar";
    avatar.textContent = item.nama.charAt(0).toUpperCase();
    avatar.setAttribute("aria-hidden", "true");

    const orang = document.createElement("div");
    orang.className = "review-person";

    const nama = document.createElement("strong");
    nama.textContent = item.nama;

    const tanggal = document.createElement("small");
    tanggal.textContent = item.tanggal;

    orang.append(nama, tanggal);
    header.append(avatar, orang);

    const bintang = document.createElement("div");
    bintang.className = "review-stars";
    bintang.textContent =
      "★".repeat(item.rating) +
      "☆".repeat(5 - item.rating);

    bintang.setAttribute(
      "aria-label",
      `Rating ${item.rating} dari 5`
    );

    const komentar = document.createElement("p");
    komentar.className = "review-comment";
    komentar.textContent = item.komentar;

    kartu.append(header, bintang, komentar);
    daftarUlasan.appendChild(kartu);
  });
}

document.getElementById("formUlasan")
  .addEventListener("submit", event => {

    event.preventDefault();

    const nama = document.getElementById("namaUlasan")
      .value.trim();

    const komentar = document.getElementById("komentar")
      .value.trim();

    const ratingInput = document.querySelector(
      'input[name="rating"]:checked'
    );

    if (!nama || !komentar || !ratingInput) {
      alert("Silakan isi nama, rating, dan ulasan.");
      return;
    }

    const ulasanLama = ambilUlasan();

    if (ulasanLama.length >= 200) {
      alert(
        "Penyimpanan ulasan pada browser sudah penuh. " +
        "Gunakan sistem database untuk penyimpanan permanen."
      );
      return;
    }

    const ulasanBaru = {
      nama,
      rating: Number(ratingInput.value),
      komentar,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    };

    ulasanLama.push(ulasanBaru);

    if (!simpanUlasan(ulasanLama)) {
      alert(
        "Ulasan belum dapat disimpan di browser ini. " +
        "Periksa pengaturan penyimpanan browser."
      );
      return;
    }

    tampilkanUlasan();

    event.target.reset();

    document.getElementById("star5").checked = true;

    alert("Terima kasih! Ulasanmu berhasil disimpan.");

    document.getElementById("daftarUlasan")
      .scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
  });


perbaruiPratinjau();
renderKeranjang();
tampilkanUlasan();
