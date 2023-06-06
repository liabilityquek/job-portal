const express = require("express");
const prisma = require('./config/database');
const app = express();
const port = 3000;
const path = require("path");
const candidateRouter = require('./router/candidateRouter')
const employerRouter = require('./router/employerRouter')
const loginRouter = require('./router/loginRouter')

require('dotenv').config();
require('./config/database');

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use('/applicants', candidateRouter);
app.use('/employer', employerRouter);
app.use('/', loginRouter);

app.listen(port, () => {
  console.log(`Job Portal app listening on port ${port}`);
});

module.exports = app;
