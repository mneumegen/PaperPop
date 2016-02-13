require(['vue', 'vue-router'], function(Vue, VueRouter) {
	console.log('oaded');
	Vue.use(VueRouter);


	var joinQuiz = {
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
					name: !!this.participantName.trim(),
					code: this.code && this.code.includes('x')
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
				if (this.isValid) {
					router.go({ path: '/live/' + this.code})
				} else {
					console.log('Invalid');
				}
			}
		}
	};

	var App = Vue.extend({});

	var router = new VueRouter();

	router.map({
		'/' : {
			component: joinQuiz
		},
		'/live/:quiz_id': {
			component: {
				template: '<p>quiz is {{$route.params.quiz_id}}</p>'
			}
		}
	});

	router.start(App, '#content');
});
