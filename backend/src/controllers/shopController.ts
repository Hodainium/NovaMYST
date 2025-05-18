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
      const { itemID } = req.params;
      const user = (req as any).user;
  
      const itemSnap = await db.collection('item_definitions').doc(itemID).get();
      if (!itemSnap.exists) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
  
      const item = itemSnap.data()!;
      const userRef = db.collection('users').doc(user.uid);
      const userSnap = await userRef.get();
      const userData = userSnap.data();
  
      if ((userData.coins || 0) < item.cost) {
        res.status(400).json({ error: 'Insufficient coins' });
        return;
      }
  
      const inventory = userData.inventory || [];
      const alreadyOwned = inventory.some((i: any) => i.itemID === itemID);
      if (alreadyOwned) {
        res.status(400).json({ error: 'Item already owned' });
        return;
      }
  
      inventory.push({ itemID, equipped: false });
  
      await userRef.update({
        coins: userData.coins - item.cost,
        inventory
      });
  
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
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
      shoes: userData.equipped?.shoes || null,
    };

    equipped[item.slot] = itemID;

    await userRef.update({ equipped });

    res.json({ message: `Equipped ${item.slot}`, equipped });
  } catch (err) {
    res.status(500).json({ error: "Failed to equip item" });
  }
};

export const unequipSlot = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const slot = req.params.slot;

      console.log("User UID:", user.uid);
      console.log("Slot to unequip:", slot);
  
      const userRef = db.collection('users').doc(user.uid);
      await userRef.update({
        [`equipped.${slot}`]: null
      });
      
      console.log(`Successfully unequipped slot: ${slot}`);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to unequip slot:", err);
      res.status(500).json({ error: "Failed to unequip slot" });
    }
  };
