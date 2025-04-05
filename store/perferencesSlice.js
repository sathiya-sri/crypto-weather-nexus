import { createSlice } from '@reduxjs/toolkit';

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    favoriteCities: [],
    favoriteCryptos: []
  },
  reducers: {
    addFavoriteCity: (state, action) => {
      if (!state.favoriteCities.includes(action.payload)) {
        state.favoriteCities.push(action.payload);
      }
    },
    removeFavoriteCity: (state, action) => {
      state.favoriteCities = state.favoriteCities.filter(city => city !== action.payload);
    },
    addFavoriteCrypto: (state, action) => {
      if (!state.favoriteCryptos.includes(action.payload)) {
        state.favoriteCryptos.push(action.payload);
      }
    },
    removeFavoriteCrypto: (state, action) => {
      state.favoriteCryptos = state.favoriteCryptos.filter(crypto => crypto !== action.payload);
    }
  }
});

export const {
  addFavoriteCity,
  removeFavoriteCity,
  addFavoriteCrypto,
  removeFavoriteCrypto
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
