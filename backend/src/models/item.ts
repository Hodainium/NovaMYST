export type SlotType = "hat" | "shirt" | "pants" | "shoes";

export interface ItemDefinition {
  itemID: string;
  name: string;
  slot: SlotType;
  cost: number;
  set: string;
}

export interface InventoryItem {
  itemID: string;
  equipped: boolean;
}