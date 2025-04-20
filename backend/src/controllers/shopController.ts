import { Request, Response } from 'express';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '../index';
import { ItemDefinition, InventoryItem } from '../models/item';
import { User, EquippedSlots } from '../models/user';

export const getShopItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const shopSnap = await db.collection('shop_items').get();
    const itemIDs = shopSnap.docs.map((doc: QueryDocumentSnapshot<ItemDefinition>) => doc.data().itemID);

    const items: ItemDefinition[] = [];

    for (const id of itemIDs) {
      const defSnap = await db.collection('item_definitions').doc(id).get();
      if (defSnap.exists) {
        items.push(defSnap.data() as ItemDefinition);
      }
    }

    res.json(items);
  } catch (err) {
    console.error("Failed to fetch shop items:", err);
    res.status(500).json({ error: "Failed to fetch shop items" });
  }
};

export const purchaseItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { itemID } = req.params;
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() as User;

    const storeItemSnap = await db.collection('shop_items').doc(itemID).get();
    if (!storeItemSnap.exists) res.status(404).json({ error: "Item not in store" });

    const itemSnap = await db.collection('item_definitions').doc(itemID).get();
    if (!itemSnap.exists) res.status(404).json({ error: "Item not found" });

    const item = itemSnap.data() as ItemDefinition;

    if ((userData.coins || 0) < item.cost) {
      res.status(400).json({ error: "Insufficient coins" });
    }

    const alreadyOwned = (userData.inventory || []).some((i: InventoryItem) => i.itemID === itemID);
    if (alreadyOwned) {
      res.status(400).json({ error: "You already own this item" });
    }

    const updatedInventory = [...(userData.inventory || []), { itemID, equipped: false }];
    const updatedCoins = userData.coins - item.cost;

    await userRef.update({
      coins: updatedCoins,
      inventory: updatedInventory
    });

    res.json({ message: "Item purchased", newCoinBalance: updatedCoins });
  } catch (err) {
    res.status(500).json({ error: "Failed to purchase item" });
  }
};

export const equipItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { itemID } = req.params;
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data() as User;

    const itemSnap = await db.collection('item_definitions').doc(itemID).get();
    if (!itemSnap.exists) res.status(404).json({ error: "Item not found" });

    const item = itemSnap.data() as ItemDefinition;

    const hasItem = (userData.inventory || []).some((i: InventoryItem) => i.itemID === itemID);
    if (!hasItem) res.status(403).json({ error: "Item not in inventory" });

    const equipped: EquippedSlots = {
      hat: userData.equipped?.hat || null,
      shirt: userData.equipped?.shirt || null,
      pants: userData.equipped?.pants || null,
    };

    equipped[item.slot] = itemID;

    await userRef.update({ equipped });

    res.json({ message: `Equipped ${item.slot}`, equipped });
  } catch (err) {
    res.status(500).json({ error: "Failed to equip item" });
  }
};
