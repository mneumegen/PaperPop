require(['vue', 'vue-router'], function(Vue, VueRouter) {
	console.log('loaded');
	Vue.use(VueRouter);

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
				debugger
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
		'/live/:shortCode': {
			component: liveQuizComponent
		}
	});

	router.start(App, '#content');
});
