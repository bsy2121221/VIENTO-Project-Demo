import type { Category, Department, Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, Product, ShippingAddress, StatusEvent } from '@/types'
import { ORDER_STATUSES } from '@/types'
import { addDays, calcShipping } from '@/lib/format'

const IMG = '/images/products'
const REPRESENTATIVE = 'Representative image. Final photography for this model is pending.'

export const CATEGORIES: Category[] = [
  { id: 'hand-sealers', name: 'Hand Sealers', description: 'Countertop poly sealers for shops, kitchens and small packing lines.' },
  { id: 'impulse-sealers', name: 'Impulse Sealers', description: 'Heavy-gauge impulse sealing for thicker films and longer seams.' },
  { id: 'band-sealers', name: 'Band Sealers', description: 'Continuous sealing for high-volume production and packing units.' },
  { id: 'accessories', name: 'Accessories', description: 'Teflon cloth, sealing tape and maintenance kits.' },
  { id: 'spare-parts', name: 'Spare Parts', description: 'Genuine heating elements and replacement components.' },
  { id: 'home-decor-gifts', name: 'Home Décor & Gifts', description: 'Hand-beaded cushions, placemats and table runners for homes and festive gifting.' },
  { id: 'kitchen-essentials', name: 'Kitchen Essentials', description: 'Everyday kitchenware and storage for modern Indian homes.' },
]

/** Display order here is the order used on the homepage and in the Explore menu. */
export const DEPARTMENTS: Department[] = [
  {
    id: 'home-decor-gifts',
    name: 'Home Decoration',
    description: 'Hand-beaded cushion covers, placemats and table runners that bring warmth and festive sparkle to every room.',
    categoryIds: ['home-decor-gifts'],
    image: `${IMG}/decor-runner-gold-circles.jpeg`,
  },
  {
    id: 'power-tools',
    name: 'Power Tools',
    description: 'Electric sealing machines, genuine spare parts and accessories for shops, kitchens and packing lines.',
    categoryIds: ['hand-sealers', 'impulse-sealers', 'band-sealers', 'accessories', 'spare-parts'],
    image: `${IMG}/sealer-blue-studio.jpeg`,
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    description: 'Practical kitchenware, storage and everyday essentials for modern homes.',
    categoryIds: ['kitchen-essentials'],
  },
]

const ts = '2026-10-01T09:00:00.000Z'

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'p-1001',
    slug: 'viento-poly-sealing-machine-12-orange',
    name: 'VIENTo Poly Sealing Machine 12" (Orange)',
    categoryId: 'hand-sealers',
    shortDescription: 'Countertop hand sealer with 8-level temperature control and a 12-inch seal.',
    description:
      'The VIENTo Poly Sealing Machine is built for everyday packing in retail counters, sweet shops, bakeries and home businesses. Its electronic circuit control heats instantly, so there is no warm-up time, and the timer knob lets you match heat to film thickness for a clean, airtight seal every time. The powder-coated metal body sits firmly on the bench while the lever arm closes with a light press.',
    price: 1499,
    compareAtPrice: 1999,
    stock: 42,
    lowStockThreshold: 10,
    images: [`${IMG}/sealer-orange-studio.jpeg`, `${IMG}/sealer-orange-features.jpeg`, `${IMG}/sealer-orange-kit.jpeg`, `${IMG}/sealer-orange-why.jpeg`],
    features: ['No warm-up needed: seals in 2–3 seconds', '8-level temperature adjustment for different films', 'Electronic circuit control with timer knob', 'Includes 2 free heating elements and Teflon cloth', '1-year manufacturer guarantee'],
    specs: [
      { label: 'Seal length', value: '300 mm (12")' },
      { label: 'Seal width', value: '2 mm' },
      { label: 'Power', value: '300 W' },
      { label: 'Voltage', value: '220–240 V AC, 50 Hz' },
      { label: 'Film thickness', value: 'Up to 0.15 mm' },
      { label: 'Body', value: 'Powder-coated metal' },
      { label: 'Weight', value: '2.4 kg' },
      { label: 'Warranty', value: '1 year' },
    ],
    isActive: true,
    isFeatured: true,
    sku: 'VNT-HS12-OR',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1002',
    slug: 'viento-poly-sealing-machine-12-royal-blue',
    name: 'VIENTo Poly Sealing Machine 12" (Royal Blue)',
    categoryId: 'hand-sealers',
    shortDescription: 'The same trusted 12-inch hand sealer in a royal blue finish.',
    description:
      'Our best-selling 12-inch hand sealer in a royal blue finish. It seals polythene, PP and laminated pouches for snacks, spices, dry fruits, stationery and hardware. Electronic heat control and an audible cycle indicator make it easy for new staff to get a smooth, consistent seal from the first day.',
    price: 1499,
    compareAtPrice: 1999,
    stock: 35,
    lowStockThreshold: 10,
    images: [`${IMG}/sealer-blue-studio.jpeg`, `${IMG}/sealer-blue-features.jpeg`, `${IMG}/sealer-blue-kit.jpeg`, `${IMG}/sealer-blue-guide.jpeg`],
    features: ['Instant heating with electronic circuit control', 'Adjustable timer for thin and thick films', 'Light-press lever arm with comfort grip knob', 'Includes 2 free heating elements', '1-year manufacturer guarantee'],
    specs: [
      { label: 'Seal length', value: '300 mm (12")' },
      { label: 'Seal width', value: '2 mm' },
      { label: 'Power', value: '300 W' },
      { label: 'Voltage', value: '220–240 V AC, 50 Hz' },
      { label: 'Film thickness', value: 'Up to 0.15 mm' },
      { label: 'Body', value: 'Powder-coated metal' },
      { label: 'Weight', value: '2.4 kg' },
      { label: 'Warranty', value: '1 year' },
    ],
    isActive: true,
    isFeatured: true,
    sku: 'VNT-HS12-BL',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1003',
    slug: 'viento-heavy-duty-impulse-sealer-16',
    name: 'VIENTo Heavy Duty Impulse Sealer 16"',
    categoryId: 'impulse-sealers',
    shortDescription: 'Longer 16-inch seal and wider 5 mm seam for thick and laminated bags.',
    description:
      'Designed for grocery wholesalers, rice and pulse packers and hardware suppliers, the Heavy Duty Impulse Sealer delivers a 5 mm wide seam across 16 inches. The reinforced arm and higher-wattage element handle thicker laminated films without wrinkling, and the impulse design only draws power during the sealing cycle.',
    price: 2899,
    compareAtPrice: 3499,
    stock: 8,
    lowStockThreshold: 10,
    images: [`${IMG}/sealer-orange-why.jpeg`, `${IMG}/sealer-orange-studio.jpeg`],
    imageNote: REPRESENTATIVE,
    features: ['16-inch seal length with 5 mm wide seam', 'Handles laminated and thick LDPE bags', 'Reinforced arm for continuous shift use', 'Power draw only during the sealing cycle'],
    specs: [
      { label: 'Seal length', value: '400 mm (16")' },
      { label: 'Seal width', value: '5 mm' },
      { label: 'Power', value: '600 W' },
      { label: 'Voltage', value: '220–240 V AC, 50 Hz' },
      { label: 'Film thickness', value: 'Up to 0.30 mm' },
      { label: 'Weight', value: '4.1 kg' },
      { label: 'Warranty', value: '1 year' },
    ],
    isActive: true,
    isFeatured: true,
    sku: 'VNT-IS16-HD',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1004',
    slug: 'viento-continuous-band-sealer-fr900',
    name: 'VIENTo Continuous Band Sealer FR-900',
    categoryId: 'band-sealers',
    shortDescription: 'Conveyor band sealer with digital temperature control and batch coding.',
    description:
      'The FR-900 continuous band sealer moves pouches along a conveyor while sealing, making it ideal for food processing units, pharma packers and FMCG distributors. Digital temperature control, adjustable conveyor speed and an embossed date coder keep output consistent at production volumes.',
    price: 14500,
    compareAtPrice: 16900,
    stock: 4,
    lowStockThreshold: 5,
    images: [`${IMG}/sealer-blue-features.jpeg`, `${IMG}/sealer-blue-guide.jpeg`],
    imageNote: REPRESENTATIVE,
    features: ['Continuous conveyor sealing up to 12 m/min', 'Digital temperature controller', 'Embossed batch and date coding', 'Horizontal and vertical operation'],
    specs: [
      { label: 'Sealing speed', value: '0–12 m/min' },
      { label: 'Seal width', value: '10 mm' },
      { label: 'Temperature range', value: '0–300 °C' },
      { label: 'Power', value: '770 W' },
      { label: 'Max load on conveyor', value: '3 kg' },
      { label: 'Weight', value: '28 kg' },
      { label: 'Warranty', value: '1 year' },
    ],
    isActive: true,
    isFeatured: true,
    sku: 'VNT-BS900',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1005',
    slug: 'viento-portable-sealing-machine-8',
    name: 'VIENTo Portable Sealing Machine 8"',
    categoryId: 'hand-sealers',
    shortDescription: 'Compact 8-inch sealer for home kitchens, stalls and small batches.',
    description:
      'A lighter 8-inch version of the VIENTo hand sealer for home kitchens, market stalls and exhibitions. It takes up very little counter space, packs easily into a carry bag and gives the same clean seal on snack, spice and grocery pouches.',
    price: 1099,
    compareAtPrice: 1399,
    stock: 0,
    lowStockThreshold: 10,
    images: [`${IMG}/sealer-orange-kit.jpeg`, `${IMG}/sealer-orange-studio.jpeg`],
    imageNote: REPRESENTATIVE,
    features: ['Compact 8-inch seal length', 'Lightweight and easy to carry', 'Adjustable heat for thin films', 'Ideal for home and small businesses'],
    specs: [
      { label: 'Seal length', value: '200 mm (8")' },
      { label: 'Seal width', value: '2 mm' },
      { label: 'Power', value: '200 W' },
      { label: 'Voltage', value: '220–240 V AC, 50 Hz' },
      { label: 'Weight', value: '1.5 kg' },
      { label: 'Warranty', value: '1 year' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HS08-PT',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1006',
    slug: 'viento-sealing-machine-accessories-kit',
    name: 'VIENTo Packaging Machine Accessories Kit',
    categoryId: 'accessories',
    shortDescription: 'Teflon cloth strips, heating elements and a screwdriver for routine care.',
    description:
      'Everything you need to keep a VIENTo hand sealer running smoothly: two Teflon cloth strips, two nichrome heating elements and a compact screwdriver. Replacing worn Teflon cloth keeps seals smooth and stops film from sticking to the bar.',
    price: 349,
    stock: 120,
    lowStockThreshold: 20,
    images: [`${IMG}/sealer-blue-kit.jpeg`, `${IMG}/sealer-orange-kit.jpeg`],
    features: ['2 × Teflon cloth strips', '2 × nichrome heating elements', 'Compact screwdriver included', 'Fits VIENTo 12" hand sealers'],
    specs: [
      { label: 'Compatible with', value: 'VIENTo 12" hand sealers' },
      { label: 'Contents', value: '2 Teflon strips, 2 elements, 1 screwdriver' },
      { label: 'Teflon strip size', value: '320 × 20 mm' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-ACC-KIT12',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1007',
    slug: 'viento-replacement-heating-element-12',
    name: 'VIENTo Replacement Heating Element 12" (Pack of 2)',
    categoryId: 'spare-parts',
    shortDescription: 'Genuine nichrome heating elements with a step-by-step replacement guide.',
    description:
      'Genuine VIENTo nichrome heating elements made for even heat across the full seal length. Each pack contains two elements and comes with the four-step replacement guide: loosen the screws and remove the cover, replace the heat seal strip, reset the cover and cloth, then tighten the screws.',
    price: 199,
    stock: 200,
    lowStockThreshold: 25,
    images: [`${IMG}/sealer-blue-guide.jpeg`, `${IMG}/sealer-blue-kit.jpeg`],
    features: ['Pack of 2 genuine elements', 'Even heat across the full 12" bar', 'Replace in under five minutes', 'Fits VIENTo 12" hand sealers'],
    specs: [
      { label: 'Length', value: '300 mm (12")' },
      { label: 'Width', value: '2 mm' },
      { label: 'Material', value: 'Nichrome' },
      { label: 'Pack size', value: '2 elements' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-SP-HE12',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-1008',
    slug: 'viento-teflon-cloth-tape-roll',
    name: 'VIENTo Teflon Cloth Tape Roll (10 m)',
    categoryId: 'accessories',
    shortDescription: 'Heat-resistant PTFE tape that stops film from sticking to the sealing bar.',
    description:
      'A 10-metre roll of heat-resistant PTFE-coated glass cloth tape. Cut it to length for hand, impulse and band sealers. It protects the heating element and keeps the seal surface smooth.',
    price: 249,
    stock: 64,
    lowStockThreshold: 15,
    images: [`${IMG}/sealer-orange-kit.jpeg`],
    imageNote: REPRESENTATIVE,
    features: ['10 m roll, 20 mm wide', 'Heat resistant up to 260 °C', 'Self-adhesive backing', 'Cut to any sealer length'],
    specs: [
      { label: 'Length', value: '10 m' },
      { label: 'Width', value: '20 mm' },
      { label: 'Thickness', value: '0.13 mm' },
      { label: 'Max temperature', value: '260 °C' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-ACC-PTFE10',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2001',
    slug: 'beaded-cushion-cover-palm-tree',
    name: 'Hand-Beaded Cushion Cover – Palm Tree',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Ivory cushion cover with a hand-beaded green and brown palm tree.',
    description:
      'Each cover is beaded by hand onto an ivory base to form a tall coconut palm in shades of green and brown. It adds a relaxed coastal feel to a sofa, bed or reading corner and makes a distinctive housewarming gift.',
    price: 1899,
    compareAtPrice: 2399,
    stock: 18,
    lowStockThreshold: 5,
    images: [`${IMG}/decor-cushion-palm.jpeg`],
    features: [
      'Hand-beaded palm tree motif',
      'Ivory beaded base',
      'Concealed zip closure',
      'Cover only, insert not included',
    ],
    specs: [
      { label: 'Size', value: '40 × 40 cm (16 × 16 in)' },
      { label: 'Material', value: 'Glass beads on cotton backing' },
      { label: 'Closure', value: 'Concealed zip' },
      { label: 'Care', value: 'Spot clean or dry clean only' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HD-CUSH-PALM',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2002',
    slug: 'beaded-cushion-cover-coral',
    name: 'Hand-Beaded Cushion Cover – Coral',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Sand and ivory beaded coral design with a fine bronze outline.',
    description:
      'A branching coral pattern beaded in warm sand tones on an ivory base, edged with a fine bronze outline. The neutral palette suits modern and classic interiors alike.',
    price: 1899,
    compareAtPrice: 2399,
    stock: 22,
    lowStockThreshold: 5,
    images: [`${IMG}/decor-cushion-coral.jpeg`],
    features: [
      'Hand-beaded coral motif',
      'Neutral sand, ivory and bronze palette',
      'Concealed zip closure',
      'Cover only, insert not included',
    ],
    specs: [
      { label: 'Size', value: '40 × 40 cm (16 × 16 in)' },
      { label: 'Material', value: 'Glass beads on cotton backing' },
      { label: 'Closure', value: 'Concealed zip' },
      { label: 'Care', value: 'Spot clean or dry clean only' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HD-CUSH-CORAL',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2003',
    slug: 'beaded-placemat-christmas-tree',
    name: 'Beaded Round Placemat – Christmas Tree',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Festive red placemat with white beaded trees, a star and a dove.',
    description:
      'A round red placemat hand-beaded with white Christmas trees, a star and a dove. Use it under dinner plates during the holidays or beneath a centrepiece. It also makes a cheerful festive gift.',
    price: 699,
    compareAtPrice: 899,
    stock: 40,
    lowStockThreshold: 10,
    images: [`${IMG}/decor-placemat-christmas.jpeg`],
    features: [
      'Hand-beaded festive design',
      'Red and white colourway',
      'Felt-backed to protect tables',
      'Doubles as a centrepiece base',
    ],
    specs: [
      { label: 'Diameter', value: '35 cm (14 in)' },
      { label: 'Material', value: 'Glass beads, felt backing' },
      { label: 'Pieces', value: '1' },
      { label: 'Care', value: 'Wipe with a damp cloth' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HD-PM-XMAS',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2004',
    slug: 'beaded-placemat-emerald-serpent',
    name: 'Beaded Round Placemat – Emerald Serpent',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Shimmering emerald bugle beads with a coiled gold serpent.',
    description:
      'Emerald bugle beads form the base of this statement placemat, with a coiled serpent worked in gold beads. It brings a bold, luxurious look to dinner parties and festive tables.',
    price: 899,
    compareAtPrice: 1099,
    stock: 25,
    lowStockThreshold: 6,
    images: [`${IMG}/decor-placemat-serpent.jpeg`],
    features: [
      'Hand-beaded emerald and gold design',
      'Shimmering bugle-bead finish',
      'Felt-backed to protect tables',
      'Statement piece for festive tables',
    ],
    specs: [
      { label: 'Diameter', value: '35 cm (14 in)' },
      { label: 'Material', value: 'Glass bugle beads, felt backing' },
      { label: 'Pieces', value: '1' },
      { label: 'Care', value: 'Wipe with a damp cloth' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HD-PM-SERP',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2005',
    slug: 'beaded-placemat-ivory-gold-fern',
    name: 'Beaded Round Placemat – Ivory & Gold Fern',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Pearl-ivory beads with sweeping gold fern leaves.',
    description:
      'An elegant round placemat in pearl-ivory beads with sweeping gold fern leaves. It suits weddings, festive dinners and everyday tables that need a little sparkle.',
    price: 799,
    compareAtPrice: 999,
    stock: 30,
    lowStockThreshold: 8,
    images: [`${IMG}/decor-placemat-fern-ivory.jpeg`],
    features: [
      'Hand-beaded gold fern motif',
      'Pearl-ivory base',
      'Felt-backed to protect tables',
      'Pairs with gold and white tableware',
    ],
    specs: [
      { label: 'Diameter', value: '35 cm (14 in)' },
      { label: 'Material', value: 'Glass beads, felt backing' },
      { label: 'Pieces', value: '1' },
      { label: 'Care', value: 'Wipe with a damp cloth' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HD-PM-FERN',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2006',
    slug: 'beaded-table-set-black-gold-fern',
    name: 'Beaded Table Set – Black & Gold Fern (Runner + 4 Mats)',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Matching runner and four placemats in black with gold beaded fern leaves.',
    description:
      'A coordinated dining set with one table runner and four rectangular placemats, each hand-beaded with gold fern leaves on a black base. It dresses a four-seater dining table in one go and makes a generous wedding or housewarming gift.',
    price: 4499,
    compareAtPrice: 5499,
    stock: 10,
    lowStockThreshold: 3,
    images: [`${IMG}/decor-table-set-fern-black.jpeg`],
    features: [
      '1 table runner and 4 placemats',
      'Hand-beaded gold fern motif on black',
      'Felt-backed to protect tables',
      'Gift-ready set',
    ],
    specs: [
      { label: 'Runner', value: '90 × 35 cm' },
      { label: 'Placemats', value: '45 × 30 cm each' },
      { label: 'Pieces', value: '5' },
      { label: 'Material', value: 'Glass beads, felt backing' },
      { label: 'Care', value: 'Wipe with a damp cloth' },
    ],
    isActive: true,
    isFeatured: false,
    sku: 'VNT-HD-SET-FERN',
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'p-2007',
    slug: 'beaded-table-runner-gold-circles',
    name: 'Beaded Table Runner – Gold & Ivory Circles',
    categoryId: 'home-decor-gifts',
    shortDescription: 'Interlinked gold and ivory beaded circles in a sculpted runner.',
    description:
      'A sculpted table runner made from interlinked circles of gold and ivory beads. Lay it down the centre of a dining or console table under candles, vases or a festive centrepiece.',
    price: 2499,
    compareAtPrice: 2999,
    stock: 14,
    lowStockThreshold: 4,
    images: [`${IMG}/decor-runner-gold-circles.jpeg`],
    features: [
      'Hand-beaded interlinked circle design',
      'Gold and ivory colourway',
      'Felt-backed to protect tables',
      'Sized for 4 to 6 seater tables',
    ],
    specs: [
      { label: 'Size', value: '100 × 35 cm (approx.)' },
      { label: 'Material', value: 'Glass beads, felt backing' },
      { label: 'Pieces', value: '1' },
      { label: 'Care', value: 'Wipe with a damp cloth' },
    ],
    isActive: true,
    isFeatured: true,
    sku: 'VNT-HD-RUN-GOLD',
    createdAt: ts,
    updatedAt: ts,
  },
]

/** Demo-only baseline monthly revenue used to give the sales chart history. */
export const MOCK_MONTHLY_REVENUE = [38400, 45200, 41800, 52600, 58900, 31200]

type SeedOrderSpec = {
  daysAgo: number
  customer: ShippingAddress
  items: Array<[productId: string, qty: number]>
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
}

const seedSpecs: SeedOrderSpec[] = [
  {
    daysAgo: 1,
    customer: { fullName: 'Ananya Iyer (Demo)', email: 'ananya.demo@example.com', phone: '9876500011', addressLine1: '14, 2nd Cross, Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038' },
    items: [['p-1001', 1], ['p-1007', 2]],
    status: 'Order Placed',
    paymentMethod: 'cod',
    paymentStatus: 'Pending',
  },
  {
    daysAgo: 2,
    customer: { fullName: 'Rahul Mehta (Demo)', email: 'rahul.demo@example.com', phone: '9876500022', addressLine1: 'Shop 7, Crawford Market', city: 'Mumbai', state: 'Maharashtra', postalCode: '400001' },
    items: [['p-1003', 2]],
    status: 'Confirmed',
    paymentMethod: 'demo-upi',
    paymentStatus: 'Paid',
  },
  {
    daysAgo: 4,
    customer: { fullName: 'Sri Lakshmi Sweets (Demo)', email: 'srilakshmi.demo@example.com', phone: '9876500033', addressLine1: '22, Ranganathan Street, T. Nagar', city: 'Chennai', state: 'Tamil Nadu', postalCode: '600017' },
    items: [['p-1002', 3], ['p-1006', 3]],
    status: 'Processing',
    paymentMethod: 'demo-card',
    paymentStatus: 'Paid',
  },
  {
    daysAgo: 6,
    customer: { fullName: 'Karan Spices (Demo)', email: 'karan.demo@example.com', phone: '9876500044', addressLine1: 'Plot 31, Sector 18', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301' },
    items: [['p-1004', 1]],
    status: 'Shipped',
    paymentMethod: 'demo-card',
    paymentStatus: 'Paid',
  },
  {
    daysAgo: 11,
    customer: { fullName: 'Priya Nair (Demo)', email: 'priya.demo@example.com', phone: '9876500055', addressLine1: 'Flat 3B, Marine Drive Residency', city: 'Kochi', state: 'Kerala', postalCode: '682031' },
    items: [['p-1001', 1], ['p-1008', 1]],
    status: 'Delivered',
    paymentMethod: 'demo-upi',
    paymentStatus: 'Paid',
  },
  {
    daysAgo: 15,
    customer: { fullName: 'Gupta Dry Fruits (Demo)', email: 'gupta.demo@example.com', phone: '9876500066', addressLine1: '5, Khari Baoli', city: 'New Delhi', state: 'Delhi', postalCode: '110006' },
    items: [['p-1002', 2], ['p-1003', 1], ['p-1007', 4]],
    status: 'Delivered',
    paymentMethod: 'cod',
    paymentStatus: 'Paid',
  },
]

const STATUS_NOTES: Record<OrderStatus, string> = {
  'Order Placed': 'Order received and awaiting confirmation.',
  Confirmed: 'Order confirmed by the VIENTo team.',
  Processing: 'Items are being quality-checked and packed.',
  Shipped: 'Handed over to the courier partner.',
  Delivered: 'Delivered to the customer.',
}

export const statusNote = (status: OrderStatus) => STATUS_NOTES[status]

export const buildHistory = (createdAt: string, status: OrderStatus): StatusEvent[] => {
  const upto = ORDER_STATUSES.indexOf(status)
  return ORDER_STATUSES.slice(0, upto + 1).map((s, i) => ({ status: s, at: addDays(createdAt, i), note: STATUS_NOTES[s] }))
}

export const createSeedOrders = (now = new Date()): Order[] =>
  seedSpecs.map((spec, index) => {
    const created = new Date(now)
    created.setDate(created.getDate() - spec.daysAgo)
    created.setHours(10 + index, 15, 0, 0)
    const createdAt = created.toISOString()
    const items: OrderItem[] = spec.items.map(([productId, quantity]) => {
      const p = SEED_PRODUCTS.find((x) => x.id === productId)!
      return { productId, name: p.name, sku: p.sku, image: p.images[0], unitPrice: p.price, quantity }
    })
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
    const shipping = calcShipping(subtotal)
    const seq = String(4821 + index * 37)
    return {
      id: `o-seed-${index + 1}`,
      orderNumber: `VNT-${seq}-DEMO`,
      trackingNumber: `VTRK${seq}0${index + 3}IN`,
      createdAt,
      customer: spec.customer,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      paymentMethod: spec.paymentMethod,
      paymentStatus: spec.paymentStatus,
      status: spec.status,
      statusHistory: buildHistory(createdAt, spec.status),
      estimatedDelivery: addDays(createdAt, 5),
      carrier: 'VIENTo Demo Logistics',
    }
  })

export const DEMO_TESTIMONIALS = [
  { name: 'Meera K.', business: 'Home bakery, Pune', quote: 'Our cookie pouches finally look shop-ready. The seal is neat and the machine heats up in seconds.' },
  { name: 'Imran S.', business: 'Dry fruit wholesaler, Hyderabad', quote: 'We pack close to 400 bags a day. The heavy duty sealer handles thick laminated film without any wrinkles.' },
  { name: 'Lakshmi R.', business: 'Spice exporter, Kochi', quote: 'The spare elements in the box and the simple replacement guide meant zero downtime in our first year.' },
]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'demo-card': 'Simulated Card Payment (Demo)',
  'demo-upi': 'Simulated UPI Payment (Demo)',
  cod: 'Cash on Delivery (Demo)',
}
