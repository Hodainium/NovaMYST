import "./Character.css";
import {useState} from 'react';
import { useContext } from 'react';
import { DarkModeContext } from './DarkMode';
import React from 'react'; //
import male from './assets/male_model.png'
import female from './assets/female_model.png'
import knightHelmet from './assets/knightHelmetModel.png'
import knightChest from './assets/knightChestModel.png'
import knightPants from './assets/knightPantsModel.png'
import knightShoes from './assets/knightShoesModel.png'

function Character() {
const { darkMode } = useContext(DarkModeContext);
const [gender, setGender] = useState("Male");
const [hat, setHat] = useState('');
const [top, setTop] = useState('');
const [bottom, setBottom] = useState('');
const [shoes, setShoes] = useState('');

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
                        <button className="defaultHat" onClick={() => changeHat('')}>  </button>
                        <button className="defaultTop" onClick={() => changeTop('')}>  </button>
                        <button className="defaultBottom" onClick={() => changeBottom('')}>  </button>
                        <button className="defaultShoes" onClick={() => changeShoes('')}>  </button>
                    </div>
                    

                    <h3 className="knightTitle"> Knight Set </h3>
                    <div className="knightSet">
                        <button className="knight_helmet" onClick={() => changeHat('knight')}>  </button>
                        <button className="knight_chest" onClick={() => changeTop('knight')}>  </button>
                        <button className="knight_leggings" onClick={() => changeBottom('knight')}>  </button>
                        <button className="knight_boots" onClick={() => changeShoes('knight')}>  </button>
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