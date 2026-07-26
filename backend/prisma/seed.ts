import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categoriesData = [
  { name: "Electronics", slug: "electronics", description: "Gadgets, computing, and electronic devices" },
  { name: "Smartphones", slug: "smartphones", description: "Mobile phones and cellular technology" },
  { name: "Laptops & Computers", slug: "laptops-computers", description: "High-performance notebooks and desktops" },
  { name: "Audio & Headphones", slug: "audio-headphones", description: "Headphones, earphones, and speakers" },
  { name: "Wearable Tech", slug: "wearable-tech", description: "Smartwatches, fitness bands, and tracking devices" },
  { name: "Home Appliances", slug: "home-appliances", description: "Vacuums, airfryers, and coffee makers" },
  { name: "Smart Home", slug: "smart-home", description: "Lighting, smart plugs, and security devices" },
  { name: "Men's Fashion", slug: "mens-fashion", description: "Apparel, trousers, and outer wear for men" },
  { name: "Women's Fashion", slug: "womens-fashion", description: "Dresses, coats, jeans, and fashion items for women" },
  { name: "Footwear", slug: "footwear", description: "Sneakers, boots, sandals, and athletic shoes" },
  { name: "Accessories", slug: "accessories", description: "Wallets, sunglasses, watches, and bags" },
  { name: "Fitness & Outdoors", slug: "fitness-outdoors", description: "Yoga mats, tents, and exercise gear" },
  { name: "Kitchen & Dining", slug: "kitchen-dining", description: "Cookware, blenders, stand mixers, and dinnerware" },
  { name: "Home Decor & Furniture", slug: "home-decor-furniture", description: "Chairs, vases, throws, and decorative pieces" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care", description: "Skincare, moisturizers, toothbrushes, and hair oil" },
  { name: "Office Supplies", slug: "office-supplies", description: "Chairs, desk mats, monitor arms, and storage trays" },
  { name: "Books & Stationery", slug: "books-stationery", description: "Bestsellers, journals, pens, and paper craft" },
  { name: "Board Games & Toys", slug: "board-games-toys", description: "Strategy board games, LEGOs, and puzzles" },
  { name: "Health & Wellness", slug: "health-wellness", description: "Massage guns, protein powders, and multivitamins" },
  { name: "Travel Gear", slug: "travel-gear", description: "Suitcases, pillows, passport holders, and luggage scales" }
];

const productsData = [
  // 1. Electronics
  {
    sku: "ELEC-IPHONE15PM",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    shortDescription: "Titanium design, A17 Pro chip, powerful camera.",
    description: "The iPhone 15 Pro Max features a strong and light aerospace-grade titanium design with contoured edges. An innovative 5x Telephoto camera. And the game-changing A17 Pro chip.",
    brand: "Apple",
    price: 1199.99,
    discountPrice: 1099.99,
    weight: 0.221,
    thumbnailUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000",
      "https://images.unsplash.com/photo-1695048133069-b57095c1d683?w=1000"
    ],
    specifications: [
      { key: "Storage", value: "256 GB" },
      { key: "Color", value: "Natural Titanium" },
      { key: "Screen Size", value: "6.7 inches" }
    ],
    categorySlugs: ["electronics", "smartphones", "accessories"]
  },
  {
    sku: "ELEC-SAMS24ULTRA",
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    shortDescription: "Galaxy AI, 200MP camera, built-in S Pen.",
    description: "Meet Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat screen. It is an absolute marvel of design.",
    brand: "Samsung",
    price: 1299.99,
    discountPrice: 1199.99,
    weight: 0.232,
    thumbnailUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000",
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1000"
    ],
    specifications: [
      { key: "Storage", value: "512 GB" },
      { key: "Color", value: "Titanium Gray" },
      { key: "Stylus", value: "Included S-Pen" }
    ],
    categorySlugs: ["electronics", "smartphones"]
  },
  {
    sku: "ELEC-MBP16M3",
    name: "MacBook Pro 16\" M3",
    slug: "macbook-pro-16-m3",
    shortDescription: "M3 Max chip, Liquid Retina XDR display, long battery.",
    description: "MacBook Pro blasts forward with the M3, M3 Pro, and M3 Max chips. Built on 3-nanometer technology and featuring an all-new GPU architecture.",
    brand: "Apple",
    price: 2499.99,
    discountPrice: 2299.99,
    weight: 2.16,
    thumbnailUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000"
    ],
    specifications: [
      { key: "Processor", value: "Apple M3 Pro" },
      { key: "RAM", value: "18 GB" },
      { key: "Storage", value: "512 GB SSD" }
    ],
    categorySlugs: ["electronics", "laptops-computers"]
  },
  {
    sku: "ELEC-SONYXM5",
    name: "Sony WH-1000XM5 Headphones",
    slug: "sony-wh-1000xm5-headphones",
    shortDescription: "Industry-leading noise canceling wireless headphones.",
    description: "With two processors controlling eight microphones, Auto NC Optimizer for automatically optimizing noise canceling based on your wearing conditions.",
    brand: "Sony",
    price: 399.99,
    discountPrice: 349.99,
    weight: 0.25,
    thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1000"
    ],
    specifications: [
      { key: "Battery Life", value: "Up to 30 Hours" },
      { key: "Color", value: "Black" },
      { key: "Bluetooth", value: "v5.2" }
    ],
    categorySlugs: ["electronics", "audio-headphones"]
  },
  {
    sku: "ELEC-APPLEWATCH9",
    name: "Apple Watch Series 9",
    slug: "apple-watch-series-9",
    shortDescription: "S9 SiP chip, double tap gesture, bright screen.",
    description: "Apple Watch Series 9 is more capable, intuitive, and faster. The new S9 SiP powers a super-bright display and a magical new way to interact.",
    brand: "Apple",
    price: 399.99,
    discountPrice: null,
    weight: 0.0387,
    thumbnailUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500",
    images: [
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=1000",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=1000"
    ],
    specifications: [
      { key: "Case Size", value: "45mm" },
      { key: "Connectivity", value: "GPS + Cellular" },
      { key: "Material", value: "Aluminum" }
    ],
    categorySlugs: ["electronics", "wearable-tech"]
  },

  // 2. Smartphones
  {
    sku: "SMART-PIXEL8PRO",
    name: "Google Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    shortDescription: "Tensor G3 chip, advanced AI photo features.",
    description: "The all-pro phone engineered by Google. It has the best of Google AI, the most advanced Pixel Camera ever, and can help you get more done.",
    brand: "Google",
    price: 999.99,
    discountPrice: 899.99,
    weight: 0.213,
    thumbnailUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1000",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
    ],
    specifications: [
      { key: "Storage", value: "128 GB" },
      { key: "Color", value: "Bay Blue" },
      { key: "OS", value: "Android 14" }
    ],
    categorySlugs: ["smartphones", "electronics"]
  },
  {
    sku: "SMART-ONEPLUS12",
    name: "OnePlus 12",
    slug: "oneplus-12",
    shortDescription: "Snapdragon 8 Gen 3, 100W SuperVOOC charging.",
    description: "Redefined flagship specs, the OnePlus 12 delivers prime performance with high-speed cooling, 4th Gen Hasselblad Camera for Mobile, and fast charging.",
    brand: "OnePlus",
    price: 799.99,
    discountPrice: null,
    weight: 0.22,
    thumbnailUrl: "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=500",
    images: [
      "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=1000",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000"
    ],
    specifications: [
      { key: "RAM", value: "16 GB" },
      { key: "Charging", value: "100W Wired" },
      { key: "Color", value: "Silky Black" }
    ],
    categorySlugs: ["smartphones", "electronics"]
  },
  {
    sku: "SMART-XIAOMI14U",
    name: "Xiaomi 14 Ultra",
    slug: "xiaomi-14-ultra",
    shortDescription: "Leica Summilux optical lens, 1-inch sensor.",
    description: "Co-engineered with Leica, featuring the next generation of camera tech with variable physical aperture and top-notch Snapdragon chipset.",
    brand: "Xiaomi",
    price: 1099.99,
    discountPrice: 999.99,
    weight: 0.22,
    thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1000"
    ],
    specifications: [
      { key: "Camera", value: "50MP Quad Leica" },
      { key: "Battery", value: "5000 mAh" }
    ],
    categorySlugs: ["smartphones", "electronics"]
  },
  {
    sku: "SMART-ROGPHONE8",
    name: "Asus ROG Phone 8",
    slug: "asus-rog-phone-8",
    shortDescription: "Ultimate gaming phone, 165Hz AMOLED screen.",
    description: "Unleash gaming excellence with triggers, cooling attachments support, and high refresh rate screen suited for elite esports mobile gaming.",
    brand: "Asus",
    price: 1099.99,
    discountPrice: null,
    weight: 0.225,
    thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500",
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000"
    ],
    specifications: [
      { key: "Refresh Rate", value: "165Hz" },
      { key: "RAM", value: "16 GB LPDDR5X" }
    ],
    categorySlugs: ["smartphones", "electronics"]
  },
  {
    sku: "SMART-ZFOLD5",
    name: "Samsung Galaxy Z Fold 5",
    slug: "samsung-galaxy-z-fold-5",
    shortDescription: "Large foldable inner display, multi-window multitasking.",
    description: "The PC in your pocket. Folds shut, giving you an immersive massive screen for gaming, viewing, and working.",
    brand: "Samsung",
    price: 1799.99,
    discountPrice: 1599.99,
    weight: 0.253,
    thumbnailUrl: "https://images.unsplash.com/photo-1574755393849-623942496936?w=500",
    images: [
      "https://images.unsplash.com/photo-1574755393849-623942496936?w=1000"
    ],
    specifications: [
      { key: "Display", value: "7.6 inch Foldable" },
      { key: "Weight", value: "253g" }
    ],
    categorySlugs: ["smartphones", "electronics"]
  },

  // 3. Laptops & Computers
  {
    sku: "LAP-DELLXPS15",
    name: "Dell XPS 15",
    slug: "dell-xps-15",
    shortDescription: "OLED InfinityEdge screen, Intel i9 CPU.",
    description: "High performance meets elegance. Features a stunning bezel-less screen and top configuration for creators and developers.",
    brand: "Dell",
    price: 1899.99,
    discountPrice: 1799.99,
    weight: 1.92,
    thumbnailUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500",
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1000"
    ],
    specifications: [
      { key: "Display", value: "15.6 inch OLED" },
      { key: "Processor", value: "Intel Core i9" }
    ],
    categorySlugs: ["laptops-computers", "electronics"]
  },
  {
    sku: "LAP-THINKPADX1",
    name: "Lenovo ThinkPad X1 Carbon",
    slug: "lenovo-thinkpad-x1-carbon",
    shortDescription: "Business standard, durable carbon-fiber build.",
    description: "The gold standard of enterprise laptops. Exceptional keyboard, military-grade durability, and security chips built-in.",
    brand: "Lenovo",
    price: 1599.99,
    discountPrice: null,
    weight: 1.12,
    thumbnailUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
    images: [
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=1000"
    ],
    specifications: [
      { key: "Weight", value: "1.12 kg" },
      { key: "RAM", value: "32 GB" }
    ],
    categorySlugs: ["laptops-computers", "electronics"]
  },
  {
    sku: "LAP-HPSPECTRE",
    name: "HP Spectre x360",
    slug: "hp-spectre-x360",
    shortDescription: "2-in-1 convertible laptop with stylus pen.",
    description: "Fold it back to use as a tablet, or view movies in tent mode. Includes stylus and a gorgeous OLED screen.",
    brand: "HP",
    price: 1499.99,
    discountPrice: 1399.99,
    weight: 1.45,
    thumbnailUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500",
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1000"
    ],
    specifications: [
      { key: "Form Factor", value: "2-in-1 Convertible" },
      { key: "Storage", value: "1 TB NVMe SSD" }
    ],
    categorySlugs: ["laptops-computers", "electronics"]
  },
  {
    sku: "LAP-ASUSROG14",
    name: "ASUS ROG Zephyrus G14",
    slug: "asus-rog-zephyrus-g14",
    shortDescription: "Compact 14-inch gaming beast with RTX 4070.",
    description: "Compact size, massive power. Gamers' and modelers' favorite with portable chassis and extreme graphic processing unit.",
    brand: "ASUS",
    price: 1699.99,
    discountPrice: 1549.99,
    weight: 1.65,
    thumbnailUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1000"
    ],
    specifications: [
      { key: "Graphics", value: "NVIDIA RTX 4070" },
      { key: "Processor", value: "AMD Ryzen 9" }
    ],
    categorySlugs: ["laptops-computers", "electronics"]
  },
  {
    sku: "LAP-ACERSWIFT",
    name: "Acer Swift Edge 16",
    slug: "acer-swift-edge-16",
    shortDescription: "Ultra-thin lightweight notebook, 3.2K OLED.",
    description: "Extremely portable 16-inch laptop weighing only 1.2kg. Perfect for digital nomads needing a large but featherweight screen.",
    brand: "Acer",
    price: 1199.99,
    discountPrice: null,
    weight: 1.23,
    thumbnailUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500",
    images: [
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=1000"
    ],
    specifications: [
      { key: "Display", value: "16 inch OLED 3.2K" },
      { key: "Weight", value: "1.23 kg" }
    ],
    categorySlugs: ["laptops-computers", "electronics"]
  },

  // 4. Audio & Headphones
  {
    sku: "AUD-BOSEQCULTRA",
    name: "Bose QuietComfort Ultra",
    slug: "bose-quietcomfort-ultra",
    shortDescription: "Immersive audio and world-class noise cancellation.",
    description: "Bose flagship headphones designed for maximum comfort and pure audio quality. Features custom sound tuning.",
    brand: "Bose",
    price: 429.0,
    discountPrice: 399.0,
    weight: 0.25,
    thumbnailUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1000"
    ],
    specifications: [
      { key: "Style", value: "Over-Ear" },
      { key: "ANC", value: "Active Noise Cancelling" }
    ],
    categorySlugs: ["audio-headphones", "electronics"]
  },
  {
    sku: "AUD-SENNMOM4",
    name: "Sennheiser Momentum 4",
    slug: "sennheiser-momentum-4",
    shortDescription: "Audiophile-inspired sound with 60-hour battery life.",
    description: "Sennheiser signature sound with unmatched battery performance. Keep listening on a single charge for weeks.",
    brand: "Sennheiser",
    price: 379.95,
    discountPrice: 329.95,
    weight: 0.293,
    thumbnailUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000"
    ],
    specifications: [
      { key: "Battery Life", value: "60 Hours" },
      { key: "Driver Size", value: "42mm" }
    ],
    categorySlugs: ["audio-headphones", "electronics"]
  },
  {
    sku: "AUD-APPODS2",
    name: "Apple AirPods Pro 2",
    slug: "apple-airpods-pro-2",
    shortDescription: "H2 chip, adaptive audio, USB-C case.",
    description: "Rebuilt from the sound up. AirPods Pro features up to 2x more Active Noise Cancellation, plus Adaptive Audio.",
    brand: "Apple",
    price: 249.0,
    discountPrice: null,
    weight: 0.05,
    thumbnailUrl: "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=500",
    images: [
      "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=1000"
    ],
    specifications: [
      { key: "Chip", value: "Apple H2" },
      { key: "Charging Interface", value: "USB-C / MagSafe" }
    ],
    categorySlugs: ["audio-headphones", "electronics", "accessories"]
  },
  {
    sku: "AUD-SONYWF5",
    name: "Sony WF-1000XM5 earbuds",
    slug: "sony-wf-1000xm5-earbuds",
    shortDescription: "The best noise cancelling truly wireless earbuds.",
    description: "Miniature size, huge detail. Noise canceling technology packed in ergonomic, sweatproof daily earbuds.",
    brand: "Sony",
    price: 299.99,
    discountPrice: 269.99,
    weight: 0.039,
    thumbnailUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000"
    ],
    specifications: [
      { key: "Water Resistance", value: "IPX4" },
      { key: "ANC Type", value: "Dynamic ANC" }
    ],
    categorySlugs: ["audio-headphones", "electronics"]
  },
  {
    sku: "AUD-JBLFLIP6",
    name: "JBL Flip 6 Bluetooth Speaker",
    slug: "jbl-flip-6-bluetooth-speaker",
    shortDescription: "IP67 waterproof outdoor speaker with deep bass.",
    description: "Take powerful JBL Pro sound wherever you go. Completely dustproof and waterproof, ideal for pool parties.",
    brand: "JBL",
    price: 129.95,
    discountPrice: 109.95,
    weight: 0.55,
    thumbnailUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500",
    images: [
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1000"
    ],
    specifications: [
      { key: "Waterproof Level", value: "IP67" },
      { key: "Playtime", value: "12 Hours" }
    ],
    categorySlugs: ["audio-headphones", "electronics"]
  },

  // 5. Wearable Tech
  {
    sku: "WEAR-GARMINFEN7",
    name: "Garmin Fenix 7 Pro",
    slug: "garmin-fenix-7-pro",
    shortDescription: "Multisport GPS watch with solar charging.",
    description: "Built for athletes and adventurers. Extreme GPS tracking precision and battery extension via built-in solar panels.",
    brand: "Garmin",
    price: 799.99,
    discountPrice: null,
    weight: 0.079,
    thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000"
    ],
    specifications: [
      { key: "Battery Type", value: "Solar Charged" },
      { key: "GPS Support", value: "Multi-Band GNSS" }
    ],
    categorySlugs: ["wearable-tech", "electronics", "fitness-outdoors"]
  },
  {
    sku: "WEAR-FITBIT6",
    name: "Fitbit Charge 6",
    slug: "fitbit-charge-6",
    shortDescription: "Advanced fitness tracker with heart rate and GPS.",
    description: "Slim fitness tracker that measures heart rate, sleep quality, and active zone minutes. Built-in GPS for runs.",
    brand: "Fitbit",
    price: 159.95,
    discountPrice: 139.95,
    weight: 0.029,
    thumbnailUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500",
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=1000"
    ],
    specifications: [
      { key: "Battery Life", value: "7 Days" },
      { key: "Heart Rate Monitor", value: "24/7 Continuous" }
    ],
    categorySlugs: ["wearable-tech", "electronics", "fitness-outdoors"]
  },
  {
    sku: "WEAR-GALAXYWATCH6",
    name: "Samsung Galaxy Watch 6",
    slug: "samsung-galaxy-watch-6",
    shortDescription: "AMOLED smart wrist companion with body composition.",
    description: "Advanced sleep coaching, heart health monitoring, and body BIA scanner on your wrist. Pairs perfectly with Android.",
    brand: "Samsung",
    price: 299.99,
    discountPrice: 259.99,
    weight: 0.033,
    thumbnailUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1000"
    ],
    specifications: [
      { key: "Screen", value: "Super AMOLED" },
      { key: "OS", value: "Wear OS Powered by Samsung" }
    ],
    categorySlugs: ["wearable-tech", "electronics"]
  },
  {
    sku: "WEAR-WHOOP4",
    name: "Whoop 4.0 Fitness Tracker",
    slug: "whoop-4-0-fitness-tracker",
    shortDescription: "Screenless bio-metric tracker for recovery and strain.",
    description: "The screen-free tracker used by professional athletes. Generates deep insights on sleep, strain, and recovery metrics.",
    brand: "Whoop",
    price: 239.0,
    discountPrice: null,
    weight: 0.02,
    thumbnailUrl: "https://images.unsplash.com/photo-1510017808632-95f08e03061c?w=500",
    images: [
      "https://images.unsplash.com/photo-1510017808632-95f08e03061c?w=1000"
    ],
    specifications: [
      { key: "Screen", value: "None (App-Only)" },
      { key: "Subscription", value: "Includes 12-Month Membership" }
    ],
    categorySlugs: ["wearable-tech", "electronics", "fitness-outdoors"]
  },
  {
    sku: "WEAR-AMAZFITGTR4",
    name: "Amazfit GTR 4",
    slug: "amazfit-gtr-4",
    shortDescription: "Classic circular watch, 14-day battery life.",
    description: "Premium round watch chassis offering multi-sport tracking, GPS mapping, and industry-leading two-week battery life.",
    brand: "Amazfit",
    price: 199.99,
    discountPrice: 179.99,
    weight: 0.034,
    thumbnailUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500",
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1000"
    ],
    specifications: [
      { key: "Shape", value: "Circular" },
      { key: "Battery Life", value: "14 Days" }
    ],
    categorySlugs: ["wearable-tech", "electronics"]
  },

  // 6. Home Appliances
  {
    sku: "APP-DYSONV15",
    name: "Dyson V15 Detect Vacuum",
    slug: "dyson-v15-detect-vacuum",
    shortDescription: "Cordless stick vacuum with laser illumination.",
    description: "Dyson's most powerful, intelligent cordless vacuum. Reveals microscopic dust with laser-illumination tech.",
    brand: "Dyson",
    price: 749.99,
    discountPrice: 699.99,
    weight: 3.1,
    thumbnailUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=1000"
    ],
    specifications: [
      { key: "Type", value: "Cordless Stick" },
      { key: "Suction Power", value: "230 AW" }
    ],
    categorySlugs: ["home-appliances", "smart-home"]
  },
  {
    sku: "APP-ROOMBAJ7",
    name: "iRobot Roomba j7+",
    slug: "irobot-roomba-j7",
    shortDescription: "Robot vacuum with self-emptying base and obstacle avoidance.",
    description: "Cleans up after itself and avoids pet waste and charging cords using advanced camera navigation.",
    brand: "iRobot",
    price: 799.99,
    discountPrice: 599.99,
    weight: 3.4,
    thumbnailUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=500",
    images: [
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1000"
    ],
    specifications: [
      { key: "Features", value: "Automatic Dirt Disposal" },
      { key: "Battery Type", value: "Lithium-Ion" }
    ],
    categorySlugs: ["home-appliances", "smart-home"]
  },
  {
    sku: "APP-PHILIPSAF",
    name: "Philips Airfryer XXL",
    slug: "philips-airfryer-xxl",
    shortDescription: "Fat removal airfryer for crispy healthy meals.",
    description: "Convection airfryer that cooks family-sized portions using little to no oil. Extracts excess fat from foods.",
    brand: "Philips",
    price: 249.99,
    discountPrice: null,
    weight: 7.99,
    thumbnailUrl: "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=500",
    images: [
      "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=1000"
    ],
    specifications: [
      { key: "Capacity", value: "7.3 Liters" },
      { key: "Power", value: "2200 Watts" }
    ],
    categorySlugs: ["home-appliances", "kitchen-dining"]
  },
  {
    sku: "APP-BREVBARISTA",
    name: "Breville Barista Express",
    slug: "breville-barista-express",
    shortDescription: "Espresso machine with integrated conical grinder.",
    description: "Grinds coffee beans directly into the filter for fresh, professional quality espresso in under a minute.",
    brand: "Breville",
    price: 699.95,
    discountPrice: 649.95,
    weight: 12.5,
    thumbnailUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500",
    images: [
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=1000"
    ],
    specifications: [
      { key: "Grinder", value: "Built-In Conical Burr" },
      { key: "Pressure", value: "15 Bar Italian Pump" }
    ],
    categorySlugs: ["home-appliances", "kitchen-dining"]
  },
  {
    sku: "APP-INSTANTPOT",
    name: "Instant Pot Duo Plus",
    slug: "instant-pot-duo-plus",
    shortDescription: "9-in-1 multi-cooker, sterilizer and slow cooker.",
    description: "Replaces 9 kitchen appliances. Pressure cooks, slow cooks, sterilizes, sautés, and warms food to perfection.",
    brand: "Instant Pot",
    price: 129.99,
    discountPrice: null,
    weight: 5.6,
    thumbnailUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500",
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=1000"
    ],
    specifications: [
      { key: "Capacity", value: "6 Quarts" },
      { key: "Modes", value: "9-in-1 Smart Cooker" }
    ],
    categorySlugs: ["home-appliances", "kitchen-dining"]
  },

  // 7. Smart Home
  {
    sku: "SMART-HUEKIT",
    name: "Philips Hue Starter Kit",
    slug: "philips-hue-starter-kit",
    shortDescription: "Smart lighting starter pack with 4 bulbs and Hue Bridge.",
    description: "Transform your home lighting with millions of colors. Control via app, voice assistant, or schedules.",
    brand: "Philips Hue",
    price: 199.99,
    discountPrice: 169.99,
    weight: 0.8,
    thumbnailUrl: "https://images.unsplash.com/photo-1558211583-d28f610b6eb1?w=500",
    images: [
      "https://images.unsplash.com/photo-1558211583-d28f610b6eb1?w=1000"
    ],
    specifications: [
      { key: "Light Output", value: "1100 Lumens" },
      { key: "Colors", value: "16 Million Colors" }
    ],
    categorySlugs: ["smart-home", "electronics"]
  },
  {
    sku: "SMART-NESTTHERM",
    name: "Nest Learning Thermostat",
    slug: "nest-learning-thermostat",
    shortDescription: "Smart temperature control that learns your schedule.",
    description: "Saves energy by adapting to your lifestyle. Programmed automatically based on your daily temperature settings.",
    brand: "Google",
    price: 249.0,
    discountPrice: null,
    weight: 0.5,
    thumbnailUrl: "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=500",
    images: [
      "https://images.unsplash.com/photo-1595853035070-59a39fe84de3?w=1000"
    ],
    specifications: [
      { key: "Smart Compatibility", value: "Google Assistant, Alexa" },
      { key: "Screen Type", value: "Farsight LCD Display" }
    ],
    categorySlugs: ["smart-home", "electronics", "home-appliances"]
  },
  {
    sku: "SMART-RINGDOOR",
    name: "Ring Video Doorbell Pro 2",
    slug: "ring-video-doorbell-pro-2",
    shortDescription: "Wired video doorbell with 3D motion detection.",
    description: "Premium security doorbell featuring 1536p HD Head-to-Toe Video, Bird's Eye View mapping, and built-in Alexa greetings.",
    brand: "Ring",
    price: 224.99,
    discountPrice: 199.99,
    weight: 0.35,
    thumbnailUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500",
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=1000"
    ],
    specifications: [
      { key: "Video Resolution", value: "1536p HD" },
      { key: "Power", value: "Hardwired Connection" }
    ],
    categorySlugs: ["smart-home", "electronics"]
  },
  {
    sku: "SMART-HOMEPOD2",
    name: "Apple HomePod 2nd Gen",
    slug: "apple-homepod-2nd-gen",
    shortDescription: "High-fidelity smart speaker with Siri assistant.",
    description: "Immersive high-fidelity audio that tunes itself to the room acoustics. Seamlessly control your Apple ecosystem smart home.",
    brand: "Apple",
    price: 299.0,
    discountPrice: null,
    weight: 2.3,
    thumbnailUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500",
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1000"
    ],
    specifications: [
      { key: "Connectivity", value: "Wi-Fi, Bluetooth 5.0" },
      { key: "Assistant", value: "Apple Siri" }
    ],
    categorySlugs: ["smart-home", "audio-headphones", "electronics"]
  },
  {
    sku: "SMART-TPPLUG",
    name: "TP-Link Kasa Smart Plug",
    slug: "tp-link-kasa-smart-plug",
    shortDescription: "Wi-Fi smart plug with energy monitoring.",
    description: "Control devices from anywhere using the Kasa app. Monitor energy consumption and schedule power timers.",
    brand: "TP-Link",
    price: 19.99,
    discountPrice: 14.99,
    weight: 0.1,
    thumbnailUrl: "https://images.unsplash.com/photo-1558089687-f282ffcbd1d5?w=500",
    images: [
      "https://images.unsplash.com/photo-1558089687-f282ffcbd1d5?w=1000"
    ],
    specifications: [
      { key: "Max Load", value: "15 Amps" },
      { key: "App Support", value: "Kasa Smart App" }
    ],
    categorySlugs: ["smart-home", "electronics"]
  },

  // Fill in the rest of the categories to hit 100 products.
  // To keep coding efficient, we will programmatically generate mock items for Men's Fashion (8), Women's Fashion (9), Footwear (10), Accessories (11), Fitness (12), Kitchen (13), Home Decor (14), Beauty (15), Office (16), Books (17), Board Games (18), Health (19), Travel (20).
  // This will cleanly reach exactly 100 items with rich specifications and categories.
  ...Array.from({ length: 65 }).map((_, index) => {
    const id = index + 36; // Start from 36 since we have 35 manual products above
    const categoryIndex = 7 + Math.floor((id - 36) / 5); // Distribute 5 per category
    const cat = categoriesData[categoryIndex] || categoriesData[19];

    const price = Math.round((49.99 + index * 8.5) * 100) / 100;
    const discountPrice = Math.random() > 0.5 ? Math.round(price * 0.9 * 100) / 100 : null;

    return {
      sku: `PROD-${cat.name.toUpperCase().substring(0, 4)}-${id}`,
      name: `${cat.name} Special Item ${id}`,
      slug: `${cat.slug}-special-item-${id}`,
      shortDescription: `A premium product designed for all your ${cat.name.toLowerCase()} requirements.`,
      description: `This is a high quality ecommerce product created under the ${cat.name} collection. It incorporates top materials and robust engineering.`,
      brand: `Brand ${String.fromCharCode(65 + (id % 5))}`,
      price,
      discountPrice,
      weight: 0.5 + (id % 10) * 0.4,
      thumbnailUrl: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500`,
      images: [
        `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000`,
        `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000`
      ],
      specifications: [
        { key: "Brand", value: `Brand ${String.fromCharCode(65 + (id % 5))}` },
        { key: "Quality Grade", value: "Premium" },
        { key: "Standard Warranty", value: "1 Year" }
      ],
      categorySlugs: [cat.slug, "accessories"]
    };
  })
];

async function main() {
  let variantCount = 0;
  const getRandomStock = () => {
    variantCount++;
    if (variantCount % 6 === 0) return 0; // out of stock
    return Math.floor(Math.random() * 100) + 1; // 1 to 100
  };

  console.log("🌱 Cleaning database...");
  await prisma.checkoutItem.deleteMany({});
  await prisma.checkoutSession.deleteMany({});
  await prisma.shippingService.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.variantAttributeValue.deleteMany({});
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productSeo.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productSpecification.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("🌱 Seeding Users...");
  const user1 = await prisma.user.create({
    data: {
      clerkId: "user_seed_john_doe_clerk_id",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      role: "USER",
      status: "ACTIVE",
    }
  });

  const user2 = await prisma.user.create({
    data: {
      clerkId: "user_seed_jane_smith_clerk_id",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      fullName: "Jane Smith",
      role: "USER",
      status: "ACTIVE",
    }
  });

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const superAdminPasswordHash = await bcrypt.hash("SuperAdmin123!", 10);

  await prisma.user.create({
    data: {
      clerkId: "user_seed_super_admin_clerk_id",
      email: "super.admin@example.com",
      passwordHash: superAdminPasswordHash,
      firstName: "Super",
      lastName: "Admin",
      fullName: "Super Admin",
      username: "superadmin",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    }
  });

  await prisma.user.create({
    data: {
      clerkId: "user_seed_admin_clerk_id",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      firstName: "System",
      lastName: "Admin",
      fullName: "System Admin",
      username: "admin",
      role: "ADMIN",
      status: "ACTIVE",
    }
  });

  console.log("🌱 Seeding Brands...");
  const uniqueBrands = Array.from(new Set(productsData.map(p => p.brand).filter((b): b is string => typeof b === "string")));
  const brandMap: Record<string, any> = {};
  for (const b of uniqueBrands) {
    const slug = b.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (brandMap[slug]) {
      brandMap[b] = brandMap[slug];
      continue;
    }
    const createdBrand = await prisma.brand.create({
      data: {
        name: b,
        slug,
        isActive: true,
      }
    });
    brandMap[slug] = createdBrand;
    brandMap[b] = createdBrand;
  }

  console.log("🌱 Seeding Attributes...");
  const colorAttr = await prisma.attribute.create({ data: { name: "Color" } });
  const sizeAttr = await prisma.attribute.create({ data: { name: "Size" } });
  const storageAttr = await prisma.attribute.create({ data: { name: "Storage" } });

  const colors = ["Red", "Black", "White", "Silver", "Gold", "Blue"];
  const sizes = ["S", "M", "L", "XL"];
  const storages = ["128GB", "256GB", "512GB", "1TB"];

  const colorValues: Record<string, any> = {};
  for (const c of colors) {
    colorValues[c] = await prisma.attributeValue.create({
      data: { attributeId: colorAttr.id, value: c }
    });
  }

  const sizeValues: Record<string, any> = {};
  for (const s of sizes) {
    sizeValues[s] = await prisma.attributeValue.create({
      data: { attributeId: sizeAttr.id, value: s }
    });
  }

  const storageValues: Record<string, any> = {};
  for (const st of storages) {
    storageValues[st] = await prisma.attributeValue.create({
      data: { attributeId: storageAttr.id, value: st }
    });
  }

  console.log("🌱 Seeding Categories...");
  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true
      }
    });
    categories[cat.slug] = created;
    console.log(`- Created Category: ${created.name}`);
  }

  console.log("🌱 Seeding Products...");
  let count = 0;
  for (const prod of productsData) {
    const { categorySlugs, images, specifications, ...productFields } = prod;

    // Resolve brandId
    const brandName = productFields.brand;
    const brandId = brandName ? brandMap[brandName]?.id : null;

    // Create the product, nested images, specs, and SEO details
    const createdProduct = await prisma.product.create({
      data: {
        sku: productFields.sku,
        name: productFields.name,
        slug: productFields.slug,
        shortDescription: productFields.shortDescription,
        description: productFields.description,
        price: productFields.price,
        discountPrice: productFields.discountPrice,
        weight: productFields.weight,
        thumbnailUrl: productFields.thumbnailUrl,
        isActive: true,
        isFeatured: (prod as any).isFeatured || false,
        brandId,
        images: {
          create: images.map((url, idx) => ({
            imageUrl: url,
            sortOrder: idx
          }))
        },
        specifications: {
          create: specifications
        },
        seo: {
          create: {
            seoTitle: `${productFields.name} | GeraiOne Store`,
            seoDescription: productFields.shortDescription || `Buy ${productFields.name} online at the best price on GeraiOne.`,
            seoKeywords: `${productFields.name}, ecommerce, catalog, buy online`
          }
        }
      }
    });

    // Create some Variants for the product depending on categories
    if (categorySlugs.includes("smartphones") || categorySlugs.includes("electronics")) {
      const var1 = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `${createdProduct.sku}-128GB`,
          price: createdProduct.price,
          weight: createdProduct.weight,
          isActive: true,
          inventory: {
            create: { availableStock: getRandomStock(), safetyStock: 5 }
          }
        }
      });
      await prisma.variantAttributeValue.create({
        data: { variantId: var1.id, attributeValueId: storageValues["128GB"].id }
      });

      const var2 = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `${createdProduct.sku}-256GB`,
          price: Number(createdProduct.price) + 100,
          weight: createdProduct.weight,
          isActive: true,
          inventory: {
            create: { availableStock: getRandomStock(), safetyStock: 5 }
          }
        }
      });
      await prisma.variantAttributeValue.create({
        data: { variantId: var2.id, attributeValueId: storageValues["256GB"].id }
      });
    } else if (categorySlugs.includes("mens-fashion") || categorySlugs.includes("womens-fashion") || categorySlugs.includes("footwear")) {
      const var1 = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `${createdProduct.sku}-M`,
          price: createdProduct.price,
          weight: createdProduct.weight,
          isActive: true,
          inventory: {
            create: { availableStock: getRandomStock(), safetyStock: 5 }
          }
        }
      });
      await prisma.variantAttributeValue.create({
        data: { variantId: var1.id, attributeValueId: sizeValues["M"].id }
      });

      const var2 = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `${createdProduct.sku}-L`,
          price: createdProduct.price,
          weight: createdProduct.weight,
          isActive: true,
          inventory: {
            create: { availableStock: getRandomStock(), safetyStock: 5 }
          }
        }
      });
      await prisma.variantAttributeValue.create({
        data: { variantId: var2.id, attributeValueId: sizeValues["L"].id }
      });
    } else {
      const var1 = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `${createdProduct.sku}-BLACK`,
          price: createdProduct.price,
          weight: createdProduct.weight,
          isActive: true,
          inventory: {
            create: { availableStock: getRandomStock(), safetyStock: 5 }
          }
        }
      });
      await prisma.variantAttributeValue.create({
        data: { variantId: var1.id, attributeValueId: colorValues["Black"].id }
      });

      const var2 = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          sku: `${createdProduct.sku}-WHITE`,
          price: createdProduct.price,
          weight: createdProduct.weight,
          isActive: true,
          inventory: {
            create: { availableStock: getRandomStock(), safetyStock: 5 }
          }
        }
      });
      await prisma.variantAttributeValue.create({
        data: { variantId: var2.id, attributeValueId: colorValues["White"].id }
      });
    }

    // Seed 2 reviews for each of the first 20 products
    if (count < 20) {
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userId: user1.id,
          rating: 5,
          comment: "Absolutely amazing product! Highly recommend to everyone.",
          isVerifiedPurchase: true,
          helpfulCount: 5
        }
      });
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userId: user2.id,
          rating: 4,
          comment: "Very solid build and good quality, but shipping took a little longer.",
          isVerifiedPurchase: false,
          helpfulCount: 2
        }
      });
    }

    // Seed wishlist items
    if (count < 5) {
      await prisma.wishlist.create({
        data: {
          productId: createdProduct.id,
          userId: user1.id
        }
      });
    }

    // Link product to multiple categories in join table
    const uniqueSlugs = Array.from(new Set(categorySlugs));
    for (const slug of uniqueSlugs) {
      const category = categories[slug];
      if (category) {
        await prisma.productCategory.create({
          data: {
            productId: createdProduct.id,
            categoryId: category.id
          }
        });
      }
    }

    count++;
    if (count % 20 === 0) {
      console.log(`- Seeded ${count}/100 products...`);
    }
  }

  console.log("🌱 Seeding Shipping Services...");
  const shippingServices = [
    {
      code: "INSTANT",
      name: "Instant Delivery",
      description: "Delivered within a few hours.",
      estimatedDeliveryMinDay: 0,
      estimatedDeliveryMaxDay: 1,
      defaultPrice: new Prisma.Decimal(50000),
      displayOrder: 1,
      isActive: true,
    },
    {
      code: "SAME_DAY",
      name: "Same Day Delivery",
      description: "Delivered on the same day.",
      estimatedDeliveryMinDay: 1,
      estimatedDeliveryMaxDay: 1,
      defaultPrice: new Prisma.Decimal(35000),
      displayOrder: 2,
      isActive: true,
    },
    {
      code: "EXPRESS",
      name: "Express",
      description: "Fast delivery.",
      estimatedDeliveryMinDay: 1,
      estimatedDeliveryMaxDay: 2,
      defaultPrice: new Prisma.Decimal(30000),
      displayOrder: 3,
      isActive: true,
    },
    {
      code: "REGULAR",
      name: "Regular",
      description: "Standard shipping.",
      estimatedDeliveryMinDay: 2,
      estimatedDeliveryMaxDay: 5,
      defaultPrice: new Prisma.Decimal(20000),
      displayOrder: 4,
      isActive: true,
    },
    {
      code: "CARGO",
      name: "Cargo",
      description: "Large or heavy items.",
      estimatedDeliveryMinDay: 3,
      estimatedDeliveryMaxDay: 7,
      defaultPrice: new Prisma.Decimal(100000),
      displayOrder: 5,
      isActive: true,
    },
    {
      code: "ECONOMY",
      name: "Economy",
      description: "Lowest shipping cost.",
      estimatedDeliveryMinDay: 5,
      estimatedDeliveryMaxDay: 10,
      defaultPrice: new Prisma.Decimal(15000),
      displayOrder: 6,
      isActive: true,
    },
  ];

  for (const service of shippingServices) {
    await prisma.shippingService.create({
      data: service,
    });
  }

  console.log(`✨ Seeding completed successfully. Seeded ${categoriesData.length} categories, ${uniqueBrands.length} brands, ${productsData.length} products, and ${shippingServices.length} shipping services.`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
