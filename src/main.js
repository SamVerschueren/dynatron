'use strict';

var fs = require('fs'),
    path = require('path'),
    got = require('got'),
    db = require('dynongo');

const delimiter = '.';

db.connect();

db.raw.listTables(function (err, result) {
    if (err) {
        throw err;
    }

    console.log(tree(result.TableNames));
});

function tree(list) {
    return list.reduce(function (result, item) {
        treeHelper(result, item.split(delimiter));

        return result;
    }, {});
}

function treeHelper(result, items) {
    var part = items.shift();

    if (result[part] === undefined) {
        if (items.length === 0) {
            result[part] = 'Table'; // TODO Create new table instance
        }
        else {
            result[part] = {};
        }
    }

    if (items.length > 0) {
        treeHelper(result[part], items);
    }
}