requirejs.config({
		baseUrl: '/js/vendor/',
		paths: {
				app: '../app',
				components: '../components'
		}
});

require(['vue', 'vue-router'], function(Vue, VueRouter) {
	Vue.use(VueRouter);

	var ref = new Firebase("https://paperpopdev.firebaseio.com/"),
	liveQuiz = ref.child('liveQuiz');

	var joinQuizComponent = Vue.extend({
		template: '#join-quiz',
		data: function () {
			console.log('hi');
			return {
				code: ""
			};
		},

		methods: {
			onSubmit: function () {
				console.log('submitted');
				var parent = this;

				liveQuiz.child(parent.code).once('value', function(snapshot) {
					var quiz = snapshot.val();
					if (snapshot.exists()) {
						router.go({ path: '/pending/' + parent.code});
					} else {
						console.log("invalid code");
					}
				});
			}
		}
	});

		var pendingQuizComponent = Vue.extend({
			template: '#prestart',
			methods: {
				startQuiz: function () {
					var parent = this,
						shortCode = parent.$route.params.shortCode;

					liveQuiz.child(shortCode).once('value', function(snapshot) {
						var quiz = snapshot.val();
						if ('questions' in quiz && quiz.questions) {
							liveQuiz.child(shortCode).child('questions').child(0).child('startedAt').set(Date.now());
							router.go({ path: '/live/' + shortCode });
						} else {
							console.log("invalid questions");
						}
					});
				}
			}
		});

		var liveQuizComponent = Vue.extend({
			template: '#live-quiz',
			data: function() {
				return {
					currentQuestion: {
						question: '',
						answers: []
					}
				};
			},
			methods: {
				randomizeAnswers: function() {
					var answers = this.currentQuestion.answers;
					for (var i = answers.length - 1; i > 0; i--) {
						var j = Math.floor(Math.random() * (i + 1));
						var temp = answers[i];
						answers[i] = answers[j];
						answers[j] = temp;
				 	}
				},
				onNext: function() {
					if(this.index === this.questions.length - 1) {
						this.endQuiz();
					} else {
						this.index += 1;
						liveQuiz.child(this.$route.params.shortCode).child('questions').child(this.index).child('startedAt').set(Date.now());
						this.currentQuestion = this.questions[this.index];
						this.randomizeAnswers();
					}
				},
				endQuiz: function() {
					router.go({ path: '/live/quiz-over/'});
				}
			},
			created: function() {
				var parent = this,
					shortCode = parent.$route.params.shortCode;

				liveQuiz.child(shortCode).once('value', function(snapshot) {
					parent.quiz = snapshot.val();
					parent.questions = parent.quiz.questions;
					parent.index = 0;
					parent.currentQuestion = parent.questions[parent.index];
					parent.randomizeAnswers();
				});
			}
		});

		var quizOverComponent = Vue.extend({
			template: '#quiz-over',
			data: {
			},
			computed: {
			},

			methods: {
			}
		});

	var App = Vue.extend({});

	var router = new VueRouter();

	router.map({
		'/' : {
			component: joinQuizComponent
		},
		'/pending/:shortCode': {
			component: pendingQuizComponent
		},
		'/live/:shortCode': {
			component: liveQuizComponent
		},
		'/live/quiz-over': {
			component: quizOverComponent
		}
	});

	router.start(App, '#content');
});
