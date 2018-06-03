import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ContactModel } from './contactmodel';
import { ContractModel } from './contractmodel';
import { concat } from 'rxjs/operators/concat';
import * as moment from 'moment';
declare var jquery: any;
declare var $: any; 

@Component({
  selector: 'app-contractsettings',
  templateUrl: './contractsettings.component.html',
  styleUrls: ['./contractsettings.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ContractsettingsComponent implements OnInit {
  
  //declare variables
  token;
  userid;
  template_id;
  contract_type;
  template_name;
  companies;
  currentuser_email;  
  appendedHtml: string;
  countrecipient = 3;
  listcontacts;  
  searchValue:string = '';
  suggestions = false;  
  audiofile:object;
  videofile:object;
  additionalfile:object;
  recipients = [];   
  recinfoForm: NgForm;
  showPassword: Boolean = false;  
  countcontacts = 1;
  cc_bcc_contacts = [];
  settingsForm: NgForm;

  @ViewChild('morerecipient') d1:ElementRef;
  @ViewChild('closeSettform') closeSettform:ElementRef;
  @ViewChild('closeBtn') closeBtn: ElementRef;
  @ViewChild('settingsForm') currentForm: NgForm;

  ContactModel: ContactModel;
  ContractModel: ContractModel;

  constructor(private titlecasePipe: TitleCasePipe, private activeRoute: ActivatedRoute, private contractService: ContractService, private route: Router) { 
     //get params id
     this.activeRoute.params.subscribe(
      params => {
        this.template_id = params.id  ;          
      }
    );

    this.ContactModel = new ContactModel();
    this.ContractModel = new ContractModel();

  }
  
  ngOnInit() {
    
    this.token = localStorage.getItem('tokenKey');
    let self = this;

    $( function() {     
      $('.sortable-list').sortable( {
        handle: ".fa.fa-arrows",       
        update: function(event, ui) {
          var changedList = this.id;
          var order = $(this).sortable('toArray');                             
          var index = order.indexOf('last');                  
          if (index > -1) {
            order.splice(index, 1);
          }
          self.dragged(order);           
        } 
      });
    });

    //get login user id
    this.userid = localStorage.getItem('UserId');    

    // Get data of selected template      
    this.contractService.getUserTemplate(this.template_id, this.token).subscribe((response) => {
      this.contract_type = response.data.contract_type_id.contract_type;   
      this.template_name = response.data.filename;     
    });
   
    // Get data of logged in user   
    this.contractService.getUser(this.userid, this.token).subscribe((response) => {      
      this.currentuser_email = response.data.email;
      this.companies = response.data.company_names;                 
    }); 
     
  }

  private formErrors = {
    'contract_name': '',
    'company_name' : '',
    'sending_type' : '',
    'expiration_type' : '',
    'message' : ''
  };

  private validationMessages = {
    'contract_name': {
      'required': 'Please enter your contract name first.'
    },
   'company_name': {
      'required': 'Please select your conpany name first.'
    },
    'sending_type': {
      'required': 'Please select one field first sendcontract .'
    },
    'expiration_type': {
      'required': 'Please select one field first expiration.'
    },
    'message': {
      'required': 'Please enter your message first.'
    }     
  };

  ngAfterViewChecked() {
    this.formChanged();
  }

  formChanged() {
    if (this.currentForm === this.settingsForm) { return; }
    this.settingsForm = this.currentForm;

    if (this.settingsForm) {
      this.settingsForm.valueChanges.subscribe(data => this.onValueChanged(data));
    }
  }

  private onValueChanged(data?: any) {

    if (!this.settingsForm) { return; }
    const form = this.settingsForm.form;

    // tslint:disable-next-line:forin
    for (const field in this.formErrors) { 
      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control = form.get(field);

      if (control && control.dirty && control.invalid) {
        const messages = this.validationMessages[field];

        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }

  dragged(order){
            
    let new_recipients = [] ;
    let neworder = [];

    for(let i = 0; i < order.length; i++) {    
      neworder.push(order[i] - 1);
    }

    if(this.recipients.length > 0){      
      new_recipients =  this.mapOrder(this.recipients, neworder, 'id');
      this.recipients = [];
      this.recipients = new_recipients;  
    }

  }

  mapOrder (array, order, key) {
    
    array.sort( function (a, b) {
      var A = a[key], B = b[key];
      
      if (order.indexOf(A) > order.indexOf(B)) {
        return 1;
      } else {
        return -1;
      }
      
    });
    
    return array;
  };

  addrecipient(): void {

    let appended_html;
    let count;
    if(this.countrecipient < 10){
      count = '0'+this.countrecipient;
    } else{
      count = this.countrecipient;
    }       
    appended_html = '<li id="'+this.countrecipient+'">'+
                    '<div class="rl-frm" id="recipient_'+this.countrecipient+'">'+
                      '<div class="form-group rl">'+
                        '<div class="input-group">'+
                          '<div class="input-group-addon">'+
                            '<span class="sr-no">'+count+'</span>'+
                            '<i class="fa fa-pencil" aria-hidden="true"></i>'+
                          '</div>'+ 
                          '<input type="text" class="form-control rec_email" name="recipient">'+
                          '<span class="icon-cmt">'+
                            '<i class="fa fa-comments" aria-hidden="true"></i> '+
                            '<i class="fa fa-address-card" aria-hidden="true" data-toggle="modal" data-target="#exampleModal2"></i> '+
                            '<i class="fa fa-arrows" aria-hidden="true" (click)="append()"></i> '+
                          '</span>'+
                        '</div>'+
                      '</div>'+
                    '</div>'+
                    '</li>'; 

    this.d1.nativeElement.insertAdjacentHTML('beforebegin', appended_html);

    var rec_stng = document.getElementsByClassName("fa-pencil");
    for (var i = 0; i < rec_stng.length; i++) {
      rec_stng[i].addEventListener('click', (event) => this.recipient_settings(event));
    }

    var auth_stng = document.getElementsByClassName("fa-address-card");
    for (var i = 0; i < auth_stng.length; i++) {
      auth_stng[i].addEventListener('click', (event) => this.auth_settings(event));
    }

    this.countrecipient++;

  }
      
  recipient_settings(event){        
    this.searchValue = null;        
    localStorage.setItem('Recipient_id', event.target.parentElement.parentElement.parentElement.parentElement.attributes.id.value);
    event.target.setAttribute("data-toggle", "modal");
    event.target.setAttribute("data-target", "#recipient_information");    
  } 
  
  auth_settings(event){         
    localStorage.setItem('Recipient_id', event.target.parentElement.parentElement.parentElement.parentElement.attributes.id.value);
    event.target.setAttribute("data-toggle", "modal");
    event.target.setAttribute("data-target", "#authentication_settings");   
    this.ContractModel.auth_type = 'guest_user' ;
    this.ContractModel.witness = 'no' ;
  } 

  searchcontact(event){
    this.suggestions = true;
    let search = event.target.value;

    this.contractService.list_contacts(this.userid, search, this.token).subscribe((response) => {                              
      this.listcontacts = response.data;     
    });       
  }

  selectcontact(event) {
    let id = event.target.id;    
    this.suggestions = false;  
    this.contractService.get_contact(id, this.token).subscribe((response) => {     

      this.ContactModel.first_name = response.data.first_name;       
      this.ContactModel.middle_name = response.data.middle_name;       
      this.ContactModel.last_name = response.data.last_name;       
      this.ContactModel.company_name = response.data.company_name;       
      this.ContactModel.title = response.data.title;       
      this.ContactModel.phone_no = response.data.phone_no;       
      this.ContactModel.coperate_add = response.data.coperate_add;       
      this.ContactModel.state = response.data.state;       
      this.ContactModel.email = response.data.email;       
      this.ContactModel.confirm_email = response.data.email;   
      this.ContactModel.contact_id = response.data._id;         

    }); 
  }  
  
  updaterecipient(data, type) {  

    let contact_email;     
    let rec_id = localStorage.getItem('Recipient_id');
    let contact;
    let contact_name;
    let exist = 'no';
    contact = {contact_id: '', contact_name: '', rec_type : '', witness : '', auth_type : '', sending_date: '', expiration_date: ''} ;
    data.user_id = this.userid;     
    data.token = this.token; 

    if(type === 'contact') { 
      this.contractService.addcontact(data).subscribe((response) => {                               
        contact_name = response.contact.first_name+' '+response.contact.middle_name+' '+response.contact.last_name;        
        contact_email = response.contact.email;                                                      
        $("#"+rec_id).find('.rec_email').val(contact_email);     
        this.closeSettform.nativeElement.click();        
        this.ContactModel.rec_type = 'signer';  
        localStorage.setItem('contact_id', response.contact._id);
        localStorage.setItem('contact_name', contact_name);
        localStorage.setItem('rec_type', data.rec_type);    
      }); 
    }
        
    if(type === 'auth'){ 

      this.closeBtn.nativeElement.click();                  
      this.ContractModel.auth_type = 'guest_user';
      this.ContractModel.witness = 'no';
      contact.contact_id = localStorage.getItem('contact_id');
      contact.rec_type = localStorage.getItem('rec_type');
      contact.contact_name = localStorage.getItem('contact_name');
      contact.auth_type = data.auth_type;
      contact.witness = data.witness;              
      contact.sending_date = moment(data.sending_date).format('DD-MM-YYYY'); 
      contact.expiration_date = moment(data.expiration_date).format('DD-MM-YYYY');       
      
      if(this.recipients.length > 0){ // Check if more than one recipient
        
        this.recipients.forEach((recipient, index) => { 
          
          if(recipient.contact_id === contact.contact_id) {  // Check if contact already exists
            exist = 'yes';
            this.recipients[index].auth_type = data.auth_type; // Update if already exists
            this.recipients[index].witness = data.witness;    
            this.recipients[index].sending_date = moment(data.sending_date).format('DD-MM-YYYY'); 
            this.recipients[index].expiration_date = moment(data.expiration_date).format('DD-MM-YYYY');  
          } 

        });

        if(exist === 'no'){  // Push if not exists
          contact.id = this.countcontacts;          
          this.recipients.push(contact); 
          this.countcontacts++;  
        }

      } else{   //for the first push (when array is empty)
        contact.id = 0;
        this.recipients.push(contact);  

      } 

      console.log('Final test =>> ', this.recipients)
       
    }  
    
  }   
   
  uploadAudio(e: Event){    
    const target: HTMLInputElement = e.target as HTMLInputElement;    
    let file = target.files[0];
    let filename = file.name;    

    if(file.type === 'audio/mp3' || file.type === 'audio/mpeg' || file.type === 'audio/mp4'){    
      this.audiofile = file;
      document.getElementById('audio_name').innerHTML = 'Selected Audio: '+filename; 
      document.getElementById("audio_name").style.color = "white";           
    } else {         
      document.getElementById('audio_name').innerHTML = 'Please upload mp3, mp4 and mpeg files only.';    
      document.getElementById("audio_name").style.color = "red";
    }
    
  }

  uploadVideo(e: Event){

    const target: HTMLInputElement = e.target as HTMLInputElement;
    let file = target.files[0];
    let filename = file.name;
    let filetype = file.type;
      
    if(filetype === 'video/mpeg' || filetype === 'video/mp4'|| filetype === 'video/x-msvideo' || filetype === 'video/x-ms-wmv'|| filetype === 'video/x-flv' ) {      
      this.videofile = file;    
      document.getElementById('video_name').innerHTML = 'Selected Video: '+filename;
      document.getElementById("video_name").style.color = "white";           
    }else  {          
      document.getElementById('video_name').innerHTML = 'Please upload mp4, mpeg, avi, wmv and flv files only.';      
      document.getElementById("video_name").style.color = "red";
    } 

  }

  uploadAdditional(e: Event){
    const target: HTMLInputElement = e.target as HTMLInputElement;
    let file = target.files[0];
    let filename = file.name;
    this.additionalfile = file;    
    document.getElementById('add_name').innerHTML = 'Selected Additional File: '+filename;    
  }
  
  checkPassword(event){
    let checked = event.target.checked;
    if(checked == true){
      this.showPassword = true;      
    } else{
      this.showPassword = false;
    }
  }
  
  showcontacts(){

    this.cc_bcc_contacts = [];
    let contact_auth_type;
    this.recipients.forEach((recipient, index) => { 

      if(recipient.rec_type === 'cc' || recipient.rec_type === 'bcc'){
       
        switch(recipient.auth_type) { 
          case "guest_user": { 
            contact_auth_type = 'Guest User';
            break; 
          } 
          case "enterprise_team_member": { 
            contact_auth_type = 'Enterprise Team Member';
            break; 
          } 
          case "registered_basic_user": {
            contact_auth_type = 'Registered Basic User';
            break;    
          } 
          case "registered_biometric_user": { 
            contact_auth_type = 'Registered Biometric User';
            break; 
          }  
          case "bronze_level_auth": { 
            contact_auth_type = 'Bronze Level Authenticated User';
            break; 
          }
          case "silver_level_auth": { 
            contact_auth_type = 'Silver Level Authenticated User';
            break; 
          }
          case "gold_level_auth": { 
            contact_auth_type = 'Gold Level Authenticated User';
            break; 
          }
          case "platinum_level_auth": { 
            contact_auth_type = 'Platinum Level Authenticated User';
            break; 
          }
          case "diamond_level_auth": { 
            contact_auth_type = 'Diamond Level Authenticated User';
            break; 
          }
          case "master_level_auth": { 
            contact_auth_type = 'Master Level Authenticated User';
            break; 
          }
       }
        recipient.auth_type = contact_auth_type;
        this.cc_bcc_contacts.push(recipient);
      }
    });  
   
  }

  submitsettingsForm(data){ 
    let contract_id;
    data.audio = this.audiofile;
    data.video = this.videofile;
    data.additional = this.additionalfile;
    data.recipients = this.recipients;  
    data.usertemplate_id = this.template_id; 
    data.token = this.token;
    console.log('Input ==> ', data); 

    if(data.password === data.confirm_password) {
      $('#confirm_passwrd').html('');
      this.contractService.savecontract(data).subscribe((response) => {
        contract_id = response.contract._id;
        this.route.navigate(['contract', contract_id]);
      }); 
    }
    else {
      $('#confirm_passwrd').html('Password and Confirm password not matched');
    }
     
  } 

}    