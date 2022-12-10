import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import SwapVerticalCircleOutlinedIcon from '@material-ui/icons/SwapVerticalCircleOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import './App.css';
import { useState } from 'react';
import { BigNumber, ethers } from 'ethers'
import Swap from '@artifacts/contracts/Swap.sol/Swap.json'
import Token from '@artifacts/contracts/SecurityToken.sol/SecurityToken.json'
import { tokens } from '@deploy/token-list.json';
import { swaps } from '@deploy/swap-list.json';
const greeterAddress = "your-contract-address"
function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        VMware Blockchain
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    //backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundImage: 'url(/vmbc.png)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
   // backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(7, 5),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  fieldspacing: {
    margin: theme.spacing(2, 0, 2),
  },
  selectspacing: {
    margin: theme.spacing(3, 0, 1),
  },

}));
export default function SignInSide() {
  const classes = useStyles();
  const [tokenType, setTokenTypeValue] = useState(0)
  const [swapType, setSwapTypeValue] = useState(1)
  const [userAccount, setUserAccount] = useState()
  const [amount, setAmount] = useState()
  const [swapAmount, setSwapAmount] = useState()
  const [tokenBalance, setTokenBalance] = useState()
  const [userAddress, setUserAddress] = useState()
  const [toAddress, setToAddress] = useState()
  const [tokenAddress, setTokenAddress] = useState(tokens[0].contractAddress)
  const [swapContractAddress, setSwapContractAddress] = useState(swaps[0].contractAddress)
  const [swapRate, setSwapRate] = useState(1)
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }
  //financial = (x) => Number.parseFloat(x).toFixed(2);
  async function getBalance() {
    console.log("called " + tokenType)
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setUserAddress(account)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      const balance = await contract.balanceOf(account);

      setTokenBalance((balance / 1000000000000000000).toFixed(0));
      /*
      if (balance.toString().length == "22")
          setTokenBalance(balance.toString().substring(0,4));
      else
          setTokenBalance(balance.toString().substring(0,3));

      */
    }
  }
  async function transferTokens() {
    console.log(toAddress)
    if (typeof window.ethereum !== 'undefined') {
      // await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);

      //const amountToSend = amount + "00000000000000000";
      const amountToSend = (amount * 1000000000000000000).toFixed(0);
      console.log(amountToSend);
      const transaction = await contract.transfer(toAddress, amountToSend);
      await transaction.wait();
      console.log(`${amount} Tokens successfully sent to ${toAddress}`);
      getBalance();

    }
  }
  async function swapTokens() {
    console.log(toAddress)
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      //const amountToSend = swapAmount + "00000000000000000";
      const amountToSend = (swapAmount * 1000000000000000000).toFixed(0);
      console.log(amountToSend);
      const transaction = await contract.approve(swapContractAddress, amountToSend);
      await transaction.wait();
      const swapContract = new ethers.Contract(swapContractAddress, Swap.abi, signer);
      const transactionSwap = await swapContract.swapTokens(amountToSend);
      //console.log(`${amount} Tokens successfully sent to ${toAddress}`);
      getBalance();
    }
  }
  async function handleChange(event) {
    console.log(event.target.value)
    //making sure ../deploy/token-list.json has contractAddress field for each token
    if(typeof tokens[event.target.value].contractAddress !== undefined){
      setTokenAddress(tokens[event.target.value].contractAddress)
    }
    setTokenTypeValue(event.target.value)
  }
  async function handleSwapChange(event) {
    console.log(event.target.value)
    setSwapTypeValue(event.target.value)
  }
  getBalance();
  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline/>
      <Grid item xs={false} sm={4} md={6} className={classes.image}/>
      <Grid item xs={12} sm={8} md={6} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <SwapVerticalCircleOutlinedIcon/>
          </Avatar>
          <Typography component="h1" variant="h5">
           Transfer or Swap ERC20 Tokens
          </Typography>
          <form className={classes.form} noValidate>
            <InputLabel id="demo-simple-select-label" variant="outlined">tokens</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={tokenType || 0}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                className={classes.selectspacing}
              >
                <MenuItem value={0}>GST</MenuItem>
                <MenuItem value={1}>SCT</MenuItem>
            </Select>
            <TextField
              label="Contract Address"
              id="contractAddress"
              id="outlined-size-normal"
              defaultValue={tokenAddress || ''}
              value={tokenAddress || ''}
              variant="filled"
              className={classes.fieldspacing}
              fullWidth/>
            <TextField
              label="Your Address"
              id="outlined-size-normal"
              defaultValue={userAddress || ''}
              value={userAddress || ''}
              variant="filled"
              fullWidth/>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="toAddress"
              label="Address to send tokens"
              name="toAddress"
              autoFocus
              value={toAddress}
              onChange={e => setToAddress(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="amount"
              label="Amount to send"
              name="amount"
              autoFocus
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
            <TextField
              margin="normal"
              variant="filled"
              required
              fullWidth
              name="tokenBalance"
              label="Your Token Balance"
              id="tokenBalance"
              value={tokenBalance || ''}
            />
            <Button
              onClick={transferTokens}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Transfer
            </Button>
            <InputLabel id="demo-simple-select-label" variant="outlined">Swap To</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select-convert"
                value={swapType || 0  }
                onChange={handleSwapChange}
                fullWidth
                variant="outlined"
                className={classes.selectspacing}
              >
                <MenuItem value={0}>GST</MenuItem>
                <MenuItem value={1}>SCT</MenuItem>
            </Select>
            <TextField
              label="Rate"
              id="swaprate"
              id="outlined-size-normal"
              defaultValue={swapRate || '1'}
              value={swapRate || '1'}
              variant="filled"
              className={classes.fieldspacing}
              fullWidth
            />
            <TextField
              label="Swap Contract Address"
              id="swapcontractAddress"
              id="outlined-size-normal"
              defaultValue={swapContractAddress || ''}
              value={swapContractAddress || ''}
              variant="filled"
              className={classes.fieldspacing}
              fullWidth
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="swapamount"
              label="Amount to Swap"
              name="swapamount"
              autoFocus
              value={swapAmount}
              onChange={e => setSwapAmount(e.target.value)}
            />
            <Button
              onClick={swapTokens}
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              Swap
            </Button>
            <Box mt={5}>
              <Copyright/>
            </Box>
          </form>
        </div>
      </Grid>
    </Grid>
  );
}
