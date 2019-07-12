import { Component } from '@angular/core';
import { HealthKit, HealthKitOptions } from '@ionic-native/health-kit/ngx';
import { Platform } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public height: number;
  public heightActual = 'Sin datos';
  public steps = 'Sin datos';
  public workouts = [];

  constructor(
    private platform: Platform,
    private healthService: HealthKit
  ) {
    platform.ready().then(() => {
      if (platform.is('ios')) {
        this.healthService.available().then(available => {
          if (available) {
            let opciones: HealthKitOptions = {
              readTypes: ['HKQuantityTypeIdentifierHeight', 'HKQuantityTypeIdentifierStepCount', 'HKWorkoutTypeIdentifier', 'HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierDistanceWalkingRunning'],
              writeTypes: ['HKQuantityTypeIdentifierHeight', 'HKWorkoutTypeIdentifier', 'HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierDistanceWalkingRunning']
            }
            this.healthService.requestAuthorization(opciones).then(_ => {

            });
          }
        });
      }
    });
  }

  cargarDatos() {
    if (this.platform.is('ios')) {
      this.healthService.readHeight({ unit: 'cm' }).then(height => {
        this.heightActual = height.value;
      }, error => {
        console.error('Error recuperando altura: ' + error);
      });

      let stepOptions = {
        startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(),
        unit: 'count',
        sampleType: 'HKQuantityTypeIdentifierStepCount'
      };

      this.healthService.querySampleType(stepOptions).then(data => {
        let sumaPasos = data.reduce((a, b) => a + b.quantity, 0);
        this.steps = sumaPasos;
      }, error => {
        console.error('Error recuperando pasos: ' + error);
      });

      this.healthService.findWorkouts().then(data => {
        this.workouts = data;
      }, error => {
        console.error('Error recuperando workouts: ' + error);
        this.workouts = error;
      });
    }
  }

  guardaAltura() {
    if (this.platform.is('ios')) {
      this.healthService.saveHeight({ unit: 'cm', amount: this.height }).then(_ => {
        this.height = null;
        this.cargarDatos();
      });
    }
  }

  guardaWorkout() {
    if (this.platform.is('ios')) {
      let workout = {
        'activityType': 'HKWorkoutActivityTypeRunning',
        'quantityType': 'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'startDate': new Date(),
        'endDate': null,
        'duration': 6000,
        'energy': 400,
        'energyUnit': 'kcal',
        'distance': 5,
        'distanceUnit': 'km'
      };
      this.healthService.saveWorkout(workout).then(_ => {
        this.cargarDatos();
      });
    }
  }
}
