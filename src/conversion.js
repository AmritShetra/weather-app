// ISO 8601 to 12 hour, e.g. 2023-02-24T18:00 = 6 PM
export function convertTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString(
        'en-GB', {hour12: true, hour: 'numeric'}
    );
}

// https://open-meteo.com/en/docs
export function convertWeathercode(number){
    switch(number) {
        case 0: return "Clear sky";
        case 1: return "Mainly clear";
        case 2: return "Partly cloudy";
        case 3: return "Overcast";
        case 45: return "Fog";
        case 48: return "Depositing rime fog";
        case 51: return "Light drizzle";
        case 53: return "Moderate drizzle";
        case 55: return "Heavy drizzle";
        case 56: return "Light freezing drizzle";
        case 57: return "Heavy freezing drizzle";
        case 61: return "Light rain";
        case 63: return "Moderate rain";
        case 65: return "Heavy rain";
        case 66: return "Light freezing rain";
        case 67: return "Heavy freezing rain";
        case 71: return "Light snow fall";
        case 73: return "Moderate snow fall";
        case 75: return "Heavy snow fall";
        case 77: return "Snow grains";
        case 80: return "Light rain showers";
        case 81: return "Moderate rain showers";
        case 82: return "Heavy rain showers";
        case 85: return "Light snow showers";
        case 86: return "Heavy snow showers";
        case 95: return "Thunderstorm";
        case 96: return "Thunderstorm with light hail";
        case 99: return "Thunderstorm with heavy hail";
    }
}

export function convertToF(tempC) {
    let temp = (tempC * (9/5)) + 32;
    temp = temp.toFixed(1);                 // 1 decimal place
    temp = parseFloat(temp);                // Convert string back to number
    return temp;
}
