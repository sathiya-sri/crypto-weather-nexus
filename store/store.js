import { configureStore } from "@reduxjs/toolkit";
import weatherReducer from "./weatherSlice";
import cryptoReducer from "./cryptoSlice";
import newsReducer from "./newsSlice";
import notificationsReducer from "./notificationsSlice";
import preferencesReducer from "./perferencesSlice.js";

const loadPreferences = () => {
  try {
    const serializedState = localStorage.getItem("preferences");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading preferences from localStorage:", err);
    return undefined;
  }
};

const savePreferences = (state) => {
  try {
    const serializedState = JSON.stringify(state.preferences);
    localStorage.setItem("preferences", serializedState);
  } catch (err) {
    console.error("Error saving preferences to localStorage:", err);
  }
};

const preloadedState = {
  preferences: loadPreferences() || {
    favoriteCities: [],
    favoriteCryptos: []
  }
};

const store = configureStore({
  reducer: {
    weather: weatherReducer,
    crypto: cryptoReducer,
    news: newsReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  savePreferences(store.getState());
});

export default store;
