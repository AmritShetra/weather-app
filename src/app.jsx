import React from "react";
import axios from 'axios';
import './app.css';

// ISO 8601 to 12 hour, e.g. 2023-02-24T18:00 = 6 PM
function convertTimestamp(timestamp) {
    return new Date(timestamp).toLocaleTimeString(
        'en-GB', {hour12: true, hour: 'numeric'}
    );
}

class App extends React.Component {

    state = {
        'timezone': '',
        'temp': '',
        'windspeed': '',
        'weathercode': '',
        'time': '',
        'date': '',
        'forecasts': [],
        'loaded': false
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
                        self.setState({weathercode: currentData['weathercode']});
                    
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

    render() {
        return (
            <div>
                {this.state.loaded ?
                // Display if data is loaded
                <div>
                    <div id='main-card'>
                        <div class='box' id='left'>
                            <h1>{this.state.temp}°C</h1>
                            <h3>{this.state.weathercode}</h3>
                            <h4>Wind speed: {this.state.windspeed} km/h</h4>
                        </div>
                        <div class='box' id='right'>
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

/* 
https://open-meteo.com/en/docs

Code 	        Description
0 	            Clear sky
1, 2, 3 	    Mainly clear, partly cloudy, and overcast
45, 48 	        Fog and depositing rime fog
51, 53, 55 	    Drizzle: Light, moderate, and dense intensity
56, 57 	        Freezing Drizzle: Light and dense intensity
61, 63, 65 	    Rain: Slight, moderate and heavy intensity
66, 67 	        Freezing Rain: Light and heavy intensity
71, 73, 75 	    Snow fall: Slight, moderate, and heavy intensity
77 	            Snow grains
80, 81, 82 	    Rain showers: Slight, moderate, and violent
85, 86 	        Snow showers slight and heavy
95 * 	        Thunderstorm: Slight or moderate
96, 99 * 	    Thunderstorm with slight and heavy hail

(*) Thunderstorm forecast with hail is only available in Central Europe
*/
