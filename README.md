Logitrack-Angular
=================


##Get Kinvey API Keys

1. Visit [Kinvey official site](http://www.kinvey.com/) and create your own Kinvey account.
2. Choose the "Get started" option that suits you best. 
3. Name your app, choose app platform and click "Create app backend".
4. On the app dashboard page, you will find your App Key and App Secret. 
5. Specify your app key and secret in `scripts/app.js` constant variables

```javascript
var promise = $kinvey.init({
		appKey : 'MY_APP_KEY',
		appSecret : 'MY_APP_SECRET',
	});
```


##Login Page
Page with input fields for username and password. If you input invalid credentials, forgot password link will appear. After click forgot password link you go to page with email input field.

##Register Page
Page with first name, last name, username, email, telephone number, password input fields for user registration.

##Dispatch 
Here you can create, edit, view dispatches. Dispatches may have statuses new, open and in progress:

- "new" dispatch is a shipment that hasn’t assigned to driver
- “open” dispatch is a shipment that has not been ‘picked up’ but has a pending notification to an assigned trucks device
- “in progress” dispatch is a “open” dispatch that has been “picked up”

##Logistics 
A table view of all active trips. Each trip has a hyperlink that leads to the details of the trip and shipment status. When user clicks on a trip hyperlink will appear popup with trip details.
In this popup first tab, labeled ‘Check­Ins’ will contain a table of trip checkpoints in reverse chronological order. The second tab, labeled ‘Map’ will contain an overview of the Trip checkpoints, driver’s current location and the route boundaries that were set by the dispatcher. 
					
##Manage 
Page when user can manage data:

  - Trips – add, edit, delete trip details; trip (“route”) details include a start and end destination, as well as parametric coordinates where the driver is “allowed” to take the shipment during the trip.
  “Select route” button shows popup when you can select start, end points of route and route area. You also can drag markers. 
  - Clients – add, edit, delete client.
  - Shipments - add, edit, delete shipment name and shipment info

##Session Dropdown (top right)									
Page when you can change user info and sign out.

## License

Copyright (c) 2014 Kinvey, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
