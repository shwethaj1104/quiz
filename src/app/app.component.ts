import { Component, OnInit, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {ApexChart, ApexNonAxisChartSeries, ChartComponent } from "ng-apexcharts";

import { question } from '../question';
import { environment } from '../environments/environment';
import   questions  from '../Questions.json';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  questions: question[] = [];
  listUrl = environment.questionsListUrl;
  quizs = ['html', 'javascript'];
  quizStep: boolean = false;
  userDetailsStep: boolean = false;
  quizResultStep: boolean = false;
  username: string = '';
  quizCategory: string ='';
  currentIndex: number = 0;
  singleQuestion:any;
  answerBtnPress: boolean = false;
  answersList: any[] = [];
  lastScore: number=0;
  lastScoreGrade: string='';
  showChart:Boolean=false;
  form_data: any;

  chartSeries:ApexNonAxisChartSeries=[]
  chartDetails:ApexChart={
    type:'pie',
    toolbar:{show:true}
  }
  chartLabels= ["correct answers","wrong answers"]

  constructor(private http: HttpClient, private el: ElementRef) {}

  ngOnInit() {
    this.resetQuiz();
  }
  userDetails = new FormGroup({
    userName: new FormControl('', Validators.required),
    selectQuiz: new FormControl('', Validators.required)
  });
//startquiz and pick questions from selected subject
  startQuiz() {
    this.form_data = this.userDetails.value;
    this.userDetailsStep = false;
    this.username = this.form_data.userName;
    this.quizCategory = this.form_data.selectQuiz;
    this.quizStep = true;
    if (this.quizCategory != null) {
          let category=this.quizCategory
          let shuffleQuestions;
          if(category==='html'){
            shuffleQuestions = this.sortingQuestions(questions.questions.html);
          }else if(category=='javascript'){
            shuffleQuestions = this.sortingQuestions(questions.questions.javascript);
          }
          shuffleQuestions.forEach((question:any) => {
            this.questions.push(question);
          });
          if(this.questions.length > 0) {
            this.setQuestion(this.currentIndex);
          }
    }
  }
//set Questions to quiz board
  setQuestion(i:any) {
    this.singleQuestion = this.questions[i];
    if(this.questions.length - 1 == this.currentIndex) {
      this.el.nativeElement.querySelector('.next-btn').textContent = "Submit Answers"
    }
    this.answersList.push({
      id: this.singleQuestion.id,
      isCorrect: null,
      pressedAnswer: null
    });
  }
//shuffle questions
  sortingQuestions(list:any) {
    return list.sort(() => Math.random());
  }
//reset the Quiz page
  resetQuiz() {
    this.quizResultStep = false;
    this.userDetailsStep = true;
    this.currentIndex = 0;
    this.singleQuestion = null;
    this.answersList = [];
    this.lastScore = 0;
    this.lastScoreGrade = '';
    this.questions = [];
  }
//press on answer option
  answerPressed(e:any,answer:any, answerIndex:any) {
    const btns = this.el.nativeElement.querySelectorAll('.btn-answer');
    this.answerBtnPress = true;
    e.target.classList.add('selected-answer');
    this.answersList[this.currentIndex].isCorrect = answer.isAnswer;
    this.answersList[this.currentIndex].pressedAnswer = answerIndex;
  }
//press on Next button
  nextQuestion() {
    this.answerBtnPress = false;
    this.currentIndex++;
    if((this.questions.length - 1) >= this.currentIndex) {
      this.setQuestion(this.currentIndex);
    } else {
      this.quizStep = false;
      this.quizResultStep = true;
      this.currentIndex = 0;
      this.calcScore();
    }
  }
//canculate final score
  calcScore() {
    this.showChart=true
    let correctAnswers = 0;
    this.answersList.forEach(answer => {
      if(answer.isCorrect) {
        correctAnswers++ 
      }
    });
    this.lastScore = (correctAnswers*100)/this.questions.length;
    if(this.lastScore <= 40) {
      this.lastScoreGrade = "Poor";
    } else if(this.lastScore > 40 && this.lastScore <= 70) {
      this.lastScoreGrade = "Average";
    } else {
      this.lastScoreGrade = "Good";
    }
    this.chartSeries = [this.lastScore,100-this.lastScore]
  }
  //retry the same quiz
  retry() {
    this.quizResultStep = false;
    this.quizStep = true;
  }
}
