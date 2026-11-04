/* ==========================================================================
   script.js : Portofolio Muh. Furqan Aprilian
   ========================================================================== */

/* ---------- 1. DAFTAR DOKUMEN (EDIT DI SINI) ----------
   file   : nama file PDF di dalam folder "dokumen/"
   cat    : sertifikat | magang | proyek
   Mau tambah dokumen baru? Copy satu baris, ganti isinya. Selesai.
---------------------------------------------------------- */
const DOCS = [
  // --- Magang & Rekomendasi ---
  { file: 'bukti-magang-telkom.pdf', title: 'Bukti Magang Telkom', issuer: 'Telkom Witel Sulbagsel', cat: 'magang' },
  { file: 'lor.pdf', title: 'Letter of Recommendation (LOR)', issuer: 'Telkom Witel Sulbagsel', cat: 'magang' },
  { file: 'marketing-intern.pdf', title: 'Sertifikat Marketing Intern', issuer: 'GoodSpace', cat: 'magang' },

  // --- Proyek ---
  { file: 'foodrush-customer-operations-analysis.pdf', title: 'FoodRush: Food Delivery Customer & Operations Analysis', issuer: 'Laporan Proyek', cat: 'proyek' },
  { file: 'analisis-sentimen-camscanner.pdf', title: 'Analisis Sentimen Ulasan CamScanner (Naive Bayes)', issuer: 'Laporan Proyek', cat: 'proyek' },
  { file: 'bank-sampah.pdf', title: 'Sistem Manajemen Web Bank Sampah Tunas Muda', issuer: 'Laporan Proyek', cat: 'proyek' },
  { file: 'applya-job-application-tracker.pdf', title: 'Applya — Job Application Tracker', issuer: 'Laporan Proyek', cat: 'proyek' },
  { file: 'pixora-smart-photo-editor.pdf', title: 'Pixora — Smart Photo Editor Berbasis Website', issuer: 'Laporan Proyek', cat: 'proyek' },
  { file: 'finora-personal-finance-tracker.pdf', title: 'Finora — Personal Finance Tracker', issuer: 'Laporan Proyek', cat: 'proyek' },

  // --- Sertifikat ---
  { file: 'azure-data-fundamentals.pdf', title: 'Microsoft Certified: Azure Data Fundamentals', issuer: 'Microsoft', cat: 'sertifikat' },
  { file: 'fundamental-data-science.pdf', title: 'Fundamental Data Science', issuer: 'Pusat Pengembangan Talenta Digital', cat: 'sertifikat' },
  { file: 'junior-data-scientist.pdf', title: 'Junior Data Scientist', issuer: 'BPPTIK Komdigi', cat: 'sertifikat' },
  { file: 'basic-microsoft-excel.pdf', title: 'Basic Microsoft Excel', issuer: 'Remote Skills Academy', cat: 'sertifikat' },
  { file: 'junior-graphic-designer.pdf', title: 'Junior Graphic Designer', issuer: 'Teknologi Digital', cat: 'sertifikat' },
  { file: 'css-js-php.pdf', title: 'CSS, JavaScript and PHP Complete Course', issuer: 'Udemy', cat: 'sertifikat' },
  { file: 'bangkit-mobile-development.pdf', title: 'Bangkit Academy 2024: Mobile Development', issuer: 'Google, GoTo, Traveloka', cat: 'sertifikat' },
  { file: 'toefl.pdf', title: 'TOEFL', issuer: 'Sertifikat Bahasa Inggris', cat: 'sertifikat' }
];
const DOC_FOLDER = 'dokumen/';
const CAT_LABEL = { sertifikat: 'SERTIFIKAT', magang: 'MAGANG', proyek: 'PROYEK' };

/* ---------- 2. MENU MOBILE ---------- */
const menuToggle = document.getElementById('menuToggle');
const mobileDrawer = document.getElementById('mobileDrawer');
if (menuToggle && mobileDrawer) {
  menuToggle.addEventListener('click', () => mobileDrawer.classList.toggle('active'));
  mobileDrawer.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => mobileDrawer.classList.remove('active'))
  );
}

/* ---------- 3. TOMBOL SALIN + TOAST ---------- */
function copyText(text, btn) {
  const done = () => {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}
function fallbackCopy(text, cb) {
  const t = document.createElement('textarea');
  t.value = text;
  t.style.position = 'fixed';
  t.style.opacity = '0';
  document.body.appendChild(t);
  t.select();
  try { document.execCommand('copy'); } catch (e) { }
  document.body.removeChild(t);
  cb();
}

/* ---------- 4. LIVE DATA LAB ---------- */
let sentimentChartInstance = null;
let metricsChartInstance = null;
let foodrushRevenueChartInstance = null;
let foodrushOpsChartInstance = null;
let currentFoodrushRevView = 'monthly';
let currentFoodrushOpsView = 'cityDelay';
let foodrushInitialized = false;

function resizeAllCharts() {
  if (sentimentChartInstance) sentimentChartInstance.resize();
  if (metricsChartInstance) metricsChartInstance.resize();
  if (foodrushRevenueChartInstance) foodrushRevenueChartInstance.resize();
  if (foodrushOpsChartInstance) foodrushOpsChartInstance.resize();
  window.dispatchEvent(new Event('resize'));
}

function switchDataLab(name) {
  const target = name === 'foodrush' ? 'foodrush' : 'sentiment';

  const btnSentiment = document.getElementById('tabBtnSentiment');
  const btnFoodrush = document.getElementById('tabBtnFoodrush');
  if (btnSentiment) {
    btnSentiment.classList.toggle('active', target === 'sentiment');
    btnSentiment.setAttribute('aria-selected', target === 'sentiment');
  }
  if (btnFoodrush) {
    btnFoodrush.classList.toggle('active', target === 'foodrush');
    btnFoodrush.setAttribute('aria-selected', target === 'foodrush');
  }

  const paneSentiment = document.getElementById('pane-sentiment');
  const paneFoodrush = document.getElementById('pane-foodrush');
  const headingEl = document.getElementById('dataLabHeading');
  const subtextEl = document.getElementById('dataLabSubtext');

  if (target === 'sentiment') {
    if (paneSentiment) paneSentiment.classList.add('active');
    if (paneFoodrush) paneFoodrush.classList.remove('active');
    if (headingEl) headingEl.textContent = 'Simulasi Dashboard Analitik Sentimen NLP';
    if (subtextEl) subtextEl.textContent = 'Demonstrasi interaktif pemodelan data dari studi kasus Sentiment Analysis Naive Bayes pada ulasan Play Store.';
  } else {
    if (paneSentiment) paneSentiment.classList.remove('active');
    if (paneFoodrush) paneFoodrush.classList.add('active');
    if (headingEl) headingEl.textContent = 'Simulasi Dashboard Analitik: FoodRush Sentimen & Operasional';
    if (subtextEl) subtextEl.textContent = 'Eksplorasi interaktif performa pendapatan, keterlambatan pengiriman jam sibuk, dan kepuasan pelanggan FoodRush.';
    if (typeof window.initFoodrushCharts === 'function') {
      window.initFoodrushCharts();
    }
  }

  setTimeout(resizeAllCharts, 60);
}
window.switchDataLab = switchDataLab;

function showDataLabTab(name) {
  switchDataLab(name);
  const lab = document.getElementById('data-lab');
  if (lab) lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.showDataLabTab = showDataLabTab;

/* ---------- 5. CHART (DATA SESUAI DOKUMEN ANALISIS) ---------- */
if (window.Chart) {
  Chart.defaults.color = '#808594';
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  const grid = { color: '#242630' };
  const RED = '#E50914', WHITE = '#F8F9FA';

  // SENTIMEN NLP: Distribusi Sentimen (1.949 Data Valid - Sesuai analisis-sentimen-camscanner.pdf)
  const pie = document.getElementById('sentimentPieChart');
  if (pie) {
    sentimentChartInstance = new Chart(pie, {
      type: 'doughnut',
      data: {
        labels: ['Sentimen Positif (Rating 4-5)', 'Sentimen Negatif (Rating 1-2)'],
        datasets: [{
          data: [1607, 342],
          backgroundColor: ['#10b981', '#e50914'],
          borderColor: '#181920',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 14,
              padding: 12,
              color: WHITE,
              font: { family: "'JetBrains Mono', monospace", size: 11 },
              generateLabels: function () {
                return [
                  {
                    text: 'Positif: 1.607 (82.5%)',
                    fillStyle: '#10b981',
                    strokeStyle: '#181920',
                    lineWidth: 2,
                    index: 0
                  },
                  {
                    text: 'Negatif: 342 (17.5%)',
                    fillStyle: '#e50914',
                    strokeStyle: '#181920',
                    lineWidth: 2,
                    index: 1
                  }
                ];
              }
            }
          },
          tooltip: {
            backgroundColor: '#181920',
            titleColor: WHITE,
            bodyColor: WHITE,
            borderColor: '#383B4A',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                const total = 1949;
                const pct = ((context.raw / total) * 100).toFixed(2);
                return ` ${context.label}: ${context.raw} ulasan (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  // 02. SENTIMEN NLP: Nilai Empat Metrik Evaluasi Model (Sesuai analisis-sentimen-camscanner.pdf)
  const met = document.getElementById('metricsBarChart');
  if (met) {
    const metricDetails = {
      'Accuracy': { decimal: '0.892308', frac: '174 / 195 (TP+TN / Total)' },
      'Precision': { decimal: '0.921687', frac: '153 / 166 (TP / TP+FP)' },
      'Recall': { decimal: '0.950311', frac: '153 / 161 (TP / TP+FN)' },
      'F1-Score': { decimal: '0.935780', frac: '2 × (P×R) / (P+R)' }
    };

    metricsChartInstance = new Chart(met, {
      type: 'bar',
      data: {
        labels: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
        datasets: [{
          label: 'Nilai (%)',
          data: [89.23, 92.17, 95.03, 93.58],
          backgroundColor: [
            '#e50914', // Red accent
            '#3b82f6', // Blue
            '#10b981', // Emerald
            '#f59e0b'  // Amber
          ],
          borderColor: '#181920',
          borderWidth: 1.5,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#181920',
            titleColor: WHITE,
            bodyColor: WHITE,
            borderColor: '#383B4A',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                const item = metricDetails[context.label] || {};
                return [
                  ` Persentase : ${context.raw}%`,
                  ` Nilai Desimal: ${item.decimal || ''}`,
                  ` Kalkulasi   : ${item.frac || ''}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid,
            ticks: {
              color: WHITE,
              font: { family: "'JetBrains Mono', monospace", size: 11 }
            }
          },
          y: {
            min: 75,
            max: 100,
            grid,
            ticks: {
              color: '#808594',
              font: { family: "'JetBrains Mono', monospace", size: 10 },
              callback: val => val + '%'
            }
          }
        }
      }
    });
  }

  /* FOODRUSH DATA STORE (Sesuai dokumen foodrush-customer-operations-analysis.pdf) */
  const FOODRUSH_DATA = {
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      values: [27.50, 23.25, 26.27, 25.02, 27.51, 28.41, 27.19, 28.43, 27.41, 27.33, 27.24, 29.07]
    },
    cityRevenue: {
      labels: ['Jakarta', 'Bandung', 'Makassar', 'Surabaya', 'Yogyakarta'],
      values: [98.44, 61.47, 58.78, 58.01, 47.98],
      orders: [1435, 890, 850, 840, 703]
    },
    cityDelay: {
      labels: ['Jakarta', 'Makassar', 'Surabaya', 'Bandung', 'Yogyakarta'],
      values: [72.33, 69.12, 65.61, 59.58, 56.50]
    },
    peakHours: {
      labels: ['Off-Peak (Lancar)', 'Peak Hours (Jam Sibuk)'],
      values: [59.27, 76.54]
    },
    category: {
      labels: ['Indonesian', 'Fast Food', 'Asian', 'Pizza', 'Beverages', 'Dessert'],
      values: [92.11, 69.84, 60.99, 53.03, 25.87, 22.84],
      percentages: [28.37, 21.51, 18.78, 16.33, 7.97, 7.04]
    },
    payment: {
      labels: ['E-Wallet', 'Bank Transfer', 'Cash (Tunai)', 'Credit/Debit Card'],
      values: [2214, 941, 861, 702]
    }
  };

  window.setFoodrushRevenueView = function (view) {
    currentFoodrushRevView = view;
    document.getElementById('btnFoodrushRevMonthly')?.classList.toggle('active', view === 'monthly');
    document.getElementById('btnFoodrushRevCity')?.classList.toggle('active', view === 'city');

    const titleEl = document.getElementById('foodrushChart1Title');
    const canvas = document.getElementById('foodrushRevenueChart');
    if (!canvas || !window.Chart) return;

    if (foodrushRevenueChartInstance) {
      foodrushRevenueChartInstance.destroy();
    }

    if (view === 'monthly') {
      if (titleEl) titleEl.textContent = 'Tren Pendapatan Bulanan 2025';
      const d = FOODRUSH_DATA.monthly;
      foodrushRevenueChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: d.labels,
          datasets: [{
            label: 'Pendapatan (Juta Rp)',
            data: d.values,
            borderColor: '#e50914',
            backgroundColor: 'rgba(229, 9, 20, 0.12)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#e50914',
            pointBorderColor: '#181920',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#181920',
              titleColor: WHITE,
              bodyColor: WHITE,
              borderColor: '#383B4A',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: ctx => ` Omzet: Rp ${ctx.raw.toFixed(2)} Juta`
              }
            }
          },
          scales: {
            x: {
              grid,
              ticks: { color: WHITE, font: { family: "'JetBrains Mono', monospace", size: 10 } }
            },
            y: {
              min: 20,
              max: 32,
              grid,
              ticks: {
                color: '#808594',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: val => 'Rp ' + val + 'M'
              }
            }
          }
        }
      });
    } else {
      if (titleEl) titleEl.textContent = 'Pendapatan Delivered per Kota';
      const d = FOODRUSH_DATA.cityRevenue;
      foodrushRevenueChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [{
            label: 'Pendapatan (Juta Rp)',
            data: d.values,
            backgroundColor: ['#e50914', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
            borderColor: '#181920',
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#181920',
              titleColor: WHITE,
              bodyColor: WHITE,
              borderColor: '#383B4A',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: ctx => [
                  ` Omzet: Rp ${ctx.raw.toFixed(2)} Juta`,
                  ` Pesanan: ${d.orders[ctx.dataIndex]} Delivered`
                ]
              }
            }
          },
          scales: {
            x: {
              grid,
              ticks: { color: WHITE, font: { family: "'JetBrains Mono', monospace", size: 11 } }
            },
            y: {
              min: 0,
              max: 110,
              grid,
              ticks: {
                color: '#808594',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: val => 'Rp ' + val + 'M'
              }
            }
          }
        }
      });
    }
  };

  window.setFoodrushOpsView = function (view) {
    currentFoodrushOpsView = view;
    document.getElementById('btnFoodrushOpsDelay')?.classList.toggle('active', view === 'cityDelay');
    document.getElementById('btnFoodrushOpsPeak')?.classList.toggle('active', view === 'peakHours');
    document.getElementById('btnFoodrushOpsCategory')?.classList.toggle('active', view === 'category');
    document.getElementById('btnFoodrushOpsPayment')?.classList.toggle('active', view === 'payment');

    const titleEl = document.getElementById('foodrushChart2Title');
    const canvas = document.getElementById('foodrushOpsChart');
    if (!canvas || !window.Chart) return;

    if (foodrushOpsChartInstance) {
      foodrushOpsChartInstance.destroy();
    }

    if (view === 'cityDelay') {
      if (titleEl) titleEl.textContent = 'Tingkat Keterlambatan per Kota (%)';
      const d = FOODRUSH_DATA.cityDelay;
      foodrushOpsChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [{
            label: 'Keterlambatan (%)',
            data: d.values,
            backgroundColor: ['#e50914', '#ea580c', '#f59e0b', '#3b82f6', '#10b981'],
            borderColor: '#181920',
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#181920',
              titleColor: WHITE,
              bodyColor: WHITE,
              borderColor: '#383B4A',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: ctx => [
                  ` Keterlambatan: ${ctx.raw}%`,
                  ` Rata-rata Keseluruhan: 65.85%`
                ]
              }
            }
          },
          scales: {
            x: {
              grid,
              ticks: { color: WHITE, font: { family: "'JetBrains Mono', monospace", size: 11 } }
            },
            y: {
              min: 50,
              max: 80,
              grid,
              ticks: {
                color: '#808594',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: val => val + '%'
              }
            }
          }
        }
      });
    } else if (view === 'peakHours') {
      if (titleEl) titleEl.textContent = 'Keterlambatan: Peak vs Off-Peak (%)';
      const d = FOODRUSH_DATA.peakHours;
      foodrushOpsChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [{
            label: 'Keterlambatan (%)',
            data: d.values,
            backgroundColor: ['#10b981', '#e50914'],
            borderColor: '#181920',
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#181920',
              titleColor: WHITE,
              bodyColor: WHITE,
              borderColor: '#383B4A',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: ctx => ` Keterlambatan: ${ctx.raw}% (Lonjakan Jam Sibuk: +17.27%)`
              }
            }
          },
          scales: {
            x: {
              grid,
              ticks: { color: WHITE, font: { family: "'JetBrains Mono', monospace", size: 10 } }
            },
            y: {
              min: 40,
              max: 90,
              grid,
              ticks: {
                color: '#808594',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: val => val + '%'
              }
            }
          }
        }
      });
    } else if (view === 'category') {
      if (titleEl) titleEl.textContent = 'Pendapatan per Kategori Restoran';
      const d = FOODRUSH_DATA.category;
      foodrushOpsChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [{
            label: 'Pendapatan (Juta Rp)',
            data: d.values,
            backgroundColor: ['#e50914', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'],
            borderColor: '#181920',
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#181920',
              titleColor: WHITE,
              bodyColor: WHITE,
              borderColor: '#383B4A',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: ctx => [
                  ` Omzet: Rp ${ctx.raw.toFixed(2)} Juta`,
                  ` Kontribusi: ${d.percentages[ctx.dataIndex]}%`
                ]
              }
            }
          },
          scales: {
            x: {
              grid,
              ticks: { color: WHITE, font: { family: "'JetBrains Mono', monospace", size: 9 } }
            },
            y: {
              min: 0,
              max: 105,
              grid,
              ticks: {
                color: '#808594',
                font: { family: "'JetBrains Mono', monospace", size: 10 },
                callback: val => 'Rp ' + val + 'M'
              }
            }
          }
        }
      });
    } else if (view === 'payment') {
      if (titleEl) titleEl.textContent = 'Metode Pembayaran (Delivered 4.718)';
      const d = FOODRUSH_DATA.payment;
      foodrushOpsChartInstance = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: d.labels,
          datasets: [{
            data: d.values,
            backgroundColor: ['#e50914', '#3b82f6', '#10b981', '#f59e0b'],
            borderColor: '#181920',
            borderWidth: 2,
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 10,
                color: WHITE,
                font: { family: "'JetBrains Mono', monospace", size: 10 }
              }
            },
            tooltip: {
              backgroundColor: '#181920',
              titleColor: WHITE,
              bodyColor: WHITE,
              borderColor: '#383B4A',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: ctx => {
                  const total = 4718;
                  const pct = ((ctx.raw / total) * 100).toFixed(2);
                  return ` ${ctx.label}: ${ctx.raw} pesanan (${pct}%)`;
                }
              }
            }
          }
        }
      });
    }
  };

  window.initFoodrushCharts = function () {
    if (!foodrushInitialized) {
      window.setFoodrushRevenueView('monthly');
      window.setFoodrushOpsView('cityDelay');
      foodrushInitialized = true;
    }
  };
}

/* ---------- 6. GALERI DOKUMEN PDF ---------- */
const grid = document.getElementById('docGrid');
const modal = document.getElementById('docModal');
const frame = document.getElementById('docFrame');

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function renderThumb(url, canvas, thumbEl) {
  if (!window.pdfjsLib) { thumbEl.classList.add('failed'); return; }
  pdfjsLib.getDocument(url).promise
    .then(pdf => pdf.getPage(1))
    .then(page => {
      const base = page.getViewport({ scale: 1 });
      const scale = 480 / base.width;
      const vp = page.getViewport({ scale });
      canvas.width = vp.width;
      canvas.height = vp.height;
      return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    })
    .catch(() => thumbEl.classList.add('failed'));
}

function openDoc(d) {
  const url = DOC_FOLDER + d.file;
  document.getElementById('docModalTitle').textContent = d.title;
  document.getElementById('docModalOpen').href = url;
  const dl = document.getElementById('docModalDl');
  dl.href = url;
  dl.setAttribute('download', d.file);
  frame.src = url;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDoc() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  frame.src = 'about:blank';
  document.body.style.overflow = '';
}

if (grid) {
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const c = e.target.querySelector('canvas');
          renderThumb(c.dataset.src, c, e.target);
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '200px' })
    : null;

  DOCS.forEach((d, i) => {
    const card = document.createElement('div');
    card.className = 'doc-card';
    card.dataset.cat = d.cat;
    card.tabIndex = 0;
    card.innerHTML =
      '<div class="doc-thumb"><span class="doc-num mono">' + String(i + 1).padStart(2, '0') + '</span><canvas data-src="' + DOC_FOLDER + d.file + '"></canvas>' +
      '<div class="doc-thumb-fallback">PDF</div></div>' +
      '<div class="doc-info"><span class="doc-cat mono">' + CAT_LABEL[d.cat] + '</span>' +
      '<h4 class="doc-title"></h4><div class="doc-issuer"></div></div>';
    card.querySelector('.doc-title').textContent = d.title;
    card.querySelector('.doc-issuer').textContent = d.issuer;
    card.addEventListener('click', () => openDoc(d));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openDoc(d); });
    grid.appendChild(card);

    const thumb = card.querySelector('.doc-thumb');
    if (io) io.observe(thumb);
    else renderThumb(DOC_FOLDER + d.file, thumb.querySelector('canvas'), thumb);
  });

  document.querySelectorAll('#docFilters .tab-btn').forEach(b =>
    b.addEventListener('click', () => {
      document.querySelectorAll('#docFilters .tab-btn').forEach(x => x.classList.toggle('active', x === b));
      const f = b.dataset.filter;
      grid.querySelectorAll('.doc-card').forEach(c =>
        c.classList.toggle('hidden', f !== 'all' && c.dataset.cat !== f));
    })
  );
}

if (modal) {
  document.getElementById('docClose').addEventListener('click', closeDoc);
  modal.addEventListener('click', e => { if (e.target === modal) closeDoc(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDoc(); });
}