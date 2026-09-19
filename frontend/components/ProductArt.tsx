import { Armchair, BedDouble, CookingPot, Fan, LampCeiling, Microwave, Monitor, Radio, Refrigerator, Router, Table2, WashingMachine, DoorClosed } from "lucide-react";

export default function ProductArt({ sku, className = "w-10 h-10" }: { sku: string; className?: string }) {
  const kind = sku.split("-")[1];
  const icons = { SOFA: Armchair, BED: BedDouble, HOB: CookingPot, FAN: Fan, HOOD: LampCeiling, TV: Monitor, SENSOR: Radio, FRIDGE: Refrigerator, WIFI: Router, MESH: Router, TABLE: Table2, DISHWASHER: WashingMachine, WARDROBE: DoorClosed };
  const Icon = icons[kind as keyof typeof icons] ?? Microwave;
  return <Icon className={className} strokeWidth={1.4} aria-hidden="true" />;
}
