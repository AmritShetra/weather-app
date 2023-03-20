import React from "react";
import axios from 'axios';
import './app.css';
import { convertTimestamp, convertWeathercode } from './conversion.js'
import WeatherIcon  from "./WeatherIcon";
import WeatherCard from "./WeatherCard";

class App extends React.Component {

    constructor(props) {
        super(props);
        
        this.state = {
            'timezone': '',
            'temp': '',
            'windspeed': '',
            'weathercode': '',
            'weathercode_desc': '',
            'time': '',
            'timestamp': '',
            'date': '',
            'forecasts': [],
            'loaded': false,
            'scale': '°C',
            'tempF': '',
            'sunrise': '',
            'sunset': ''
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

                axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&daily=sunrise,sunset&timezone=auto&current_weather=true&start_date=${date}&end_date=${date}`)
                    .then(res => {
                        let data = res.data;
                        self.setState({timezone: data['timezone_abbreviation']});

                        let currentData = data['current_weather'];
                        self.setState({temp: currentData['temperature']});
                        self.setState({windspeed: currentData['windspeed']});
                        self.setState({weathercode: currentData['weathercode']})
                        self.setState({weathercode_desc: convertWeathercode(currentData['weathercode'])});

                        self.setState({timestamp: currentData['time']});
                        let currentTime = convertTimestamp(currentData['time']);
                        self.setState({time: currentTime});

                        self.setState({sunrise: data['daily']['sunrise'][0]});
                        self.setState({sunset: data['daily']['sunset'][0]});

                        let hourlyForecasts = [];

                        // Get today's times, temperatures & weathercodes
                        let times = data['hourly']['time'];
                        let temps = data['hourly']['temperature_2m'];
                        let codes = data['hourly']['weathercode'];
                        
                        // We only want times, temperatures & weathercodes for the rest of the day
                        let indexOfNextHour = times.indexOf(currentData['time']) + 1;
                        times = times.slice(indexOfNextHour);
                        temps = temps.slice(indexOfNextHour);
                        codes = codes.slice(indexOfNextHour);

                        // Combine all lists into an array where each entry has an hour, temperature, and weathercode
                        for (let i = 0; i < times.length; i++) {
                            hourlyForecasts.push(
                                {
                                    'time': convertTimestamp(times[i]),
                                    'temp': temps[i],
                                    'weathercode': codes[i]
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
                            <WeatherIcon code={this.state.weathercode} time={this.state.timestamp} sunrise={this.state.sunrise} sunset={this.state.sunset} />
                            <h1>   
                                {this.state.scale === '°C' ? this.state.temp : this.state.tempF}
                                <span onClick={this.changeScale}>{this.state.scale}</span>
                            </h1>
                            <h3>{this.state.weathercode_desc}</h3>
                            <h4>Wind speed: {this.state.windspeed} km/h</h4>
                        </div>
                        <div className='box' id='right'>
                            <h2>{this.state.date}</h2>
                            <h3>{this.state.time}</h3>
                            <h4>{this.state.timezone}</h4>
                        </div>
                    </div>
                    <br/>
                    <div id='row'>
                        {this.state.forecasts.map(day => 
                            <WeatherCard time={day.time} temp={day.temp} scale={this.state.scale} weathercode={day.weathercode} changeScale={this.changeScale} sunrise={this.state.sunrise} sunset={this.state.sunset} />
                        )}
                    </div>

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
