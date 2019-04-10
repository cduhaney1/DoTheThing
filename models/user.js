// Bring in the databse connection.
const db = require("./conn");
const Review = require("./reviews");
const bcrpyt = require("bcryptjs");

// Need a User class.
// Classes should start with an uppercase letter
class User {
  constructor(id, first_name, last_name, email, password) {
    // In python, we say "self"
    //In Javascript, we say "this"

    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.password = password;
  }
  static delete(id) {
    return db.result("delete from users where id=$1", [id]);
  }

  static add(userData) {
    //do an insert into the database
    // not using ${} because I dont want to interpolate
    // using $() so that pg-promise does *safe* interpolation
    return db
      .one(
        `
        insert into users 
    (first_name, last_name, email, password) 
    values 
    ($1, $2, $3, $4)
    returning id, first_name, last_name
    `,
        [
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.password
        ]
      )
      .then(data => {
        //console.log("you did the thing! good job")
        return data.id;
      });
  }

  // "static" means that the function is something
  // the class can do, but an instance cannot.

  static getById(id) {
    // .any always returns an array
    // Instead, we'll use .one

    return db
      .one(`select * from users where id=${id}`)
      .then(userData => {
        //You *must* use the `new` keyword
        // when you call a JavaScript constuctor
        const userInstance = new User(
          userData.id,
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.password
        );
        return userInstance;
      })
      .catch(() => {
        return null; //signal an invalid value
      });
  }
  static getAll() {
    return db.any(`select * from users`).then(arrayOfUsers => {
      return arrayOfUsers.map(userData => {
        const aUser = new User(
          userData.id,
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.password
        );
        return aUser;
      });
    });
  }
  save() {
    // use. result when you might want a report about
    // how many rows got affected
    return db.result(
      `update users set first_name='${this.first_name}', last_name='${
        this.last_name
      }', email='${this.email}', password='${this.password}' where id=${
        this.id
      } `
    );
  }

  setPassword(newPassword) {
    const salt = bcrpyt.genSaltSync(10);
    const hash = bcrpyt.hashSync(newPassword, salt);
    this.password = hash;
  }
  static getByEmail(email) {
    return db
      .one(`select * from users where email=$1`, [email])
      .then(userData => {
        const aUser = new User(
          userData.id,
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.password
        );
        return aUser;
      });
  }

  checkPassword(aPassword) {
    //const isCorrect = bcrypt.compareSync(aPassword, this.password);
    return bcrpyt.compareSync(aPassword, this.password);
  }

  //   get tickets() {
  //     return db
  //       .any(`select * from tickets where user_id=${this.id}`)
  //       .then(arrayOfReviewData => {
  //         const arrayOfReviewInstances = [];
  //         arrayOfReviewData.forEach(data => {
  //           const newInstance = new Review(
  //             data.id,
  //             data.score,
  //             data.content,
  //             data.restaurant_id,
  //             data.user_id
  //           );
  //           arrayOfReviewInstances.push(newInstance);
  //         });
  //         return arrayOfReviewInstances;
  //       });
}
module.exports = User;