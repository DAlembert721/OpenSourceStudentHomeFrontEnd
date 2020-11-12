import { Component, OnInit } from '@angular/core';
import {ContractService} from '../../services/contract.service';
import {PropertyService} from '../../services/property.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Contract} from '../../models/contract';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css']
})
export class ContractListComponent implements OnInit {

  contracts: Contract[];
  id: number;
  type: any;
  constructor(private contractDataService: ContractService,
              private propertyService: PropertyService,
              private router: Router,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.contracts = [];
    this.initialize();
  }
  initialize(): void {
    this.id = Number(this.route.params.subscribe(params => {
      const id = params.id;
      this.type = localStorage.getItem('type');
      if (this.type === 'student') {
        this.retrieveContractsByStudentId(id);
      }
      else {
        this.retrievePropertiesByLandLordId(id);
      }
      return id;
    }));
  }
  retrieveContractsByStudentId(studentId): void {
    this.contractDataService.getContractsByStudentId(studentId)
      .subscribe((response: any) => {
        this.contracts = response.content;
        console.log(response);
      });
  }
  retrieveContractsByPropertyId(propertyId): void {
    this.contractDataService.getContractsByPropertyId(propertyId)
      .subscribe((response: any) => {
        for (const item of response.content) {
          this.contracts.push(item);
        }
        console.log(this.contracts);
      });
  }
  retrievePropertiesByLandLordId(landlordId): void {
    this.propertyService.getPropertiesByLandlordId(landlordId)
      .subscribe((response: any) => {
        const properties = response.content;
        for (const property of properties) {
          this.retrieveContractsByPropertyId(property.id);
        }
      });
  }
  concludeContract(contractId, contract): void {
    this.contractDataService.updateContract(contractId, contract)
      .subscribe((response: any) => {
        const index = this.contracts.indexOf(contract);
        this.contracts[index] = response;
      });
  }
  addPayment(contractId): void {
    return;
  }
}