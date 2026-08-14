import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	productIds: [],
	loading: false,
	error: null,
}

const wishlistSlice = createSlice({
	name: 'wishlist',
	initialState,
	reducers: {},
})

export default wishlistSlice.reducer
