import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Account {
    name: string
}

export interface AccountsState {
    list: Account[],
    selected: string,
}

const initialState: AccountsState = {
    list: [],
    selected: ''
}

export const accountsSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        select: (state, action: PayloadAction<string>) => {

            state.selected = state.list.find(a => a.name === action.payload).name
        }
    },
})

export const { select } = accountsSlice.actions

export default accountsSlice.reducer