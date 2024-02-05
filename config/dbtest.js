// students collection

const { db } = require("../model/users")

// {
//     "_id":"65c07e5ceae531c6aa35d054",
//     "student": "Alice",
//     "score": 85,
//     "salary": 80000
// }
// {
//     "_id":"65c07e5ceae531c6aa35d054",
//     "student": "Alice",
//     "score": 85,
//     "salary": 80000
// }

db.students.aggregate([
    {
        $bucket:{
            groupBy: "$score",
            boundaries:[0,10,30,40,50,60,70,80,90,100],
            default:"Unknown",
            output:{
                count: {$sum:1},
                students:{$push:"$student"}
            }
        }
    }
])

// res
data = [
    {
        _id: 70,
        count: 1,
        students: ['Charlie']
    },
    {
        _id: 80,
        count: 1,
        students: ['Alice']
    },
    {
        _id: 90,
        count: 2,
        students: ['Bob','David']
    }
]

// bucketAuto

db.students.aggregate([
    {
        $bucketAuto:{
            groupBy: "$score",
            buckets: 3,
            output:{
                count:{$sum:1},
                students:{$push:"$student"}
            }
        }
    }
])

// $facet  => $facet stage in mongodb aggregation pipeline is used to perform multiple independent aggregation on the 
// sme set of input docs

db.sales.aggregate([
    {
        $facet:{
            "totalRevenue":[
                {
                    $group:{ _id: null, total: {$sum:{$multiply:["$quantity","$price"]}} }
                }
            ],
            "shippedOrdersCount":[
                {$match:{status:"Shipped"}},
                {$group:{_id:null, count:{$sum:1}}}
            ]
        }
    }
])




