import { FloorPlan, LayoutData } from "./store";

export const MOCK_FLOOR_PLAN: FloorPlan = {
  walls: [
    // Outer boundary
    { id: "w1",  x1: 60,  y1: 60,  x2: 540, y2: 60  },
    { id: "w2",  x1: 540, y1: 60,  x2: 540, y2: 500 },
    { id: "w3",  x1: 540, y1: 500, x2: 60,  y2: 500 },
    { id: "w4",  x1: 60,  y1: 500, x2: 60,  y2: 60  },
    // Internal dividers
    { id: "w5",  x1: 300, y1: 60,  x2: 300, y2: 280 }, // kitchen / living divider
    { id: "w6",  x1: 60,  y1: 280, x2: 540, y2: 280 }, // upper / lower divider
    { id: "w7",  x1: 300, y1: 280, x2: 300, y2: 500 }, // bedroom / bathroom divider
  ],
  doors: [
    { id: "d1", x: 180, y: 60,  rotation: 0   }, // front door
    { id: "d2", x: 300, y: 180, rotation: 90  }, // kitchen door
    { id: "d3", x: 180, y: 280, rotation: 180 }, // bedroom door
    { id: "d4", x: 420, y: 280, rotation: 180 }, // bathroom door
  ],
  windows: [
    { id: "wn1", x: 420, y: 60,  rotation: 0  },
    { id: "wn2", x: 60,  y: 180, rotation: 90 },
    { id: "wn3", x: 540, y: 380, rotation: 90 },
  ],
  roomLabels: [
    { id: "rl1", x: 420, y: 160, type: "kitchen"     },
    { id: "rl2", x: 180, y: 160, type: "living_room" },
    { id: "rl3", x: 180, y: 390, type: "bedroom"     },
    { id: "rl4", x: 420, y: 390, type: "bathroom"    },
  ],
  furniture: [
    { id: "f1",  product_id: "RUMA-SOFA-01",   name: "Sofa",        icon: "🛋️", x: 160, y: 200, annotation: "Optimal Viewing"   },
    { id: "f2",  product_id: "RUMA-TV-01",     name: "TV",          icon: "📺", x: 160, y: 100, annotation: "Glare-Free"         },
    { id: "f3",  product_id: "RUMA-WIFI-01",    name: "WiFi Router", icon: "📡", x: 240, y: 160, annotation: "WiFi Optimal"       },
    { id: "f4",  product_id: "DAPUR-HOOD-01",   name: "Hood",        icon: "🔥", x: 420, y: 100, annotation: "Airflow Optimized"  },
    { id: "f5",  product_id: "DAPUR-HOB-01",    name: "Hob",         icon: "🍳", x: 380, y: 140, annotation: "Work Triangle"      },
    { id: "f6",  product_id: "DAPUR-FRIDGE-01", name: "Fridge",      icon: "🧊", x: 480, y: 100, annotation: "Entry Accessible"   },
    { id: "f7",  product_id: "RUMA-BED-01",     name: "Bed",         icon: "🛏️", x: 160, y: 420, annotation: "Headboard vs Wall" },
    { id: "f8",  product_id: "RUMA-WARDROBE-01",      name: "Wardrobe",    icon: "🗄️", x: 100, y: 340, annotation: "60cm Clearance"    },
  ],
};

export const MOCK_LAYOUT_DATA: LayoutData = {
  layout_id: "demo-ruma-2026",
  score: 98,
  smart_optimizations: [
    {
      type: "airflow",
      title: "Optimized Airflow",
      desc: "Hood diletak berhampiran tingkap untuk ventilasi 30% lebih baik. Work triangle dijaga di bawah 6m.",
    },
    {
      type: "wifi",
      title: "Dead Zone Elimination",
      desc: "Router dipusatkan — liputan WiFi 6E penuh merentasi semua bilik.",
    },
    {
      type: "traffic",
      title: "Traffic Flow Clear",
      desc: "Laluan 90cm tanpa halangan dari pintu masuk ke semua zon.",
    },
  ],
  bundle: {
    products: [
      { id: "DAPUR-HOOD-01",  name: "Dapur Works Smart Hood X5",             price: 1299, original_price: 1599, thumbnail: "/products/dapur-hood-x5.jpg",  sku: "DAPUR-HOOD-01"  },
      { id: "DAPUR-HOB-01",   name: "Dapur Works Gas Hob G4 Pro",            price: 899,  original_price: 1099, thumbnail: "/products/dapur-hob-g4.jpg",   sku: "DAPUR-HOB-01"   },
      { id: "DAPUR-FRIDGE-01",name: "Dapur Works Side-by-Side Fridge S2",    price: 2499, original_price: 2999, thumbnail: "/products/dapur-fridge-s2.jpg",sku: "DAPUR-FRIDGE-01"},
      { id: "RUMA-WIFI-01",   name: "Ruma Living Smart WiFi Router R1",  price: 349,  original_price: 449,  thumbnail: "/products/ruma-wifi-01.jpg",    sku: "RUMA-WIFI-01"   },
      { id: "RUMA-SOFA-01",   name: "Ruma Living L-Shape Sofa L2",       price: 1899, original_price: 2399, thumbnail: "/products/ruma-sofa-01.jpg",    sku: "RUMA-SOFA-01"   },
      { id: "RUMA-TV-01",    name: 'Ruma Living 65" Smart TV X-Series', price: 2199, original_price: 2699, thumbnail: "/products/ruma-tv-01.jpg",     sku: "RUMA-TV-01"    },
      { id: "RUMA-BED-01",    name: "Ruma Living King Bed Frame K1",      price: 1499, original_price: 1899, thumbnail: "/products/ruma-bed-01.jpg",     sku: "RUMA-BED-01"    },
      { id: "RUMA-WARDROBE-01",     name: "Ruma Living Sliding Wardrobe S3",   price: 1799, original_price: 2199, thumbnail: "/products/ruma-wardrobe-01.jpg",      sku: "RUMA-WARDROBE-01"     },
    ],
    total_original: 16341,
    total_discounted: 12442,
  },
};
