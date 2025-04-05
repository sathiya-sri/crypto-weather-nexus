import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch initial crypto data
export const fetchCrypto = createAsyncThunk("crypto/fetchCrypto", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: { vs_currency: "usd", ids: "bitcoin,ethereum,cardano" },
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch crypto data");
  }
});

const cryptoSlice = createSlice({
  name: "crypto",
  initialState: { 
    data: [], 
    loading: false, 
    error: null, 
    livePrices: {}, 
    notifications: [] 
  },
  reducers: {
    updateCryptoPrice: (state, action) => {
      const { id, price } = action.payload;
      if (state.data.find((coin) => coin.id === id)) {
        state.livePrices[id] = price;
        state.notifications.push({ 
          id: Date.now(), 
          message: `${id.toUpperCase()} price updated: $${price}` 
        });
        if (state.notifications.length > 5) state.notifications.shift(); // Keep last 5 messages
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrypto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrypto.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCrypto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export const { updateCryptoPrice, removeNotification } = cryptoSlice.actions;
export default cryptoSlice.reducer;
