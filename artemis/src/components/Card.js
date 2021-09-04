import React from 'react'
import './Card.css'
import styled from "styled-components";
import { makeStyles } from '@material-ui/core/styles';

const Button = styled.button`
    background-color: black;
    color: white;
    font-size: 15px;
    padding: 10px 20px;
    border-radius: 5px;
    margin: 10px 0px;
    cursor: pointer;
  `;
  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1),
    },
  }));
  
  
function Card({title,imageUrl,artist}){
    const classes = useStyles();
    return(
        
        <div className='card'>

            <div className="image-container">
                <img src={imageUrl} alt=''/>
            </div>
            <div className='card-title'>
                <h3>{title}</h3>
            </div>
            
            <div className='card-body'>

              
                Artist: {artist}
                

            </div>
            
        </div>
    )
}

export default Card