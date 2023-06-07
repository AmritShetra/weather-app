import './WeatherCard.css';
import WeatherIcon from './WeatherIcon';
import { convertTimestamp, convertWeathercode, convertToF } from './conversion';

export default function WeatherCard(props) {

    return (
        <div id='weather-card'>
            <h3>{convertTimestamp(props.time)}</h3>
            <WeatherIcon weathercode={props.weathercode} time={props.time} sunrise={props.sunrise} sunset={props.sunset} />
            <h2>{props.scale ==='°C'? props.temp : convertToF(props.temp)}<span onClick={props.changeScale}>{props.scale}</span></h2>
            <span>{convertWeathercode(props.weathercode)}</span>
        </div>
    );
}
