import React from "react";
import axios from 'axios';
import './app.css';

class App extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            'timezone': '',
            'temp': '',
            'windspeed': '',
            'weathercode': '',
            'time': '',
            'date': '',
            'forecasts': [],
            'loaded': false,
            'scale': '°C',
            'tempF': ''
        }

        this.changeScale = this.changeScale.bind(this);
    }

    componentDidMount() {
        const self = this;
        navigator.geolocation.getCurrentPosition(
            function(position) {
                let latitude = position.coords.latitude;
                let longitude = position.coords.longitude;

                let options = {weekday: 'long', day: 'numeric', month: 'long'};
                let date = new Date();
                self.setState({date: date.toLocaleDateString('en-GB', options)});
                // Convert to (yyyy-mm-dd)
                date = date.toJSON().slice(0, 10);

                axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&timezone=auto&current_weather=true&start_date=${date}&end_date=${date}`)
                    .then(res => {
                        // console.log(JSON.stringify(res.data, null, 2));

                        let data = res.data;
                        self.setState({timezone: data['timezone_abbreviation']});

                        let currentData = data['current_weather'];
                        self.setState({temp: currentData['temperature']});
                        self.setState({windspeed: currentData['windspeed']});
                        self.setState({weathercode: convertWeathercode(currentData['weathercode'])});
                    
                        let currentTime = convertTimestamp(currentData['time']);
                        self.setState({time: currentTime});

                        let hourlyForecasts = [];

                        // Get today's times & temperatures
                        let times = data['hourly']['time'];
                        let temps = data['hourly']['temperature_2m'];
                        
                        // We only want times & temperatures for the rest of the day
                        let indexOfNextHour = times.indexOf(currentData['time']) + 1;
                        times = times.slice(indexOfNextHour);
                        temps = temps.slice(indexOfNextHour);

                        // Combine both lists into an array where each entry has an hour and temperature
                        for (let i = 0; i < times.length; i++) {
                            hourlyForecasts.push(
                                {
                                    'time': convertTimestamp(times[i]),
                                    'temp': temps[i]
                                }
                            )
                        }
                        self.setState({forecasts: hourlyForecasts});

                        self.setState({loaded: true});
                    })
                }
        )
    }

    changeScale() {
        if (this.state.scale === '°C') {
            this.setState({scale: '°F'});
            if (this.state.tempF === '') {
                let temp = (this.state.temp * (9/5)) + 32;
                temp = temp.toFixed(1);         // 1 decimal place
                temp = parseFloat(temp);        // Convert string back to number
                this.setState({tempF: temp});
            }
        }
        else {
            this.setState({scale: '°C'});
        }
    }

    render() {
        return (
            <div>
                {this.state.loaded ?
                // Display if data is loaded
                <div>
                    <div id='main-card'>
                        <div className='box' id='left'>
                            <h1>   
                                {this.state.scale === '°C' ? this.state.temp : this.state.tempF}
                                <span onClick={this.changeScale}>{this.state.scale}</span>
                            </h1>
                            <h3>{this.state.weathercode}</h3>
                            <h4>Wind speed: {this.state.windspeed} km/h</h4>
                        </div>
                        <div className='box' id='right'>
                            <h2>{this.state.date}</h2>
                            <h3>{this.state.time}</h3>
                            <h4>{this.state.timezone}</h4>
                        </div>
                    </div>
                    <br/>
                    {this.state.forecasts.map(day => 
                        <div key={day['time']}>
                            {day['time']}: {day['temp']}°C
                        </div>)
                    }

                    <div id='footer'>
                        <a href="https://open-meteo.com/">Weather data by Open-Meteo.com</a>
                    </div>
                </div>
                :
                // Display if no data yet
                <div>
                    Finding out your location...
                </div>
                }
            </div>
        );
    }
}

export default App;

// ISO 8601 to 12 hour, e.g. 2023-02-24T18:00 = 6 PM
function convertTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString(
        'en-GB', {hour12: true, hour: 'numeric'}
    );
}

// https://open-meteo.com/en/docs
function convertWeathercode(number){
    switch(number) {
        case 0: return "Clear sky";
        case 1: return "Mainly clear";
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
