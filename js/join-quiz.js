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
		liveQuiz = ref.child('liveQuiz'),
		currentUser = null;

	var joinQuizComponent = Vue.extend({
		template: '#join-quiz',
		data: function () {
			return {
				participantName: "aaa",
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
				console.log('submitted');
				var parent = this;
				if (this.isValid) {
					liveQuiz.child(parent.code).once('value', function(snapshot) {
						var quiz = snapshot.val();
						if (snapshot.exists()) {
							if (! (quiz.participants && parent.participantName in quiz.participants)) {
								currentUser = parent.participantName;
								router.go({ path: '/pending/' + parent.code});
								console.log('hi');
							} else {
								console.log('name taken');
							}
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

	var pendingQuizComponent = Vue.extend({
		template: '#prestart',
		data: function () {
			return {
				quiz: null
			};
		},
		init: function() {
			var parent = this,
			onDataLoad = function(snapshot) {
				var quiz = snapshot.val(),
					shortCode = parent.$route.params.shortCode;
				if (snapshot.exists()) {
					if (currentUser) {
						if (! (quiz.participants && currentUser in quiz.participants)) {
							liveQuiz.child(shortCode).child('participants').child(currentUser).set(true);
						}

						if ('questions' in quiz && quiz.questions && 'startedAt' in quiz.questions[0]) {
							router.go({ path: '/live/' + shortCode });
						}
					} else {
						console.log('No name');
						router.go({ path: '/'});
						return;
					}
				} else {
					console.log('no quiz');
					router.go({ path: '/'});
				}
			};

			liveQuiz.child(parent.$route.params.shortCode).on('value', onDataLoad);
		}
	});

	var liveQuizComponent = Vue.extend({
		template: '#live-quiz',
	});

	var viewQuiz = new Vue({
		template: '#view-quiz',
		data: function () {
			return {
				quiz: {
				  "ownerId":1234,
				  "shortCode":"X5DH3",
				  "participants":[
				    "Bill",
				    "Dana",
				    "Mike",
				    "Donald"
				  ],
				  "createdAt":1455402950821,
				  "startedAt":1455402950825,
				  "questions":[
				    {
				      "startedAt":1455402950828,
				      "question":"How old is Donald Trump?",
				      "correctAnswer":69,
				      "answers":[
				        65,
				        67,
				        69,
				        71
				      ],
				      "results":[
				        {
				          "participant":"Mike",
				          "correct":false,
				          "answeredAt":1455402950829
				        },
				        {
				          "participant":"Dana",
				          "correct":true,
				          "answeredAt":1455402950830
				        },
				        {
				          "participant":"Donald",
				          "correct":true,
				          "answeredAt":1455402950929
				        },
				        {
				          "participant":"Bill",
				          "correct":false,
				          "answeredAt":1455402950926
				        }
				      ]
				    },
				    {
				      "startedAt":null,
				      "question":"How old is the Burn?",
				      "correctAnswer":74,
				      "answers":[
				        69,
				        72,
				        74,
				        78
				      ],
				      "results":[
				      ]
				    }
				  ],
				  "finished":false
				}
			};
		},
		computed: {

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
			onNext: function () {
			}
		},

		created: function() {
			this.questions = this.quiz.questions;
			this.currentQuestion = this.questions[0];
			this.randomizeAnswers();
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
		}
		// '/live/:shortCode': {
		// 	component: liveQuizComponent
		// }
	});

	router.start(App, '#content');
});
