Logitrack-Angular
=================

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