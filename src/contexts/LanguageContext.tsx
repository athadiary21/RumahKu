import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Navbar
    "nav.features": "Fitur",
    "nav.howItWorks": "Cara Kerja",
    "nav.pricing": "Harga",
    "nav.install": "Install",
    "nav.login": "Masuk",
    "nav.getStarted": "Mulai Sekarang",
    
    // Install Page
    "install.title": "Install RumahKu",
    "install.subtitle": "Akses RumahKu dengan mudah dari perangkat apapun. Ikuti panduan di bawah sesuai platform Anda.",
    "install.backHome": "Kembali",
    "install.recommended": "Direkomendasikan",
    "install.android": "Android",
    "install.ios": "iOS",
    "install.desktop": "Desktop",
    "install.androidTitle": "Install di Android",
    "install.androidStep1": "Buka rumahku.app di browser Chrome atau Edge",
    "install.androidStep2": "Tap menu (3 titik vertikal) di pojok kanan atas",
    "install.androidStep3": "Pilih 'Install app' atau 'Tambahkan ke layar utama'",
    "install.androidStep4": "Konfirmasi dengan tap 'Install'",
    "install.androidStep5": "Icon RumahKu akan muncul di layar utama Anda",
    "install.androidNote": "Setelah terinstall, RumahKu akan berjalan seperti aplikasi native dengan akses cepat dari home screen.",
    "install.iosTitle": "Install di iPhone/iPad",
    "install.iosStep1": "Buka rumahku.app di browser Safari (wajib Safari)",
    "install.iosStep2": "Tap tombol Share (kotak dengan panah ke atas) di bawah",
    "install.iosStep3": "Scroll ke bawah dan tap 'Add to Home Screen'",
    "install.iosStep4": "Edit nama aplikasi jika diperlukan",
    "install.iosStep5": "Tap 'Add' di pojok kanan atas",
    "install.iosStep6": "Icon RumahKu akan muncul di home screen Anda",
    "install.iosImportant": "Penting untuk iOS:",
    "install.iosNote": "Hanya Safari yang mendukung instalasi PWA di iOS. Chrome dan browser lain tidak mendukung fitur ini.",
    "install.desktopTitle": "Install di Desktop",
    "install.desktopStep1": "Buka rumahku.app di Chrome atau Edge",
    "install.desktopStep2": "Klik icon install (⊕) di address bar sebelah URL, atau",
    "install.desktopStep3": "Klik menu (3 titik) → 'Install RumahKu'",
    "install.desktopStep4": "Klik 'Install' pada dialog konfirmasi",
    "install.desktopStep5": "Aplikasi akan terbuka di window terpisah seperti aplikasi desktop",
    "install.firefoxNote": "Firefox belum sepenuhnya mendukung instalasi PWA. Anda bisa bookmark halaman atau gunakan Chrome/Edge untuk pengalaman terbaik.",
    "install.benefitsTitle": "Keuntungan Install RumahKu",
    "install.benefit1": "Akses lebih cepat - Buka langsung dari home screen atau desktop",
    "install.benefit2": "Notifikasi push - Dapatkan pengingat penting langsung di perangkat",
    "install.benefit3": "Offline support - Tetap bisa akses data dasar tanpa internet",
    "install.benefit4": "Pengalaman native - Tampilan fullscreen tanpa address bar browser",
    "install.getStarted": "Mulai Sekarang",
    "install.needHelp": "Butuh bantuan?",
    "install.contactSupport": "Hubungi support kami",
    
    // Hero
    "hero.badge": "Sistem Operasi Keluarga Anda",
    "hero.title1": "Kelola Uang, Jadwal & Kehidupan Sehari-hari",
    "hero.title2": "di Satu Tempat",
    "hero.description": "RumahKu menyatukan kalender, perencanaan dapur, keuangan, dan dokumen penting. Kurangi stres, tingkatkan kolaborasi, dan kendalikan kehidupan keluarga.",
    "hero.cta1": "Subscribe Sekarang",
    "hero.cta2": "Lihat Cara Kerja",
    "hero.free": "Mulai dari Rp 20.000/bulan",
    "hero.noCard": "Batalkan Kapan Saja",
    
    // Features
    "features.title": "Semua yang Keluarga Anda Butuhkan",
    "features.subtitle": "Enam modul lengkap yang bekerja bersama untuk mengatur kehidupan keluarga Anda",
    "features.calendar.title": "Kalender Keluarga",
    "features.calendar.desc": "Manajemen jadwal terpadu agar tidak ada yang terlewat. Kategori berwarna, pengingat cerdas, dan sinkronisasi real-time.",
    "features.kitchen.title": "Dapur & Belanja",
    "features.kitchen.desc": "Rencanakan menu mingguan dan buat daftar belanja otomatis. Kolaborasi real-time. Tidak lupa apa yang harus dibeli atau dimasak.",
    "features.finance.title": "Keuangan Cerdas",
    "features.finance.desc": "Pelacak anggaran dengan metode amplop, dukungan multi-dompet, perencanaan tujuan, dan laporan visual. Tahu persis kemana uang Anda pergi.",
    "features.vault.title": "Vault Digital",
    "features.vault.desc": "Simpan dokumen penting dengan enkripsi. Akta kelahiran, asuransi, paspor - semua terorganisir dan dapat diakses saat dibutuhkan.",
    "features.family.title": "Manajemen Keluarga",
    "features.family.desc": "Kelola anggota keluarga, atur peran (Admin, Member, Child), dan undang anggota baru untuk bergabung dengan keluarga Anda.",
    "features.tasks.title": "Tugas Keluarga",
    "features.tasks.desc": "Bagi tugas rumah tangga dengan mudah. Assign ke anggota, set prioritas, dan buat tugas berulang harian, mingguan, atau bulanan.",
    
    // How It Works
    "howItWorks.title": "Lihat Keajaiban dalam Aksi",
    "howItWorks.subtitle": "Modul kami bekerja bersama dengan mulus untuk menghemat waktu dan energi mental Anda",
    "howItWorks.step1.title": "Rencanakan Menu",
    "howItWorks.step1.desc": "Pilih resep untuk minggu ini di modul Dapur",
    "howItWorks.step2.title": "Daftar Belanja Otomatis",
    "howItWorks.step2.desc": "Dapatkan daftar belanja instan dengan semua bahan",
    "howItWorks.step3.title": "Lacak Pengeluaran",
    "howItWorks.step3.desc": "Pembelian otomatis perbarui pelacak anggaran Anda",
    
    // Pricing
    "pricing.title": "Harga Sederhana dan Transparan",
    "pricing.subtitle": "Mulai gratis, upgrade kapan Anda siap. Tanpa biaya tersembunyi.",
    "pricing.popular": "Paling Populer",
    "pricing.starter.name": "Test Awal",
    "pricing.starter.desc": "Paling populer untuk keluarga aktif",
    "pricing.starter.feature1": "Semua 4 Modul (Kalender, Dapur, Keuangan, Vault)",
    "pricing.starter.feature2": "Kategori Anggaran Unlimited",
    "pricing.starter.feature3": "Akun & Dompet Unlimited",
    "pricing.starter.feature4": "Dukungan Prioritas",
    "pricing.starter.feature5": "Analitik Lanjutan",
    "pricing.starter.cta": "Mulai Sekarang",
    "pricing.family.name": "Donasi Murah",
    "pricing.family.desc": "kirimkan donasi seikhlasnya untuk mendukung pengembangan aplikasi",
    "pricing.family.feature1": "Bisa dikirimkan tanpa batasan jumlah",
    "pricing.family.feature2": "Bisa Dikirimkan ke BCA Creator 1880678805",
    "pricing.family.feature3": "Terima kasih atas dukungan Anda!",
    "pricing.family.feature4": "Anda adalah pahlawan kami!",
    "pricing.family.cta": "Subscribe Sekarang",
    "pricing.premium.name": "Donasi Sultan",
    "pricing.premium.desc": "Untuk Anda yang ingin memberikan dukungan lebih besar",
    "pricing.premium.feature1": "Bisa dikirimkan tanpa batasan jumlah",
    "pricing.premium.feature2": "Bisa Dikirimkan ke BCA Creator 1880678805",
    "pricing.premium.feature3": "Terima kasih atas dukungan Anda!",
    "pricing.premium.feature4": "Anda adalah pahlawan kami!",
    "pricing.premium.cta": "Subscribe Sekarang",
    "pricing.perMonth": "/bulan",
    "pricing.annualDiscount": "Hemat 20% dengan langganan tahunan",
    "pricing.mostPopular": "PALING POPULER",
    
    // FAQ
    "faq.title": "Pertanyaan yang Sering Diajukan",
    "faq.subtitle": "Punya pertanyaan? Kami punya jawabannya.",
    "faq.q1": "Apakah ada biaya setup atau biaya tersembunyi?",
    "faq.a1": "Tidak ada sama sekali. Harga yang tertera adalah harga final. Tidak ada biaya setup, biaya aktivasi, atau biaya tersembunyi lainnya.",
    "faq.q2": "Bagaimana cara membatalkan langganan?",
    "faq.a2": "Anda dapat membatalkan kapan saja dari pengaturan akun Anda. Tidak ada kontrak jangka panjang dan tidak ada penalti pembatalan.",
    "faq.q3": "Apakah data keluarga saya aman?",
    "faq.a3": "Ya, sangat aman. Kami menggunakan enkripsi end-to-end untuk semua data sensitif, khususnya di Vault Digital. Data Anda disimpan di server yang aman dan tidak pernah dibagikan dengan pihak ketiga.",
    "faq.q4": "Berapa banyak anggota keluarga yang bisa menggunakan satu akun?",
    "faq.a4": "Paket Keluarga mendukung hingga 6 anggota, sedangkan paket Premium mendukung hingga 12 anggota dengan manajemen peran lanjutan.",
    "faq.q5": "Apakah saya bisa mencoba sebelum berlangganan?",
    "faq.a5": "Ya! Semua paket berbayar dilengkapi dengan garansi uang kembali 30 hari. Jika Anda tidak puas, kami akan mengembalikan uang Anda sepenuhnya.",
    "faq.q6": "Apakah RumahKu bekerja offline?",
    "faq.a6": "RumahKu memerlukan koneksi internet untuk sinkronisasi real-time. Namun, Anda dapat melihat data yang di-cache saat offline, dan perubahan akan disinkronkan saat Anda kembali online.",
    
    // CTA
    "cta.title": "Siap Mengatur Kehidupan Keluarga Anda?",
    "cta.description": "Bergabunglah dengan 10.000+ keluarga Indonesia yang telah mengurangi stres dan meningkatkan kualitas hidup keluarga mereka.",
    "cta.button1": "Subscribe Sekarang",
    "cta.button2": "Jadwalkan Demo",
    "cta.stat1": "Keluarga Aktif",
    "cta.stat2": "Rating Pengguna",
    "cta.stat3": "Uptime",
    
    // Footer
    "footer.description": "Sistem operasi keluarga Anda. Kelola uang, jadwal, dan kehidupan sehari-hari di satu tempat.",
    "footer.product": "Produk",
    "footer.company": "Perusahaan",
    "footer.legal": "Legal",
    "footer.features": "Fitur",
    "footer.pricing": "Harga",
    "footer.faq": "FAQ",
    "footer.roadmap": "Roadmap",
    "footer.about": "Tentang Kami",
    "footer.blog": "Blog",
    "footer.careers": "Karir",
    "footer.contact": "Kontak",
    "footer.privacy": "Kebijakan Privasi",
    "footer.terms": "Syarat Layanan",
    "footer.cookies": "Kebijakan Cookie",
    "footer.copyright": "RumahKu oleh Atha Studio. Hak cipta dilindungi.",
    "footer.newsletter": "Dapatkan Update Terbaru",
    "footer.newsletterDesc": "Berlangganan newsletter kami untuk tips dan fitur terbaru.",
    "footer.email": "Email Anda",
    "footer.subscribe": "Berlangganan",
    "footer.followUs": "Ikuti Kami",
    "footer.contactEmail": "athadiary21@gmail.com",
    "footer.contactWA": "+62 822-4159-0417",
  },
  en: {
    // Navbar
    "nav.features": "Features",
    "nav.howItWorks": "How It Works",
    "nav.pricing": "Pricing",
    "nav.install": "Install",
    "nav.login": "Login",
    "nav.getStarted": "Get Started",
    
    // Install Page
    "install.title": "Install RumahKu",
    "install.subtitle": "Access RumahKu easily from any device. Follow the guide below according to your platform.",
    "install.backHome": "Back",
    "install.recommended": "Recommended",
    "install.android": "Android",
    "install.ios": "iOS",
    "install.desktop": "Desktop",
    "install.androidTitle": "Install on Android",
    "install.androidStep1": "Open rumahku.app in Chrome or Edge browser",
    "install.androidStep2": "Tap the menu (3 vertical dots) in the top right corner",
    "install.androidStep3": "Select 'Install app' or 'Add to Home screen'",
    "install.androidStep4": "Confirm by tapping 'Install'",
    "install.androidStep5": "RumahKu icon will appear on your home screen",
    "install.androidNote": "Once installed, RumahKu will run like a native app with quick access from your home screen.",
    "install.iosTitle": "Install on iPhone/iPad",
    "install.iosStep1": "Open rumahku.app in Safari browser (Safari only)",
    "install.iosStep2": "Tap the Share button (box with arrow pointing up) at the bottom",
    "install.iosStep3": "Scroll down and tap 'Add to Home Screen'",
    "install.iosStep4": "Edit the app name if needed",
    "install.iosStep5": "Tap 'Add' in the top right corner",
    "install.iosStep6": "RumahKu icon will appear on your home screen",
    "install.iosImportant": "Important for iOS:",
    "install.iosNote": "Only Safari supports PWA installation on iOS. Chrome and other browsers do not support this feature.",
    "install.desktopTitle": "Install on Desktop",
    "install.desktopStep1": "Open rumahku.app in Chrome or Edge",
    "install.desktopStep2": "Click the install icon (⊕) in the address bar next to the URL, or",
    "install.desktopStep3": "Click menu (3 dots) → 'Install RumahKu'",
    "install.desktopStep4": "Click 'Install' in the confirmation dialog",
    "install.desktopStep5": "The app will open in a separate window like a desktop app",
    "install.firefoxNote": "Firefox does not fully support PWA installation yet. You can bookmark the page or use Chrome/Edge for the best experience.",
    "install.benefitsTitle": "Benefits of Installing RumahKu",
    "install.benefit1": "Faster access - Open directly from home screen or desktop",
    "install.benefit2": "Push notifications - Get important reminders directly on your device",
    "install.benefit3": "Offline support - Still access basic data without internet",
    "install.benefit4": "Native experience - Fullscreen display without browser address bar",
    "install.getStarted": "Get Started Now",
    "install.needHelp": "Need help?",
    "install.contactSupport": "Contact our support",
    
    // Hero
    "hero.badge": "Your Family's Operating System",
    "hero.title1": "Manage Money, Schedule & Daily Life",
    "hero.title2": "in One Place",
    "hero.description": "RumahKu brings together calendar, kitchen planning, finances, and important documents. Reduce stress, increase collaboration, and take control of family life.",
    "hero.cta1": "Subscribe Now",
    "hero.cta2": "See How It Works",
    "hero.free": "Starting from $5/month",
    "hero.noCard": "Cancel Anytime",
    
    // Features
    "features.title": "Everything Your Family Needs",
    "features.subtitle": "Six complete modules that work together seamlessly to organize your family life",
    "features.calendar.title": "Family Calendar",
    "features.calendar.desc": "Unified schedule management so nothing gets missed or conflicts. Color-coded categories, smart reminders, and real-time sync across all devices.",
    "features.kitchen.title": "Kitchen & Shopping",
    "features.kitchen.desc": "Plan weekly menus and auto-generate shopping lists. Collaborate on lists in real-time. Never forget what to buy or what to cook.",
    "features.finance.title": "Smart Finance",
    "features.finance.desc": "Budget tracker with envelope method, multi-wallet support, goal planning, and visual reports. Know exactly where your money goes.",
    "features.vault.title": "Digital Vault",
    "features.vault.desc": "Securely store important documents with encryption. Birth certificates, insurance, passports - all organized and accessible when you need them.",
    "features.family.title": "Family Management",
    "features.family.desc": "Manage family members, set roles (Admin, Member, Child), and invite new members to join your family.",
    "features.tasks.title": "Family Tasks",
    "features.tasks.desc": "Divide household chores easily. Assign to members, set priorities, and create daily, weekly, or monthly recurring tasks.",
    
    // How It Works
    "howItWorks.title": "See The Magic in Action",
    "howItWorks.subtitle": "Our modules work together seamlessly to save you time and mental energy",
    "howItWorks.step1.title": "Plan Your Menu",
    "howItWorks.step1.desc": "Choose recipes for the week in the Kitchen module",
    "howItWorks.step2.title": "Auto Shopping List",
    "howItWorks.step2.desc": "Get an instant shopping list with all ingredients",
    "howItWorks.step3.title": "Track Spending",
    "howItWorks.step3.desc": "Purchases automatically update your budget tracker",
    
    // Pricing
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle": "Start free, upgrade when you're ready. No hidden fees.",
    "pricing.popular": "Most Popular",
    "pricing.starter.name": "Starter",
    "pricing.starter.desc": "Most popular for active families",
    "pricing.starter.feature1": "All 4 Modules (Calendar, Kitchen, Finance, Vault)",
    "pricing.starter.feature2": "Unlimited Budget Categories",
    "pricing.starter.feature3": "Unlimited Accounts & Wallets",
    "pricing.starter.feature4": "Priority Support",
    "pricing.starter.feature5": "Advanced Analytics",
    "pricing.starter.cta": "Get Started",
    "pricing.family.name": "Donation Basic",
    "pricing.family.desc": "Send a donation as you wish to support app development",
    "pricing.family.feature1": "Can be sent without amount limitation",
    "pricing.family.feature2": "Can be sent to BCA Creator 1880678805",
    "pricing.family.feature3": "Thank you for your support!",
    "pricing.family.feature4": "You are our hero!",
    "pricing.family.cta": "Subscribe Now",
    "pricing.premium.name": "Donation Premium",
    "pricing.premium.desc": "For those who want to give bigger support",
    "pricing.premium.feature1": "Can be sent without amount limitation",
    "pricing.premium.feature2": "Can be sent to BCA Creator 1880678805",
    "pricing.premium.feature3": "Thank you for your support!",
    "pricing.premium.feature4": "You are our hero!",
    "pricing.premium.cta": "Subscribe Now",
    "pricing.perMonth": "/month",
    "pricing.annualDiscount": "Save 20% with annual subscription",
    "pricing.mostPopular": "MOST POPULAR",
    
    // FAQ
    "faq.title": "Frequently Asked Questions",
    "faq.subtitle": "Got questions? We've got answers.",
    "faq.q1": "Are there any setup fees or hidden charges?",
    "faq.a1": "None at all. The price you see is the price you pay. No setup fees, activation fees, or hidden charges.",
    "faq.q2": "How do I cancel my subscription?",
    "faq.a2": "You can cancel anytime from your account settings. No long-term contracts and no cancellation penalties.",
    "faq.q3": "Is my family's data secure?",
    "faq.a3": "Yes, absolutely. We use end-to-end encryption for all sensitive data, especially in the Digital Vault. Your data is stored on secure servers and never shared with third parties.",
    "faq.q4": "How many family members can use one account?",
    "faq.a4": "The Family plan supports up to 6 members, while the Premium plan supports up to 12 members with advanced role management.",
    "faq.q5": "Can I try before subscribing?",
    "faq.a5": "Yes! All paid plans come with a 30-day money-back guarantee. If you're not satisfied, we'll refund you in full.",
    "faq.q6": "Does RumahKu work offline?",
    "faq.a6": "RumahKu requires an internet connection for real-time sync. However, you can view cached data when offline, and changes will sync when you're back online.",
    
    // CTA
    "cta.title": "Ready to Organize Your Family Life?",
    "cta.description": "Join 10,000+ families worldwide who have reduced stress and improved their family's quality of life.",
    "cta.button1": "Subscribe Now",
    "cta.button2": "Schedule a Demo",
    "cta.stat1": "Active Families",
    "cta.stat2": "User Rating",
    "cta.stat3": "Uptime",
    
    // Footer
    "footer.description": "Your family's operating system. Manage money, schedule, and daily life in one place.",
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.legal": "Legal",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.faq": "FAQ",
    "footer.roadmap": "Roadmap",
    "footer.about": "About Us",
    "footer.blog": "Blog",
    "footer.careers": "Careers",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookie Policy",
    "footer.copyright": "RumahKu by Atha Studio. All rights reserved.",
    "footer.newsletter": "Get Latest Updates",
    "footer.newsletterDesc": "Subscribe to our newsletter for tips and latest features.",
    "footer.email": "Your email",
    "footer.subscribe": "Subscribe",
    "footer.followUs": "Follow Us",
    "footer.contactEmail": "athadiary21@gmail.com",
    "footer.contactWA": "+62 822-4159-0417",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem("language");
    return (stored === "id" || stored === "en") ? stored : "id";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
