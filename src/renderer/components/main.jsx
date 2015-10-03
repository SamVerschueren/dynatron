'use babel';

import React from 'react';
import db from 'dynongo';

export default class Main extends React.Component {

    constructor() {
        super();

        db.connect();

        db.raw.listTables(((err, result) => {
            if (err) {
                throw err;
            }

            this.setTree(this.createTree(result.TableNames));
        }).bind(this));
    }

    createTree (list) {
        return list.reduce(((result, item) => {
            this.createTreeHelper(result, item.split('.'));

            return result;
        }).bind(this), {});
    }

    createTreeHelper (result, items) {
        const part = items.shift();

        if (result[part] === undefined) {
            if (items.length === 0) {
                // TODO Create new table instance
                result[part] = 'Table';
            } else {
                result[part] = {};
            }
        }

        if (items.length > 0) {
            this.createTreeHelper(result[part], items);
        }
    }

    render() {
        return <div>Hello World</div>;
    }
}