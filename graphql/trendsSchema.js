const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const Trends = require("../model/trends_ventilator_collection"); // Import Mongoose Trends model

const TrendsType = new GraphQLObjectType({
    name: 'Trends',
    fields: () => ({
      id: { type: GraphQLID },
      did: { type: GraphQLString },
      time: { type: GraphQLString },
      type: { type: GraphQLString },
      mode: { type: GraphQLString },
      pip: { type: GraphQLString },
      peep: { type: GraphQLString },
      mean_Airway: { type: GraphQLString },
      vti: { type: GraphQLString },
      vte: { type: GraphQLString },
      mve: { type: GraphQLString },
      mvi: { type: GraphQLString },
      fio2: { type: GraphQLString },
      respiratory_Rate: { type: GraphQLString },
      ie: { type: GraphQLString },
      tinsp: { type: GraphQLString },
      texp: { type: GraphQLString },
      averageLeak: { type: GraphQLString },
      sPo2: { type: GraphQLString },
      pr: { type: GraphQLString },
    }),
  });


// Query to fetch trends by did
const trendsQuery = {
    trendsByDid: {
      type: new GraphQLList(TrendsType),
      args: { did: { type: GraphQLString } },
      resolve(parent, args) {
        return Trends.find({ did: args.did });
      },
    },
    trends: {
      type: new GraphQLList(TrendsType),
      resolve() {
        return Trends.find();
      },
    },
    trend: {
      type: TrendsType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Trends.findById(args.id);
      },
    },
};

// Mutations for Trends
const trendsMutation = {
  addTrend: {
    type: TrendsType,
    args: {
      did: { type: new GraphQLNonNull(GraphQLString) },
      time: { type: new GraphQLNonNull(GraphQLString) },
      type: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve(parent, args) {
      const trend = new Trends({
        did: args.did,
        time: args.time,
        type: args.type,
      });
      return trend.save();
    },
  },
};

module.exports = { trendsQuery, trendsMutation };
