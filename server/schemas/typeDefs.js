const typeDefs = `
  type Book {
    bookId: ID!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
  }
    
  type User {
    _id: ID!
    username: String!
    email: String!
    password: String!
    savedBooks: [Book]
  }

  type Auth {
    token: ID!
    user: User
  }

  type Query {
    me: User
    searchBooks(query: String!): [Book]
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    addBooktoUser(userId: ID!, book: BookInput!): User
    deleteBook(userId: ID!, bookId: ID!): User
  }

  input BookInput {
    bookId: ID!
    authors: [String]
    description: String
    title: String!
    image: String
    link: String
  }
`;

module.exports = typeDefs;
