import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch crypto news
export const fetchNews = createAsyncThunk(
  "news/fetchNews",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=pub_78103ed87326c97755bfee406e85247214c2a&q=crypto&language=en`
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.results)) {
        throw new Error("Invalid API response: No news data available.");
      }

      return data.results;
    } catch (error) {
      console.error("Error fetching news:", error.message);
      return rejectWithValue(error.message || "Failed to fetch news.");
    }
  }
);

// News slice
const newsSlice = createSlice({
  name: "news",
  initialState: {
    data: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {}, // You can add manual reducers if needed in the future
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.status = "loading";
        state.error = null; // Reset error state when fetching starts
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Something went wrong.";
      });
  },
});

export default newsSlice.reducer;
