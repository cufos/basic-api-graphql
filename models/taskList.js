const { Schema, model } = require('mongoose')

const taskListSchema = new Schema({
  createdAt: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  progress: {
    type: Number
  },
  users: {
    type: [Schema.Types.ObjectId],
    ref: 'User'
  }
})

taskListSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v

    delete returnedObject.password
  }
})

module.exports = model('TaskList', taskListSchema)

