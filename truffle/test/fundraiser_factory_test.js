const FundraiserFactoryContract = artifacts.require("FundraiserFactory");

contract("FundraiserFactory: deployment",()=>{
    it("FundraiserFactory has been deployed", async()=>{
        const fundraiserFactory = await FundraiserFactoryContract.deployed();
        assert(fundraiserFactory,"Contract not been deployed");
    })
});

//create fundraisers
contract("Create fundraisers",(accounts)=>{
    let fundraiserFactory;
    // fundraiser args
    const name = "Beneficiary Name";
    const url = "beneficiaryname.org";
    const imageURL = "https://placekitten.com/600/350"
    const bio = "Beneficiary Description"
    const beneficiary = accounts[1];

    it("Increments the fundraisers count by one",async()=>{

        fundraiserFactory = await FundraiserFactoryContract.deployed();
        const currentfundraisersCount = await fundraiserFactory.fundraisersCount();
        await fundraiserFactory.createFundraiser(name,url,imageURL,bio,beneficiary);
        const newfundraisersCount = await fundraiserFactory.fundraisersCount();

        const diff = newfundraisersCount - currentfundraisersCount;

        assert.equal(1, diff, "Count not incremented properly");
    })

    it("Emits an event when a fundraiser is created", async()=>{
        fundraiserFactory = await FundraiserFactoryContract.deployed();

        const tx = await fundraiserFactory.createFundraiser(name,url,imageURL,bio,beneficiary);
        const expectedEvent ="FundraiserCreated";
        const actualEvent = tx.logs[0].event;

        assert.equal(actualEvent,expectedEvent, "Event are not matching");
    })
});

contract("Get fundraisers",(accounts)=>{
    async function createFundraiserFactory(fundraiserCount, accounts) {
        const factory = await FundraiserFactoryContract.new();
        await addFundraisers(factory, fundraiserCount, accounts);
        return factory;
    }
    async function addFundraisers(factory,count,accounts){
        const name = "Beneficiary";
        const lowerCaseName = name.toLowerCase();
        const beneficiary = accounts[1];
        for (let i=0; i < count; i++) {
            await factory.createFundraiser(
            // create a series of fundraisers. The index will be used
            // to make them each unique
            `${name} ${i}`,
            `${lowerCaseName}${i}.com`,
            `${lowerCaseName}${i}.png`,
            `Description for ${name} ${i}`,
            beneficiary
            );
        }
    }

    describe("when fundraiser collection is empty", ()=>{

        it("returns 0 when fundraiser collection is empty", async()=>{
            const factory = await createFundraiserFactory(0,accounts);
            const fundraisers = await factory.fundraisers(10, 0);
            assert.equal(fundraisers.length,0,"collection should be empty");    
        })

        
    });

    describe("testing varying limits", ()=>{
        let factory;
        beforeEach(async () => {
            factory = await createFundraiserFactory(30, accounts);
        })

        it("returns 10 results when limit requested is 10", async ()=>{
            const fundraisers = await factory.fundraisers(10, 0);
            assert.equal(fundraisers.length,10,"results size should be 10");
        });

        xit("returns 20 when limit is 20", async()=>{
            const fundraisers = await factory.fundraisers(20, 0);
            assert.equal(fundraisers.length, 20, "result size should be 20");
        })

        xit("returns 20 results when limit requested is 30", async ()=>{
            const fundraisers = await factory.fundraisers(30, 0);
            assert.equal(fundraisers.length,20,"results size should not exceed 20");
        });
        
    })
});