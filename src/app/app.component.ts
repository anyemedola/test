import { Component } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import json from '../assets/posts.json';

interface TreeNode {
  id?: number,
  location?: string,
  time?: string,
  author?: string,
  text?: string,
  value?: string,
  name?: string;
  children?: TreeNode[];
}

interface FlatNode {
  expandable: boolean;
  level: number;
  id?: number,
  index?: number,
  location?: string,
  time?: string,
  author?: string,
  text?: string,
  value?: string,
  name?: string;
}

interface Filter {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  private _transformer = (node: TreeNode, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      level: level,
      ...node
    };
  };

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.expandable,
  );

  treeFlattener = new MatTreeFlattener(
    this._transformer,
    node => node.level,
    node => node.expandable,
    node => node.children,
  );

  field: string = 'week';
  posts = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  filters: Filter[] = [
    {value: 'week', viewValue: 'Week'},
    {value: 'location', viewValue: 'Location'},
    {value: 'author', viewValue: 'Author'},
  ];

  ngOnInit() {
  	this.parseJson();
  }

  parseJson() {
  	json.map((item: any, index: any) => {
  		item.week = this.getCurrentWeek(item.time);
  	})
  	this.orderJson();
  }

  orderJson() {
  	json.sort((a: any, b: any) => {
  		return this.orderByField(a, b, this.field);
  	});
  	this.createChilds();
  }

  createChilds() {
  	var counter: number = -1;
  	var filter: string = '';
  	var tempArray: any = [];
  	json.forEach((item: any, index: any) => {
  		if (item[this.field] !== filter) {
  			counter++;
  			tempArray[counter] = {
  				name: this.field,
  				value: item[this.field],
  				children: []
  			}
  			filter = item[this.field];
  		}
      item.index = counter;
  		tempArray[counter].children.push(item);
  	})
  	this.posts.data = tempArray;
  }

  orderByField(a: any, b: any, field: string): any {
  	return this.compareValues(a[field], b[field]);
  }

  compareValues(valueA: any, valueB: any): number {
  	if (valueA > valueB)
        return 1;
    if (valueA < valueB)
        return -1;
    return 0;
  }

  getCurrentWeek(date: any) {
  	const timestamp = parseInt(date) * 1000;
  	const dateFromTimestamp: any = new Date(timestamp);
    var startDate:any = new Date(dateFromTimestamp.getFullYear(), 0, 1);
    var days = Math.floor((dateFromTimestamp - startDate) / (24 * 60 * 60 * 1000));
          
    return Math.ceil(days / 7);
  }

  hasChild = (_: number, node: FlatNode) => node.expandable;

  changeGroup(event: any) {
    this.field = event.value;
    this.orderJson();
  }

  getDateTime(time: any) {
    const timestamp = parseInt(time) * 1000;
    const dateFromTimestamp = new Date(timestamp);
    return dateFromTimestamp.getFullYear() + '-' + 
      this.parseZeroBeforeNumber(dateFromTimestamp.getMonth() + 1) + '-' +
      this.parseZeroBeforeNumber(dateFromTimestamp.getDate()) + ' ' +
      dateFromTimestamp.getHours() + ':' +
      dateFromTimestamp.getMinutes() + ':' +
      dateFromTimestamp.getSeconds();
  }

  parseZeroBeforeNumber(number: number) {
    return number < 10 ? '0'+number : number;
  }

  saveData(node: any, field: string) {
    json.map((item: any, idx: any) => {
      if (idx === node.index && item.id === node.id) {
        if (item[field] !== node[field]) {
          item[field] = node[field];
          this.orderJson();
        }
      }
    })
  }
}
