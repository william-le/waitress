import { createSlice } from '@reduxjs/toolkit'

export const claimSlice = createSlice({
  name: 'claim',
  initialState: {
    claim: [] as number[]
  },
  reducers: {
    add: (state) => {
      state.claim.push(0)
    }
  }
})
