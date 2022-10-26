import React, { useState, useEffect } from "react";
import { makeStyles } from 'tss-react/mui';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FactoryContract from './contracts/FundraiserFactory.json';
import Web3 from "web3";


const NewFundraiser = () => {

    const [ name, setFundraiserName ] = useState(null)
    const [ website, setFundraiserWebsite ] = useState(null)
    const [ description, setFundraiserDescription ] = useState(null)
    const [ image, setImage ] = useState(null)
    const [ address, setAddress ] = useState(null)
    const [ custodian, setCustodian ] = useState(null)
    const [ contract, setContract] = useState(null)
    const [ accounts, setAccounts ] = useState(null)

    useEffect(() => {
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
                // setWeb3(web3)
                setContract(instance)
                setAccounts(accounts)

            }catch(error){
                alert(`Failed to load web3, accounts, or contract. Check console for details.`);
                console.error(error);
            }
        }
        init();       
    }, []);

    const useStyles = makeStyles(theme => ({
        container: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        textField: {
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
        },
        dense: {
            marginTop: theme.spacing(2),
        },
        menu: {
            width: 200,
        },
        button: {
            margin: theme.spacing(1),
        },
        input: {
            display: 'none',
        },

    }));

    const classes = useStyles();

    async function handleSubmit(){

        await contract.methods.createFundraiser(
            name,
            website,
            image,
            description,
            address,
            custodian
        ).send({ from: accounts[0] });

        alert('Successfully created fundraiser');

    }

    return (
    <div>
        <h2>Create a New Fundraiser</h2>

        <label>Name</label>
        <TextField
        id="outlined-bare"
        className={classes.textField}
        placeholder="Fundraiser Name"
        margin="normal"
        onChange={(e) => setFundraiserName(e.target.value)}
        variant="outlined"
        inputProps={{ 'aria-label': 'bare' }}
        />

        <label>Website</label>
        <TextField
        id="outlined-bare"
        className={classes.textField}
        placeholder="Fundraiser Website"
        margin="normal"
        onChange={(e) => setFundraiserWebsite(e.target.value)}
        variant="outlined"
        inputProps={{ 'aria-label': 'bare' }}
        />

        <label>Description</label>
        <TextField
        id="outlined-bare"
        className={classes.textField}
        placeholder="Fundraiser Description"
        margin="normal"
        onChange={(e) => setFundraiserDescription(e.target.value)}
        variant="outlined"
        inputProps={{ 'aria-label': 'bare' }}
        />

        <label>Image</label>
        <TextField
        id="outlined-bare"
        className={classes.textField}
        placeholder="Fundraiser Image"
        margin="normal"
        onChange={(e) => setImage(e.target.value)}
        variant="outlined"
        inputProps={{ 'aria-label': 'bare' }}
        />

        <label>Address</label>
        <TextField
        id="outlined-bare"
        className={classes.textField}
        placeholder="Fundraiser Ethereum Address"
        margin="normal"
        onChange={(e) => setAddress(e.target.value)}
        variant="outlined"
        inputProps={{ 'aria-label': 'bare' }}
        />

        <label>Custodian</label>
        <TextField
        id="outlined-bare"
        className={classes.textField}
        placeholder="Fundraiser Custodian"
        margin="normal"
        onChange={(e) => setCustodian(e.target.value)}
        variant="outlined"
        inputProps={{ 'aria-label': 'bare' }}
        />

        <Button
            onClick={handleSubmit}
            variant="contained"
            className={classes.button}>
            Submit
        </Button>

    </div>
    )

}

export default NewFundraiser;