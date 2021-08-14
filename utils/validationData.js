const jwt = require('jsonwebtoken')
require('dotenv').config()
const { ForbiddenError } = require('apollo-server')
const { SECRET } = process.env
const User = require('../models/user')

const extractToken = async (req) => {
  const header = req.headers.authorization
  const token = header.split(' ')[1]

  return verifyToken({ token })
}

const verifyToken = async ({ token }) => {
  if (!token) throw new ForbiddenError('Invalid token or missing')

  const tokenData = jwt.verify(token, SECRET)

  if (!tokenData.dataToken.id) {
    throw new ForbiddenError('Invalid token or missing')
  }

  return await User.findOne({ id: tokenData.id })
}

const getToken = ({ user }) => {
  const dataToken = {
    id: user._id,
  }

  return jwt.sign({ dataToken }, process.env.SECRET, { expiresIn: '7 days' })
}

module.exports = {
  verifyToken,
  getToken,
  extractToken
}