window.SK = (() => {
  const img = (path, w = 800) => `https://i0.wp.com/satekajang.com.my/wp-content/uploads/${path}?w=${w}&ssl=1`;
  const DRINK = (glass, jug, temp = true) => {
    const groups = [];
    if (temp) groups.push({ key: 'suhu', label: 'Suhu', options: [{ label: 'Ais', price: 0 }, { label: 'Panas', price: 0 }] });
    if (jug != null) groups.push({ key: 'saiz', label: 'Saiz', options: [{ label: 'Gelas', price: glass }, { label: 'Jug', price: jug }] });
    return groups;
  };

  const SATE = [
    { id: 'ayam',     name: 'Sate Ayam',            price: 1.70, img: img('2022/12/1-sate-ayam.jpg'),            cut: 'assets/sk-ayam.png', tone: '#C8913E', desc: 'Isi ayam perap kunyit dan serai, dibakar atas arang.' },
    { id: 'dglemak',  name: 'Sate Daging + Lemak',  price: 2.10, img: img('2022/12/2-sate-daging.jpg'),          cut: 'assets/sk-dglemak.png', tone: '#8C4E2C', desc: 'Daging lembu berselang lemak — lebih lembut dan berlemak.' },
    { id: 'daging',   name: 'Sate Daging',          price: 2.40, img: img('2022/12/2-sate-daging.jpg'),          cut: 'assets/sk-daging.png', tone: '#6C3820', desc: 'Daging lembu tanpa lemak, perapan rempah penuh.' },
    { id: 'perut',    name: 'Sate Perut',           price: 1.90, img: img('2022/12/3-sate-perut.jpg'),           cut: 'assets/sk-perut.png', tone: '#C4A06E', desc: 'Perut lembu yang dibersihkan dan diperap, kenyal dan berempah.' },
    { id: 'hati',     name: 'Sate Hati & Pedal',    price: 1.70, img: img('2022/12/4-sate-hati.jpg'),            cut: 'assets/sk-hati.png', tone: '#5B2D22', desc: 'Hati dan pedal ayam, dibakar hingga garing di luar.' },
    { id: 'ikan',     name: 'Sate Ikan',            price: 2.20, img: img('2022/12/5-sate-ikan.jpg'),            cut: 'assets/sk-ikan.png', tone: '#DDB46A', desc: 'Isi ikan perap, pilihan ringan untuk yang tidak makan daging.' },
    { id: 'kmlemak',  name: 'Sate Kambing + Lemak', price: 2.80, img: img('2022/12/6-sate-kambing.jpg'),         cut: 'assets/sk-kmlemak.png', tone: '#7B4130', desc: 'Kambing berselang lemak dengan perapan rempah pekat.' },
    { id: 'kmprem',   name: 'Sate Kambing Premium', price: 3.00, img: img('2024/03/sate-kambing-premium.jpg'),   cut: 'assets/sk-kmprem.png', tone: '#4A281C', desc: 'Potongan kambing terpilih, lebih tebal dan tanpa lemak.' },
  ];

  const SIDES_BUILDER = [
    { id: 'himpitK', name: 'Nasi Himpit Kecil + Bawang', price: 2.30, img: 'assets/side-himpit.jpg' },
    { id: 'himpitB', name: 'Nasi Himpit Besar + Bawang', price: 3.50, img: 'assets/side-himpit.jpg' },
    { id: 'ketupat', name: 'Ketupat', price: 1.50, unit: 'biji', img: 'assets/side-ketupat.jpg' },
    { id: 'kuah',    name: 'Kuah Tambah 180g', price: 4.00, img: 'assets/side-kuah.jpg' },
    { id: 'cili',    name: 'Cili Tambah', price: 3.00, img: 'assets/side-cili.jpg' },
    { id: 'timun',   name: 'Timun Tambah', price: 0.50, img: 'assets/side-timun.jpg' },
    { id: 'bawang',  name: 'Bawang Tambah', price: 0.50, img: 'assets/side-timun.jpg' },
  ];

  const CATEGORIES = [
    {
      id: 'sate', name: 'Sate per Cucuk', note: 'Harga seunit. Pesanan dikira mengikut cucuk.',
      items: SATE.map(s => ({ id: 'c-' + s.id, name: s.name, price: s.price, img: s.img, desc: s.desc, defaultQty: 10, unit: 'cucuk' })),
    },
    {
      id: 'set', name: 'Set Sate', items: [
        { id: 'set-single', name: 'Sate Set Single', img: img('2023/03/setsingle-1.jpg'), desc: '10 cucuk sate, 1 nasi himpit kecil, kuah kacang & timun.',
          groups: [{ key: 'jenis', label: 'Pilihan', options: [{ label: 'Ayam', price: 19.00, detail: '10 cucuk sate ayam' }, { label: 'Campur', price: 20.50, detail: '6 ayam, 4 daging' }] }] },
        { id: 'set-double', name: 'Sate Set Double', img: img('2023/03/setdouble.jpg'), desc: '20 cucuk sate, 1 nasi himpit roll, kuah kacang & timun.',
          groups: [{ key: 'jenis', label: 'Pilihan', options: [{ label: 'Ayam', price: 38.00, detail: '20 cucuk sate ayam' }, { label: 'Campur', price: 42.20, detail: '12 ayam, 8 daging' }] }] },
        { id: 'set-family', name: 'Sate Set Family', img: img('2023/03/setfamily.jpg'), desc: '50 cucuk sate, 2 nasi himpit roll, kuah kacang & timun.',
          groups: [{ key: 'jenis', label: 'Pilihan', options: [{ label: 'Ayam', price: 94.00, detail: '50 cucuk sate ayam' }, { label: 'Campur', price: 102.00, detail: '30 ayam, 20 daging' }] }] },
        { id: 'set-platter', name: 'Set Sate Platter', price: 17.50, img: img('2022/12/IMG_0995.jpg'), desc: '8 cucuk sate dari setiap jenis, nasi himpit, timun, bawang & kuah kacang.' },
        { id: 'set-hotplate', name: 'Sate Hot Plate', img: img('2023/03/sizzlinghotplate.jpg'), desc: '7 cucuk sate atas pinggan panas, 1 nasi himpit kecil & timun.',
          groups: [{ key: 'jenis', label: 'Pilihan', options: [{ label: 'Ayam', price: 17.50 }, { label: 'Daging', price: 20.00 }, { label: 'Kambing', price: 29.50 }, { label: 'Mix', price: 18.50 }] }] },
        { id: 'set-otg', name: 'Set On The Go', img: img('2023/03/onthego.jpg'), desc: '5 cucuk sate, nasi himpit, kuah kacang & timun dalam satu cawan.',
          groups: [{ key: 'jenis', label: 'Pilihan', options: [{ label: 'Ayam', price: 8.70 }, { label: 'Daging', price: 10.70 }, { label: 'Kambing', price: 15.00 }, { label: 'Campur (3 ayam, 2 daging)', price: 9.50 }] }] },
      ],
    },
    {
      id: 'sampingan', name: 'Sampingan', items: [
        { id: 's-himpitB', name: 'Nasi Himpit Besar + Bawang', price: 3.50, img: img('2022/12/2.NasiHimpitBesar.JPG-36.jpg') },
        { id: 's-himpitK', name: 'Nasi Himpit Kecil + Bawang', price: 2.30, img: img('2022/12/1.NasiHimpitKecil.JPG-36.jpg') },
        { id: 's-ketupat', name: 'Ketupat', price: 1.50, img: img('2022/12/KETUPAT.JPG-36.jpg'), desc: 'Harga sebiji.' },
        { id: 's-roll', name: 'Nasi Himpit Roll', price: 5.50 },
        { id: 's-kuah180', name: 'Kuah Tambah 180g', price: 4.00, img: 'assets/side-kuah.jpg' },
        { id: 's-kuah500', name: 'Kuah Kacang ½ kg', price: 10.00 },
        { id: 's-kuah1k', name: 'Kuah Kacang 1 kg', price: 20.00 },
        { id: 's-cili', name: 'Cili Tambah', price: 3.00, img: 'assets/side-cili.jpg' },
        { id: 's-cili500', name: 'Cili ½ kg', price: 10.00 },
        { id: 's-timun', name: 'Timun Tambah', price: 0.50, img: 'assets/side-timun.jpg' },
        { id: 's-bawang', name: 'Bawang Tambah', price: 0.50 },
      ],
    },
    {
      id: 'popia', name: 'Popia & Roti Bakar', items: [
        { id: 'p-popia', name: 'Popia Goreng', img: img('2023/04/popia-scaled.jpg'), desc: 'Dihidang bersama kuah kacang.',
          groups: [
            { key: 'isi', label: 'Inti', options: [{ label: 'Ayam', price: 0 }, { label: 'Daging', price: 0 }, { label: 'Mix', price: 0 }] },
            { key: 'saiz', label: 'Kuantiti', options: [{ label: '5 pcs', price: 0 }, { label: '10 pcs', price: 0 }] },
          ],
          priceTable: { 'Ayam|5 pcs': 7.00, 'Ayam|10 pcs': 14.00, 'Daging|5 pcs': 7.90, 'Daging|10 pcs': 15.80, 'Mix|5 pcs': 7.50, 'Mix|10 pcs': 15.00 } },
        { id: 'p-rotikk', name: 'Roti Bakar Kuah Kacang', price: 4.00 },
        { id: 'p-rotisk', name: 'Roti Sri Kaya', price: 4.00 },
      ],
    },
    {
      id: 'nasi', name: 'Nasi & Nasi Goreng', items: [
        { id: 'n-ayam', name: 'Nasi Ayam', price: 7.90, img: img('2022/12/nasiayam-36.jpg') },
        { id: 'n-ngayam', name: 'Nasi Goreng Ayam', price: 9.50, img: img('2022/12/3.NasiGorengAyam-37.jpg') },
        { id: 'n-ngbiasa', name: 'Nasi Goreng Biasa', price: 6.50, img: img('2022/12/8.NasiGorengBiasa-36.jpg') },
        { id: 'n-ngkampung', name: 'Nasi Goreng Kampung', price: 7.00, img: img('2022/12/4.NasiGorengKampung-36.jpg') },
        { id: 'n-ngciliapi', name: 'Nasi Goreng Cili Api', price: 7.00, img: img('2022/12/5.NasiGorengCiliApi-36.jpg') },
        { id: 'n-ngcina', name: 'Nasi Goreng Cina', price: 7.00, img: img('2022/12/6.NasiGorengCina-36.jpg') },
        { id: 'n-pattaya', name: 'Nasi Goreng Pattaya', price: 8.90, img: img('2022/12/7.NasiGorengPattaya11-36.jpg') },
        { id: 'n-padprik', name: 'Nasi Padprik', price: 7.90, img: img('2022/12/2.NasiPadprik-36.jpg') },
        { id: 'n-ngpadprik', name: 'Nasi Goreng Padprik', price: 9.50 },
        { id: 'n-kunyit', name: 'Nasi Ayam Goreng Kunyit', price: 7.50 },
        { id: 'n-gulai', name: 'Nasi Gulai Kawah Daging Tetel', price: 7.00 },
        { id: 'n-lemak', name: 'Nasi Masak Lemak Daging Tetel', price: 7.00 },
      ],
    },
    {
      id: 'mee', name: 'Mee / Kue Tiaw / Mihun', items: [
        ['m-goreng', 'Goreng', 6.50, '2022/12/9.MeeGoreng-36.jpg'],
        ['m-bandung', 'Bandung', 7.50, '2022/12/meebandung-36.jpg'],
        ['m-sup', 'Sup', 7.50, '2022/12/11.MeeSup-36.jpg'],
        ['m-hailam', 'Hailam', 7.50, '2022/12/12.MeeHailam-36.jpg'],
      ].map(([id, n, p, f]) => ({ id, name: n, price: p, img: img(f),
        groups: [{ key: 'mee', label: 'Jenis mi', options: [{ label: 'Mee', price: 0 }, { label: 'Kue Tiaw', price: 0 }, { label: 'Mihun', price: 0 }] }] })),
    },
    {
      id: 'ngk', name: 'Set Nasi Goreng Kampung', items: [
        { id: 'k-set1', name: 'Set 1', price: 14.50, img: img('2023/03/ngkset1.jpg'), desc: 'Nasi goreng kampung, 5 cucuk sate ayam, teh O ais.' },
        { id: 'k-set2', name: 'Set 2', price: 22.40, img: img('2023/03/ngkset2.jpg'), desc: 'Nasi goreng kampung, 5 cucuk sate ayam, 5 batang popia goreng.' },
        { id: 'k-set3', name: 'Set 3', price: 14.80, img: img('2023/03/ngkset3.jpg'), desc: 'Nasi goreng kampung, 3 cucuk sate ayam, 2 batang popia goreng.' },
      ],
    },
    {
      id: 'tambahan', name: 'Tambahan', items: [
        { id: 't-putih', name: 'Nasi Putih', price: 2.00 },
        { id: 't-ayamkosong', name: 'Nasi Ayam Kosong', price: 3.00 },
        { id: 't-ayamgoreng', name: 'Ayam Goreng', price: 5.00 },
        { id: 't-dadar', name: 'Telur Dadar', price: 2.50 },
        { id: 't-mata', name: 'Telur Mata', price: 2.00 },
        { id: 't-padprik', name: 'Padprik', price: 6.00 },
      ],
    },
    {
      id: 'minuman', name: 'Minuman', items: [
        { id: 'd-tehtarik', name: 'Teh Tarik', price: 3.00, img: img('2024/05/teh-tarik.jpg'), groups: DRINK(3.00, 21.00) },
        { id: 'd-teh', name: 'Teh', price: 3.00, img: img('2024/05/teh-ais.jpg'), groups: DRINK(3.00, 21.00) },
        { id: 'd-teho', name: 'Teh O', price: 2.30, img: img('2024/05/teh-o-ais.jpg'), groups: DRINK(2.30, 16.00) },
        { id: 'd-tehol', name: 'Teh O Limau', price: 3.50, img: img('2024/05/Teh-o-limau.jpg'), groups: DRINK(3.50, 24.00) },
        { id: 'd-kopi', name: 'Kopi', price: 3.00, img: img('2024/05/kopi-ais.jpg'), groups: DRINK(3.00, 21.00) },
        { id: 'd-kopio', name: 'Kopi O', price: 2.30, img: img('2024/05/kopi-o-ais.jpg'), groups: DRINK(2.30, 16.00) },
        { id: 'd-vico', name: 'Vico', price: 3.80, img: img('2024/05/vico.jpg'), groups: DRINK(3.80, 26.00) },
        { id: 'd-whitecafe', name: 'White Cafe', price: 3.80, img: img('2024/05/white-cafe.jpg'), groups: DRINK(3.80, 26.00) },
        { id: 'd-sirap', name: 'Sirap', price: 2.30, img: img('2024/05/sirap.jpg'), groups: DRINK(2.30, 16.00) },
        { id: 'd-bandung', name: 'Sirap Bandung', price: 3.00, img: img('2024/05/sirap-bandung.jpg'), groups: DRINK(3.00, 21.00) },
        { id: 'd-sliamu', name: 'Sirap Limau', price: 3.00, img: img('2024/05/Sirap-limau.jpg'), groups: DRINK(3.00, 21.00) },
        { id: 'd-slaici', name: 'Sirap Laici', price: 3.80, img: img('2024/05/sirap-laici.jpg'), groups: DRINK(3.80, 26.00, false) },
        { id: 'd-limau', name: 'Limau', price: 2.80, img: img('2024/05/limau-ais.jpg'), groups: DRINK(2.80, 19.00) },
        { id: 'd-jlaici', name: 'Jus Laici', price: 3.50, img: img('2024/05/jus-laici.jpg'), groups: DRINK(3.50, 24.00, false) },
        { id: 'd-jtembikai', name: 'Jus Tembikai', price: 4.00, img: img('2024/05/jus-tembikai.jpg'), groups: DRINK(4.00, 28.00, false) },
        { id: 'd-jtl', name: 'Jus Tembikai Laici', price: 4.80, img: img('2024/05/jus-tembikai-laici.jpg'), groups: DRINK(4.80, 33.00, false) },
        { id: 'd-joren', name: 'Jus Oren', price: 3.80, img: img('2024/05/jus-oren.jpg'), groups: DRINK(3.80, 26.00, false) },
        { id: 'd-soya', name: 'Soya', price: 2.80, img: img('2024/05/soya.jpg'), desc: 'Tin.' },
        { id: 'd-abc', name: 'Air Batu Campur', price: 5.50, img: img('2024/05/ais-batu-campur.jpg') },
        { id: 'd-kelapa', name: 'Kelapa', price: 6.00, img: img('2024/05/kelapa.jpg'), desc: 'Sebiji, segar.' },
        { id: 'd-float', name: 'Float', price: 4.50 },
        { id: 'd-tin', name: 'Minuman Tin', price: 2.80 },
        { id: 'd-ais', name: 'Aiskrim (3 scoop)', groups: [{ key: 'perisa', label: 'Perisa', options: [{ label: 'Vanilla', price: 3.50 }, { label: 'Coklat', price: 3.50 }] }] },
        { id: 'd-m500', name: 'Air Mineral 500ml', price: 2.00 },
        { id: 'd-m1500', name: 'Air Mineral 1500ml', price: 3.00 },
        { id: 'd-kosong', name: 'Air Kosong / Suam', price: 0.50 },
      ],
    },
  ];

  const wk = (mt, fri, sat, sun) => [sun, mt, mt, mt, mt, fri, sat];
  const BRANCHES = [
    { name: 'Bangunan Dato Nazir, Kajang', area: 'bandar', addr: 'Tingkat Bawah, Bangunan Dato Nazir, Jalan Kelab, 43000 Kajang, Selangor', tel: ['03-8737 1853', '016-774 6318'],
      hours: wk(['11:30', '22:30'], ['11:30', '23:00'], ['12:00', '23:00'], ['12:00', '22:30']), note: 'Jumaat rehat 1.00–3.00 ptg' },
    { name: 'Kompleks PKNS Bangi', area: 'bandar', addr: 'Lot G-01, Tingkat Bawah, Kompleks PKNS Bangi, 43650 Bandar Baru Bangi, Selangor', tel: ['03-8926 1710', '014-329 6318'],
      hours: wk(['11:30', '22:00'], ['11:30', '23:00'], ['11:30', '22:30'], ['11:30', '22:00']), note: 'Jumaat rehat 1.00–3.00 ptg' },
    { name: 'Taman Warisan, Putrajaya', area: 'bandar', addr: 'Taman Warisan Putrajaya, Presint 16, 62150 Putrajaya', tel: ['03-8890 1788', '016-330 4802'],
      hours: wk(['11:30', '22:00'], ['11:30', '22:00'], ['11:30', '22:00'], ['11:30', '22:00']), note: 'Jumaat rehat 12.30–2.30 ptg' },
    { name: 'R&R Awan Besar', area: 'lebuhraya', addr: 'ABW 8 & AB-P3, Perhentian Awan Besar, Lebuhraya Shah Alam, 47500 Seri Petaling, Selangor', tel: ['016-229 6421'],
      hours: wk(['11:00', '22:00'], ['16:00', '22:30'], ['11:00', '22:30'], ['11:00', '22:00']) },
    { name: 'R&R Kinrara', area: 'lebuhraya', addr: 'K4, Kawasan Rehat & Rawat Kinrara, Lebuhraya Shah Alam, 47500 Kuala Lumpur', tel: ['03-7770 1030', '016-330 9985'],
      hours: wk(['11:00', '22:00'], ['16:00', '22:30'], ['11:00', '22:30'], ['11:00', '22:00']) },
    { name: 'Hentian Jejantas Sungai Buloh', area: 'lebuhraya', addr: 'S-14SB, S-16SB & S-18SB, Sg. Buloh Overhead Bridge Restaurant, Lebuhraya Utara-Selatan, 46000 Sungai Buloh, Selangor', tel: ['016-710 8483'],
      hours: wk(['11:00', '22:30'], ['16:00', '23:00'], ['11:00', '23:00'], ['11:00', '23:00']) },
    { name: 'R&R Dengkil Arah Utara (Elite)', area: 'lebuhraya', addr: 'No. 17, Kawasan Rehat & Rawat Dengkil Arah Utara, 43800 Dengkil, Selangor', tel: ['016-201 6402'],
      hours: wk(['11:00', '22:30'], ['16:00', '23:00'], ['11:00', '23:00'], ['11:00', '23:00']) },
    { name: 'R&R Dengkil Arah Selatan (Elite)', area: 'lebuhraya', addr: 'No. 16, Kawasan Rehat & Rawat Dengkil Arah Selatan, 43800 Dengkil, Selangor', tel: ['016-229 6406'],
      hours: wk(['11:00', '22:30'], ['16:00', '23:00'], ['11:00', '23:00'], ['11:00', '23:00']) },
  ];

  return {
    img, SATE, SIDES_BUILDER, CATEGORIES, BRANCHES,
    LOGO: 'https://satekajang.com.my/wp-content/uploads/2023/02/LOGOcurrentSMALL72ppi.png',
    HERO: img('2022/12/IMG_0995.jpg', 1920),
    FACTORY: img('2022/12/Kilang1-31.webp', 1140),
  };
})();
