import { createSlice } from '@reduxjs/toolkit'
import { addCartItemThunk } from './cartSlice'

const initialState = {
	id: 0,
	message: '',
	actionLabel: '',
	actionTo: '',
}

const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducers: {
		showNotification(state, action) {
			const payload = typeof action.payload === 'string'
				? { message: action.payload }
				: action.payload

			state.id += 1
			state.message = payload.message
			state.actionLabel = payload.actionLabel || ''
			state.actionTo = payload.actionTo || ''
		},
	},
	extraReducers: (builder) => {
		builder.addCase(addCartItemThunk.fulfilled, (state) => {
			state.id += 1
			state.message = 'Producto añadido al carrito'
			state.actionLabel = 'Ver carrito'
			state.actionTo = '/cart'
		})
	},
})

export const { showNotification } = notificationSlice.actions

export default notificationSlice.reducer
