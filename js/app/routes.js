require(['vue', 'vue-router'], function(Vue, VueRouter) {
	console.log('loaded');
	Vue.use(VueRouter);


	var joinQuiz = new Vue({
		el: '#content',
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
			component: joinQuiz
		},
		'/live/:quiz_id': {
			component: {
				template: '<p>quiz is {{$route.params.quiz_id}}</p>'
			}
		},
		'/live/view-quiz' : {
			component: viewQuiz
		}
	});

	router.start(App, '#content');
});
