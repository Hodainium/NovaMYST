import "./Character.css";
import {useState} from 'react';
import { useContext } from 'react';
import { DarkModeContext } from './DarkMode';
import React from 'react'; //
import {auth} from "./firebase"
import male from './assets/male_model.png'
import female from './assets/female_model.png'
import knightHelmet from './assets/knightHelmetModel.png'
import knightChest from './assets/knightChestModel.png'
import knightPants from './assets/knightPantsModel.png'
import knightShoes from './assets/knightShoesModel.png'

function Character() {

const defaultUnlocks = ["Unlocked", "Unlocked", "Unlocked", "Unlocked"];
const knightUnlocks = ["Locked", "Locked", "Locked", "Locked"];
const princessUnlocks = ["Locked", "Locked", "Locked", "Locked"];
const cowboyUnlocks = ["Locked", "Locked", "Locked", "Locked"];

const { darkMode } = useContext(DarkModeContext);
const [coins, setUserCoins] = useState(0);
const [gender, setGender] = useState("Male");
const [hat, setHat] = useState('');
const [top, setTop] = useState('');
const [bottom, setBottom] = useState('');
const [shoes, setShoes] = useState('');
const [isPurchaseModalOpen, setIsPurchaseOpen] = useState(false);
const [CanBuy, setCanBuy] = useState(false);
const [CannotBuy, setCannotBuy] = useState(false);

const handleClose = () => {
        setIsPurchaseOpen(false);
    };

// Modal Styling
const Modal = ({isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div onClick = {onClose}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            > 
                <div
                    style={{
                        background: "white",
                        margin: "auto",
                        padding: "20px",
                        border: "3px solid",
                        width: "20%",
                        borderRadius: "10px",
                        borderColor: "#6c5dd3",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {children}
                </div>
            </div>
        );
    };

const refreshUserData = async () => {
    try {
      console.log("refreshUserData called");
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUserCoins(data.coins || 0);
    }
    
    catch (err) {
      console.error("Failed to refresh user data:", err);
    }
};



const changeGender = (SelectedGender) => {
    setGender(SelectedGender);
}

const changeHat = (SelectedHat) => {
    setHat(SelectedHat);
}

const changeTop = (SelectedTop) => {
    setTop(SelectedTop);
}

const changeBottom = (SelectedBottom) => {
    setBottom(SelectedBottom);
}

const changeShoes = (SelectedShoes) => {
    setShoes(SelectedShoes);
}

const handleOutfit = async (SelectedOutfitSet, Index, Part, OutfitName) => {
    if(SelectedOutfitSet[Index] === "Locked")
    {
        setIsPurchaseOpen(true);

            <Modal className="PurchaseModal" isOpen={isPurchaseModalOpen}>
                <h3 className="PurchaseQuestion"> Do you want to buy this piece? </h3>
                <div>
                    <button className="PurchaseButton" onClick={handlePurchase}> Yes </button>
                    <button className="PurchaseButton" onClick={handleClose}> No </button>
                </div>

            </Modal>
    }

    // const handlePurchase = () => {
    //     if (coins < 35)
    //     {
    //         setIsPurchaseOpen(false);
    //         setCannotBuy(True);

    //         <Modal className="Unpurchasable" CannotBuy={true}> 
    //             <span className="close" onClick={setCannotBuy(false)}>&times;</span>
    //             <h3> You don't have enough coins </h3>
    //         </Modal>


    //     }
        
    //     if (coins >=35) 
    //     {
    //         setUserCoins(coins - 35);


    //         SelectedOutfitSet[Index] = "Unlocked";

    //         setIsPurchaseOpen(false);
    //         setCanBuy(true);

    //         <Modal className="Purchased" CanBuy={true}> 
    //             <span className="close" onClick={setCanBuy(false)}>&times;</span>
    //             <h3> You have purchased this piece </h3>
    //         </Modal>

            
    //     }
    // }


    // // What happens if the user just bought the item and wants to automatically wear it? --> If statement rather than else if
    // if(SelectedOutfitSet[Index] === "Unlocked") 
    // {
    //     if (Part === "Hat")
    //     {
    //         changeHat(OutfitName);
    //     }
    //     if (Part === "Top")
    //     {
    //         changeTop(OutfitName);
    //     }
    //     if (Part === "Bottom")
    //     {
    //         changeBottom(OutfitName);
    //     }
    //     if (Part === "Shoes")
    //     {
    //         changeShoes(OutfitName)
    //     }
    // }
    // await refreshUserData();
}

// Shoes first, then pants, then helmet, then armor

    return (
        <div className={`background ${darkMode ? 'dark' : ''}`}> 
            <div className="characterScreen">
                <h1 className="characterTitle">Character Screen</h1>

                <div className="gender">
                    <button className="genderButton" onClick={() => changeGender("Male")}> Male </button>
                    <button className="genderButton" onClick={() => changeGender("Female")}> Female </button>
                </div>

                <div className="CharacterModel">
                    {gender === "Male" && (<img className="maleModel" src={male} alt="Male" />)}
                    {gender === "Female" && (<img className="femaleModel" src={female} alt="Female"/>)}

                    {shoes === "knight" && (<img className="knightShoesModel" src={knightShoes} alt="Knight Shoes"/>)}
                    
                    {bottom === "knight" && (<img className="knightBottomModel" src={knightPants} alt="Knight Pants"/>)}

                    {top === "knight" && (<img className="knightTopModel" src={knightChest} alt="Knight Chest"/>)}

                    {hat === "knight" && (<img className="knightHelmetModel" src={knightHelmet} alt="Knight Helmet"/>)}
                </div>
                

            </div>

            <div className="wardrobe">
                <h1 className="wardrobeTitle"> Wardrobe </h1>

                <div className="clothingSelection">

                <h3 className="defaultTitle">Default</h3>
                    <div className="default"> 
                        {/* <button className="defaultHat" onClick={() => changeHat('')}>  </button> */}
                        <button className="defaultHat" onClick={() => handleOutfit(defaultUnlocks, 0, "Hat", '')}>  </button>
                        <button className="defaultTop" onClick={() => changeTop('')}>  </button>
                        <button className="defaultBottom" onClick={() => changeBottom('')}>  </button>
                        <button className="defaultShoes" onClick={() => changeShoes('')}>  </button>
                    </div>
                    

                    <h3 className="knightTitle"> Knight Set </h3>
                    <div className="knightSet">
                        {/* <button className="knight_helmet" onClick={() => changeHat('knight')}>  </button> */}
                        <button className="knight_helmet" onClick={() => handleOutfit(knightUnlocks, 0, "Hat", 'knight')}>  </button>
                        <button className="knight_chest" onClick={() => changeTop('knight')}>  </button>
                        <button className="knight_leggings" onClick={() => changeBottom('knight')}>  </button>
                        <button className="knight_boots" onClick={() => changeShoes('knight')}>  </button>

                        {/* line of prices for each item I guess*/}
                        <div> </div>
                    </div>

                    <h3 className="princessTitle"> Princess Set </h3>
                    <div className="princessSet"> 
                        <button className="princess_tiara"> </button>
                        <button className="princess_dress"> </button>
                        <button className="princess_stockings"> </button>
                        <button className="princess_heels"> </button>
                    </div>

                    <h3 className="cowboyTitle"> Cowboy Set </h3>
                    <div className="cowboySet">
                        <button className="wildwest_hat"> </button>
                        <button className="wildwest_vest"> </button>
                        <button className="wildwest_pants"> </button>
                        <button className="wildwest_spurs"> </button>    
                    </div>


                </div>
            </div>
        </div>
    );
}

export default Character;