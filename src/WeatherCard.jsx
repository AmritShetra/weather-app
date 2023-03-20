import './WeatherCard.css';
import WeatherIcon from './WeatherIcon';
import { convertWeathercode } from './conversion';

export default function WeatherCard(props) {
    
    function convertToF() {
        let temp = (props.temp * (9/5)) + 32;
        return parseFloat(temp.toFixed(1));
    }

    return (
        <div id='weather-card'>
            <h3>{props.time}</h3>
            <WeatherIcon code={props.weathercode} sunrise={props.sunrise} sunset={props.sunset} />
            <h2>{props.scale==='°C'? props.temp : convertToF(props.temp)}<span onClick={props.changeScale}>{props.scale}</span></h2>
            <span>{convertWeathercode(props.weathercode)}</span>
        </div>
    );
}
