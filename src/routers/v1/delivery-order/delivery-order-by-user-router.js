var Router = require('restify-router').Router;
var router = new Router();
var db = require("../../../db");
var DeliveryOrderManager = require("dl-module").managers.purchasing.DeliveryOrderManager;
var resultFormatter = require("../../../result-formatter");

var passport = require('../../../passports/jwt-passport');
const apiVersion = '1.0.0';

router.get("/", passport, function (request, response, next) {
    db.get().then(db => {
        var manager = new DeliveryOrderManager(db, request.user);

        var sorting = {
            "_updatedDate": -1
        };
        var filter = {
            _createdBy: request.user.username
        };

        var query = request.queryInfo;
        query.filter = filter;
        query.order = sorting;
        query.select = [
            "no", "date", "supplier.name", "items"
        ]
        manager.read(query)
            .then(docs => {
                var result = resultFormatter.ok(apiVersion, 200, docs.data);
                delete docs.data;
                delete docs.order;
                result.info = docs;
                response.send(200, result);
            })
            .catch(e => {
                response.send(500, "Failed to fetch data.");
            })
    })
        .catch(e => {
            var error = resultFormatter.fail(apiVersion, 400, e);
            response.send(400, error);
        })
});

router.get('/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new DeliveryOrderManager(db, request.user);

        var id = request.params.id;
        manager.getSingleById(id)
            .then(doc => {
                var result = resultFormatter.ok(apiVersion, 200, doc);
                response.send(200, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.post('/', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new DeliveryOrderManager(db, request.user);

        var data = request.body;

        manager.create(data)
            .then(docId => {
                response.header('Location', `${request.url}/${docId.toString()}`);
                var result = resultFormatter.ok(apiVersion, 201);
                response.send(201, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

router.put('/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new DeliveryOrderManager(db, request.user);

        var id = request.params.id;
        var data = request.body;

        manager.update(data)
            .then(docId => {
                var result = resultFormatter.ok(apiVersion, 204);
                response.send(204, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })

    })
});

router.del('/:id', passport, (request, response, next) => {
    db.get().then(db => {
        var manager = new DeliveryOrderManager(db, request.user);

        var id = request.params.id;
        var data = request.body;

        manager.delete(data)
            .then(docId => {
                var result = resultFormatter.ok(apiVersion, 204);
                response.send(204, result);
            })
            .catch(e => {
                var error = resultFormatter.fail(apiVersion, 400, e);
                response.send(400, error);
            })
    })
});

module.exports = router