export interface TourismDestination {
  id: string;
  name: string;
  category: 'alam' | 'budaya' | 'kuliner';
  description: string;
  image: string;
  highlights: string[];
}

export interface BoundaryInfo {
  utara: string;
  selatan: string;
  timur: string;
  barat: string;
}

export interface ClimateData {
  type: string;
  avgTemp: string;
  minTemp: string;
  maxTemp: string;
  rainfall: string;
  humidity: string;
  bestSeason: string;
}

export interface CultureInfo {
  ethnicity: string;
  language: string;
  religion: string;
  traditions: { name: string; description: string }[];
  cuisine: { name: string; description: string }[];
  livelihoods: string[];
}

export interface SaribudolokData {
  // Overview
  name: string;
  officialName: string;
  code: string;
  level: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  description: string;
  tagline: string;
  welcomeText: string;
  heroImage: string;

  // Statistik
  areaKm2: number;
  elevation: number;
  population: number;
  populationYear: number;
  latitude: number;
  longitude: number;

  // Geografi
  topography: string;
  soilType: string;
  climate: ClimateData;
  boundaries: BoundaryInfo;
  geographyDescription: string;

  // Wisata
  tourismOverview: string;
  destinations: TourismDestination[];

  // Budaya
  culture: CultureInfo;
  cultureDescription: string;
  cultureImage: string;

  // Ekonomi
  economyDescription: string;
  mainCommodities: string[];
  economicSector: string;
  farmImage: string;
}

const saribudolokData: SaribudolokData = {
  // === OVERVIEW ===
  name: 'Saribudolok',
  officialName: 'Desa Saribu Dolok',
  code: '12.08.25.1012',
  level: 'Desa (Village)',
  kecamatan: 'Silimakuta',
  kabupaten: 'Simalungun',
  provinsi: 'Sumatera Utara',
  tagline: 'Permata di Dataran Tinggi Simalungun',
  heroImage: '/images/hero.png',

  description:
    'Saribudolok adalah sebuah desa yang terletak di Kecamatan Silimakuta, Kabupaten Simalungun, Provinsi Sumatera Utara. ' +
    'Terletak di dataran tinggi dengan ketinggian rata-rata 1.400 meter di atas permukaan laut, Saribudolok dikenal sebagai ' +
    'pusat agropolitan dengan tanah vulkanik yang subur dan udara pegunungan yang sejuk. Desa ini merupakan salah satu ' +
    'kawasan strategis di Simalungun yang memiliki potensi pertanian, pariwisata, dan kebudayaan yang sangat kaya.',

  welcomeText:
    'Jelajahi keindahan dan kekayaan Desa Saribudolok — dari perbukitan hijau yang membentang luas, ' +
    'budaya Simalungun yang autentik, hingga destinasi wisata alam yang memukau. ' +
    'Temukan mengapa desa ini disebut sebagai permata tersembunyi di dataran tinggi Sumatera Utara.',

  // === STATISTIK ===
  areaKm2: 10.03,
  elevation: 1400,
  population: 3200,
  populationYear: 2024,
  latitude: 2.9956,
  longitude: 98.6088,

  // === GEOGRAFI ===
  topography:
    'Berbukit-bukit dengan lereng landai hingga curam. Terletak di punggung Pegunungan Bukit Barisan ' +
    'dengan kontur tanah bergelombang yang cocok untuk pertanian terasering.',

  soilType:
    'Tanah vulkanik (andosol) yang sangat subur, berasal dari aktivitas vulkanik gunung-gunung di sekitar ' +
    'kawasan Danau Toba. Kandungan mineral tinggi membuat tanah ini ideal untuk hortikultura.',

  climate: {
    type: 'Tropis Dataran Tinggi (Af/Am)',
    avgTemp: '18–24°C',
    minTemp: '14°C',
    maxTemp: '27°C',
    rainfall: '2.000–2.500 mm/tahun',
    humidity: '75–85%',
    bestSeason: 'Juni – September (musim kemarau)',
  },

  boundaries: {
    utara: 'Desa Silimakuta',
    selatan: 'Desa Dolok Panribuan',
    timur: 'Desa Purba Tua Etek',
    barat: 'Desa Saribu Janggali',
  },

  geographyDescription:
    'Secara geografis, Saribudolok berada di koordinat 2.9956° LU dan 98.6088° BT, membentang seluas 10,03 km² ' +
    'di dataran tinggi Kabupaten Simalungun. Wilayah ini termasuk dalam zona ekosistem pegunungan Bukit Barisan ' +
    'dengan topografi berbukit yang dramatis. Curah hujan yang tinggi dan suhu sejuk menjadikan kawasan ini ' +
    'sangat hijau sepanjang tahun. Dari beberapa titik tertinggi, pengunjung dapat melihat pemandangan ' +
    'Danau Toba yang memukau di kejauhan.',

  // === WISATA ===
  tourismOverview:
    'Saribudolok dan sekitarnya menyimpan kekayaan wisata alam yang menakjubkan. Mulai dari panorama Danau Toba, ' +
    'pemandian air panas alami, hingga taman wisata di pegunungan — semuanya bisa dijangkau dengan mudah dari desa ini.',

  destinations: [
    {
      id: 'paropo',
      name: 'Wisata Paropo',
      category: 'alam',
      description:
        'Kawasan wisata di tepi Danau Toba yang menawarkan pemandangan danau vulkanik terbesar di dunia. ' +
        'Paropo terkenal dengan sunset-nya yang menakjubkan dan suasana tenang yang cocok untuk relaksasi.',
      image: '/images/wisata-paropo.png',
      highlights: [
        'Pemandangan Danau Toba 360°',
        'Sunset point terbaik',
        'Wisata perahu tradisional',
        'Kuliner ikan segar danau',
      ],
    },
    {
      id: 'aek-nauli',
      name: 'Aek Nauli',
      category: 'alam',
      description:
        'Sumber air panas alami yang tersembunyi di tengah hutan pegunungan. Air panas yang mengalir dari perut bumi ' +
        'dipercaya memiliki kandungan mineral yang bermanfaat untuk kesehatan.',
      image: '/images/wisata-aek-nauli.png',
      highlights: [
        'Pemandian air panas alami',
        'Trekking hutan pegunungan',
        'Udara segar pegunungan',
        'Terapi air mineral',
      ],
    },
    {
      id: 'taman-simalem',
      name: 'Taman Simalem Resort',
      category: 'alam',
      description:
        'Resort dan taman wisata di ketinggian 1.500 mdpl dengan area seluas 206 hektar. Menawarkan kebun bunga, ' +
        'hutan pinus, dan pemandangan Danau Toba yang spektakuler dari ketinggian.',
      image: '/images/wisata-simalem.png',
      highlights: [
        'Kebun bunga 206 hektar',
        'View Danau Toba dari ketinggian',
        'Hutan pinus & camping ground',
        'Agrowisata kopi & sayuran',
      ],
    },
  ],

  // === BUDAYA ===
  cultureDescription:
    'Saribudolok merupakan bagian dari wilayah adat Simalungun, salah satu sub-etnis Batak yang memiliki ' +
    'kebudayaan unik dan berbeda dari sub-etnis Batak lainnya. Masyarakat Simalungun dikenal dengan ' +
    'keramahtamahannya, tradisi gotong royong, dan seni budaya yang kaya. Ulos Simalungun, tarian Tortor, ' +
    'dan musik tradisional Gondang menjadi warisan budaya yang masih dilestarikan hingga saat ini.',

  cultureImage: '/images/budaya-simalungun.png',

  culture: {
    ethnicity: 'Batak Simalungun',
    language: 'Bahasa Simalungun & Bahasa Indonesia',
    religion: 'Kristen Protestan (mayoritas), Katolik, Islam',
    traditions: [
      {
        name: 'Tor-Tor Simalungun',
        description:
          'Tarian adat sakral yang ditampilkan dalam upacara pernikahan, pemakaman, dan festival budaya. ' +
          'Gerakan tarian yang lembut dan anggun menjadi ciri khas Simalungun.',
      },
      {
        name: 'Marpaniaran',
        description:
          'Tradisi gotong royong masyarakat Simalungun dalam mengerjakan lahan pertanian secara bergantian ' +
          'antar keluarga di desa.',
      },
      {
        name: 'Rondang Bittang',
        description:
          'Festival budaya tahunan Simalungun yang menampilkan pameran kesenian, perlombaan tradisional, ' +
          'dan kuliner khas daerah.',
      },
    ],
    cuisine: [
      {
        name: 'Dayok Na Niarsik',
        description: 'Ayam kampung yang dimasak dengan bumbu rempah khas Simalungun dan andaliman.',
      },
      {
        name: 'Dengke Na Niura',
        description: 'Ikan segar Danau Toba yang dimasak dengan perasan jeruk purut dan bumbu khas.',
      },
      {
        name: 'Saksang',
        description: 'Masakan tradisional Batak dari daging babi yang dimasak dengan darah dan rempah.',
      },
      {
        name: 'Kopi Simalungun',
        description: 'Kopi arabika khas dataran tinggi Simalungun dengan cita rasa unik dan aroma kuat.',
      },
    ],
    livelihoods: [
      'Petani hortikultura (sayur-mayur, buah-buahan)',
      'Pekebun kopi arabika',
      'Peternak (sapi, kerbau, babi)',
      'Pedagang hasil bumi',
      'Pengrajin ulos & kerajinan tangan',
    ],
  },

  // === EKONOMI ===
  economyDescription:
    'Ekonomi Saribudolok didominasi oleh sektor pertanian dataran tinggi. Tanah vulkanik yang subur ' +
    'menjadikan desa ini salah satu produsen sayuran terbesar di Sumatera Utara. Komoditas utama ' +
    'meliputi kubis, kentang, tomat, cabai, dan bawang merah. Kopi arabika juga menjadi komoditas ' +
    'andalan yang diminati pasar domestik maupun ekspor.',

  mainCommodities: [
    'Kubis (Kol)',
    'Kentang',
    'Tomat',
    'Cabai',
    'Bawang Merah',
    'Kopi Arabika',
    'Jahe',
    'Jeruk',
  ],

  economicSector: 'Pertanian & Hortikultura',
  farmImage: '/images/pertanian.png',
};

export default saribudolokData;
