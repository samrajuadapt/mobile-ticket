
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

<h2>Version 1.10.1-internal</h2>

**Date: 2020-10-27**
 
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
Connection string can be either cloud database connection or local database connection. Please read the deployment guide for available options for the database and more information with regard to OTP configurations.

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
