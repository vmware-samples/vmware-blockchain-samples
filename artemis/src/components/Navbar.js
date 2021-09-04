import React from 'react'
import './Navbar.css'

function Navbar({currentUser}){
    return(
        // "https://www.datocms-assets.com/2885/1551892148-vmware-1.jpg?w=560&h=240&fit=crop"
        <div className="Navbar">
<div className='navbar-brand'>
<img src="https://www.datocms-assets.com/2885/1551892148-vmware-1.jpg?w=560&h=240&fit=crop" alt='hey' width='80px' margin-left='20px' />
</div>

            <div className="leftside">
                <p>Digital Art NFT</p>
            </div>
            <div className="rightside">
                <p>Current User: {currentUser}</p>
            </div>

        </div>
    )
}

export default Navbar