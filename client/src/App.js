import "./App.css";
import { makeStyles } from 'tss-react/mui';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from "react";
import FactoryContract from "./contracts/FundraiserFactory.json";
import Web3 from "web3";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from "react-router-dom";

import Home from "./Home";
import NewFundraiser from "./NewFundraiser";

function App() {
  const [state, setState] = useState({web3: null, accounts: null, contract: null});
  const [storageValue, setStorageValue] = useState(0);

  const useStyles = makeStyles({
    root: {
    flexGrow: 1,
    },
  });
  const classes = useStyles();

  useEffect(()=>{

    const init = async() =>{
      try{
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:9545');
        const accounts = await web3.eth.getAccounts();
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = await FactoryContract.networks[networkId];
        const instance = new web3.eth.Contract(
          FactoryContract.abi,
          deployedNetwork && deployedNetwork.address,
        );
        setState({web3, accounts, contract: instance});
        console.log(accounts[0])
      }catch(error){
        alert(
          `Failed to load web3, accounts, or contract.
          Check console for details.`,
          )
          console.error(error);
      }
    }
    init();

  },[])


  return (
    <Router>
    <div>
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" color="inherit">
          <NavLink className="nav-link" to="/">Home</NavLink>
        </Typography>
        <NavLink className="nav-link" to="/new">New Fundraiser</NavLink>
      </Toolbar>
    </AppBar>
    
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/new">
          <NewFundraiser />
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
    </Router>
  );
}

export default App;


