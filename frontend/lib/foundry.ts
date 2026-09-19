export async function suggestFurniture(floorPlan: {
  walls: { id: string; x1: number; y1: number; x2: number; y2: number }[];
  roomLabels: { id: string; x: number; y: number; type: string }[];
  canvas_width: number;
  canvas_height: number;
  style_preset?: string;
  style_prompt?: string;
}) {
  const response = await fetch("/api/suggest-furniture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(floorPlan),
  });

  if (!response.ok) {
    throw new Error("Failed to get furniture suggestions");
  }

  return response.json();
}

export async function createProposal(layout: any, imageUrl?: string) {
  const response = await fetch(`/api/proposal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, image_url: imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to create proposal");
  }

  return response.json();
}

export async function getProposal(id: string) {
  const response = await fetch(`/api/proposal/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error("Proposal not found");
  }

  return response.json();
}
