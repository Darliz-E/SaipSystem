import { Component, OnInit } from '@angular/core';

declare var $: any;

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  clubList = [
    {
      number: 1,
      name: 'Águilas Doradas',
      evaluation: 5,
      percent: 94,
      percentLabel: 'Promedio',
      backgroundColor: 'f0b100',
    },
    {
      number: 2,
      name: 'Tigres Blancos',
      evaluation: 3,
      percent: 80,
      percentLabel: 'Promedio',
      backgroundColor: 'c99a1af',
    },
    {
      number: 3,
      name: 'Lobos Negros',
      evaluation: 2,
      percent: 70,
      percentLabel: 'Promedio',
      backgroundColor: 'bb4d00',
    },
    {
      number: 4,
      name: 'Dragones Rojos',
      evaluation: 4,
      percent: 88,
      percentLabel: 'Promedio',
      backgroundColor: 'c415a77',
    },
    {
      number: 5,
      name: 'Dragones Azules',
      evaluation: 4,
      percent: 92,
      percentLabel: 'Promedio',
      backgroundColor: 'f0b100',
    },


  ];

  evaluationList = [
    {
      name: 'Águilas Doradas',
      percent: 94,
      colorText: 'text-success',
      backgroundColor: 'alert-success',
    },
    {
      name: 'Tigres Blancos',
      percent: 80,
      colorText: 'text-primary',
      backgroundColor: 'alert-primary',
    },
    {
      name: 'Lobos Negros',
      percent: 70,
      colorText: 'text-success',
      backgroundColor: 'alert-success',
    },
    {
      name: 'Dragones Rojos',
      percent: 88,
      colorText: 'text-primary',
      backgroundColor: 'alert-primary',
    },
    {
      name: 'Dragones Azules',
      percent: 92,
      colorText: 'text-primary',
      backgroundColor: 'alert-primary',
    },
  ];
  constructor() { }

  ngOnInit(): void { }
}
