
<h1>Release notes Mobile Ticket 1</h1>

----------

<h2>Introduction</h2>

This document describes the new features, bug corrections, known issues and recommendations for Mobile Ticket 1. If you want to know about connector changes details or similar, this document is for you.

**Note:** Several of the remarks refer to a Jira number (Jira is Qmatic&#39;s internal registration system for bugs), or Pivotal Tracker (internal system for improvements and other issues).

<!--Add new update section after each release

<h2>Version UPDATE_VERSION_NUMBER</h2>

**Date:**
 
**Build number:**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story header** Solution text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Bug header** Solution text |

<h3>Known issues</h3>

| **Id/Jira** | **Description** |
| --- | --- |
| **xxx** | **Bug header** Bug text |

<h3>Upgrade instructions</h3> 

----------
-->

<h2> Version 1.14.0-internal </h2>

**Date: 2021-05-18**
 
**Build number: 6**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-578** | **Update version value when doing an upgrade in mobile ticket** |
| **MOB-552** | **Improving Mobile Ticket phone number with country code/flag** |
| **MOB-576** | **Mobile ticket to arrive appointment based on external ID** |
| **MOB-586** | **Customer entry of phone number mandatory.** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-607** | **User navigate back to customer data page from privacy policy active consent page, if cookie concent popup open for the second time** |
| **MOB-616** | **Prefilled mobile no in OTP screen get cleared if user open & close cookie consent popup** |

<h3>Upgrade Instructions</h3>

- When upgrading from a previous version, 'preferred_country_list' parameter needs to be added to config.json and 'customer_data' parameter description need to be updated.

```
 "preferred_country_list": {
    "value": "",
    "description": "Define the preferred country codes for dropdown in country code inputs. list of comma separated country codes is expected. Should be 'ISO alpha-2 format'."
  }
```
```
  "customer_data": {
    "value": {
      "phone_number": {
        "value": "disable",
        "description": "Enable or disable customer phone number field in customer data section, 'enable => phone number field is visible but not mandatory', 'disable => phone number field is not visible' , 'mandatory => phone number field is visible and mandatory'"
      },
      "customerId": {
        "value": "disable",
        "description": "Enable or disable customer id field in customer data section, 'on = enable', 'off = disable'"
      }
    },
    "description": "Enable or disable customer id or phone number in customer area. If both are disabled customer data section will be hidden"
  },
```
- When upgrading from a previous version, API Gateway route needs to be added to application.yml.

```
 central_appointment_ext_id:        
        path: /MobileTicket/MyAppointment/findCentral/external/*
        url: ${orchestra.central.url}/qsystem/rest/appointment/appointments/external
```
---------- 

<h2> Version 1.13.1 </h2>

**Date: 2021-04-15**
 
**Build number: 5**

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-575** | **Restrict REST methods exposed from mobile ticket.** |

----------

<h2>Version 1.13.0</h2>

**Date: 2021-04-09**
 
**Build number: 6**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-309** | **Angular version updated to v11** |
| **MOB-526** | **Enter customer infomation in ticket** |
| **MOB-558** | **Geo-fencing Configurable*** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-557** | **Long service names are rendered incorrectly** |

<h3>Upgrade Instructions</h3>

- When upgrading from a previous version, 'customer_data' parameter needs to be added to config.json.

```
 "customer_data": {
    "value": {
      "phone_number": {
        "value": "disable",
        "description": "Enable or disable customer phone number field in customer data section, 'on = enable', 'off = disable'"
      },
      "customerId": {
        "value": "disable",
        "description": "Enable or disable customer id field in customer data section, 'on = enable', 'off = disable'"
      }
    },
    "description": "Enable or disable customer id or phone number in customer area. If both are disabled customer data section will be hidden"
  }
```

----------

<h2>Version 1.12.0</h2>

**Date: 2021-03-02**
 
**Build number: 6**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-508** | **Prevent replay attacks in MT** |
| **MOB-504** | **improve upgrade procedure** |
| **MOB-426** | **Never show "Get New Ticket" button in the thankyou page when user open a ticket which is NOT created via MT** |
| **MOB-393** | **Mobile Ticket phone number** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-509** | **Date format issue when the year is set to YY** |
| **MOB-512** | **OTP validation for multiple resend attempts by replaying the request** |

<h3>Upgrade Instructions</h3>
- When upgrading from a previous version, following should be considered.

1. 'create_ticket_token' parameter needs to be added to config.json

```
"create_ticket_token": {
    "value": "enable",
    "description": "Enable or disable unique token for a ticket"
  }
```
"Create ticket token" feature needs a valid MongoDB database and the connection string needs to be provided for the "db_connection_string" parameter and "tenant_id" as mentioned in the previous upgrade. The database can setup as a local MongoDB database, a MongoDB hosted on a cloud like AWS (https://docs.aws.amazon.com/quickstart/latest/mongodb/welcome.html), a global cloud database service like Atlas (https://www.mongodb.com/cloud/atlas), or can be run as a docker container. Please read the deployment guide for more information regarding this.

----------

<h2> Version 1.11.1 </h2>

**Date: 2021-01-21**
 
**Build number: 5**

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **00000000** | **DMV view ticket URL leave the line not allowed to view anymore tickets because of the local storage visit validation fixed.** |

----------

<h2> Version 1.11.0 </h2>

**Date: 2020-12-18**
 
**Build number: 7**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-434** | **Enforced geo-fence** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-457** | **It is still possible to get a ticket for a closed service when direct url to the service is used.** |
| **MOB-384** | **Nothing happens when user try to arrive an appointment while API_GW or Orchestra is down.** |
| **MOB-418** | **Thankyou page appear for short moment before user redirect to customer feedback page.** |
| **MOB-422** | **Loading icon hangs forever when there is no branch nearby.** |
| **MOB-432** | **Validate tenant_id.** |
| **MOB-415** | **OTP implementation : MongoDB - Show validation message for DB errors.** |
| **MOB-456** | **OPT functionality is not working for create visit url while customer_data is disabled.** |
| **MOB-421** | **Improve the description of "customer_feedback" setting.** |
| **MOB-428** | **Firefox only > horizontal scroll bars appear with form validation messages.** |
| **MOB-430** | **Send Information button is too low on the high resolution devices issue fixed.** |
| **MOB-471** | **Console errors fixed in branch loading.** |
| **MOB-425** | **Location Service robustness issue fixed.** |
| **MOB-494** | **Restrict passcode field to eight characters/digits.** |
| **MOB-492** | **Show a message if no service selected.** |
| **MOB-501** | **Not able to use link from create/call notification if all services are disabled.** |
| **MOB-498** | **Mobile Tickets can be created during branch closed time issue fixed.** |
| **MOB-496** | **OTP timer gets separated when having a long heading.** |
| **MOB-497** | **Set "Service screen timeout" to its default value.** |

----------

<h2>Version 1.10.0</h2>

**Date: 2020-10-29**
 
**Build number: 2**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-312** | **Mobile Ticket works with button sheduler** |
| **MOB-300** | **Improved Installation Procedure** |
| **MOB-301** | **Improved Upgrade Procedure** |
| **MOB-311** | **Get New Ticket - OTP Implementation** |
| **MOB-385** | **Get New Ticket - Configurable unit of distance** |


<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-287** | **Possibility to change the HSTS time** |
| **MOB-286** | **Possibility to change the used ciphers** |
| **MOB-304** | **Allow to create a new ticket while viewing an existing ticket** |
| **MOB-305** | **Random issue in parallel ticket scenario > visit doesn't end in one tab** |
| **MOB-307** | **Firefox and Edge support should be provide in iOS** |
| **MOB-299** | **Very intense polling for mobile ticket status bug fixed** |
| **MOB-350** | **Allow to arrive an appointment visit while already open a ticket** |
| **MOB-352** | **Allow to view/create a visit while open an appointment ticket from another tab** |
| **MOB-355** | **iPhone input fields > zoom in persist after focus out from input fields** |
| **MOB-351** | **Allow to view a ticket while already open a ticket from another tab** |
| **MOB-353** | **RTL issue in Mobile ticket** |
| **MOB-387** | **Cookie consent popup shouldn't appear in some pages bug fixed** |
| **MOB-382** | **Ding sound and ticket flash is only working for the first time** |

<h3>Upgrade Instructions</h3>
- When upgrading from a previous version, following should be considered.

1. 'otp_service' parameter needs to be added to config.json

```
"otp_service": {
    "value": "enable",
    "description": "Enable or disable OTP service"
  }
```
2. 'tenand_id' parameter needs to be configured in mt-service/src/config/config.json
```
  "tenant_id": {
    "value": "1001",
    "description": "unique identifire of the client application"
  }
```
3. 'db_connection_string' parameter needs to be configured in mt-service/src/config/config.json
```
  "db_connection_string": {
    "value": "",
    "description": "database connection URL"
  }
```
OTP feature needs a valid MongoDB database and the connection string needs to be provided for the "db_connection_string" parameter as mentioned above. The database can setup as a local MongoDB database, a MongoDB hosted on a cloud like AWS (https://docs.aws.amazon.com/quickstart/latest/mongodb/welcome.html), a global cloud database service like Atlas (https://www.mongodb.com/cloud/atlas), or can be run as a docker container. Please read the deployment guide for more information regarding this.

----------

<h2>Version 1.9.1</h2>

**Date: 2020-09-14**
 
**Build number: 1**

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-310** | **Preselected country code doesn't show when using link directly to service** |

----------

<h2>Version 1.9.0</h2>

**Date:2020-09-11**
 
**Build number:1**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-272** | **Open MT from same device as created only** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-271** | **"Get new ticket" not functioning** |

<h3>Upgrade Instructions</h3>
- When upgrading from a previous version, 'block_other_browsers' parameter needs to be added to config.json.

```
"block_other_browsers" : {
        "value": "disable",
        "description": "Enable or disable whether user allow to use/open the ticket in other devices ..."
    }
```

----------

<h2>Version 28</h2>

**Date:2020-09-08**
 
**Build number:28**

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-302** | **customer data related bug fix** |

----------

<h2>Version 27</h2>

**Date:2020-08-28**
 
**Build number:27**

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-251** | **No error displayed when user try to arrive an already arrived visit** |

----------

<h2>Version 26</h2>

**Date:2020-08-17**
 
**Build number:26**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-225** | **MT compatibility issues when test in Firefox** |
| **MOB-226** | **MT compatibility issues when test in Edge browser** |
| **MOB-202** | **MT Application operate as a service** |
| **MOB-151** | **MobileTicket Block in Windows+Safari** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-219** | **Appointment time display bug** |
| **MOB-230** | **Set curser to pointer in service list** |

----------

<h2>Version 25</h2>

**Date:2020-07-17**
 
**Build number:25**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-221** | **Handle API GW newly defined 404 error with message** |
| **MOB-220** | **Loading text on ticket page function implement** |
| **MOB-208** | **Cookie clean up and convert cookie usage to use local storage** |
| **MOB-195** | **Active Cookie consent implemented** |
| **MOB-186** | **Possibility to change the TLS version in the proxy-config.json** |

----------

<h2>Version 24</h2>

**Date:2020-07-17**
 
**Build number:24**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-158** | **Integration with MsTeams for Remote Serving customers in Core** |
| **MOB-175** | **Improve UI, enter of mobile number more intuitive** |
| **MOB-177** | **Introduce extra configurable color to be used for privacy policy link** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-155** | **Mobile Ticket Add Phone Number** |

----------

<h2>Version 23</h2>

**Date:2020-07-01**
 
**Build number:23**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-174** | **Give more attraction to phone number text and button** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-159** | **Notes are gone when checkin appointment** |

----------

<h2>Version 22</h2>

**Date:2020-05-18**
 
**Build number:22**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-138** | **End user flow, enter mobile number feature** |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-146** | **If branch is closed for the whole day the Opening hours are shown as "false" bug fixed** |

<h3>Upgrade instructions</h3> 

- New customer data (mobile number) entry feature requires notification module version 4.0.0.49 or above.

----------

<h2>Version 21</h2>

**Date:2020-05-18**
 
**Build number:21**

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **MOB-137** | **New feature to load appointments through a URL and arrive** |

<h3>Upgrade instructions</h3> 

- New configurations related to appointment arrival needs to be entered in src/config/config.json. You can find the new entries in README.md.
- When configuring "Appointment Confirmation" notification type, below message format should be used.
  ```html
  http://[MOBILE_TICKET_SERVER]/appointment?appId=[publicId]
  ```

----------

<h2>Version 20</h2>

**Date:2020-04-20**
 
**Build number:20** 

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **GP-2624** | **Agent name to be shown when called is now optional** Done from en.json. For example {firstName} is ready to serve you at |

----------

<h2>Version 19</h2>

**Date:2020-01-27**
 
**Build number:19** 

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **169836431** | **Vulnerability: Click jacking - enable/disable MT in iframe** Increase security level in the application using security headers |

----------

<h2>Original release</h2>

**Date:2019-10-11**
 
**Build number:18** 

<h3>Stories</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Story header** Story text |

<h3>Bug fixes</h3>

| **Id** | **Release notes** |
| --- | --- |
| **xxx** | **Bug header** Solution text |

<h3>Known issues</h3>

| **Id/Jira** | **Description** |
| --- | --- |
| **xxx** | **Bug header** Bug text |

<h3>Upgrade Instructions</h3>

----------

<h3>Copyright notice</h3>

The information in this document is subject to change without prior notice and does not represent a commitment on the part of Q-MATIC AB. All efforts have been made to ensure the accuracy of this manual, but Q-MATIC AB cannot assume any responsibility for any errors and their consequences.

This manual is copyrighted and all rights are reserved.
Qmatic and Qmatic Orchestra are registered trademarks or trademarks of Q-MATIC AB.
Reproduction of any part of this manual, in any form, is not allowed, unless written permission is given by Q‑MATIC AB.
COPYRIGHT &copy; Q-MATIC AB, 2020.
