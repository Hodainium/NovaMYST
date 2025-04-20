export type SlotType = "hat" | "shirt" | "pants";

export interface ItemDefinition {
  itemID: string;
  name: string;
  emoji: string;
  slot: SlotType;
  cost: number;
}

export interface InventoryItem {
  itemID: string;
  equipped: boolean;
}