import { FloorPlan } from "./store";

export interface RoomTemplate {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  plan: FloorPlan;
}

export const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: "studio_1r1b",
    name: "Studio Suite (1R1B)",
    category: "Apartment",
    icon: "🏢",
    description: "Pelan studio kompak lengkap dengan zon tidur, ruang tamu terbuka, dan bilik air.",
    plan: {
      walls: [
        // Outer boundary (520x460)
        { id: "w1", x1: 80, y1: 80, x2: 600, y2: 80 },
        { id: "w2", x1: 600, y1: 80, x2: 600, y2: 480 },
        { id: "w3", x1: 600, y1: 480, x2: 80, y2: 480 },
        { id: "w4", x1: 80, y1: 480, x2: 80, y2: 80 },
        // Dividers
        { id: "w5", x1: 360, y1: 80, x2: 360, y2: 280 }, // living / bedroom divider
        { id: "w6", x1: 440, y1: 280, x2: 600, y2: 280 }, // bathroom top
        { id: "w7", x1: 440, y1: 280, x2: 440, y2: 480 }, // bathroom left
      ],
      doors: [
        { id: "d1", x: 160, y: 80, rotation: 0 }, // main door
        { id: "d2", x: 440, y: 360, rotation: 90 }, // bathroom door
      ],
      windows: [
        { id: "wn1", x: 240, y: 480, rotation: 0 }, // living window
        { id: "wn2", x: 520, y: 80, rotation: 0 }, // bedroom window
      ],
      roomLabels: [
        { id: "rl1", x: 220, y: 200, type: "living_room" },
        { id: "rl2", x: 480, y: 180, type: "bedroom" },
        { id: "rl3", x: 520, y: 380, type: "bathroom" },
        { id: "rl4", x: 220, y: 380, type: "dining_room" },
      ],
      furniture: [
        { id: "f1", product_id: "RUMA-SOFA-01", name: "Sofa", icon: "🛋️", x: 200, y: 240, annotation: "Cozy Angle" },
        { id: "f2", product_id: "RUMA-TV-01", name: "TV", icon: "📺", x: 200, y: 140, annotation: "Glare-Free" },
        { id: "f3", product_id: "RUMA-BED-01", name: "Bed", icon: "🛏️", x: 500, y: 180, annotation: "Quiet Zone" },
        { id: "f4", product_id: "RUMA-WIFI-01", name: "WiFi Router", icon: "📡", x: 360, y: 160, annotation: "Full Reach" },
      ],
    },
  },
  {
    id: "master_bedroom_suite",
    name: "Master Bedroom Suite",
    category: "Residential",
    icon: "🛏️",
    description: "Bilik tidur utama mewah dengan bilik persalinan (walk-in wardrobe) & bilik air en-suite.",
    plan: {
      walls: [
        // Outer boundary
        { id: "mw1", x1: 80, y1: 80, x2: 640, y2: 80 },
        { id: "mw2", x1: 640, y1: 80, x2: 640, y2: 500 },
        { id: "mw3", x1: 640, y1: 500, x2: 80, y2: 500 },
        { id: "mw4", x1: 80, y1: 500, x2: 80, y2: 80 },
        // En-suite & Wardrobe partition
        { id: "mw5", x1: 440, y1: 80, x2: 440, y2: 300 },
        { id: "mw6", x1: 440, y1: 300, x2: 640, y2: 300 },
      ],
      doors: [
        { id: "md1", x: 160, y: 500, rotation: 180 }, // entry door
        { id: "md2", x: 440, y: 200, rotation: 90 }, // en-suite door
      ],
      windows: [
        { id: "mwn1", x: 260, y: 80, rotation: 0 },
        { id: "mwn2", x: 80, y: 280, rotation: 90 },
      ],
      roomLabels: [
        { id: "mrl1", x: 260, y: 280, type: "bedroom" },
        { id: "mrl2", x: 540, y: 180, type: "bathroom" },
      ],
      furniture: [
        { id: "mf1", product_id: "RUMA-BED-01", name: "Bed", icon: "🛏️", x: 260, y: 280, annotation: "Feng Shui Headboard" },
        { id: "mf2", product_id: "RUMA-WARDROBE-01", name: "Wardrobe", icon: "🗄️", x: 540, y: 400, annotation: "Spacious Walkway" },
        { id: "mf3", product_id: "RUMA-FAN-01", name: "Ceiling Fan", icon: "🌀", x: 260, y: 280, annotation: "Even Cooling" },
        { id: "mf4", product_id: "RUMA-SENSOR-01", name: "Smart Sensor", icon: "🌡️", x: 120, y: 120, annotation: "Climate Monitoring" },
      ],
    },
  },
  {
    id: "open_living_dining",
    name: "Open Living & Dining Lounge",
    category: "Lounge",
    icon: "🛋️",
    description: "Ruang tamu dan ruang makan berkonsep terbuka untuk interaksi keluarga maksimum.",
    plan: {
      walls: [
        { id: "ow1", x1: 80, y1: 80, x2: 660, y2: 80 },
        { id: "ow2", x1: 660, y1: 80, x2: 660, y2: 480 },
        { id: "ow3", x1: 660, y1: 480, x2: 80, y2: 480 },
        { id: "ow4", x1: 80, y1: 480, x2: 80, y2: 80 },
        // Semi-divider kitchen nook
        { id: "ow5", x1: 440, y1: 80, x2: 440, y2: 240 },
      ],
      doors: [
        { id: "od1", x: 140, y: 480, rotation: 180 },
      ],
      windows: [
        { id: "own1", x: 280, y: 80, rotation: 0 },
        { id: "own2", x: 660, y: 280, rotation: 90 },
      ],
      roomLabels: [
        { id: "orl1", x: 240, y: 260, type: "living_room" },
        { id: "orl2", x: 540, y: 160, type: "kitchen" },
        { id: "orl3", x: 540, y: 360, type: "dining_room" },
      ],
      furniture: [
        { id: "of1", product_id: "RUMA-SOFA-01", name: "Sofa", icon: "🛋️", x: 240, y: 320, annotation: "Lounge Center" },
        { id: "of2", product_id: "RUMA-TV-01", name: "TV", icon: "📺", x: 240, y: 140, annotation: "Cinematic Arc" },
        { id: "of3", product_id: "RUMA-TABLE-01", name: "Coffee Table", icon: "☕", x: 240, y: 230, annotation: "Conversational Hub" },
        { id: "of4", product_id: "DAPUR-HOOD-01", name: "Hood", icon: "🔥", x: 540, y: 120, annotation: "Exhaust Line" },
        { id: "of5", product_id: "DAPUR-HOB-01", name: "Hob", icon: "🍳", x: 540, y: 180, annotation: "Culinary Triangle" },
        { id: "of6", product_id: "RUMA-WIFI-01", name: "WiFi Router", icon: "📡", x: 440, y: 260, annotation: "Mesh Apex" },
      ],
    },
  },
  {
    id: "executive_soho",
    name: "Executive SOHO & Studio",
    category: "Workspace",
    icon: "💼",
    description: "Ruang pejabat rumah pintar (SOHO) dioptimumkan untuk fokus, mesyuarat video, dan zon rehat.",
    plan: {
      walls: [
        { id: "sw1", x1: 100, y1: 80, x2: 620, y2: 80 },
        { id: "sw2", x1: 620, y1: 80, x2: 620, y2: 480 },
        { id: "sw3", x1: 620, y1: 480, x2: 100, y2: 480 },
        { id: "sw4", x1: 100, y1: 480, x2: 100, y2: 80 },
        // Meeting nook divider
        { id: "sw5", x1: 380, y1: 260, x2: 620, y2: 260 },
      ],
      doors: [
        { id: "sd1", x: 180, y: 480, rotation: 180 },
      ],
      windows: [
        { id: "swn1", x: 240, y: 80, rotation: 0 },
        { id: "swn2", x: 520, y: 80, rotation: 0 },
      ],
      roomLabels: [
        { id: "srl1", x: 240, y: 260, type: "living_room" },
        { id: "srl2", x: 500, y: 160, type: "bedroom" },
        { id: "srl3", x: 500, y: 380, type: "dining_room" },
      ],
      furniture: [
        { id: "sf1", product_id: "RUMA-TV-01", name: "Display Screen", icon: "📺", x: 240, y: 120, annotation: "Presentation Display" },
        { id: "sf2", product_id: "RUMA-WIFI-01", name: "WiFi 6E Router", icon: "📡", x: 380, y: 260, annotation: "Low Latency Gateway" },
        { id: "sf3", product_id: "RUMA-SOFA-01", name: "Executive Lounge", icon: "🛋️", x: 240, y: 360, annotation: "Client Seating" },
        { id: "sf4", product_id: "RUMA-TABLE-01", name: "Meeting Table", icon: "☕", x: 500, y: 380, annotation: "Strategy Hub" },
        { id: "sf5", product_id: "RUMA-FAN-01", name: "Smart Fan", icon: "🌀", x: 240, y: 240, annotation: "Whisper-Quiet Airflow" },
      ],
    },
  },
];
