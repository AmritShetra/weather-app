import React, { useEffect, useState } from "react";
import axios from 'axios';
import './App.css';
import { convertTimestamp, convertWeathercode, convertToF } from './conversion.js'
import WeatherIcon  from "./WeatherIcon";
import WeatherCard from "./WeatherCard";

export default function App() {

    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();

    const [currentWeather, setCurrentWeather] = useState();
    const [timezone, setTimezone] = useState();
    const [sunrise, setSunrise] = useState();
    const [sunset, setSunset] = useState();
    const [forecasts, setForecasts] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const [scale, setScale] = useState('°C');

    let date = new Date().toLocaleDateString(
        `en-GB`, {weekday: 'long', day: 'numeric', month: 'long'}
    );


    useEffect(() => {
        if (loaded) {
            return;
        }
        navigator.geolocation.watchPosition(
            function(position) {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            }
        )
    }, [loaded]);

    useEffect(() => {
        // Stops page from loading extra forecast data when I save code editor
        if (loaded) { 
            return; 
        }

        if (longitude == null || latitude == null) {
            return;
        }

        // yyyy-mm-dd format
        let date = new Date().toJSON().slice(0, 10);
        let url = `https://api.open-meteo.com/v1/forecast?&`;
        let params = [
            `latitude=${latitude}`,
            `&longitude=${longitude}`,
            `&hourly=temperature_2m,weathercode`,
            `&daily=sunrise,sunset`,
            `&timezone=auto`,
            '&current_weather=true',
            `&start_date=${date}`,
            `&end_date=${date}`
        ];
        axios.get(url + params.join(``))
            .then (res => {
                let data = res.data;

                setCurrentWeather(
                    {
                        'temp': data['current_weather']['temperature'],
                        'time': data['current_weather']['time'],
                        'windspeed': data['current_weather']['windspeed'],
                        'weathercode': data['current_weather']['weathercode']
                    }
                )
                
                setTimezone(data['timezone_abbreviation']);
                setSunrise(data['daily']['sunrise']);
                setSunset(data['daily']['sunset']);
                
                // Today's times, temperatures, and weathercodes
                let times = data['hourly']['time'];
                let temps = data['hourly']['temperature_2m'];
                let codes = data['hourly']['weathercode'];

                // We only want the data for the rest of the day
                let indexOfNextHour = times.indexOf(data['current_weather']['time']) + 1;
                times = times.slice(indexOfNextHour);
                temps = temps.slice(indexOfNextHour);
                codes = codes.slice(indexOfNextHour);

                // Combine ith entries of lists into array, append each array to Forecasts list
                for (let i= 0; i < times.length; i++) {
                    setForecasts(oldForecasts => 
                        [
                            ...oldForecasts, 
                            {
                                'time': times[i],
                                'temp': temps[i],
                                'weathercode': codes[i]
                            }
                        ]
                    )
                }
                setLoaded(true);
            });
    }, [latitude, longitude])

    function changeScale() {
        if (scale === '°C') {
            setScale('°F');
        }
        else {
            setScale('°C');
        }
    }
    
    return (
        <div>
            {loaded ?
                <div>
                    <div id='main-card'>
                        <div className='box' id='left'>
                            <WeatherIcon 
                                weathercode={currentWeather.weathercode} 
                                time={currentWeather.time} 
                                sunrise={sunrise} 
                                sunset={sunset} 
                            />
                            <h1>   
                                {scale === '°C' ? currentWeather.temp : convertToF(currentWeather.temp)}
                                <span onClick={changeScale}>{scale}</span>
                            </h1>
                            <h3>{convertWeathercode(currentWeather.weathercode)}</h3>
                            <h4>Wind speed: {currentWeather.windspeed} km/h</h4>
                        </div>
                        <div className='box' id='right'>
                            <h2>{date}</h2>
                            <h3>{convertTimestamp(currentWeather.time)}</h3>
                            <h4>{timezone}</h4>
                        </div>
                    </div>
                    <div id='row'>
                        {forecasts.map(day => 
                            <WeatherCard 
                                key={day.time}
                                time={day.time}
                                temp={day.temp}
                                weathercode={day.weathercode}
                                sunrise={sunrise}
                                sunset={sunset}
                                scale={scale}
                                changeScale={changeScale}
                            />
                        )}
                    </div>
                    <div id='footer'>
                        <a href="https://open-meteo.com/">Weather data by Open-Meteo.com</a>
                    </div>
                </div>
            :  
                <div id="loading">
                    Finding out your location...
                </div>
            }
        </div>
    );
}
