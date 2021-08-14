const { gql } = require('apollo-server')

module.exports = gql`
  type Query{
    myTaskLists: [TaskList!]!
    getTaskList(id:ID!):TaskList
  }

  # Custom Query
  type User {
    id: ID!
    name: String!
    email: String!
    avatar: String
  }

  type TaskList {
    id: ID!
    createdAt: String!
    title: String!
    progress: Float!
    users: [User!]!
    todos: [ToDo!]
  }

  type ToDo {
    id: ID!
    content: String!
    isCompleted: Boolean!
    taskList: TaskList!
  }

  type AuthUser {
    user: User!
    token: String!
  }

  # custom inputs
  input SignUpInput {
    email: String!
    password: String!
    name: String!
    avatar: String
  }

  input SignInInput {
    email: String!
    password: String!
  }

  # All mutation
  type Mutation {
    # Authentication
    signUp(input: SignUpInput!): AuthUser!
    signIn(input: SignInInput!): AuthUser!

    # all releated with taskList
    createTaskList(title: String!): TaskList!
    updateTaskList(id: ID!, title: String!): TaskList!
    deleteTaskList(id:ID!):Boolean!
    addUserToTaskList(taskListId: ID!,userId:ID!): TaskList

    # All releated with ToDo
    createToDo(content:String!, taskListId: ID!): ToDo!
    updateToDo(id:ID!,content:String,isCompleted:Boolean): ToDo!
    deleteToDo(id:ID!): Boolean!
  }
`