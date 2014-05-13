var Services = angular.module("go.services", []).factory;

Services("$dpd", [function() {
	return dpd;
}]);

Services("parse", [function() {
	Parse.initialize("GL1SDhT31Mf1r6uizWHOTXCuM4Mc4uPGWvcNL0eP", "Y6SVRS3W0PSMWWO0mS6wJ2XlVo728UC6MBhwaWB0");
	return Parse;
}]);

Services("$fb", [function() {

	var _this = this;
	var _public = {};

	_this.token = "";

	_this.init = function() {

	window.fbAsyncInit = function() {
    	FB.init({
        	appId      : '623325864408977',
			status     : true,
			xfbml      : true
		});
	};

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/all.js";
		fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));

		return _public;
	}

	_public.login = function(fn) {

		FB.login(function(response) {

			if(response && response.status === "connected") {
				
				_this.token = response.authResponse.accessToken;

				FB.api("/me", function(me) {
					_this.me = me;
					fn(me);
				});
			}
		}, {scope: 'email,rsvp_event,user_events'});
	}

	_public.me = function() {
		return _this.me || {};
	}

	_public.token = function() {
		return _this.token;
	}

	return _this.init();
}])

Services("$user", ['$dpd', '$fb', function($dpd, $fb) {

	var _this = this;
	var _public = {};

	_this.me = null;

	_this.init = function() {

		_public.getCurrent(function(err, me) {
			_this.me = me;
		});

		return _public;
	}

	_public.me = function(fn) {
		return _this.me;
	}

	_public.logout = function(fn) {

		fn = fn || function(){};
		_this.me = null;
		fn();
	}

	_public.getCurrent = function(fn) {
		fn = fn || function(){};
		$dpd.users.me(function(me, error) {
			fn(error, me);
		});
	}

	_public.login = function(opt, fn) {

		opt = opt || {};
		fn = fn || function(){};

		$dpd.users.login({

			username: opt.email,
			password: opt.password

		}, function(result, error) {

			if(result)
				_this.me = result;

			fn(error, result);

		});
	}

	_public.signup = function(opt, fn) {

		$dpd.users.post({

			name: opt.name,
			username: opt.email, 
			email: opt.email, 
			password: opt.password

		}, function(result, error) {

			if(error) {
				return fn(error, null)
			}

			else {

				_public.login({

					email: opt.email,
					password: opt.password

				}, function(error, result) {

					if(result)
						_this.me = result;

					fn(error, result);
				});
			}

			if(result)
				_this.me = result;

			fn(error, result);
		});
	}

	_public.facebookLogin = function(fn) {

		fn = fn || function(){};

		document.location = "/auth/facebook?redirectURL=http://www.govipclub.com.br/loginredir";
		return;

		// TODO: implement in deployd
		$fb.login(function(me) {
			_this.me = me;
			fn(null, me);
		});
	}

	return _this.init();

}]);

Services("$order", ['$dpd', function($dpd) {

	var _this = this;
	var _public = {};

	_this.code = null;
	_this.redir = null;

	_public.code = function(set) {
		_this.code = set || _this.code;
		return _this.code;
	}

	_public.redir = function(set) {
		_this.redir = set || _this.redir;
		return _this.redir;
	}

	_public.place = function(e, items, fn, retry) {

		items = JSON.parse(angular.toJson(items));

		$dpd.pagseguro.post({

			'items': items

		}, function(pag, error) {

			if(error || pag.result == "error") {

				if(!retry) {
					return _public.place(e, items, fn, true);
				}
				
				return fn(error || pag);
			}

			$dpd.orders.post({

				'items': items,
				'event': e,
				'pagseguro': pag

			}, function(result, error) {

				if(error) {
					return fn(error);
				}

				else {

					return fn(null, {
						order: result,
						pagseguro: pag
					});
				}
			});
		});
	}

	return _public;
}])

Services("$event", ["$dpd", function($dpd){

	var _this = this;
	var _public = {};

	_this.init = function() {
		return _public;
	};

	_public.list = function(fn) {
		$dpd.events.get(function(results, error) {
			fn(error, results);
		});
	}

	_public.find = function(query, fn) {
		$dpd.events.get(query, function(results, error) {
			fn(error, results);
		});
	}

	_public.findById = function(id, fn) {
		$dpd.events.get(id, function(results, error) {
			fn(error, results);
		});
	}

	_public.getItems = function(id, fn) {

		$dpd.items.get({

			'event': id

		}, function(results, error) {
			fn(error, results);
		});
	}

	return _this.init();
}]);