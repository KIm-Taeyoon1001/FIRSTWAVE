export type Project = {
  id: string; slug: string; name: string; tagline: string; description: string;
  category: string; platform: string; status: string; logo_url: string | null;
  screenshots: string[]; product_url: string | null; capacity: number;
  deadline: string | null; requirements: string | null; instructions: string | null;
  expected_feedback: string | null; reward: string | null; maker_id: string;
  created_at: string;
  available_positions?: number;
  application_count?: number;
  moderation_note?: string | null;
};
export type Application = { id: string; project_id: string; tester_id: string; status: string; message: string; experience: string | null; device_info: string | null; created_at: string };
