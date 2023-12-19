

// Insert query

const { db } = require("../model/project");

db.products.insertOne({name:"shiv", item:"box-item", qty:20});
// res
//{ "acknowledged" : true, "insertedId" : 10 }

// Insert many  => for array of documents
    db.products.insertMany( [
       { item: "card", qty: 15 },
       { item: "envelope", qty: 20 },
       { item: "stamps" , qty: 30 }
    ] );

    // {
    //     "acknowledged" : true,
    //     "insertedIds" : [
    //        ObjectId("562a94d381cb9f1cd6eb0e1a"),
    //        ObjectId("562a94d381cb9f1cd6eb0e1b"),
    //        ObjectId("562a94d381cb9f1cd6eb0e1c")
    //     ]
    //  }
    
    // IF I NEED TO INSERT ARRAY OF DOC WITH UNORDERED
        db.products.insertMany( [
            { _id:1, item: "large box", qty: 100 },
            { _id:2, item: "small box", qty: 200 },
            { _id:3, item: "medium box", qty: 300 },
        ], { ordered: false } );

// Additional Methods for Inserts
// The following methods can also add new documents to a collection:

        db.restaurant.updateOne(
            { name:"john" },
            { $set: { violations:3 } },
        );

// Setting upsert: true would insert the document if no match was found. See 
// Update with Upsert

// DOC
db.members.insertMany( [
    { "_id" : 1, "member" : "abc123", "status" : "A", "points" : 2, "misc1" : "note to self: confirm status", "misc2" : "Need to activate", "lastUpdate" : ISODate("2019-01-01T00:00:00Z") },
    { "_id" : 2, "member" : "xyz123", "status" : "A", "points" : 60, comments: [ "reminder: ping me at 100pts", "Some random comment" ], "lastUpdate" : ISODate("2019-01-01T00:00:00Z") }
] )



db.members.updateOne(
    { _id: 1 },
    [
       { $set: { status: "Modified", comments: [ "$misc1", "$misc2" ], lastUpdate: "$$NOW" } },
       { $unset: [ "misc1", "misc2" ] }
    ]
);

// RESP

// { 
//     "_id" : 1, "member" : "abc123", "status" : "Modified", "points" : 2, "lastUpdate" : ISODate("2020-01-23T05:21:59.321Z"), "comments" : [ "note to self: confirm status", "Need to activate" ] 
// }
// { 
//     "_id" : 2, "member" : "xyz123", "status" : "A", "points" : 60, "comments" : [ "reminder: ping me at 100pts", "Some random comment" ], "lastUpdate" : ISODate("2019-01-01T00:00:00Z") 
// }

// The $set stage:

// creates a new array field comments whose elements are the current content of the misc1 and misc2 fields and
// The $unset stage removes the misc1 and misc2 fields.

//Update with Upsert : UPSERT TRUE => INSERT NEW DOC WHEN FILTER CONDITION NOT FIND 

db.restaurant.updateOne(
    { name:"pizza one" },
    { $set: { "_id" : 4, "violations" : 7, "borough" : "Manhattan" } },
    { upsert:true },
)
// get monthly data
db.test.aggregate([
    {$group: {
        _id: {$substr: ['$bookingdatetime', 5, 2]}, 
        numberofbookings: {$sum: 1}
    }}
])








