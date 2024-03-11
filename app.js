const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const UsuariosRouter = require('./routers/usersRouter');
const CoursesRouter = require('./routers/coursesRouter');
const ModulesRouter = require('./routers/modulesRouter');
const app= express();

app.use(cors());
app.use(bodyParser.json());

//Usuarios
app.use("/users", UsuariosRouter);

app.use("/courses", CoursesRouter);

app.use("/modules", ModulesRouter);

app.use('/uploads',express.static('uploads'))

const PORT = process.env.PORT || 5000;
app.listen(PORT);