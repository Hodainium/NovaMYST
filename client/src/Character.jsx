import "./Character.css";
import {useState} from 'react';

function Character() {
const [hat, setHat] = useState('default');
const [top, setTop] = useState('default');
const [bottom, setBottom] = useState('default');
const [shoes, setShoes] = useState('default');

    // Setting the clothes
    const toggleSetHat = async(e) => {

    };

    const toggleSetTop = async(e) => {

    };

    const toggleSetBottom = async(e) => {

    };

    const toggleSetShoes = async(e) => {

    };


    return (
        <div className="background"> 
            <div className="characterScreen">
                <h1 className="characterTitle">Character Screen</h1>

                <div className="gender">
                    <button className="genderButton"> Male </button>
                    <button className="genderButton"> Female </button>
                </div>
            </div>

            <div className="wardrobe">
                <h1 className="wardrobeTitle"> Wardrobe </h1>

                <div className="clothingSelection">

                <h3 className="defaultTitle"> Default Set </h3>
                    <div className="defaultSet"> 
                        <button className="default_hat">  </button>
                        <button className="default_top"> </button>
                        <button className="default_bottom"> </button>
                        <button className="default_shoes"> </button>
                    </div>
                    

                    <h3 className="knightTitle"> Knight Set </h3>
                    <div className="knightSet">
                        <button className="knight_helmet">  </button>
                        <button className="knight_chest">  </button>
                        <button className="knight_leggings">  </button>
                        <button className="knight_boots">  </button>
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