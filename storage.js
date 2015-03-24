/**
 * @author Paolo Cavanna [https://github.com/paolocavanna]
 * @beta
 * @version 0.1
 *
 * @namespace MYAPP
 * @class ManageStorage
 * @description Wrapper layer for WebStorage management.
 * @param  {Object} app App global namespace
 */
(function(app){

	"use strict";

	/**
	 * create a wrapper object
	 * @type {Object}
	 */
	var ManageStorage = {};

	/**
	 * @property {Object} opt Store module's options
	 */
	ManageStorage.opt = {
		storage: localStorage
	};

	/**
	 * @property {Boolean} _available Store a reference to availability's status
	 */
	ManageStorage._available = false;

	/**
	 * @method  isAvailable Check if WebStorage is available and writable.
	 * Invokes this method immediately and sets the private property
	 * `_available` to true/false and then freeze it.
	 * The `_available` property is consumed later to initialize the rest of the
	 * object.
	 * The idea behind this check is in part due to @Damiano Seno [https://github.com/madeingnecca]
	 */
	ManageStorage.isAvailable = function() {

		var storageAvailable, storageWritable;

		storageAvailable = (typeof this.opt.storage !== "undefined") && (typeof JSON !== "undefined");

		if ( storageAvailable ) {

			try {

				this.opt.storage.setItem("storage:test", "test");

				storageWritable = true;

				this.opt.storage.removeItem("storage:test");

			} catch (e) {

				storageWritable = false;

			}

			this._available = storageWritable;

		} else {

			this._available = false;

		}

		/**
		 * Set `_available` property to be read-only,
		 * so it won't be modifed in the future
		 * @type {Object}
		 */
		Object.defineProperty(this, "_available", {
			writable: false
		});

	}.call(ManageStorage);

	/**
	 * Init all module's methods after availability checking
	 */
	if ( ManageStorage._available ) {

		/**
		 * @method  execute
		 * Abstract calls to native WebStorage methods
		 * to avoid browsers' quirks (expecially mobile borwsers in private mode).
		 * @param  {String} operation Storage method
		 * @param  {String} item      Storage item name
		 * @param  {Object} data      Data to feed storage item
		 * @example
		 * app.ManageStorage.execute("setItem", "itemName", {
		 *     foo: "bar"
		 * });
		 *
		 * app.ManageStorage.execute("getItem", "itemName");
		 */
		ManageStorage.execute = function(operation, item, data){

			if ( typeof operation === "undefined" ) {

				console.warn("operation not defined in ManageStorage.execute");

				return;
			}

			switch(operation){

				case "setItem":

					data = JSON.stringify(data);

					this.opt.storage.setItem(item, data);

					break;

				case "getItem":

					return JSON.parse(this.opt.storage.getItem(item));

					break;

				case "removeItem":

					this.opt.storage.removeItem(item);

					break;

				default:

			}

		};

		/**
		 * @method  key
		 * Map WebStorage `key` method
		 * @param  {Number} i Loop index
		 * @return {Function}
		 */
		ManageStorage.key = function(i){

			return this.opt.storage.key(i);

		};

		/**
		 * @method getLength Get storage length
		 * @return {Number}
		 */
		ManageStorage.getLength = function(){

			return this.opt.storage.length;

		};

		/**
		 * @method check
		 * @param  {String} id Storage's item id
		 * @return {Boolean}
		 */
		ManageStorage.check = function(id){

			if ( id in this.opt.storage ){

				return true;

			}

			return false;

		};

		/**
		 * @method  flush Clear storage utility.
		 * If no argument is passed, the entire storage will be cleared.
		 */

		// jQuery version
		/*ManageStorage.flush = function(){

			var arg = $.makeArray(arguments);

			if ( arg.length ) {

				$.each($.proxy(function(index, value){

					this.execute.call(this, "removeItem", value);

				}), this);

			} else {

				this.opt.storage.clear();

			}

		};*/

		// plain JavaScript version
		ManageStorage.flush = function(){

			var arg = Array.prototype.slice.call(arguments),
				execute = this.execute;

			if ( arg.length ) {

				arg.forEach(execute.bind(this, "removeItem"));

			} else {

				this.opt.storage.clear();

			}

		};

	} else {

		console.warn("WARNING: if you are browsing in private mode, WebStorage is not available");

	}

	app.ManageStorage = ManageStorage;

})(MYAPP);