import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchProducts } from '@web/api/client';
import type { ProductDto } from '@web/api/types';

export const loadProducts = createAsyncThunk('catalog/loadProducts', () => fetchProducts());

interface CatalogState {
  items: ProductDto[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CatalogState = {
  items: [],
  status: 'idle',
  error: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Error al cargar productos';
      });
  },
});

export default catalogSlice.reducer;
