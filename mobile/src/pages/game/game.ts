import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ViewController } from 'ionic-angular';
import { GamesProvider } from '../../providers/games/games';

import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-game',
  templateUrl: 'game.html',
})
export class GamePage {

  public score: any;
  public players: Array<any>=[];
  public groupedPlayers: any;
  public startedAt: Date;
  public finishedAt: Date;

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public viewCtrl: ViewController, private alertCtrl: AlertController, public navParams: NavParams, public gamesProvider: GamesProvider) {
    this.score = {
      'blue': 0,
      'red': 0
    }
    this.players = navParams.get('players');
    this.groupedPlayers = _.groupBy(this.players, 'team');
    this.startedAt = new Date();
  }

  isFinish(){
    return this.score.blue > 9 || this.score.red > 9
  }

  goal(team){
    if(!this.isFinish())
      this.score[team] = this.score[team] + 1;
  }

  reduceGoal(team){
    if(this.score[team] > 0)
      this.score[team] = this.score[team] - 1;
  }

  presentAlert() {
    let alert = this.alertCtrl.create({
      title: 'Oops',
      subTitle: 'Something went wrong',
      buttons: ['Ok']
    });
    alert.present();
  }

  swipeBlue(event){
    if(event.direction == 2)
      this.reduceGoal('blue');
    if(event.direction == 4)
      this.goal('blue');
  }

  swipeRed(event){
    if(event.direction == 2)
      this.goal('red');
    if(event.direction == 4)
      this.reduceGoal('red');
  }


  save(){
    this.finishedAt = new Date();
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    this.gamesProvider.save({ "games": {
      red_attacker_id: this.groupedPlayers.red[0].id,
      red_defender_id: this.groupedPlayers.red[1].id,
      blue_attacker_id: this.groupedPlayers.blue[0].id,
      blue_defender_id: this.groupedPlayers.blue[1].id,
      blue_score: this.score.blue,
      red_score: this.score.red,
      started_at: this.startedAt,
      finished_at: this.finishedAt
    } })
    .then(data => {
      loading.dismiss();
      this.navCtrl.getPrevious().instance.resetTeams();
      this.viewCtrl.dismiss();
    }).catch(error => {
      loading.dismiss();
      this.presentAlert();
    });
  }

}