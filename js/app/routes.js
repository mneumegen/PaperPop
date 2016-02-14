require(['vue', 'vue-router', 'js-cookie'], function(Vue, VueRouter, Cookies) {
	Vue.use(VueRouter);
	Vue.config.debug = true

	var ref = new Firebase("https://paperpopdev.firebaseio.com/"),
	liveQuiz = ref.child('liveQuiz');

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
								var storedNames = Cookies.getJSON('participantName');
								if (storedNames === null) {
									storedNames = {};
								}
								storedNames[parent.code] = parent.participantName;
								Cookies.set('participantName', storedNames);
								router.go({ path: '/live/' + parent.code});
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

	var quizOverComponent = Vue.extend({
		template: '#quiz-over',
		data: {
		},
		computed: {
		},

		methods: {
		}
	});

	var playQuizComponent = Vue.extend({
		template: '#play-quiz',
		data: {
		},
		computed: {
		},

		methods: {
			select: function(answer) {
				// do something to save answer to firebase with user id? 
			}
		}
	});

	var liveQuizComponent = Vue.extend({
		template: '#live-quiz',
		data: function () {
			return {
				quiz: 'a'
			};
		},
		init: function() {
			var parent = this,
			onDataLoad = function(snapshot) {
				console.log('loaded');
				var quiz = snapshot.val(),
					shortCode = parent.$route.params.shortCode;
				if (snapshot.exists()) {
					var storedNames = Cookies.getJSON('participantName');
					if (storedNames === '{}') {
						storedNames = {};
					}

					if (shortCode in storedNames) {
						if (! (quiz.participants && storedNames[shortCode] in quiz.participants)) {
							liveQuiz.child(shortCode).child('participants').child(storedNames[shortCode]).set(true);
						}
					} else {
						console.log('No name');
						router.go({ path: '/'});
						return;
					}
					parent.quiz = quiz;
				} else {
					console.log('no quiz');
					router.go({ path: '/'});
				}
			};

			liveQuiz.child(parent.$route.params.shortCode).once('child_added', onDataLoad);
			liveQuiz.child(parent.$route.params.shortCode).on('child_changed', onDataLoad);
		}
	});

	var viewQuizComponent = Vue.extend({
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
					this.currentQuestion.question = '';
					this.currentQuestion.answers = [];
					this.index += 1;
					this.currentQuestion = this.questions[this.index];
					this.randomizeAnswers();
				}
			},
			endQuiz: function() {
				router.go({ path: '/live/quiz-over/'});
			}
		},

		created: function() {
			this.questions = this.quiz.questions;
			this.index = 0;
			this.currentQuestion = this.questions[this.index];
			this.randomizeAnswers();
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
		},
		'/live/view-quiz': {
			component: viewQuizComponent
		},
		'/live/quiz-over': {
			component: quizOverComponent
		},
		'/live/play/:shortCode': {
			component: playQuizComponent
		}
	});

	router.start(App, '#content');
});
