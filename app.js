var express = require("express");
//var bodyParser = require("body-parser");
var User = require("./models/user").User;
//var cookieSession = require("cookie-session");
var redis = require("redis");
var session = require("express-session");
var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");
var formidable = require("express-formidable");
var RedisStore = require("connect-redis")(session);
var client = redis.createClient();
var http = require("http");
var realtime = require("./realtime");

var methodOverride = require("method-override");

var app = express();
var server = http.Server(app);

var sessionMiddleware = session({
  store: new RedisStore({ client: client }),
  secret: "super ultra secret word",
  resave: false,
  saveUninitialized: false,
});

realtime(server, sessionMiddleware);

app.use("/public", express.static("public"));
//app.use(bodyParser.json()); // para peticiones application/json
//app.use(bodyParser.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(sessionMiddleware);

// app.use(
//   cookieSession({
//     name: "session",
//     keys: ["llave-1", "llave-2"],
//   })
// );

app.use(formidable({ keepExtensions: true }));
app.set("view engine", "jade");

app.get("/", function (req, res) {
  console.log(req.session.user_id);
  res.render("index");
});

app.get("/signup", function (req, res) {
  User.find(function (err, doc) {
    console.log(doc);
    res.render("signup");
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/users", function (req, res) {
  var user = new User({
    email: req.fields.email,
    password: req.fields.password,
    password_confirmation: req.fields.password_confirmation,
    username: req.fields.username,
  });

  // Save utilizando promises en vez de callbacks
  user.save().then(
    function (us) {
      res.send("Guardamos el usuario exitosamente.");
    },
    function (err) {
      if (err) {
        console.log(String(err));
        res.send("Hubo un error al guardar el usuario.");
      }
    }
  );
});

app.post("/sessions", function (req, res) {
  // find devuelve una collecion, primer parametro es el query,
  // segundo parametro son los campos que queremos que nos devuelva del documento,
  // tercer parametro es el callback
  User.findOne(
    { email: req.fields.email, password: req.fields.password },
    function (err, user) {
      req.session.user_id = user._id;
      res.redirect("/app");
    }
  );
});

app.use("/app", session_middleware);
app.use("/app", router_app);

server.listen(8080);

// Save utilizando callbacks
/*
  user.save(function (err,user,numero) {
    if (err) {
      console.log(String(err));
    }
    res.send("Guardamos tus datos");
  });
*/
