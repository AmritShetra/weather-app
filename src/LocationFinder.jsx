import { useEffect, useState } from "react"
import App from './App';
import './App.css';

export default function LocationFinder() {

    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(setPosition, showError);
    }, []);

    function setPosition(position) {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLoaded(true);
    }
    
    function showError(error) {
        if (error.PERMISSION_DENIED) {
            // Fill space (like the left side does) instead of animating ellipsis
            document.getElementById('dots').setAttribute('id', 'left');
            document.getElementById('middle').innerHTML = "Please refresh the page and enable Location.";
        }
    }

    return (
        <div>
            {loaded ? 
                <App latitude={latitude} longitude={longitude} />
            :
                <div id='loading-row'>
                    <div id='left'></div>
                    <div id='middle'>Finding out your location</div>
                    <div id='dots'></div>
                </div>
            }
        </div>
    )

}