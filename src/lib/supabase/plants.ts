import { createClient } from "@/lib/supabase/server";
import type { PlantInsert, PlantUpdate } from "@/types/plant";

export async function getPlants() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Not authenticated") };
  }

  const { data, error } = await supabase
    .from("plants")
    .select("id, name, x_position, y_position, growth_stage, user_id, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return { data, error };
}

export async function getPlantById(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Not authenticated") };
  }

  const { data, error } = await supabase
    .from("plants")
    .select("id, name, x_position, y_position, growth_stage, user_id, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  return { data, error };
}

export async function createPlant(plant: PlantInsert) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Not authenticated") };
  }

  const { data, error } = await supabase
    .from("plants")
    .insert({
      user_id: user.id,
      name: plant.name,
      x_position: plant.x_position ?? 0,
      y_position: plant.y_position ?? 0,
      growth_stage: plant.growth_stage ?? 0,
    })
    .select("id, name, x_position, y_position, growth_stage, user_id, created_at, updated_at")
    .single();

  return { data, error };
}

export async function updatePlant(id: string, updates: PlantUpdate) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Not authenticated") };
  }

  const { data, error } = await supabase
    .from("plants")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, x_position, y_position, growth_stage, user_id, created_at, updated_at")
    .single();

  return { data, error };
}

export async function deletePlant(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Not authenticated") };
  }

  const { error } = await supabase
    .from("plants")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return { error };
}

export async function updatePlantPosition(
  id: string,
  x_position: number,
  y_position: number,
) {
  return updatePlant(id, { x_position, y_position });
}

export async function updatePlantGrowthStage(id: string, growth_stage: number) {
  return updatePlant(id, { growth_stage });
}
