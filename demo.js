const {MongoClient} = require('mongodb');


async function main() {
    const url = "mongodb+srv://mkp:kbcwjibojjs6238@cluster0.p8fbz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    const client = new MongoClient(url);

    try {
        await client.connect();

        //await deleteListingByName(client,"Cozy Cottage"); 

        //await updateAllListingToHavePropertyType(client);

        // await upsertListingByName(client,"Cozy Cottage",{name:"Cozy Cottage",
        // bedrooms:5,bathrooms:5});

        // await upsertListingByName(client,"Cozy Cottage",{name:"Cozy Cottage",
        // bedrooms:5,bathrooms:4});

        //await updateListingByName(client, "A lovely loft",{bedrooms:6, bathrooms:4});

        // await findOneListingByMinimumBedroomsBathroomsAndMostRecentReviews(client,{
        //     minimumNumberOfBedrooms:4,
        //     minimumNumberOfBathrooms:2,
        //     maximumNumberOfResults:5
        // });

        //await findOneListingByName(client,"A lovely loft");

        // await createMultipleListings(client,[ 
        //     {
        //         name:"A lovely loft",
        //         summary:"A charming loft in Paris",
        //         bedrooms:1,
        //         baathrooms:1
        //     },
        //     {
        //         name:"Private room in London",
        //         property_type:"Apartment",
        //         bedrooms:1,
        //         baathrooms:1
        //     },
        //     {
        //         name:"Beautiful Beach House",
        //         summary:"Enjoy realxed beach living",
        //         bedrooms:4,
        //         baathrooms:2.5,
        //         beds:7,
        //         last_review: new Date()
        //     }
        // ]);

    } catch(e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);

async function deleteListingByName(client, nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingAndReviews").deleteOne({name:nameOfListing});

    console.log(`${result.deletedCount} documents was/were deleted`);
}

async function updateAllListingToHavePropertyType(client){
    const result = await client.db("sample_airbnb").collection("listingAndReviews")
    .updateMany({property_type:{$exists:false}},
        {$set: {property_type:"Unknown"}});

    console.log(`${result.matchedCount} document(s) matched with the query criteria`);
    console.log(`${result.modifiedCount} documents was/were updated`);
}

async function upsertListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingAndReviews")
    .updateOne({name:nameOfListing},{$set:updatedListing},{upsert:true});

    console.log(`${result.matchedCount} document(s) matched with the query criteria`);
    
    if(result.upsertedCount>0){
        console.log(`One document was inserted with the id ${result.upsertedId}`);

    } else{
        console.log(`${result.modifiedCount} documents was/were updated`);
    }

}

async function updateListingByName(client, nameOfListing, updatedListing){
    const result = await client.db("sample_airbnb").collection("listingAndReviews")
    .updateOne({name:nameOfListing},{$set:updatedListing});

    console.log(`${result.matchedCount} document(s) matched with the query criteria`);
    console.log(`${result.modifiedCount} documents was/were updated`);


}

async function findOneListingByMinimumBedroomsBathroomsAndMostRecentReviews
(client,{
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}){
    const cursor = await client.db("sample_airbnb").collection("listingAndReviews").find({
        bedrooms:{$gte:minimumNumberOfBedrooms},
        bathrooms:{$gte:minimumNumberOfBathrooms}
    }).sort({last_review:-1})
    .limit(maximumNumberOfResults);

    const results = await cursor.toArray(); 
    
    if(results.length>0){
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} 
        bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result,i)=>{
            date = new Date(result.last_review).toDateString();
            console.log();
            console.log(`${i+1}, name:${result.name}`);
            console.log(`   _id:${result.id}`);
            console.log(`   bedrooms:${result.bedrooms}`);
            console.log(`   bathrooms:${result.bathrooms}`);
            console.log(`   most recent reviews date: ${new Date(result.last_review).toDateString}`);
        })
    } else{
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms 
        and ${minimumNumberOfBathrooms} bathrooms:`);
    }

}


async function findOneListingByName(client,nameOfListing){
    const result = await client.db("sample_airbnb").collection("listingAndReviews").findOne({name:nameOfListing});
    if(result){
        console.log(`Found a listing in the collection with the name '${nameOfListing}'`);
        console.log(result);
    }
    else {
        console.log(`No listing found with the name '${nameOfListing}'`);
    }

}

async function createMultipleListings(client, newListings){
    const results = await client.db("sample_airbnb").collection("listingAndReviews").insertMany(newListings);
    console.log(`${results.insertedCount} New listing created with the follwoing id: `);
    console.log(results.insertedIds);
   
}

async function createListing(client, newListing){
   const result = await client.db("sample_airbnb").collection("listingAndReviews").insertOne(newListing);
   console.log(`New listing created with the follwoing id: ${result.insertedId}`);

}

async function listDatabases(client) {
    const databaseList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databaseList.databases.forEach(db => {
        console.log(`- ${db.name}`);
    });
}