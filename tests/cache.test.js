import mongoose, { Schema } from "mongoose";
import chai, { expect } from "chai";
import { db_test } from "../src/config.json";
import Entry from "../src/models/entry";

describe("Database Tests", function() {
  before(done => {
    mongoose
      .connect(db_test)
      .then(() => {
        console.log("connected to db");
        done();
      })
      .catch(err => console.error(err));
  });

  describe("Test Database", function() {
    it("New entry saved to database", done => {
      let testEntry = new Entry({ key: "testKey", value: "testValue" });
      testEntry.save(done);
    });

    it("Dont save incorrect format to database", done => {
      let wrongSave = new Entry({ notKey: "testKey" });
      wrongSave.save(err => {
        if (err) return done();
        throw new Error("Should generate error!");
      });
    });

    it("Should retrieve data from test database", function(done) {
      Entry.find({ key: "testKey" }, (err, entry) => {
        if (err) throw err;
        if (entry.length === 0) throw new Error("No data!");
        done();
      });
    });
  });

  after(done => {
    mongoose.connection.db.dropDatabase(() => mongoose.connection.close(done));
  });
});
