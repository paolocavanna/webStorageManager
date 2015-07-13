/**
 * @author Paolo Cavanna [https://github.com/paolocavanna]
 * @beta
 * @version 0.5
 * @class ManageStorage
 * @description Wrapper layer for WebStorage management.
 * @param  {Object} w Window global object
 */
;(function(w){

	"use strict";

	var _slice, _warn, ManageStorage;

	/**
	 * _slice Local reference to global Array slice method
	 * @private
	 * @type {Function}
	 */
	_slice = Array.prototype.slice;

	/**
	 * _warn Dummy check for `console` support.
	 * No need to check for all methods, just need `warn`
	 * @param  {String} msg Message to be printed out in the console
	 * @private
	 */
	_warn = function _warn(msg){

		if ( !("console" in w) || typeof console === "undefined" ) {

			w.console.warn(msg);

		}

	};

	/**
	 * create a wrapper object
	 * @type {Object}
	 */
	ManageStorage = {};

	/**
	 * @property {Object} opt Store module's options
	 */
	ManageStorage.opt = {
		storage: w.localStorage
	};

	/**
	 * @property {Boolean} _available
	 * Store a reference to availability's status
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
	ManageStorage.isAvailable = function isAvailable() {

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
		 * @method setItem Map native setItem method
		 * @param  {String} item      Storage item name
		 * @param  {Object} data      Data to feed storage item
		 * @chainable
		 */
		ManageStorage.setItem = function setItem(item, data) {

			data = JSON.stringify(data);

			this.opt.storage.setItem(item, data);

			return this;

		};

		/**
		 * @method getItem Run an enhanced version of storage native getItem method:
		 * this implementation returns an already parsed item.
		 * @param  {String} item      Storage item name
		 * @return {Object}	Parsed item
		 */
		ManageStorage.getItem = function getItem(item){

			return JSON.parse(this.opt.storage.getItem(item));

		};

		/**
		 * @method removeItem Map native removeItem method
		 * @param  {String} item      Storage item name
		 * @chainable
		 */
		ManageStorage.removeItem = function removeItem(item){

			this.opt.storage.removeItem(item);

			return this;

		};

		/**
		 * @method  key
		 * Map WebStorage `key` method
		 * @param  {Number} i Loop index
		 * @return {Function}
		 */
		ManageStorage.key = function key(i){

			return this.opt.storage.key(i);

		};

		/**
		 * @method getLength Get storage length
		 * @return {Number}
		 */
		ManageStorage.getLength = function getLength(){

			return this.opt.storage.length;

		};

		/**
		 * @method check
		 * @param  {String} id Storage's item id
		 * @return {Boolean}
		 */
		ManageStorage.check = function check(id){

			if ( id in this.opt.storage ){

				return true;

			}

			return false;

		};

		/**
		 * @method  flush Clear storage utility.
		 * If no argument is passed, the entire storage will be cleared.
		 * @chainable
		 */
		ManageStorage.flush = function flush(){

			var args = _slice.call(arguments);

			if ( args.length ) {

				args.forEach(this.removeItem.bind(this));

			} else {

				this.opt.storage.clear();

			}

			return this;

		};

	} else {

		_warn("WARNING: if you are browsing in private mode, WebStorage is not available");

	}

	w.ManageStorage = ManageStorage;

})(window);