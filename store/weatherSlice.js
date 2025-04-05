import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (_, { rejectWithValue }) => {
    try {
      const cities = ["New York", "London", "Tokyo", "United States"];
      const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
      const WEATHERAPI_KEY = process.env.NEXT_PUBLIC_WEATHERAPI_KEY;

      if (!OPENWEATHER_API_KEY || !WEATHERAPI_KEY) {
        toast.error("API keys are missing");
        throw new Error("API keys missing");
      }

      const results = await Promise.all(
        cities.map(async (city) => {
          try {
            // Get current weather data from OpenWeatherMap
            const weatherResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
            );

            const weatherData = weatherResponse.data;
            let alerts = [];

            // Get alerts from WeatherAPI.com
            try {
              const alertResponse = await axios.get(
                `https://api.weatherapi.com/v1/forecast.json?key=${WEATHERAPI_KEY}&q=${city}&days=1&alerts=yes`
              );
              
              console.log(alertResponse);
              // Format alerts from WeatherAPI
              alerts = alertResponse.data?.alerts?.alert?.map(alert => ({
                sender: "WeatherAPI",
                event: alert.headline,
                description: alert.desc,
                start: new Date(alert.effective).getTime() / 1000,
                end: new Date(alert.expires).getTime() / 1000,
                severity: alert.severity,
                instruction: alert.instruction
              })) || [];
              
              console.log(`Alerts for ${city}:`, alerts);
            } catch (alertError) {
              console.log(`No alerts available for ${city}`, alertError.message);
            }

            return {
              id: weatherData.id,
              name: weatherData.name,
              dt: weatherData.dt,
              weather: weatherData.weather,
              main: {
                temp: weatherData.main.temp,
                feels_like: weatherData.main.feels_like,
                temp_min: weatherData.main.temp_min,
                temp_max: weatherData.main.temp_max,
                humidity: weatherData.main.humidity,
                pressure: weatherData.main.pressure,
              },
              wind: {
                speed: weatherData.wind.speed,
              },
              sys: {
                sunrise: weatherData.sys.sunrise,
                sunset: weatherData.sys.sunset,
              },
              coord: weatherData.coord,
              alerts: alerts,
            };
          } catch (error) {
            console.error(`Error fetching ${city}:`, error.message);
            toast.error(`Failed to load ${city} weather`);
            return null;
          }
        })
      );

      return results.filter((city) => city !== null);
    } catch (error) {
      console.error("Weather fetch error:", error);
      toast.error("Failed to load weather data");
      return rejectWithValue(error.message);
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    data: [],
    loading: false,
    error: null,
    alerts: [],
    lastAlertCheck: null,
  },
  reducers: {
    dismissAlert: (state, action) => {
      const cityName = action.payload;
      state.data = state.data.map((city) => {
        if (city.name === cityName) {
          return { ...city, alerts: [] };
        }
        return city;
      });
      state.alerts = state.alerts.filter((alert) => alert.city !== cityName);
    },
    clearAllAlerts: (state) => {
      state.data = state.data.map((city) => ({ ...city, alerts: [] }));
      state.alerts = [];
      state.lastAlertCheck = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;

        const allAlerts = action.payload.reduce((acc, city) => {
          if (city.alerts?.length > 0) {
            return [
              ...acc,
              ...city.alerts.map((alert) => ({ 
                ...alert, 
                city: city.name,
                // Add more alert details for display
                fullMessage: `${alert.event}: ${alert.description}. ${alert.instruction || ''}`
              })),
            ];
          }
          return acc;
        }, []);

        state.alerts = allAlerts;
        state.lastAlertCheck = new Date().toISOString();

        if (allAlerts.length > 0) {
          allAlerts.forEach((alert) => {
            toast.warning(
              `${alert.city} Alert: ${alert.event}`,
              { 
                autoClose: 10000,
                closeOnClick: true,
                render: () => (
                  <div className="alert-toast">
                    <h4>{alert.city} Weather Alert</h4>
                    <p><strong>{alert.event}</strong></p>
                    <p>{alert.description}</p>
                    {alert.instruction && <p className="instructions">{alert.instruction}</p>}
                    <small>Severity: {alert.severity}</small>
                  </div>
                )
              }
            );
          });
        }
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { dismissAlert, clearAllAlerts } = weatherSlice.actions;
export default weatherSlice.reducer;