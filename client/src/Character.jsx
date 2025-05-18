import "./Character.css";
import { useState, useEffect, useContext } from 'react';
import { DarkModeContext } from './DarkMode';
import { auth } from "./firebase";
import male from './assets/male_model.png';
import female from './assets/female_model.png';
import chains from './assets/Chains.png';
import knightHelmet from './assets/knightHelmetModel.png';
import knightChest from './assets/knightChestModel.png';
import knightPants from './assets/knightPantsModel.png';
import knightShoes from './assets/knightShoesModel.png';
import princessTiara from './assets/princessTiaraModel.png';
import princessDress from './assets/princessDressModel.png';
import princessPants from './assets/princessPantsModel.png';
import princessHeels from './assets/princessHeelsModel.png';
import cowboyHat from './assets/cowboyHatModel.png';
import cowboyVest from './assets/cowboyVestModel.png';
import cowboyPants from './assets/cowboyPantsModel.png';
import cowboySpurs from './assets/cowboySpursModel.png';

function Character() {
  const { darkMode } = useContext(DarkModeContext);
  const [gender, setGender] = useState("Male");
  const [playerCoins, setCoins] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({ hat: null, shirt: null, pants: null, shoes: null });
  const [isPurchaseModalOpen, setIsPurchaseOpen] = useState(false);
  const [CanBuy, setCanBuy] = useState(false);
  const [CannotBuy, setCannotBuy] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState(null);
  const [loading, setLoading] = useState(true);

  const ownsItem = (itemID) => inventory.some(i => i.itemID === itemID);

  const fetchCharacterData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/user/character`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCoins(data.coins);
    setInventory(data.inventory);
    setEquipped(data.equipped);
    setGender(data.gender || "Male");
    setLoading(false);
  };

  useEffect(() => {
    fetchCharacterData();
  }, []);

  const handleClose = () => {
    setIsPurchaseOpen(false);
    setCanBuy(false);
    setCannotBuy(false);
  };

  const clearEquippedSlot = async (slot) => {
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/shop/unequip/${slot}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("clearEquippedSlot response:", data);
      } catch (err) {
        console.error("Failed to clear slot:", err);
      }
  };

  const handlePurchase = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/shop/purchase/${selectedItemID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      await fetchCharacterData();
      setCanBuy(true);
    } else {
      setCannotBuy(true);
    }

    setIsPurchaseOpen(false);
  };

  const equipItem = async (itemID) => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${import.meta.env.VITE_API_URL}/shop/equip/${itemID}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchCharacterData();
  };

  const updateGender = async (newGender) => {
    setGender(newGender); // Update locally for visual display
  
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/gender`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gender: newGender })
      });
  
      if (!res.ok) {
        console.error("Failed to update gender on backend");
      }
    } catch (err) {
      console.error("Error updating gender:", err);
    }
  };

  const handleOutfit = async (unlockSet, index, slotType, setName) => {
    const itemMap = {
      Hat: {
        knight: "knight_helmet",
        default: "default_hat",
        princess: "princess_tiara",
        cowboy: "cowboy_hat"
      },
      Top: {
        knight: "knight_chest",
        default: "default_shirt",
        princess: "princess_dress",
        cowboy: "cowboy_vest"
      },
      Bottom: {
        knight: "knight_legs",
        default: "default_pants",
        princess: "princess_stockings",
        cowboy: "cowboy_pants"
      },
      Shoes: {
        knight: "knight_boots",
        default: "default_shoes",
        princess: "princess_heels",
        cowboy: "cowboy_spurs"
      }
    };

    const itemID = itemMap[slotType][setName];

    if (!ownsItem(itemID)) {
      setSelectedItemID(itemID);
      setIsPurchaseOpen(true);
      return;
    }

    if (itemID.startsWith("default")) {
        const slotMap = {
            Hat: "hat",
            Top: "shirt",
            Bottom: "pants",
            Shoes: "shoes"
        };

        const slot = slotMap[slotType];

        if (!slot) {
            console.error("Invalid slotType:", slotType);
            return;
        }

        await clearEquippedSlot(slot);
        await fetchCharacterData();
        console.log("Successfully called clearEquippedSlot");
        return;
    }

    await equipItem(itemID);
  };

  if (loading) return <div className={`background ${darkMode ? 'dark' : ''}`} />;

  return (
    <div className={`background ${darkMode ? 'dark' : ''}`}> 
      <div className="characterScreen">
        <h1 className="characterTitle">Character Screen</h1>

        <div className="gender">
            <button className="genderButton" onClick={() => updateGender("Male")}> Male </button>
            <button className="genderButton" onClick={() => updateGender("Female")}> Female </button>
        </div>

        <div className="CharacterModel">
          {gender === "Male" && (<img className="maleModel" src={male} alt="Male" />)}
          {gender === "Female" && (<img className="femaleModel" src={female} alt="Female" />)}

          {/* For the Character model */}
          {/* Knight Models */}
          {equipped.shoes === 'knight_boots' && <img className="knightShoesModel" src={knightShoes} alt="Knight Shoes" />}
          {equipped.pants === 'knight_legs' && <img className="knightBottomModel" src={knightPants} alt="Knight Pants" />}
          {equipped.shirt === 'knight_chest' && <img className="knightTopModel" src={knightChest} alt="Knight Chest" />}
          {equipped.hat === 'knight_helmet' && <img className="knightHelmetModel" src={knightHelmet} alt="Knight Helmet" />}

          {/* Cowboy Models */}
          {equipped.shoes === 'cowboy_spurs' && <img className="cowboySpursModel" src={cowboySpurs} alt="Cowboy Spurs" />}
          {equipped.pants === 'cowboy_pants' && <img className="cowboyPantsModel" src={cowboyPants} alt="Cowboy Pants" />}
          {equipped.shirt === 'cowboy_vest' && <img className="cowboyVestModel" src={cowboyVest} alt="Cowboy Vest" />}
          {equipped.hat === 'cowboy_hat' && <img className="cowboyHatModel" src={cowboyHat} alt="Cowboy Hat" />}

          {/* Princess Models */}
          {equipped.shoes === 'princess_heels' && <img className="princessShoesModel" src={princessHeels} alt="Princess Shoes" />}
          {equipped.pants === 'princess_stockings' && <img className="princessPantsModel" src={princessPants} alt="Princess Pants" />}
          {equipped.shirt === 'princess_dress' && <img className="princessDressModel" src={princessDress} alt="Princess Dress" />}
          {equipped.hat === 'princess_tiara' && <img className="princessTiaraModel" src={princessTiara} alt="Princess Tiara" />}
        </div>
      </div>

      <div className="wardrobe">
        <h1 className="wardrobeTitle"> Wardrobe </h1>
        <h3 className="playerCoins"> Coins: {playerCoins}</h3> 

        <div className="clothingSelection">

          {/* For the Buttons */}
          <h3 className="defaultTitle">Default</h3>
          <div className="defaultSet"> 
            <button className="default" onClick={() => handleOutfit(null, 0, "Hat", 'default')}> </button>
            <button className="default" onClick={() => handleOutfit(null, 1, "Top", 'default')}> </button>
            <button className="default" onClick={() => handleOutfit(null, 2, "Bottom", 'default')}> </button>
            <button className="default" onClick={() => handleOutfit(null, 3, "Shoes", 'default')}> </button>
          </div>

          <h3 className="knightTitle"> Knight Set </h3>
          <div className="knightSet">
            <button className="knight_helmet" onClick={() => handleOutfit(null, 0, "Hat", 'knight')}> </button>
            <button className="knight_chest" onClick={() => handleOutfit(null, 1, "Top", 'knight')}> </button>
            <button className="knight_leggings" onClick={() => handleOutfit(null, 2, "Bottom", 'knight')}> </button>
            <button className="knight_boots" onClick={() => handleOutfit(null, 3, "Shoes", 'knight')}> </button>
          </div>

          <h3 className="princessTitle"> Princess Set </h3>
          <div className="princessSet"> 
            <button className="princess_tiara" onClick={() => handleOutfit(null, 0, "Hat", 'princess')}> </button>
            <button className="princess_dress" onClick={() => handleOutfit(null, 1, "Top", 'princess')}> </button>
            <button className="princess_stockings" onClick={() => handleOutfit(null, 2, "Bottom", 'princess')}> </button>
            <button className="princess_heels" onClick={() => handleOutfit(null, 3, "Shoes", 'princess')}> </button>
          </div>

          <h3 className="cowboyTitle"> Wild West Set </h3>
          <div className="cowboySet">
            <button className="wildwest_hat" onClick={() => handleOutfit(null, 0, "Hat", 'cowboy')}> </button>
            <button className="wildwest_vest" onClick={() => handleOutfit(null, 1, "Top", 'cowboy')}> </button>
            <button className="wildwest_pants" onClick={() => handleOutfit(null, 2, "Bottom", 'cowboy')}> </button>
            <button className="wildwest_spurs" onClick={() => handleOutfit(null, 3, "Shoes", 'cowboy')}> </button>    
          </div>
        </div>
      </div>

      {isPurchaseModalOpen && (
        <div className="PurchaseModal">
          <h3 className="PurchaseQuestion"> Do you want to buy this piece for 35 coins? </h3>
          <button className="PurchaseButton" onClick={handlePurchase}> Yes </button>
          <button className="PurchaseButton" onClick={handleClose}> No </button>
        </div>
      )}

      {CannotBuy && (
        <div className="Unpurchasable">
          <span className="close" onClick={handleClose}>&times;</span>
          <h3 className="Able"> You don't have enough coins </h3>
        </div>
      )}

      {CanBuy && (
        <div className="Purchased">
          <span className="close" onClick={handleClose}>&times;</span>
          <h3 className="Unable"> You have purchased this piece </h3>
        </div>
      )}
    </div>
  );
}

export default Character;
