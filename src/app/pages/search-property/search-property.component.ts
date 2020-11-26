import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Property} from '../../models/property';
import {MatTableDataSource} from '@angular/material/table';
import {Region} from '../../models/region';
import {Province} from '../../models/province';
import {District} from '../../models/district';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {PropertyService} from '../../services/property.service';
import {LocationService} from '../../services/location.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceService} from '../../services/service.service';
import {Service} from '../../models/service';
import {element} from 'protractor';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-search-property',
  templateUrl: './search-property.component.html',
  styleUrls: ['./search-property.component.css']
})
export class SearchPropertyComponent implements OnInit, AfterViewInit {

  @ViewChild('propertyForm', {static: false})
  studentId: number;
  propertyForm: NgForm;
  properties: Property[] = [];
  propertyData: Property = new Property();
  dataSource = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'active', 'title', 'description', 'rooms', 'size', 'cost', 'address',
    'location', 'landLordId', 'landLordFirstName', 'landLordLastName', 'actions'];
  minCost: number = null;
  maxCost: number = null;
  minSize: number = null;
  maxSize: number =  null;
  minRooms: number =  null;
  maxRooms: number = null;
  selectedRegion: Region = null;
  selectedProvince: Province = null;
  selectedDistrict: District = null;
  services: Service[] = [];
  regions: Region[] = [];
  provinces: Province[] = [];
  districts: District[] = [];
  servicesSelected: boolean[] = [];
  districtsSelected: District[] = [];
  filteredProperties: Property[] = [];
  selectable = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private propertyDataService: PropertyService,
              private locationService: LocationService,
              private serviceService: ServiceService,
              private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.studentId = Number(this.route.snapshot.paramMap.get('id'));
    this.dataSource.sort = this.sort;
    this.getAllProperties();
    this.retrieveAllServices();
    this.retrieveAllRegions();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getAllProperties(): void {
    this.propertyDataService.getAllActiveProperties()
      .subscribe((response: any) => {
        this.properties = response.content;
        this.dataSource.data = this.properties.slice();
        // console.log(response.content);
      });
  }
  navigateToPropertyDetails(element: Property): void {
    if (element.active) {
      this.router.navigate([`students/${this.studentId}/properties/${element.id}`]).then(() => null);
    }
  }

  filter(): void {
    this.filteredProperties = this.properties.slice();
    this.filterByRooms();
    this.filterByCost();
    this.filterBySize();
    this.filterByAddress();
    if (this.servicesSelected.includes(true)) {
      this.filterByServices();
    }
    else {
      this.dataSource.data = this.filteredProperties;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  reset(): void {
    this.minCost = null;
    this.maxCost = null;
    this.minRooms = null;
    this.maxRooms = null;
    this.maxSize = null;
    this.minSize = null;
    this.selectedRegion = null;
    this.selectedProvince = null;
    this.selectedDistrict = null;
    let index = 0;
    for (const service of this.services) {
      this.servicesSelected[index] = false;
      index++;
    }
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.dataSource.data = this.properties.slice();
    // console.log(this.properties);
  }

  onSubmit(): void {
    this.filter();
  }

  filterByCost(): void {
    if (this.minCost !== null) {
      this.filteredProperties = this.filteredProperties.filter((element) => element.cost >= this.minCost);
    }
    if (this.maxCost  !== null) {
      this.filteredProperties = this.filteredProperties.filter((element) => element.cost <= this.maxCost);
    }

  }

  filterBySize(): void {
    if (this.minSize !== null) {
      this.filteredProperties = this.filteredProperties.filter((element) => element.size >= this.minSize);
    }
    if (this.maxSize !== null) {
      this.filteredProperties = this.filteredProperties.filter((element) => element.size <= this.maxSize);
    }
  }

  filterByRooms(): void {
    if (this.minRooms !== null) {
      this.filteredProperties = this.filteredProperties.filter((element) => element.rooms >= this.minRooms);
    }
    if (this.maxRooms !== null) {
      this.filteredProperties = this.filteredProperties.filter((element) => element.rooms <= this.maxRooms);
    }
  }

  filterByAddress(): void {
    // console.log(this.filteredProperties);
    if (this.selectedDistrict !== null) {
      this.filterByDistrict();
    } else if (this.selectedProvince !== null) {
      this.filterByProvince();
    } else if (this.selectedRegion !== null){
      this.filterByRegion();
    }
  }

  filterByRegion(): void {
    for (const property of this.filteredProperties) {
      if (this.selectedRegion.id !== property.regionId) {
        const index = this.filteredProperties.map((e) => e.id).indexOf(property.id);
        this.filteredProperties.splice(index, 1);
      }
    }
  }

  filterByProvince(): void {
    for (const property of this.filteredProperties) {
      if (this.selectedProvince.id !== property.provinceId) {
        const index = this.filteredProperties.map((e) => e.id).indexOf(property.id);
        this.filteredProperties.splice(index, 1);
      }
    }
  }

  filterByDistrict(): void {
    for (const property of this.filteredProperties) {
      if (this.selectedDistrict.id !== property.districtId) {
        const index = this.filteredProperties.map((e) => e.id).indexOf(property.id);
        this.filteredProperties.splice(index, 1);
      }
    }
  }

  filterByServices(): void {
    let elements = [];
    for (let i = 0; i < this.servicesSelected.length; i++) {
      if (this.servicesSelected[i] === true) {
        this.propertyDataService.getAllPropertiesByServiceId(this.services[i].id)
          .subscribe((response: any) => {
            const resources = response.content;
            for (const resource of resources) {
              console.log(resource);
              for (const property of this.filteredProperties) {
                if (property.id === resource.id && !elements.includes(property)){
                  elements.push(property);
                }
              }
            }
            this.filteredProperties = elements;
            this.dataSource.data = this.filteredProperties;
            if (this.dataSource.paginator) {
              this.dataSource.paginator.firstPage();
            }
            // onsole.log(this.dataSource.data);
          });
      }
    }
    //
  }

  retrieveAllRegions(): void {
    this.locationService.getRegionById()
      .subscribe((response: any) => {
        this.regions = response.content;
        // console.log(response);
      });
  }

  retrieveProvinces(regionId): void {
    this.locationService.getProvincesByRegionId(regionId)
      .subscribe((response: any) => {
        this.provinces = response.content;
        // console.log(response);
      });
  }

  retrieveDistricts(provinceId): void {
    this.locationService.getDistrictsByProvinceId(provinceId)
      .subscribe((response: any) => {
        this.districts = response.content;
        // console.log(response);
      });
  }

  removeSelectedDistrict(district): void {
    const index = this.districts.indexOf(district);
    if (index >= 0) {
      this.districts.splice(index, 1);
    }
  }

  retrieveAllServices(): void {
    this.serviceService.getAllServices()
      .subscribe((response: any) => {
        this.services = response.content;
        for (const service of this.services) {
          this.servicesSelected.push(false);
        }
      });
  }
}
