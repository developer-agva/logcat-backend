const { GraphQLSchema, GraphQLObjectType } = require('graphql');
const { userQuery, userMutation } = require('./userSchema');
const { trendsQuery, trendsMutation } = require('./trendsSchema');

// Root Query
const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    ...userQuery,
    ...trendsQuery,
  },
});

// Root Mutation
const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...userMutation,
    ...trendsMutation,
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});
