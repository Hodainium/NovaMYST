import "./Character.css";
import {useState} from 'react';

function Character() {
const [category, setCategory] = useState('hats');
const [hat, setHat] = useState('default');
const [top, setTop] = useState('default');
const [bottom, setBottom] = useState('default');
const [shoes, setShoes] = useState('default');

    const toggleHats = async (e) => {

    };

    const toggleTops = async (e) => {

    };

    const toggleBottom = async(e) => {

    };

    const toggleShoes = async(e) => {

    };

    return (
        <div className="background"> 
            <div className="characterScreen">
                <h1>Character Screen</h1>
                <button className="genderButton"> Male </button>
                <button className="genderButton"> Female </button>
            </div>

            <div className="wardrobe">
                <h1> Wardrobe </h1>
                <div className="categorySelection">
                    <button className="categoryButton" onClick={toggleHats}> HATS </button>
                    <button className="categoryButton" onClick={toggleTops}> TOPS </button>
                    <button className="categoryButton" onClick={toggleBottom}> BOTTOM </button>
                    <button className="categoryButton" onClick={toggleShoes}> SHOES </button>
                </div>

                <div className="clothingSelection">
                    <button className="default_hat">  </button>
                    <button className="knight_helmet">  </button>
                    <button className="knight_chest">  </button>
                    <button className="knight_leggings">  </button>
                    <button className="knight_boots">  </button>
                </div>
            </div>
        </div>
    );
}

export default Character;