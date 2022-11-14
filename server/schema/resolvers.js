const { User } = require('../models');
const { AuthenticationError } = require('apollo-server-express')
const { signToken } = require('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v -password')
                return userData;
            }
            throw new AuthenticationError('Not logged in')
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email })
            if (!user) {
                throw new AuthenticationError('User not found')
            }
            const validPassword = await user.isCorrectPassword(password)


            if (!validPassword) {
                throw new AuthenticationError('Incorrect password')
            }
            const token = signToken(user);
            return { token, user }
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { user, token };
        },
        addBook: async (parent, { bookdata }) => {
            if (context.user) {

                const updatedUser = await User.findOneAndUpdate(

                    { _id: context.user._id },
                    { $push: { savedBooks: bookdata } },
                    { new: true }
                );
                return updatedUser
            }
            throw new AuthenticationError('Must be signed in')

        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const book = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: book.bookId } },
                    { new: true }
                )
                return book;

            }

            throw new AuthenticationError('Must be signed in')

        },

    },


};

module.exports = resolvers;
