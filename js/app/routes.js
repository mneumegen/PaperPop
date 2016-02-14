require(['vue', 'vue-router'], function(Vue, VueRouter) {
	console.log('oaded');
	Vue.use(VueRouter);

	var ref = new Firebase("https://paperpopdev.firebaseio.com/"),
		liveQuiz = ref.child('liveQuiz');


	var joinQuizComponent = Vue.extend({
		template: '#join-quiz',
		data: function () {
			return {
				participantName: "",
				code: ""
			};
		},
		computed: {
			validation: function () {
				return {
					name: !!this.participantName.trim()
				};
			},
			isValid: function () {
				var validation = this.validation;
				return Object.keys(validation).every(function (key) {
					return validation[key];
				});
			}
		},

		methods: {
			onSubmit: function () {
				var parent = this;
				if (this.isValid) {
					liveQuiz.orderByChild("shortCode").equalTo(parent.code).once('value', function(snapshot) {
						if (snapshot.val()) {
							router.go({ path: '/live/' + parent.code});
						} else {
							console.log('invalid');
						}
					});

				} else {
					console.log('Invalid');
				}
			}
		}
	});

	var liveQuizComponent = Vue.extend({
		template: '#live-quiz',
		data: function () {
			return {
				testMike: "aa"
			};
		},
		init: function() {
			var parent = this;
			liveQuiz.orderByChild("shortCode").equalTo(parent.$route.params.shortCode).once('value', function(snapshot) {
				if (snapshot.val() === null) {
					router.go({ path: '/'});
					console.log('not found');
				} else {
					console.log('found');
				}
			});
		}
	});

	var App = Vue.extend({});

	var router = new VueRouter();

	router.map({
		'/' : {
			component: joinQuizComponent
		},
		'/live/:shortCode': {
			component: liveQuizComponent
		}
	});

	router.start(App, '#content');
});
