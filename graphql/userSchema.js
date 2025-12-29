const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql');
const User = require("../model/users"); // Import Mongoose User model

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    hospitalName: { type: GraphQLString },
    designation: { type: GraphQLString },
    contactNumber: { type: GraphQLString },
    department: { type: GraphQLString },
    userType: { type: GraphQLString },
    accountStatus: { type: GraphQLString },
  }),
});

// Queries for User
const userQuery = {
  users: {
    type: new GraphQLList(UserType),
    resolve() {
      return User.find();
    },
  },
  user: {
    type: UserType,
    args: { id: { type: GraphQLID } },
    resolve(parent, args) {
      return User.findById(args.id);
    },
  },
};

// Mutations for User
const userMutation = {
  addUser: {
    type: UserType,
    args: {
      firstName: { type: new GraphQLNonNull(GraphQLString) },
      lastName: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve(parent, args) {
      const user = new User({
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
      });
      return user.save();
    },
  },
};

module.exports = { userQuery, userMutation };
