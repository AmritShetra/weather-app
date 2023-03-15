import clearDay from './icons/clear-day.svg';
import clearNight from './icons/clear-night.svg';
import overcast from './icons/overcast.svg';
import fog from './icons/fog.svg';
import drizzle from './icons/drizzle.svg';
import rain from './icons/rain.svg';
import snow from './icons/snow.svg';
import thunderstorms from './icons/thunderstorms.svg';
import thunderstormsRain from './icons/thunderstorms-rain.svg';

export default function WeatherIcon(props) {
    let icon;

    switch(props.code) {
        case 0: case 1:
            if (props.time > props.sunrise && props.time < props.sunset) {
                icon = clearDay;
            }
            else {
                icon = clearNight;
            }
            break;
        case 3:
            icon = overcast;
            break;
        case 45: case 48:
            icon = fog;
            break;
        case 51: case 53: case 55: case 56: case 57:
            icon = drizzle;
            break;
        case 61: case 63: case 65: case 66: case 67:
            icon = rain;
            break;
        case 71: case 73: case 75: case 77:
            icon = snow;
            break;
        case 95:
            icon = thunderstorms;
            break;
        case 96: case 99:
            icon = thunderstormsRain;
            break;
        default:
            icon = '';
    }

    return (
        <img src={icon} alt='Weather icon' width='100px'></img>
    );
}
