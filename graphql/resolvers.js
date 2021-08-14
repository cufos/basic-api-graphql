const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Task = require('../models/taskList')
const { AuthenticationError, UserInputError } = require('apollo-server')
const { getToken } = require('../utils/validationData')
const { findOne } = require('../models/user')

module.exports = {
  Query: {
    myTaskLists: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      const taskList = await Task.find({ users: user.id }).toArray()

      return taskList
    },
    getTaskList: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      return await Task.findOne({ _id: ObjectId(id) })
    }
  },
  Mutation: {
    // ALl releated with authentication
    signUp: async (_, { input }) => {
      try {
        const hashedPassword = await bcrypt.hash(input.password, 10)

        const user = new User({
          password: hashedPassword,
          email: input.email,
          name: input.name,
          avatar: input.avatar
        })

        const savedUser = await user.save()

        return {
          token: getToken({ user: savedUser }),
          user: {
            id: savedUser._id,
            email: savedUser.email,
            name: savedUser.name,
            avatar: savedUser.avatar
          }
        }

      } catch (err) {
        console.log(err)
      }
    },
    signIn: async (_, { input: { email, password } }) => {
      try {
        const user = await User.findOne({ email })

        if (!user) {
          throw new AuthenticationError('Invalid credentials')
        }

        const correctPass = await bcrypt.compare(password, user.password)

        if (!correctPass) {
          throw new AuthenticationError('Invalid credentials')
        }


        return {
          token: getToken({ user }),
          user: {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            id: user._id
          }
        }

      } catch (err) {
        console.log(err)
      }
    },

    // All releated with taskList
    createTaskList: async (_, { title }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      const newTaskList = new TaskList({
        title,
        createdAt: new Date().toISOString(),
        users: [user]
      })

      const savedTaskList = await newTaskList.save()

      return {
        id: savedTaskList._id,
        createdAt: savedTaskList.createdAt,
        title: savedTaskList.title,
        users: savedTaskList.users,
        prgress: 0
      }
    },
    updateTaskList: async (_, { id, title }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      const task = await Task.findByIdAndUpdate({ _id: id }, { title })

      return {
        task
      }
    },
    deleteTaskList: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      await Task.deleteById({ _id: id })

      return true
    },
    addUserToTaskList: async (_, { taskListId, userId }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      const taskList = Task.findOne({ _id: taskListId })

      if (!taskList) {
        throw new UserInputError('The taskList do not exists')
      }

      if (taskList.users.find((user) => user.toString() === userId.toString())) {
        return tasklist
      }

      await Task.findByIdAndUpdate({ _id: taskListId }, { $addToSet: { users: userId } })

      taskList.users.push(userId)

      return taskList
    },

    // All releated with ToDo
    createToDo: async (_, { content, taskListId }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')
      const newToDo = {
        content,
        taskListId,
        isCompleted: false
      }

      const toDo = new ToDo({ ...newToDo })

      return await toDo.save()
    },
    updateToDo: async (_, data, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      const toDo = await ToDo.findByIdAndUpdate(data.id, { data })

      return toDo
    },
    deleteToDo: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Authentication error. Please sign in')

      await Task.deleteById({ _id: id })

      return true
    }
  },
  User: {
    id: ({ _id, id }) => _id || id
  },
  ToDo: {
    id: ({ _id, id }) => _id || id
  },
  TaskList: {
    id: ({ _id, id }) => _id || id,

    progress: async ({ _id }) => {
      const todos = await Task.find({ taskListId: _id }).toArray()

      const completed = todos.filter(todo => todo.isCompleted)

      if (todos.length === 0)
        return 0

      return 100 * completed.length / todos.length
    }
  }
}