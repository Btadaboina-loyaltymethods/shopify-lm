const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require('crypto')
const {validationResult} = require('express-validator')


const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use the email service you prefer
  auth: {
    user: 'vvchow124@gmail.com', // Your email address
    pass: 'rlxqdmndzrctrqjj', // Your email password (use an app password or enable "Less secure apps" in Gmail settings)
  },
});


exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get("Cookie").split("=")[1] === "true";
  // console.log(req.get("Cookie").split("=")[1]);
  let msg = req.flash('error');
  if(msg.length>0){
    msg = msg[0];
  }
  else{
    msg = null
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: msg,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: []
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
  // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly ");
  // req.isLoggedIn = true;
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req)

  if(!errors.isEmpty()){
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage:  errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({ email: email }).then((user) => {
    if (!user) {
      req.flash("error", "Invalid email");
      return res.redirect("/login");
    }
    bcrypt
      .compare(password, user.password)
      .then((doMatch) => {
        if (doMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            res.redirect("/");
          });
        }
        req.flash("error", "Invalid pasword.");
        return res.redirect("/login");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/login");
      });
  });
};

exports.postSignup = (req, res, next) => {

  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req)

  if(!errors.isEmpty()){
    console.log(errors.array(),'line 81 auth ccontroller');
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors: errors.array()
    });
  }
  
      bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
          const mailOptions = {
            from: 'vvchow124@gmail.com', // Sender email address
            to: email, // Recipient email address
            subject: 'Welcome to Your App', // Email subject
            text: 'Welcome to Your App!', // Plain text body
            html: '<p>Welcome to Your App!</p>', // HTML body
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('Error sending email:', error);
            } else {
              console.log('Email sent:', info.response);
              res.redirect("/signup");
            }
          });
        })
};

// exports.postSignup = (req, res, next) => {
//   const email = req.body.email;
//   const password = req.body.password;
//   const confirmPassword = req.body.confirmPassword;
//   User.findOne({ email: email }).then((userDoc) => {
//     if (userDoc) {
//       req.flash("error", "User already exists");
//       return res.redirect("/signup");
//     }
//     return bcrypt
//       .hash(password, 12)
//       .then((hashedPassword) => {
//         const user = new User({
//           email: email,
//           password: hashedPassword,
//           cart: { items: [] },
//         });
//         return user.save();
//       })
//       .then((result) => {
//         res.redirect("/login");
//         // transporter.sendMail({
//         //   to: email,
//         //   from: 'shop@complete.com',
//         //   subject: 'signup succeded',
//         //   html: '<h1>Signup completed</h1>'
//         // })
//         sendWelcomeEmail(email, "User Name")
//         .then(() => {
//           res.redirect("/login");
//         })
//         .catch((error) => {
//           console.error("Error sending welcome email:", error);
//           res.redirect("/signup");
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
// };

exports.getSignup = (req, res, next) => {
  let msg = req.flash('error');
  if(msg.length>0){
    msg = msg[0];
  }
  else{
    msg = null
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: msg,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: ""
    },
    validationErrors: []
  });
};


exports.getReset = (req, res, next) => {
  let msg = req.flash('error');
  if(msg.length>0){
    msg = msg[0];
  }
  else{
    msg = null
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: msg,
  });
}

exports.postReset  = (req, res, user) => {
  crypto.randomBytes(32, (err, buffer) => {
    if(err){
      console.log(err);
      return res.redirect('/reset')
    }
    const token = buffer.toString('hex');
    User
    .findOne({email: req.body.email})
    .then(user => {
      if(!user){
        req.flash('error', 'No account with that email')
        res.redirect('/reset')
      }
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save()
    })
    .then(result => {
      res.redirect('/')
      const mailOptions = {
        from: 'vvchow124@gmail.com', // Sender email address
        to: req.body.email, // Recipient email address
        subject: 'Password Reset', // Email subject
        text: 'Welcome to Your App!', // Plain text body
        html: `<p>Reset</p>
              <p>Click here to reset <a href="http://localhost:3333/reset/${token}">Link</a> to set the password</p>        
        `, // HTML body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
          res.redirect("/signup");
        }
      });

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  })

}

exports.getNewPassword = (req, res, next) => {

  const token = req.params.token;

  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
      let msg = req.flash('error');
      if(msg.length>0){
        msg = msg[0];
      }
      else{
        msg = null
      }

  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "new password",
    errorMessage: msg,
    userId: user._id.toString(),
    passwordToken: token
  });

  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}

exports.postNewPassword = (req, res, next) => {


  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;



  let resetuser

  User
  .findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id:userId})
  .then( user => {
    resetuser = user
    return bcrypt
    .hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetuser.password = hashedPassword,
    resetuser.resetToken = undefined,
    resetuser.resetTokenExpiration = undefined
    return resetuser.save()

  })
  .then(result => {
    res.redirect('/login')
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
}
// const User = require('../models/user');

// exports.getLogin = (req, res, next) => {
//   res.render('auth/login', {
//     path: '/login',
//     pageTitle: 'Login',
//     isAuthenticated: false
//   });
// };

// exports.getSignup = (req, res, next) => {
//   res.render('auth/signup', {
//     path: '/signup',
//     pageTitle: 'Signup',
//     isAuthenticated: false
//   });
// };

// exports.postLogin = (req, res, next) => {
//   User.findById('5bab316ce0a7c75f783cb8a8')
//     .then(user => {
//       req.session.isLoggedIn = true;
//       req.session.user = user;
//       req.session.save(err => {
//         console.log(err);
//         res.redirect('/');
//       });
//     })
//     .catch(err => console.log(err));
// };

// exports.postSignup = (req, res, next) => {};

// exports.postLogout = (req, res, next) => {
//   req.session.destroy(err => {
//     console.log(err);
//     res.redirect('/');
//   });
// };
