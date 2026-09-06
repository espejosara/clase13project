import { createSlice } from '@reduxjs/toolkit'
import { addCartItemThunk } from './cartSlice'

const initialState = {
	id: 0,
	message: '',
}

const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducers: {
		showNotification(state, action) {
			state.id += 1
			state.message = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(addCartItemThunk.fulfilled, (state) => {
			state.id += 1
			state.message = 'Producto añadido al carrito'
		})
	},
})

export const { showNotification } = notificationSlice.actions

export default notificationSlice.reducer
