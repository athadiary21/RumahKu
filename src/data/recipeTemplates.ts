export interface RecipeTemplate {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  category: string;
  difficulty: 'Mudah' | 'Sedang';
  icon: string;
}

export const RECIPE_CATEGORIES = [
  'Semua',
  'Nasi & Mie',
  'Ayam',
  'Daging',
  'Telur',
  'Sayuran',
  'Tahu & Tempe',
  'Camilan',
];

export const recipeTemplates: RecipeTemplate[] = [
  // Kategori Nasi & Mie
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng Sederhana',
    description: 'Nasi goreng praktis dengan bahan-bahan yang mudah didapat',
    ingredients: [
      '2 piring nasi putih dingin',
      '2 butir telur',
      '3 siung bawang putih, cincang',
      '2 sdm kecap manis',
      '1 sdm minyak goreng',
      'Garam secukupnya',
      'Daun bawang untuk taburan',
    ],
    instructions: `1. Panaskan minyak, tumis bawang putih hingga harum
2. Masukkan telur, orak-arik hingga matang
3. Tambahkan nasi, aduk rata dengan telur
4. Bumbui dengan kecap manis dan garam
5. Aduk hingga nasi tercampur rata dan bumbu meresap
6. Sajikan dengan taburan daun bawang`,
    prep_time: 5,
    cook_time: 10,
    servings: 2,
    category: 'Nasi & Mie',
    difficulty: 'Mudah',
    icon: '🍚',
  },
  {
    id: 'nasi-uduk',
    name: 'Nasi Uduk',
    description: 'Nasi gurih khas Indonesia yang harum dan lezat',
    ingredients: [
      '2 cup beras, cuci bersih',
      '400 ml santan',
      '2 lembar daun salam',
      '2 cm lengkuas, memarkan',
      '1 sdt garam',
      '1/2 sdt gula',
    ],
    instructions: `1. Campur beras dengan santan, daun salam, lengkuas, garam, dan gula
2. Masak dengan rice cooker hingga matang
3. Aduk nasi setelah matang
4. Sajikan dengan lauk favorit`,
    prep_time: 10,
    cook_time: 30,
    servings: 4,
    category: 'Nasi & Mie',
    difficulty: 'Mudah',
    icon: '🍚',
  },
  {
    id: 'mie-goreng-instant',
    name: 'Mie Goreng Instant Upgrade',
    description: 'Mie instan yang ditingkatkan dengan sayuran segar',
    ingredients: [
      '1 bungkus mie instan',
      '1 butir telur',
      'Sayuran (sawi/wortel/kol)',
      '2 siung bawang putih, cincang',
      '1 sdm minyak goreng',
    ],
    instructions: `1. Rebus mie hingga setengah matang, tiriskan
2. Tumis bawang putih hingga harum
3. Masukkan sayuran, tumis sebentar
4. Tambahkan mie dan bumbu instan, aduk rata
5. Buat lubang di tengah, masukkan telur dan orak-arik
6. Campur semua bahan hingga matang`,
    prep_time: 5,
    cook_time: 8,
    servings: 1,
    category: 'Nasi & Mie',
    difficulty: 'Mudah',
    icon: '🍜',
  },
  {
    id: 'mie-kuah-sayuran',
    name: 'Mie Kuah Sayuran',
    description: 'Mie kuah hangat dengan sayuran segar',
    ingredients: [
      '1 bungkus mie telur',
      '500 ml kaldu ayam',
      'Sawi hijau secukupnya',
      'Wortel, iris tipis',
      '2 siung bawang putih',
      'Garam dan merica',
    ],
    instructions: `1. Rebus mie hingga matang, tiriskan
2. Panaskan kaldu, tambahkan bawang putih
3. Masukkan wortel, masak hingga empuk
4. Tambahkan sawi, masak sebentar
5. Bumbui dengan garam dan merica
6. Tuang kuah ke mangkuk berisi mie`,
    prep_time: 5,
    cook_time: 10,
    servings: 2,
    category: 'Nasi & Mie',
    difficulty: 'Mudah',
    icon: '🍜',
  },

  // Kategori Ayam
  {
    id: 'ayam-goreng-kuning',
    name: 'Ayam Goreng Bumbu Kuning',
    description: 'Ayam goreng dengan bumbu kunyit yang harum',
    ingredients: [
      '500g ayam, potong-potong',
      '3 siung bawang putih',
      '2 cm kunyit',
      '1 cm jahe',
      '1 sdt ketumbar',
      'Garam dan gula secukupnya',
      'Minyak untuk menggoreng',
    ],
    instructions: `1. Haluskan bawang putih, kunyit, jahe, dan ketumbar
2. Lumuri ayam dengan bumbu halus, garam, dan gula
3. Diamkan 30 menit agar bumbu meresap
4. Goreng ayam hingga matang dan berwarna kecokelatan
5. Tiriskan dan sajikan hangat`,
    prep_time: 15,
    cook_time: 25,
    servings: 4,
    category: 'Ayam',
    difficulty: 'Sedang',
    icon: '🍗',
  },
  {
    id: 'ayam-bakar-kecap',
    name: 'Ayam Bakar Kecap',
    description: 'Ayam bakar manis dengan kecap yang lezat',
    ingredients: [
      '500g ayam, potong-potong',
      '4 sdm kecap manis',
      '2 sdm kecap asin',
      '4 siung bawang putih, haluskan',
      '2 sdm air jeruk nipis',
      '1 sdt merica',
    ],
    instructions: `1. Campur semua bumbu, marinasi ayam selama 1 jam
2. Bakar ayam dengan api sedang sambil diolesi sisa bumbu
3. Balik ayam sesekali hingga matang sempurna
4. Sajikan dengan sambal dan lalapan`,
    prep_time: 15,
    cook_time: 30,
    servings: 4,
    category: 'Ayam',
    difficulty: 'Sedang',
    icon: '🍗',
  },
  {
    id: 'soto-ayam',
    name: 'Soto Ayam',
    description: 'Soto ayam kuah kuning yang hangat dan segar',
    ingredients: [
      '300g ayam, rebus dan suwir',
      '1 liter kaldu ayam',
      '3 siung bawang putih',
      '3 cm kunyit',
      '1 batang serai',
      '2 lembar daun salam',
      'Tauge, kol, bihun',
      'Jeruk nipis dan sambal',
    ],
    instructions: `1. Haluskan bawang putih dan kunyit
2. Tumis bumbu halus hingga harum
3. Tuang kaldu, tambahkan serai dan daun salam
4. Masak hingga mendidih
5. Siapkan mangkuk dengan bihun, tauge, kol
6. Tuang kuah panas, tambahkan suwiran ayam
7. Sajikan dengan jeruk nipis dan sambal`,
    prep_time: 20,
    cook_time: 30,
    servings: 4,
    category: 'Ayam',
    difficulty: 'Sedang',
    icon: '🍲',
  },
  {
    id: 'opor-ayam',
    name: 'Opor Ayam',
    description: 'Opor ayam santan yang creamy dan gurih',
    ingredients: [
      '500g ayam, potong-potong',
      '400 ml santan kental',
      '5 siung bawang putih',
      '6 butir bawang merah',
      '3 cm lengkuas',
      '2 lembar daun salam',
      'Garam dan gula',
    ],
    instructions: `1. Haluskan bawang merah dan bawang putih
2. Tumis bumbu halus hingga harum
3. Masukkan ayam, masak hingga berubah warna
4. Tuang santan, tambahkan lengkuas dan daun salam
5. Masak dengan api kecil hingga ayam empuk
6. Bumbui dengan garam dan gula
7. Sajikan dengan nasi atau lontong`,
    prep_time: 15,
    cook_time: 40,
    servings: 4,
    category: 'Ayam',
    difficulty: 'Sedang',
    icon: '🍛',
  },

  // Kategori Daging
  {
    id: 'rendang-cepat',
    name: 'Rendang Daging Cepat',
    description: 'Rendang praktis dengan bumbu instant yang tetap lezat',
    ingredients: [
      '500g daging sapi, potong dadu',
      '1 bungkus bumbu rendang instant',
      '200 ml santan kental',
      '2 lembar daun jeruk',
      '1 batang serai, memarkan',
      '2 sdm minyak goreng',
    ],
    instructions: `1. Tumis bumbu rendang instant hingga harum
2. Masukkan daging, aduk hingga berubah warna
3. Tuang santan, tambahkan daun jeruk dan serai
4. Masak dengan api kecil hingga daging empuk
5. Aduk sesekali hingga bumbu meresap dan mengering
6. Sajikan dengan nasi hangat`,
    prep_time: 10,
    cook_time: 45,
    servings: 4,
    category: 'Daging',
    difficulty: 'Sedang',
    icon: '🥩',
  },
  {
    id: 'semur-daging',
    name: 'Semur Daging',
    description: 'Daging sapi dengan kuah semur manis kecap',
    ingredients: [
      '500g daging sapi, potong-potong',
      '4 sdm kecap manis',
      '3 butir bawang merah, iris',
      '3 siung bawang putih, iris',
      '3 butir kemiri, sangrai',
      '1 sdt pala bubuk',
      '500 ml air',
      'Garam dan gula',
    ],
    instructions: `1. Tumis bawang merah dan putih hingga harum
2. Masukkan kemiri dan pala, aduk rata
3. Tambahkan daging, masak hingga berubah warna
4. Tuang air dan kecap manis
5. Masak dengan api kecil hingga daging empuk
6. Bumbui dengan garam dan gula
7. Sajikan hangat`,
    prep_time: 15,
    cook_time: 60,
    servings: 4,
    category: 'Daging',
    difficulty: 'Sedang',
    icon: '🍖',
  },
  {
    id: 'sate-sapi',
    name: 'Sate Sapi',
    description: 'Sate daging sapi dengan bumbu kacang',
    ingredients: [
      '500g daging sapi, potong dadu',
      '3 sdm kecap manis',
      '2 siung bawang putih, haluskan',
      '1 sdt ketumbar bubuk',
      'Tusuk sate',
      'Bumbu kacang siap pakai',
    ],
    instructions: `1. Marinasi daging dengan kecap, bawang putih, ketumbar
2. Diamkan 30 menit
3. Tusuk daging ke tusuk sate
4. Bakar dengan api sedang sambil diolesi bumbu
5. Sajikan dengan bumbu kacang dan lontong`,
    prep_time: 20,
    cook_time: 15,
    servings: 4,
    category: 'Daging',
    difficulty: 'Sedang',
    icon: '�串',
  },

  // Kategori Telur
  {
    id: 'telur-dadar-padang',
    name: 'Telur Dadar Padang',
    description: 'Telur dadar berbumbu khas Padang yang gurih',
    ingredients: [
      '3 butir telur',
      '2 batang daun bawang, iris',
      '2 siung bawang merah, iris',
      '1 buah cabai merah, iris',
      'Garam dan merica',
      '2 sdm minyak goreng',
    ],
    instructions: `1. Kocok telur lepas
2. Tambahkan daun bawang, bawang merah, cabai
3. Bumbui dengan garam dan merica
4. Panaskan minyak, tuang adonan telur
5. Goreng hingga matang kedua sisi
6. Potong-potong dan sajikan`,
    prep_time: 5,
    cook_time: 5,
    servings: 2,
    category: 'Telur',
    difficulty: 'Mudah',
    icon: '🥚',
  },
  {
    id: 'telur-balado',
    name: 'Telur Balado',
    description: 'Telur goreng dengan sambal balado pedas',
    ingredients: [
      '4 butir telur, rebus dan goreng',
      '10 buah cabai merah',
      '5 siung bawang merah',
      '3 siung bawang putih',
      '2 buah tomat',
      '1 sdt gula',
      'Garam secukupnya',
    ],
    instructions: `1. Haluskan cabai, bawang merah, bawang putih, tomat
2. Tumis bumbu halus hingga matang
3. Bumbui dengan gula dan garam
4. Masukkan telur, aduk hingga bumbu merata
5. Masak hingga bumbu meresap
6. Sajikan hangat`,
    prep_time: 10,
    cook_time: 10,
    servings: 4,
    category: 'Telur',
    difficulty: 'Mudah',
    icon: '🥚',
  },
  {
    id: 'telur-ceplok-kecap',
    name: 'Telur Ceplok Kecap',
    description: 'Telur ceplok simple dengan kecap manis',
    ingredients: [
      '2 butir telur',
      '2 sdm kecap manis',
      '1 siung bawang putih, cincang',
      '1 buah cabai rawit, iris',
      '1 sdm minyak goreng',
    ],
    instructions: `1. Panaskan minyak, tumis bawang putih dan cabai
2. Pecahkan telur, ceplok di atas bawang
3. Masak hingga putih telur matang
4. Siram dengan kecap manis
5. Sajikan segera`,
    prep_time: 3,
    cook_time: 5,
    servings: 1,
    category: 'Telur',
    difficulty: 'Mudah',
    icon: '🍳',
  },

  // Kategori Sayuran
  {
    id: 'tumis-kangkung',
    name: 'Tumis Kangkung',
    description: 'Kangkung tumis dengan bumbu sederhana',
    ingredients: [
      '2 ikat kangkung, siangi',
      '3 siung bawang putih, iris',
      '2 buah cabai merah, iris',
      '1 sdm saus tiram',
      '1/2 sdt garam',
      '2 sdm minyak goreng',
    ],
    instructions: `1. Panaskan minyak, tumis bawang putih dan cabai
2. Masukkan kangkung, aduk cepat
3. Tambahkan saus tiram dan garam
4. Masak 2-3 menit hingga layu
5. Angkat dan sajikan`,
    prep_time: 5,
    cook_time: 5,
    servings: 3,
    category: 'Sayuran',
    difficulty: 'Mudah',
    icon: '🥬',
  },
  {
    id: 'capcay',
    name: 'Capcay Sayuran',
    description: 'Tumis sayuran beragam dengan kuah gurih',
    ingredients: [
      'Wortel, potong serong',
      'Kembang kol',
      'Sawi putih',
      'Baby corn',
      'Buncis',
      '3 siung bawang putih',
      '2 sdm saus tiram',
      '1 sdm kecap asin',
      '200 ml air',
      '1 sdm maizena',
    ],
    instructions: `1. Tumis bawang putih hingga harum
2. Masukkan wortel dan baby corn, tumis sebentar
3. Tambahkan air, kecap asin, dan saus tiram
4. Masukkan sayuran lain, masak hingga matang
5. Kentalkan dengan larutan maizena
6. Sajikan hangat`,
    prep_time: 15,
    cook_time: 10,
    servings: 4,
    category: 'Sayuran',
    difficulty: 'Mudah',
    icon: '🥕',
  },
  {
    id: 'sayur-asem',
    name: 'Sayur Asem',
    description: 'Sayur asam segar khas Indonesia',
    ingredients: [
      'Jagung manis, potong-potong',
      'Labu siam, potong dadu',
      'Kacang panjang',
      'Daun melinjo',
      '3 buah asam jawa',
      '2 lembar daun salam',
      'Gula merah secukupnya',
      'Garam',
    ],
    instructions: `1. Rebus air hingga mendidih
2. Masukkan jagung dan labu siam
3. Tambahkan asam jawa dan daun salam
4. Masukkan kacang panjang dan daun melinjo
5. Bumbui dengan gula merah dan garam
6. Masak hingga sayuran empuk`,
    prep_time: 10,
    cook_time: 20,
    servings: 4,
    category: 'Sayuran',
    difficulty: 'Mudah',
    icon: '🍲',
  },
  {
    id: 'sayur-lodeh',
    name: 'Sayur Lodeh',
    description: 'Sayur santan dengan berbagai sayuran',
    ingredients: [
      'Labu siam, potong dadu',
      'Terong ungu',
      'Kacang panjang',
      'Daun singkong',
      '400 ml santan',
      '3 siung bawang putih',
      '2 cm lengkuas',
      '1 lembar daun salam',
      'Garam dan gula',
    ],
    instructions: `1. Tumis bawang putih hingga harum
2. Tuang santan, tambahkan lengkuas dan daun salam
3. Masukkan labu siam dan terong
4. Masak hingga sayuran setengah matang
5. Tambahkan kacang panjang dan daun singkong
6. Bumbui dengan garam dan gula
7. Masak hingga matang`,
    prep_time: 15,
    cook_time: 20,
    servings: 4,
    category: 'Sayuran',
    difficulty: 'Mudah',
    icon: '🥘',
  },
  {
    id: 'gado-gado',
    name: 'Gado-Gado',
    description: 'Salad sayuran Indonesia dengan bumbu kacang',
    ingredients: [
      'Kol, iris tipis',
      'Tauge',
      'Kacang panjang',
      'Kentang, rebus',
      'Telur rebus',
      'Tahu dan tempe goreng',
      'Bumbu kacang siap pakai',
      'Kerupuk',
    ],
    instructions: `1. Rebus semua sayuran hingga matang
2. Tiriskan dan tata di piring
3. Tambahkan kentang, telur, tahu, tempe
4. Siram dengan bumbu kacang
5. Taburi kerupuk
6. Sajikan segera`,
    prep_time: 20,
    cook_time: 15,
    servings: 4,
    category: 'Sayuran',
    difficulty: 'Mudah',
    icon: '🥗',
  },

  // Kategori Tahu & Tempe
  {
    id: 'tempe-goreng-tepung',
    name: 'Tempe Goreng Tepung',
    description: 'Tempe crispy dengan lapisan tepung bumbu',
    ingredients: [
      '1 papan tempe, iris tipis',
      '100g tepung terigu',
      '50g tepung beras',
      '2 siung bawang putih, haluskan',
      '1 sdt ketumbar bubuk',
      'Garam secukupnya',
      'Air secukupnya',
      'Minyak untuk menggoreng',
    ],
    instructions: `1. Campur semua tepung dengan bumbu
2. Tambahkan air secukupnya hingga adonan kental
3. Celupkan tempe ke adonan tepung
4. Goreng hingga kuning keemasan
5. Tiriskan dan sajikan hangat`,
    prep_time: 10,
    cook_time: 15,
    servings: 4,
    category: 'Tahu & Tempe',
    difficulty: 'Mudah',
    icon: '🟫',
  },
  {
    id: 'tahu-goreng-crispy',
    name: 'Tahu Goreng Crispy',
    description: 'Tahu goreng renyah di luar lembut di dalam',
    ingredients: [
      '4 buah tahu putih',
      '100g tepung terigu',
      '1 sdt baking powder',
      '1 siung bawang putih, haluskan',
      'Garam dan merica',
      'Air dingin',
      'Minyak untuk menggoreng',
    ],
    instructions: `1. Potong tahu sesuai selera
2. Campur tepung, baking powder, bawang putih, garam, merica
3. Tambahkan air dingin sedikit demi sedikit
4. Celupkan tahu ke adonan
5. Goreng hingga kuning keemasan
6. Tiriskan dan sajikan dengan sambal`,
    prep_time: 10,
    cook_time: 10,
    servings: 4,
    category: 'Tahu & Tempe',
    difficulty: 'Mudah',
    icon: '⬜',
  },
  {
    id: 'sambal-goreng-tahu-tempe',
    name: 'Sambal Goreng Tahu Tempe',
    description: 'Tahu tempe dengan sambal pedas manis',
    ingredients: [
      '2 papan tempe, potong dadu',
      '4 buah tahu, potong dadu',
      '10 buah cabai merah',
      '5 siung bawang merah',
      '3 siung bawang putih',
      '2 sdm kecap manis',
      '1 sdm gula merah',
      'Garam secukupnya',
    ],
    instructions: `1. Goreng tahu dan tempe hingga kuning, sisihkan
2. Haluskan cabai, bawang merah, bawang putih
3. Tumis bumbu halus hingga harum
4. Tambahkan kecap manis dan gula merah
5. Masukkan tahu dan tempe, aduk rata
6. Masak hingga bumbu meresap`,
    prep_time: 15,
    cook_time: 15,
    servings: 4,
    category: 'Tahu & Tempe',
    difficulty: 'Mudah',
    icon: '🌶️',
  },
  {
    id: 'perkedel-tahu',
    name: 'Perkedel Tahu',
    description: 'Perkedel gurih dari tahu dan sayuran',
    ingredients: [
      '4 buah tahu putih, haluskan',
      '2 batang daun bawang, iris',
      '1 batang wortel, parut',
      '2 siung bawang putih, haluskan',
      '1 butir telur',
      'Tepung terigu secukupnya',
      'Garam dan merica',
    ],
    instructions: `1. Campur tahu halus dengan semua bahan
2. Aduk hingga tercampur rata
3. Bentuk adonan bulat pipih
4. Goreng hingga kuning keemasan
5. Tiriskan dan sajikan dengan sambal`,
    prep_time: 15,
    cook_time: 15,
    servings: 4,
    category: 'Tahu & Tempe',
    difficulty: 'Mudah',
    icon: '🥘',
  },

  // Kategori Camilan
  {
    id: 'pisang-goreng',
    name: 'Pisang Goreng',
    description: 'Pisang goreng crispy yang manis',
    ingredients: [
      '6 buah pisang kepok',
      '150g tepung terigu',
      '2 sdm gula pasir',
      '1/4 sdt garam',
      '1/2 sdt vanili',
      'Air secukupnya',
      'Minyak untuk menggoreng',
    ],
    instructions: `1. Campur tepung, gula, garam, vanili
2. Tambahkan air sedikit demi sedikit
3. Aduk hingga adonan kental
4. Belah pisang memanjang
5. Celupkan ke adonan tepung
6. Goreng hingga kuning keemasan`,
    prep_time: 10,
    cook_time: 10,
    servings: 6,
    category: 'Camilan',
    difficulty: 'Mudah',
    icon: '🍌',
  },
  {
    id: 'martabak-telur-mini',
    name: 'Martabak Telur Mini',
    description: 'Martabak telur ukuran mini yang praktis',
    ingredients: [
      '10 lembar kulit pangsit',
      '3 butir telur',
      '2 batang daun bawang, iris',
      '100g daging cincang',
      '2 siung bawang putih, cincang',
      'Garam dan merica',
      'Minyak untuk menggoreng',
    ],
    instructions: `1. Tumis bawang putih dan daging hingga matang
2. Kocok telur, campur dengan daging dan daun bawang
3. Bumbui dengan garam dan merica
4. Ambil kulit pangsit, isi dengan adonan
5. Lipat dan rekatkan pinggirnya
6. Goreng hingga kuning keemasan`,
    prep_time: 20,
    cook_time: 15,
    servings: 10,
    category: 'Camilan',
    difficulty: 'Sedang',
    icon: '🥟',
  },
];
