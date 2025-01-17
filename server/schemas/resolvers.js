const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const fetch = require('node-fetch');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id }).select('-__v -password').populate('savedBooks');
        return userData;
      }
      throw new AuthenticationError('Not logged in');
    },
    searchBooks: async (parent, { query }) => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
        if (!response.ok) {
          throw new Error('Error fetching books from Google Books API');
        }
        const data = await response.json();
        return data.items.map((book) => ({
          bookId: book.id,
          authors: book.volumeInfo.authors || ['No author to display'],
          title: book.volumeInfo.title,
          description: book.volumeInfo.description,
          image: book.volumeInfo.imageLinks?.thumbnail || '',
          link: book.volumeInfo.infoLink,
        }));
      } catch (err) {
        console.error(err);
        throw new Error('Error fetching books');
      }
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);

      return { token, user };
    },

    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    addBooktoUser: async (parent, { userId, book }) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { savedBooks: book } },
        { new: true }
      ).populate('savedBooks');

      return updatedUser;
    },

    deleteBook: async (parent, { userId, bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: userId },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate('savedBooks');
        return updatedUser;
      }
      throw new AuthenticationError('Not logged in');
    },
  },
};

module.exports = resolvers;