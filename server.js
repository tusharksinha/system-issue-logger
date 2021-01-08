const express = require('express');
require('dotenv').config();
const morgan = require('morgan');

const connectDB = require('./config/dbConfig');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const logRoute = require('./routes/logRoute');

const app = express();
//Connect to MongoDB
connectDB();

app.use(express.json({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send('Welcome to express Server');
});

app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/logs', logRoute);

app.use(notFound);
//Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server listening on port ${PORT} in ${process.env.NODE_ENV} mode`
  )
);
