export type Plant = {
  id: string;
  user_id: string;
  name: string;
  x_position: number;
  y_position: number;
  growth_stage: number;
  created_at?: string;
  updated_at?: string;
};

export type PlantInsert = {
  name: string;
  x_position?: number;
  y_position?: number;
  growth_stage?: number;
};

export type PlantUpdate = Partial<
  Pick<Plant, "name" | "x_position" | "y_position" | "growth_stage">
>;
