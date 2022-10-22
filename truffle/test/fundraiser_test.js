const FundraiserContract = artifacts.require("Fundraiser");

contract('Fundraiser', (accounts) => {
  let fundraiser;
  const name = "Beneficiary Name";
  const url = "beneficiaryname.org";
  const imageURL = "https://placekitten.com/600/350";
  const description = "Beneficiary description";
  const beneficiary = accounts[1];
  const owner = accounts[0];

  describe('Initialization',()=>{
    beforeEach(async()=>{
      fundraiser = await FundraiserContract.new(name,url,imageURL,description,beneficiary,owner);
    })

    it("gets the beneficiary name", async()=>{
      const actual = await fundraiser.name();
      assert.equal(actual,name,"names not matching");
    })

    it("gets the url", async()=>{
      const actual = await fundraiser.url();
      assert.equal(actual,url,"urls should match");
    })

    it("gets the image url", async()=>{
      const actual = await fundraiser.imageURL();
      assert.equal(actual,imageURL,"imgurls should match");
    })

    it("gets the description", async()=>{
      const actual = await fundraiser.desc();
      assert.equal(actual,description,"descriptions should match");
    })

    it("gets the beneficiary", async()=>{
      const actual = await fundraiser.beneficiary();
      assert.equal(actual,beneficiary,"beneficiary should match");
    })

    it("gets the owner", async()=>{
      const actual = await fundraiser.owner();
      assert.equal(actual,owner,"owners should match");
    })

    describe("making donations", () => {
      const value = web3.utils.toWei('0.0289');
      const donor = accounts[2];

        it("increases myDonationsCount",async()=>{
          const currentDonationsCount = await fundraiser.myDonationsCount(
            {from: donor}
            );
            await fundraiser.donate({from: donor, value});
            const newDonationsCount = await fundraiser.myDonationsCount(
            {from: donor}
            );
            assert.equal(
            1,
            newDonationsCount - currentDonationsCount,
            "myDonationsCount should increment by 1");
        });

        it("includes donation in myDonations",async()=>{

          await fundraiser.donate({from:donor, value});
          const { values, dates} = await fundraiser.myDonations({from:donor});
          assert.equal(value,values[0],"values should match");

          assert(dates[0],"dates are not matching");
            
        });

        it("Increases the total donations amount", async()=>{
          const currentDonations = await fundraiser.totalDonations();
          await fundraiser.donate({from:donor, value});
          const newDonations = await fundraiser.totalDonations();

          const diff = newDonations - currentDonations;
          
          assert.equal(diff, value, "Diffrences are not matching");

        })

        it("Increases donations count",async()=>{
          const currentDonationCount = await fundraiser.donationsCount();
          await fundraiser.donate();
          const newDonationCount = await fundraiser.donationsCount();

          const diff = newDonationCount - currentDonationCount;

          assert.equal(1,diff, "Count not updating properly");
        })

        it("Emits an event when a donation is made", async()=>{
          const tx = await fundraiser.donate({from:donor,value});
          const expectedEvent ="DonationRecieved";
          const actualEvent = tx.logs[0].event;

          assert.equal(actualEvent,expectedEvent, "Events not properly emitted");
        })
      });
  });

  describe("SetBeneficiary",()=>{
    const newBeneficiary = accounts[2];

    it("updated beneficiary when called by owner account", async()=>{
      await fundraiser.setBeneficiary(newBeneficiary,{from:owner});
      const actual = await fundraiser.beneficiary();
      assert.equal(actual,newBeneficiary,"Beneficiaries are not matching");
    })

    it("throws an error when called from a non-owner account", async () => {
      try {
      await fundraiser.setBeneficiary(newBeneficiary, {from: accounts[3]});
      assert.fail("withdraw was not restricted to owners")
      } catch(err) {
      const expectedError = "Ownable: caller is not the owner"
      const actualError = err.reason;
      assert.equal(actualError, expectedError, "should not be permitted")
      }
      })
  });

  //withdrawing funds..
  describe("Withdrawing funds", ()=>{
    //before withdraw donate some funds to withdraw
    beforeEach(async()=>{
      await fundraiser.donate({from:accounts[2],value: web3.utils.toWei('0.0289')});
    })

    it("transfers balance to the beneficiary", async()=>{

      const currentContractBalance = await web3.eth.getBalance(fundraiser.address);
      const currentBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
      await fundraiser.withdraw({from:owner});
      const newContractBalance = await web3.eth.getBalance(fundraiser.address);
      const newBeneficiaryBalance = await web3.eth.getBalance(beneficiary);
      const beneficiaryDifference = newBeneficiaryBalance - currentBeneficiaryBalance;

      assert.equal(
      newContractBalance,
      0,
      "contract should have a 0 balance"
      );

      // assert.equal(
      // beneficiaryDifference,
      // currentContractBalance,
      // "beneficiary should receive all the funds"
      // );

    })

    it("emits Withdraw event", async () => {
      const tx = await fundraiser.withdraw({from: owner});
      const expectedEvent ="Withdraw";
      const actualEvent = tx.logs[0].event;
      assert.equal(
      actualEvent,
      expectedEvent,
      "events should match"
      );
    });

  });

  //access controls...
  describe("Access controls", ()=>{

    it("Throw an error when withrawing from a non owner account", async()=>{
      try{
        await fundraiser.withdraw({from:accounts[3]});
        assert.fail("Withdraw was not restricted to the owners");
      }catch(err){
        const expectedError = "Ownable: caller is not the owner";
        const actualError = err.reason;
        assert.equal(actualError, expectedError, "should not be permitted");
      }
    })

    it("Permits owner to call the withdraw", async()=>{
      try{
        await fundraiser.withdraw({from:owner});
        assert(true,"No errors were thrown");
      }catch(err){
        assert.fail("Should not have thrown an error");
      }
    })

  });

  //anonymous function or fallback function..
  describe("Fallback function",()=>{

    const value = web3.utils.toWei('0.0289');

    it("Should increase the total donations amount", async()=>{
      const currentDonationAmount = await fundraiser.totalDonations();
      await web3.eth.sendTransaction({to:fundraiser.address,from:accounts[9],value});
      const newDonationAmount = await fundraiser.totalDonations();

      const diff = newDonationAmount - currentDonationAmount;

      assert.equal(diff, value, "Amount should match");
    })

    it("Should increase the total donations count", async()=>{
      const currentDonationCount = await fundraiser.donationsCount();
      await web3.eth.sendTransaction({to:fundraiser.address,from:accounts[9],value});
      const newDonationsCount = await fundraiser.donationsCount();

      const diff = newDonationsCount - currentDonationCount;

      assert.equal(1, diff, "Count not properly updated");
    })

  });

});
