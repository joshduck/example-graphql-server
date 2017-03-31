var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var data = require('./data');

// Define a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello(name: String): String
    author(id: ID!): Author
    article(id: ID!): Article
    news(count: Int!): [Article]
  }

  type Article {
    title: String!
    author: Author!
    href: String!
    likeCount: Int!
    commentCount: Int!
  }

  type Author {
    image: String!
    name: String!
  }
`);

// Define data fetching for each type
class Article {
  constructor(id) {
    this.data = data.article[id];
  }

  title() {
    return this.data.title;
  }

  href() {
    return this.data.href;
  }

  likeCount() {
    return this.data.likeCount;
  }

  commentCount() {
    return this.data.commentCount;
  }

  author() {
    return new Author(this.data.author);
  }
}

class Author {
  constructor(id) {
    this.data = data.author[id];
  }

  name() {
    return this.data.name;
  }

  image() {
    return this.data.image;
  }
}


// The root provides a resolver function for each API endpoint
var root = {
  hello: ({name}) => {
    return 'Hello ' + (name || 'World');
  },

  news: ({count}) => {
    return Object.keys(data.article)
      .slice(0, count)
      .map(id => new Article(id));
  },

  article: ({id}) => {
    return new Article(id);
  },

  author: ({id}) => {
    return new Author(id);
  }
};

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');
