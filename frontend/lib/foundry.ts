const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeFloorplan(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/api/analyze-floorplan`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to analyze floorplan");
  }

  return response.json();
}

export async function generateLayout(rooms: any[], imagePath?: string) {
  const response = await fetch(`/api/generate-layout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rooms, image_path: imagePath }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate layout");
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
