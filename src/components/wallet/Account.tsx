import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store'

function Account() {

    const account = useSelector((state: RootState) => state.accounts.list.find(a => a.name === state.accounts.selected))


    return <div>
        {!account && <div>no pucha selected</div>}
    </div>
}

export default Account