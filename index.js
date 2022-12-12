const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const FileStore = require("session-file-store")(session);
const flash = require("express-flash");

const PORT = process.env.PORT || 3000;

const app = express();

const conn = require("./db/conn");

const MessageController = require("./controllers/MessageController");

const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const User = require("./models/User");
const Message = require("./models/Message");

app.engine("hbs", engine({ extname: "hbs", defaultLayout: "main" }));
app.set("view engine", "hbs");

app.use(
  express.urlencoded({
    extended: true,
  })
);

// session midleware
app.use(
  session({
    name: "session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn: function () {},
      path: require("path").join(require("os").tmpdir(), "sessions"),
    }),
    cookie: {
      secure: false,
      maxAge: 86400000,
      expires: new Date(Date.now() + 86400000),
      httpOnly: true,
    },
  })
);

// flash messages
app.use(flash());

// set session to res
app.use((req, res, next) => {
  if (req.session.userid) {
    res.locals.session = req.session;
  }
  next();
});

app.use(express.json());

app.use(express.static("public"));

// rotes

app.use("/", authRoutes);
app.use("/chat", messageRoutes);

app.use("/", MessageController.showMessages);

conn.sequelize
  .sync()
  .then(() => {
    app.listen(PORT);
  })
  .catch((err) => console.log(err));
