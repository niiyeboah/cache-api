import express, { Router } from "express";
import Entry from "../models/entry";
import loremIpsum from "lorem-ipsum";

export default config => {
  const cache = Router();
  const { ttl, limit } = config;
  const filter = { _id: 0, __v: 0 };
  const cacheHit = hit => console.log(`Cache ${hit ? "hit" : "miss"}`);
  const secondsDiff = previousHit => (Date.now() - previousHit) / 1000;

  /**
   * @description
   * Attempt to add an entry to the cache.
   * If the cache limit is exceeded,
   * update the oldest entry instead.
   * @param {Object} body
   * @param {express.Response} res
   * @param {Function} next
   */
  function addEntry(body, res, next) {
    Entry.find()
      .count()
      .then(count => {
        if (count < limit) {
          Entry.create(body, (err, entry) => {
            if (err) return next(err);
            res.json(body);
          });
        } else {
          console.log("Cache limit exceeded");
          Entry.aggregate([{ $sort: { previousHit: 1 } }, { $limit: 1 }]).then(([oldestEntry]) => {
            console.log(`Overwriting key: "${oldestEntry.key}"`);
            Entry.findOneAndUpdate({ key: oldestEntry.key }, body, (err, entry) => {
              if (err) return next(err);
              res.json(body);
            });
          });
        }
      });
  }

  /* GET ALL ENTRIES */
  cache.get("/", (req, res, next) => {
    Entry.find({}, { ...filter, previousHit: 0 }, (err, entries) => {
      if (err) return next(err);
      res.json(entries);
    });
  });

  /* GET SINGLE ENTRY BY KEY */
  cache.get("/:key", ({ params: { key } }, res, next) => {
    Entry.findOne({ key }, filter, (err, entry) => {
      if (err) return next(err);
      if (!entry) {
        cacheHit(false);
        addEntry({ key, value: loremIpsum() }, res, next);
      } else {
        cacheHit(true);
        let body = { key, previousHit: Date.now() };
        if (secondsDiff(entry.previousHit) < ttl) {
          body.value = entry.value;
        } else {
          console.log("TTL exceeded");
          body.value = loremIpsum();
        }
        Entry.findOneAndUpdate({ key }, body, (err, entry) => {
          if (err) return next(err);
          delete body.previousHit;
          res.json(body);
        });
      }
    });
  });

  /* SAVE ENTRY */
  cache.post("/", ({ body }, res, next) => {
    addEntry(body, res, next);
  });

  /* UPDATE ENTRY */
  cache.put("/:key", ({ params: { key }, body }, res, next) => {
    Entry.findOneAndUpdate({ key }, body, (err, entry) => {
      if (err) return next(err);
      res.json(body);
    });
  });

  /* DELETE ENTRY */
  cache.delete("/:key", ({ params: { key } }, res, next) => {
    Entry.findOneAndRemove({ key }, (err, entry) => {
      if (err) return next(err);
      res.json({ deleted: key });
    });
  });

  /* DELETE ALL ENTRIES */
  cache.delete("/", ({ params: { key }, body }, res, next) => {
    Entry.remove({}, (err, { n }) => {
      if (err) return next(err);
      res.json({ numDeleted: n });
    });
  });

  return cache;
};
